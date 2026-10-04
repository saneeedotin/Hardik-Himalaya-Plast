"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { revalidatePath } from "next/cache";

function serializeData(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getPurchaseOrders() {
  await requirePermission("PurchaseOrders", "read");
  const pos = await prisma.purchaseOrder.findMany({
    include: {
      supplier: true,
      items: {
        include: {
          item: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return serializeData(pos);
}

export async function getPurchaseOrder(id: string) {
  await requirePermission("PurchaseOrders", "read");
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: {
        include: {
          item: true,
        },
      },
    },
  });
  return po ? serializeData(po) : null;
}

export async function createPurchaseOrder(data: any) {
  await requirePermission("PurchaseOrders", "create");
  
  const count = await prisma.purchaseOrder.count();
  const poNumber = `BUY-PO-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;
  
  const totalAmount = data.items.reduce((sum: number, item: any) => sum + (Number(item.qty) * Number(item.rate)), 0);

  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber,
      supplierId: data.supplierId,
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

  revalidatePath("/buying");
  return serializeData(po);
}

export async function updatePurchaseOrder(id: string, data: any) {
  await requirePermission("PurchaseOrders", "update");
  
  const totalAmount = data.items.reduce((sum: number, item: any) => sum + (Number(item.qty) * Number(item.rate)), 0);

  await prisma.purchaseOrderItem.deleteMany({
    where: { purchaseOrderId: id }
  });

  const po = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      supplierId: data.supplierId,
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

  revalidatePath("/buying");
  revalidatePath(`/buying/${id}`);
  return serializeData(po);
}

export async function updatePurchaseOrderStatus(id: string, status: string) {
  await requirePermission("PurchaseOrders", "update");
  const po = await prisma.purchaseOrder.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/buying");
  revalidatePath(`/buying/${id}`);
  return serializeData(po);
}

export async function deletePurchaseOrder(id: string) {
  await requirePermission("PurchaseOrders", "delete");
  await prisma.purchaseOrder.delete({ where: { id } });
  revalidatePath("/buying");
}

export async function receivePurchaseOrder(id: string) {
  const user = await requirePermission("PurchaseOrders", "update");
  
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: { include: { item: true } } },
  });

  if (!po) throw new Error("PO not found");
  if (po.status === "RECEIVED") throw new Error("PO already received");

  // Create Stock Ledger Entries inside a transaction
  await prisma.$transaction(async (tx) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;

    let itemIndex = 1;
    for (const poItem of po.items) {
      const batchNumber = `RM-${dateStr}-${po.id.substring(po.id.length - 4).toUpperCase()}-${itemIndex++}`;

      const batch = await tx.batch.create({
        data: {
          batchNumber,
          itemId: poItem.itemId,
          quantity: poItem.qty,
          uom: poItem.item.uom,
          source: "PURCHASE",
        }
      });

      await tx.stockLedgerEntry.create({
        data: {
          itemId: poItem.itemId,
          batchId: batch.id,
          warehouse: "MAIN",
          quantity: poItem.qty,
          movementType: "RECEIPT",
          referenceId: po.id,
          notes: `Received from PO ${po.poNumber}`,
        }
      });
    }

    await tx.purchaseOrder.update({
      where: { id },
      data: { status: "RECEIVED" },
    });
    
    await tx.auditLog.create({
      data: {
        userId: user.id,
        event: "PO_RECEIVED",
        metadata: JSON.stringify({ poId: po.id }),
      }
    });
  });

  revalidatePath("/buying");
  revalidatePath(`/buying/${id}`);
  revalidatePath("/stock");
}
