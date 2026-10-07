"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/core";
import { revalidatePath } from "next/cache";

function serializeData(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getSalesOrders() {
  await requirePermission("SalesOrders", "read");
  const orders = await prisma.salesOrder.findMany({
    include: {
      customer: true,
      items: {
        include: {
          item: true,
        },
      },
      workOrders: true,
      deliveryNotes: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return serializeData(orders);
}

export async function getSalesOrder(id: string) {
  await requirePermission("SalesOrders", "read");
  const [order, reservations, itemsList] = await Promise.all([
    prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        confirmedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeCode: true,
          },
        },
        items: {
          include: {
            item: {
              include: {
                boms: {
                  include: {
                    materials: {
                      include: {
                        rmItem: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        workOrders: {
          include: {
            fgItem: true,
            jobCards: {
              include: {
                workstation: true,
                assignedUser: true,
                die: true,
                inspections: true,
              },
            },
          },
        },
        deliveryNotes: {
          include: {
            cartons: {
              include: {
                batch: {
                  include: {
                    item: true,
                  },
                },
                scannedBy: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.stockReservation.findMany({
      where: { salesOrderId: id },
    }),
    prisma.item.findMany(),
  ]);

  if (!order) return null;

  const itemsMap = new Map(itemsList.map((i) => [i.id, i]));
  const enrichedReservations = reservations.map((res) => ({
    ...res,
    item: itemsMap.get(res.itemId) || { id: res.itemId, name: "Unknown Item", code: "UNKNOWN", uom: "" },
  }));

  return serializeData({
    ...order,
    reservations: enrichedReservations,
  });
}

export async function createSalesOrder(data: any) {
  await requirePermission("SalesOrders", "create");

  const count = await prisma.salesOrder.count();
  const orderNumber = `SO-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

  const totalAmount = data.items.reduce(
    (sum: number, item: any) => sum + Number(item.qty) * Number(item.rate),
    0
  );

  const order = await prisma.salesOrder.create({
    data: {
      orderNumber,
      customerId: data.customerId,
      customerName: data.customerName,
      customerGstin: data.customerGstin || null,
      deliveryDate: new Date(data.deliveryDate),
      approvalMethod: data.approvalMethod || "WHATSAPP",
      status: "DRAFT",
      totalAmount,
      notes: data.notes,
      items: {
        create: data.items.map((item: any) => ({
          itemId: item.itemId,
          qty: Number(item.qty),
          rate: Number(item.rate),
          amount: Number(item.qty) * Number(item.rate),
        })),
      },
    },
  });

  revalidatePath("/orders");
  return serializeData(order);
}

export async function updateSalesOrder(id: string, data: any) {
  await requirePermission("SalesOrders", "update");

  const totalAmount = data.items.reduce(
    (sum: number, item: any) => sum + Number(item.qty) * Number(item.rate),
    0
  );

  await prisma.salesOrderItem.deleteMany({
    where: { salesOrderId: id },
  });

  const order = await prisma.salesOrder.update({
    where: { id },
    data: {
      customerId: data.customerId,
      customerName: data.customerName,
      customerGstin: data.customerGstin || null,
      deliveryDate: new Date(data.deliveryDate),
      approvalMethod: data.approvalMethod,
      totalAmount,
      notes: data.notes,
      items: {
        create: data.items.map((item: any) => ({
          itemId: item.itemId,
          qty: Number(item.qty),
          rate: Number(item.rate),
          amount: Number(item.qty) * Number(item.rate),
        })),
      },
    },
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
  return serializeData(order);
}

export async function checkMaterialAvailability(orderId: string) {
  await requirePermission("SalesOrders", "read");

  const order = await prisma.salesOrder.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          item: {
            include: {
              boms: {
                include: {
                  materials: {
                    include: {
                      rmItem: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) return [];

  const requiredMaterials: Record<
    string,
    {
      rmItem: any;
      requiredQty: number;
      physicalStock: number;
      reservedStock: number;
      availableStock: number;
      deficitQty: number;
      status: "AVAILABLE" | "DEFICIT";
    }
  > = {};

  for (const orderItem of order.items) {
    const defaultBom = orderItem.item.boms[0];
    if (!defaultBom) continue;

    const outputQty = defaultBom.outputQty > 0 ? defaultBom.outputQty : 1;
    const multiplier = orderItem.qty / outputQty;
    const scrapFactor = defaultBom.scrapFactor || 0.025;
    const scrapMultiplier = 1 / (1 - scrapFactor);

    for (const mat of defaultBom.materials) {
      if (!requiredMaterials[mat.rmItemId]) {
        requiredMaterials[mat.rmItemId] = {
          rmItem: mat.rmItem,
          requiredQty: 0,
          physicalStock: 0,
          reservedStock: 0,
          availableStock: 0,
          deficitQty: 0,
          status: "AVAILABLE",
        };
      }
      requiredMaterials[mat.rmItemId].requiredQty += mat.qtyPerUnit * multiplier * scrapMultiplier;
    }
  }

  // Calculate physical stock & reservations from ledger
  for (const rmItemId of Object.keys(requiredMaterials)) {
    const [ledgers, otherReservations] = await Promise.all([
      prisma.stockLedgerEntry.findMany({ where: { itemId: rmItemId } }),
      prisma.stockReservation.findMany({
        where: {
          itemId: rmItemId,
          status: "RESERVED",
          salesOrderId: { not: orderId }, // Exclude current order's existing reservations
        },
      }),
    ]);

    let physicalStock = 0;
    for (const entry of ledgers) {
      if (["RECEIPT", "PRODUCTION_OUTPUT", "PRODUCTION", "RECOVERY", "ADJUSTMENT_IN"].includes(entry.movementType)) {
        physicalStock += entry.quantity;
      } else if (["CONSUMPTION", "SCRAP", "DISPATCH", "ADJUSTMENT_OUT"].includes(entry.movementType)) {
        physicalStock -= entry.quantity;
      }
    }

    const reservedStock = otherReservations.reduce((sum, r) => sum + r.quantity, 0);
    const availableStock = Math.max(0, physicalStock - reservedStock);
    const requiredQty = requiredMaterials[rmItemId].requiredQty;

    const isAvailable = availableStock >= requiredQty;
    const deficitQty = isAvailable ? 0 : Math.ceil((requiredQty - availableStock) * 100) / 100;

    requiredMaterials[rmItemId].physicalStock = Math.round(physicalStock * 100) / 100;
    requiredMaterials[rmItemId].reservedStock = Math.round(reservedStock * 100) / 100;
    requiredMaterials[rmItemId].availableStock = Math.round(availableStock * 100) / 100;
    requiredMaterials[rmItemId].requiredQty = Math.round(requiredQty * 100) / 100;
    requiredMaterials[rmItemId].deficitQty = deficitQty;
    requiredMaterials[rmItemId].status = isAvailable ? "AVAILABLE" : "DEFICIT";
  }

  return serializeData(Object.values(requiredMaterials));
}

export async function confirmSalesOrderWithReservation(
  orderId: string,
  approvalMethod: string = "WHATSAPP",
  customerNotes?: string
) {
  await requirePermission("SalesOrders", "update");

  // 1. Strict Hard Gate Material Check
  const check = await checkMaterialAvailability(orderId);
  const deficits = check.filter((m: any) => m.status === "DEFICIT");

  if (deficits.length > 0) {
    const errorDetails = deficits
      .map(
        (d: any) =>
          `${d.rmItem.name} (${d.rmItem.code}): required ${d.requiredQty} ${d.rmItem.uom}, available ${d.availableStock} ${d.rmItem.uom} (deficit: ${d.deficitQty} ${d.rmItem.uom})`
      )
      .join(" | ");

    throw new Error(
      `Strict Hard Gate: Cannot confirm order. Deficits detected for: ${errorDetails}. Please generate a Purchase Order first.`
    );
  }

  const session = await getSession();
  const userId = session?.user?.id;

  // 2. Perform Atomic Reservation & Order Status Transition
  await prisma.$transaction(async (tx) => {
    // A. Update Sales Order
    const updated = await tx.salesOrder.update({
      where: { id: orderId },
      data: {
        status: "CONFIRMED",
        approvalMethod: approvalMethod || "WHATSAPP",
        confirmedAt: new Date(),
        confirmedById: userId || null,
        notes: customerNotes ? customerNotes : undefined,
      },
      include: {
        items: { include: { item: true } },
      },
    });

    // B. Clean up any previous reservations for this order to ensure fresh state
    await tx.stockReservation.deleteMany({
      where: { salesOrderId: orderId },
    });

    // C. Lock stock via StockReservation
    for (const mat of check) {
      if (mat.requiredQty > 0) {
        await tx.stockReservation.create({
          data: {
            itemId: mat.rmItem.id,
            salesOrderId: orderId,
            quantity: mat.requiredQty,
            status: "RESERVED",
          },
        });
      }
    }

    // D. Auto-generate Work Order if not present
    const existingWOs = await tx.workOrder.findMany({
      where: { salesOrderId: orderId },
    });

    if (existingWOs.length === 0) {
      let woIndex = 1;
      const totalWOCount = await tx.workOrder.count();
      for (const orderItem of updated.items) {
        if (orderItem.item.category === "FINISHED_GOODS") {
          const woNumber = `PROD-WO-${new Date().getFullYear()}-${String(totalWOCount + woIndex++).padStart(5, "0")}`;
          await tx.workOrder.create({
            data: {
              workOrderNumber: woNumber,
              salesOrderId: orderId,
              fgItemId: orderItem.itemId,
              plannedQty: orderItem.qty,
              status: "PENDING",
            },
          });
        }
      }
    }

    // E. Audit Log
    if (userId) {
      await tx.auditLog.create({
        data: {
          userId,
          event: "SALES_ORDER_CONFIRMED",
          metadata: JSON.stringify({
            orderId,
            orderNumber: updated.orderNumber,
            reservedItemsCount: check.length,
            confirmedAt: new Date().toISOString(),
          }),
        },
      });
    }
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/stock");

  // Always return the complete, hydrated order with all relations!
  const fullOrder = await getSalesOrder(orderId);
  return serializeData(fullOrder);
}

export async function createPurchaseOrderForShortage(orderId: string) {
  await requirePermission("PurchaseOrders", "create");

  const [order, check] = await Promise.all([
    prisma.salesOrder.findUnique({ where: { id: orderId } }),
    checkMaterialAvailability(orderId),
  ]);

  if (!order) throw new Error("Order not found");

  const deficits = check.filter((m: any) => m.status === "DEFICIT");
  if (deficits.length === 0) {
    return { success: false, message: "No material deficits found for this order." };
  }

  // Find or create default supplier
  let supplier = await prisma.supplier.findFirst({ where: { status: "ACTIVE" } });
  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: {
        name: "Standard Polymer Raw Material Corp",
        gstin: "24AAACS9999P1Z1",
        phone: "+91 98250 12345",
        email: "procurement@standardpolymer.com",
        status: "ACTIVE",
      },
    });
  }

  const count = await prisma.purchaseOrder.count();
  const poNumber = `BUY-PO-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

  const poItems = deficits.map((d: any) => {
    const qty = Math.ceil(d.deficitQty);
    const rate = Number(d.rmItem.standardCost || 100);
    return {
      itemId: d.rmItem.id,
      qty,
      rate,
      amount: qty * rate,
    };
  });

  const totalAmount = poItems.reduce((sum: number, it: any) => sum + it.amount, 0);

  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber,
      supplierId: supplier.id,
      status: "DRAFT",
      totalAmount,
      notes: `Auto-generated shortage replenishment for Sales Order ${order.orderNumber} (${deficits.length} deficit items)`,
      items: {
        create: poItems,
      },
    },
    include: {
      supplier: true,
      items: { include: { item: true } },
    },
  });

  revalidatePath("/buying");
  revalidatePath(`/buying/${po.id}`);
  revalidatePath(`/orders/${orderId}`);

  return serializeData({
    success: true,
    poId: po.id,
    poNumber: po.poNumber,
    itemsCount: deficits.length,
    totalAmount,
  });
}

export async function updateSalesOrderStatus(id: string, status: string, additionalData?: any) {
  await requirePermission("SalesOrders", "update");

  if (status === "CONFIRMED") {
    return await confirmSalesOrderWithReservation(
      id,
      additionalData?.approvalMethod || "WHATSAPP",
      additionalData?.notes
    );
  }

  const updatePayload: any = { status };

  if (status === "PROFORMA_SENT") {
    updatePayload.proformaSentAt = new Date();
    if (additionalData?.proformaRef) {
      updatePayload.proformaRef = additionalData.proformaRef;
    }
  }

  await prisma.salesOrder.update({
    where: { id },
    data: updatePayload,
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);

  // Always return the complete, hydrated order with all relations!
  const fullOrder = await getSalesOrder(id);
  return serializeData(fullOrder);
}

export async function advanceOrderStatus(orderId: string, status: string, notes?: string) {
  return await updateSalesOrderStatus(orderId, status, { notes });
}

export async function updateOrderDispatchGate(
  orderId: string,
  data: {
    transporterName: string;
    vehicleNumber: string;
    lrNumber: string;
    customerConsentMethod: string;
    notes?: string;
  }
) {
  await requirePermission("SalesOrders", "update");

  const order = await prisma.salesOrder.findUnique({
    where: { id: orderId },
    include: {
      deliveryNotes: {
        include: { cartons: true },
      },
    },
  });

  if (!order) throw new Error("Order not found");

  let dn = order.deliveryNotes[0];
  if (!dn) {
    const dnCount = await prisma.deliveryNote.count();
    const dnNumber = `DN-${new Date().getFullYear()}-${String(dnCount + 1).padStart(5, "0")}`;
    dn = await prisma.deliveryNote.create({
      data: {
        dnNumber,
        salesOrderId: orderId,
        customerName: order.customerName,
        transporterName: data.transporterName,
        vehicleNumber: data.vehicleNumber,
        lrNumber: data.lrNumber,
        status: "DRAFT",
      },
      include: { cartons: true },
    });
  } else {
    dn = await prisma.deliveryNote.update({
      where: { id: dn.id },
      data: {
        transporterName: data.transporterName,
        vehicleNumber: data.vehicleNumber,
        lrNumber: data.lrNumber,
      },
      include: { cartons: true },
    });
  }

  // Update order notes / approval method
  await prisma.salesOrder.update({
    where: { id: orderId },
    data: {
      approvalMethod: data.customerConsentMethod || order.approvalMethod,
      notes: data.notes
        ? `${order.notes ? order.notes + "\n" : ""}[Dispatch Consent (${data.customerConsentMethod})]: ${data.notes}`
        : order.notes,
    },
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/dispatch");

  const fullOrder = await getSalesOrder(orderId);
  return serializeData({ success: true, deliveryNote: dn, order: fullOrder });
}

export async function quickLogExtrusion(
  orderId: string,
  meters: number,
  scrapKg: number = 0
) {
  await requirePermission("WorkOrders", "update");

  const order = await prisma.salesOrder.findUnique({
    where: { id: orderId },
    include: {
      workOrders: {
        include: {
          jobCards: true,
          fgItem: true,
        },
      },
    },
  });

  if (!order) throw new Error("Order not found");

  let wo = order.workOrders[0];
  if (!wo) {
    const fgItem = await prisma.item.findFirst({
      where: { category: "FINISHED_GOODS" },
    });
    if (!fgItem) throw new Error("No Finished Goods item found.");
    const totalWOCount = await prisma.workOrder.count();
    wo = await prisma.workOrder.create({
      data: {
        workOrderNumber: `PROD-WO-${new Date().getFullYear()}-${String(totalWOCount + 1).padStart(5, "0")}`,
        salesOrderId: orderId,
        fgItemId: fgItem.id,
        plannedQty: 1000,
        status: "IN_PROGRESS",
      },
      include: { jobCards: true, fgItem: true },
    });
  }

  // Find workstation
  let ws = await prisma.workstation.findFirst({ where: { status: "RUNNING" } });
  if (!ws) ws = await prisma.workstation.findFirst();

  let jobCard = wo.jobCards?.[0];
  if (!jobCard) {
    jobCard = await prisma.jobCard.create({
      data: {
        workOrderId: wo.id,
        workstationId: ws?.id || "cl_line_01",
        status: "ACTIVE",
        goodQty: meters,
        scrapQty: scrapKg,
      },
      include: { workstation: true, assignedUser: true, die: true, inspections: true },
    });
  } else {
    await prisma.jobCard.update({
      where: { id: jobCard.id },
      data: {
        goodQty: { increment: meters },
        scrapQty: { increment: scrapKg },
      },
    });
  }

  // Update work order produced qty
  await prisma.workOrder.update({
    where: { id: wo.id },
    data: {
      producedQty: { increment: meters },
      status: "IN_PROGRESS",
    },
  });

  // Record in stock ledger
  await prisma.stockLedgerEntry.create({
    data: {
      itemId: wo.fgItemId,
      warehouse: "MAIN",
      quantity: meters,
      movementType: "PRODUCTION_OUTPUT",
      referenceId: wo.id,
      notes: `Extruded +${meters} meters for SO ${order.orderNumber}`,
    },
  });

  // Handle RM compound deduction & reservations
  const bom = await prisma.bOM.findFirst({
    where: { fgItemId: wo.fgItemId },
    include: { materials: true },
  });

  if (bom) {
    const multiplier = meters / (bom.outputQty > 0 ? bom.outputQty : 1);
    const scrapMultiplier = 1 / (1 - (bom.scrapFactor || 0.025));

    for (const mat of bom.materials) {
      const rmConsumed = Math.round(mat.qtyPerUnit * multiplier * scrapMultiplier * 100) / 100;
      await prisma.stockLedgerEntry.create({
        data: {
          itemId: mat.rmItemId,
          warehouse: "MAIN",
          quantity: rmConsumed,
          movementType: "CONSUMPTION",
          referenceId: wo.id,
          notes: `BOM consumption for +${meters}m extrusion on SO ${order.orderNumber}`,
        },
      });

      // Release reservation
      const res = await prisma.stockReservation.findFirst({
        where: {
          salesOrderId: orderId,
          itemId: mat.rmItemId,
          status: "RESERVED",
        },
      });

      if (res) {
        if (res.quantity <= rmConsumed) {
          await prisma.stockReservation.update({
            where: { id: res.id },
            data: { status: "CONSUMED", quantity: 0 },
          });
        } else {
          await prisma.stockReservation.update({
            where: { id: res.id },
            data: { quantity: Math.round((res.quantity - rmConsumed) * 100) / 100 },
          });
        }
      }
    }
  }

  // If order status is CONFIRMED, update to IN_PRODUCTION
  if (order.status === "CONFIRMED" || order.status === "APPROVED") {
    await prisma.salesOrder.update({
      where: { id: orderId },
      data: { status: "IN_PRODUCTION" },
    });
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/production");
  revalidatePath("/stock");

  const fullOrder = await getSalesOrder(orderId);
  return serializeData({ success: true, order: fullOrder });
}

export async function quickSubmitQC(
  orderId: string,
  data: {
    status: string;
    pinSize?: number;
    width?: number;
    legThickness?: number;
    linearWeight?: number;
    fitTestResult?: string;
    inspectorName?: string;
  }
) {
  await requirePermission("QC", "create");

  const order = await prisma.salesOrder.findUnique({
    where: { id: orderId },
    include: { workOrders: { include: { jobCards: true } } },
  });

  if (!order) throw new Error("Order not found");

  const wo = order.workOrders[0];
  const jc = wo?.jobCards?.[0];

  const count = await prisma.qualityInspection.count();
  const reportNumber = `QC-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

  await prisma.qualityInspection.create({
    data: {
      reportNumber,
      jobCardId: jc?.id || null,
      batchNumber: wo?.fgBatchNumber || `BATCH-FG-${new Date().getFullYear()}-00101`,
      status: data.status || "PASS",
      sampleSize: 5,
      qcData: JSON.stringify({
        pinSize: data.pinSize || 4.2,
        width: data.width || 18.5,
        legThickness: data.legThickness || 1.8,
        linearWeight: data.linearWeight || 78.5,
        fitTest: data.fitTestResult || "PASS - Snug Fit",
      }),
      inspectorName: data.inspectorName || "Param (Quality Lead)",
    },
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/qc");

  const fullOrder = await getSalesOrder(orderId);
  return serializeData({ success: true, order: fullOrder });
}

export async function quickSerializeCarton(
  orderId: string,
  data: {
    quantity: number;
    cartonCode?: string;
  }
) {
  await requirePermission("Dispatch", "create");

  const order = await prisma.salesOrder.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      deliveryNotes: { include: { cartons: true } },
    },
  });

  if (!order) throw new Error("Order not found");

  let dn = order.deliveryNotes[0];
  if (!dn) {
    const dnCount = await prisma.deliveryNote.count();
    const dnNumber = `DN-${new Date().getFullYear()}-${String(dnCount + 1).padStart(5, "0")}`;
    dn = await prisma.deliveryNote.create({
      data: {
        dnNumber,
        salesOrderId: orderId,
        customerName: order.customerName,
        status: "DRAFT",
      },
      include: { cartons: true },
    });
  }

  // Find or create batch
  let batch = await prisma.batch.findFirst({
    where: { itemId: order.items[0]?.itemId },
  });

  if (!batch) {
    batch = await prisma.batch.create({
      data: {
        batchNumber: `BATCH-FG-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        itemId: order.items[0]?.itemId || "cmusvod90000keyngm62gj0ix",
        quantity: 5000,
        uom: "Meter",
        source: "EXTRUSION",
      },
    });
  }

  const cartonCount = await prisma.cartonLabel.count();
  const cartonCode =
    data.cartonCode || `CTN-${new Date().getFullYear()}-${String(cartonCount + 1).padStart(5, "0")}`;

  await prisma.cartonLabel.create({
    data: {
      cartonCode,
      deliveryNoteId: dn.id,
      batchId: batch.id,
      quantity: Number(data.quantity) || 250,
      scanned: false,
    },
  });

  // Update order status to READY_TO_DISPATCH if in production
  if (order.status === "IN_PRODUCTION" || order.status === "CONFIRMED") {
    await prisma.salesOrder.update({
      where: { id: orderId },
      data: { status: "READY_TO_DISPATCH" },
    });
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/dispatch");

  const fullOrder = await getSalesOrder(orderId);
  return serializeData({ success: true, order: fullOrder });
}

export async function deleteSalesOrder(id: string) {
  await requirePermission("SalesOrders", "delete");

  // Also clean up any reservations
  await prisma.stockReservation.deleteMany({
    where: { salesOrderId: id },
  });

  await prisma.salesOrder.delete({ where: { id } });
  revalidatePath("/orders");
  revalidatePath("/stock");
}
