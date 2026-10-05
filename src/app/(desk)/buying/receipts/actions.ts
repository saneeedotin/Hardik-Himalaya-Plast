"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPurchaseReceipts() {
  return prisma.purchaseReceipt.findMany({
    include: {
      supplier: true,
      purchaseOrder: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPurchaseReceiptById(id: string) {
  return prisma.purchaseReceipt.findUnique({
    where: { id },
    include: {
      supplier: true,
      purchaseOrder: true,
      items: {
        include: {
          item: true,
          batch: true,
        },
      },
    },
  });
}

export async function createPurchaseReceipt(formData: FormData) {
  const supplierId = formData.get("supplierId") as string;
  const purchaseOrderId = formData.get("purchaseOrderId") as string;
  const receiptDate = formData.get("receiptDate") as string;
  const notes = formData.get("notes") as string;
  
  // Fetch PO items to copy them to the receipt
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: purchaseOrderId },
    include: { items: true },
  });

  const count = await prisma.purchaseReceipt.count();
  const receiptNumber = `GRN-2026-${String(count + 1).padStart(5, '0')}`;

  const pr = await prisma.purchaseReceipt.create({
    data: {
      receiptNumber,
      supplierId,
      purchaseOrderId,
      receiptDate: receiptDate ? new Date(receiptDate) : new Date(),
      notes,
      status: "DRAFT",
      totalAmount: po ? po.totalAmount : 0,
      items: {
        create: po?.items.map(item => ({
          itemId: item.itemId,
          qty: item.qty,
          rate: item.rate,
          amount: item.amount,
        })) || []
      }
    },
  });

  revalidatePath("/buying/receipts");
  return pr;
}

export async function submitPurchaseReceipt(id: string) {
  const pr = await prisma.purchaseReceipt.findUnique({
    where: { id },
    include: { items: { include: { item: true } } },
  });

  if (!pr || pr.status !== "DRAFT") {
    throw new Error("Invalid receipt or already submitted");
  }

  // 1. Create Batches and Stock Ledger Entries
  await prisma.$transaction(async (tx) => {
    for (const item of pr.items) {
      // Create a batch for the received material
      const batchCode = `BATCH-${pr.receiptNumber}-${item.itemId.substring(0, 4).toUpperCase()}`;
      const batch = await tx.batch.create({
        data: {
          batchNumber: batchCode,
          itemId: item.itemId,
          quantity: item.qty,
          uom: item.item.uom,
          source: "PURCHASE",
        }
      });

      // Link batch to the receipt item
      await tx.purchaseReceiptItem.update({
        where: { id: item.id },
        data: { batchId: batch.id }
      });

      // Add to Stock Ledger
      await tx.stockLedgerEntry.create({
        data: {
          itemId: item.itemId,
          quantity: item.qty,
          batchId: batch.id,
          warehouse: "MAIN", // Default warehouse
          movementType: "RECEIPT",
          referenceId: pr.id,
          notes: "Purchase Receipt: " + pr.receiptNumber,
        }
      });
    }

    // 2. Mark PR as SUBMITTED
    await tx.purchaseReceipt.update({
      where: { id },
      data: { status: "SUBMITTED" }
    });

    // 3. Mark PO as CLOSED if fully received (simplified logic)
    await tx.purchaseOrder.update({
      where: { id: pr.purchaseOrderId },
      data: { status: "CLOSED" }
    });
  });

  revalidatePath("/buying/receipts");
  revalidatePath(`/buying/receipts/${id}`);
  return { success: true };
}

