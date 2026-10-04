"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { revalidatePath } from "next/cache";

export async function getFGBatches(itemId: string) {
  await requirePermission("Stock", "read");
  // Get batches that are EXTRUSION generated
  const batches = await prisma.batch.findMany({
    where: { 
      itemId,
      source: "EXTRUSION"
    },
    orderBy: { createdAt: "desc" }
  });

  // Calculate current stock from ledger if needed, but for now just return the batches
  // In a robust system, we would JOIN StockLedgerEntry to get current balance.
  return batches;
}

export async function generateDeliveryNoteAndPack(data: {
  salesOrderId: string;
  customerName: string;
  items: Array<{
    batchId: string;
    itemId: string;
    cartonCount: number;
    qtyPerCarton: number;
  }>
}) {
  const user = await requirePermission("Orders", "write");

  // 1. Create Delivery Note
  const count = await prisma.deliveryNote.count();
  const dnNumber = `DN-26-${String(count + 1).padStart(5, "0")}`;

  const deliveryNote = await prisma.deliveryNote.create({
    data: {
      dnNumber,
      salesOrderId: data.salesOrderId,
      customerName: data.customerName,
      status: "DRAFT"
    }
  });

  // 2. Generate Cartons
  const cartonCreations = [];
  let totalQty = 0;

  for (const item of data.items) {
    totalQty += item.cartonCount * item.qtyPerCarton;
    for (let i = 0; i < item.cartonCount; i++) {
      const code = `HP-CTN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
      cartonCreations.push({
        cartonCode: code,
        deliveryNoteId: deliveryNote.id,
        batchId: item.batchId,
        quantity: item.qtyPerCarton,
      });
    }
  }

  await prisma.cartonLabel.createMany({
    data: cartonCreations
  });

  // 3. Update Sales Order status to DISPATCH_PREP
  await prisma.salesOrder.update({
    where: { id: data.salesOrderId },
    data: { status: "DISPATCH_PREP" }
  });

  revalidatePath("/dispatch");
  revalidatePath("/orders");
  revalidatePath(`/orders/${data.salesOrderId}`);

  return { success: true, deliveryNoteId: deliveryNote.id };
}

export async function getDeliveryNotes() {
  await requirePermission("Orders", "read");
  return prisma.deliveryNote.findMany({
    include: {
      salesOrder: true,
      cartons: {
        include: {
          batch: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDeliveryNote(id: string) {
  await requirePermission("Orders", "read");
  return prisma.deliveryNote.findUnique({
    where: { id },
    include: {
      salesOrder: {
        include: {
          customer: true,
          items: {
            include: { item: true },
          },
        },
      },
      cartons: {
        include: {
          batch: true,
        },
      },
    },
  });
}
