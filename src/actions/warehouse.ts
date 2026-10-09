"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function receiveRM(barcode: string) {
  try {
    // In a real scenario, barcode might be a Purchase Order ID or batch ID.
    // For this prototype, we'll assume the barcode represents a pending PO or incoming batch ID.
    // Let's create a new Batch of PVC Resin.
    
    // Find the RM-PVC-K67 item
    const pvcItem = await prisma.item.findUnique({
      where: { code: "RM-PVC-K67" },
    });

    if (!pvcItem) throw new Error("PVC Resin item not found in DB.");

    // Create a new batch
    const newBatch = await prisma.batch.create({
      data: {
        batchNumber: `BATCH-RM-${barcode}-${Date.now().toString().slice(-4)}`,
        itemId: pvcItem.id,
        quantity: 25, // 25 Kg standard bag
        uom: "Kg",
        source: "PURCHASE",
      },
    });

    // Create a stock ledger entry (optional, if we track ledger strictly)
    await prisma.stockLedgerEntry.create({
      data: {
        itemId: pvcItem.id,
        batchId: newBatch.id,
        warehouse: "MAIN",
        quantity: 25,
        movementType: "RECEIPT",
        referenceId: barcode,
        notes: "Received via Tablet App",
      },
    });

    revalidatePath("/stock/inward");
    
    return { 
      success: true, 
      batch: {
        id: newBatch.batchNumber,
        material: pvcItem.name,
        qty: newBatch.quantity,
        time: newBatch.createdAt.toLocaleTimeString()
      }
    };
  } catch (error: any) {
    console.error("Error receiving RM:", error);
    return { success: false, error: error.message };
  }
}

export async function verifyMixingBOM(jobCardId: string, resinBarcode: string, masterbatchBarcode: string) {
  try {
    // In a full implementation, this would look up the jobCardId, get its BOM, 
    // and verify the resin/MB batches exist and match the BOM components.
    
    // For the prototype, we just verify they exist in the DB (or mock the validation logic)
    // Let's ensure the JobCard exists
    const jobCard = await prisma.jobCard.findFirst({
      where: { 
        workOrder: { workOrderNumber: jobCardId } 
      }
    });

    // If job card doesn't exist by WO number, let's just do a dummy pass if they type standard codes
    if (resinBarcode.includes("ERR") || masterbatchBarcode.includes("ERR") || jobCardId.includes("ERR")) {
      return { success: false, error: "Mismatch Detected! Components do not match BOM." };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
