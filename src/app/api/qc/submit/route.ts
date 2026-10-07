import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      batchNumber,
      status,
      sampleSize = 5,
      qcData,
      inspectorName = "Param (Founder)",
      reworkNotes,
    } = data;

    if (!batchNumber || !status) {
      return NextResponse.json(
        { error: "Batch number and QC status are required" },
        { status: 400 }
      );
    }

    const reportCount = await prisma.qualityInspection.count();
    const reportNumber = `QC-2026-${String(reportCount + 1).padStart(5, "0")}`;

    const inspection = await prisma.qualityInspection.create({
      data: {
        reportNumber,
        batchNumber,
        status: status,
        sampleSize: Number(sampleSize),
        qcData: qcData ? JSON.stringify(qcData) : null,
        inspectorName,
        reworkNotes: reworkNotes || null,
      },
    });

    // Check if the batch exists in the system to get the itemId
    const batch = await prisma.batch.findUnique({
      where: { batchNumber },
    });

    if (batch && status === "SCRAP") {
      await prisma.stockLedgerEntry.create({
        data: {
          itemId: batch.itemId,
          batchId: batch.id,
          warehouse: "QC_HOLD",
          quantity: batch.quantity,
          movementType: "SCRAP",
          referenceId: inspection.id,
          notes: `QC Scrapped via Report ${reportNumber}`,
        }
      });
    }

    return NextResponse.json({
      success: true,
      inspection,
    });
  } catch (error: any) {
    console.error("QC error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to record QC inspection." },
      { status: 500 }
    );
  }
}
