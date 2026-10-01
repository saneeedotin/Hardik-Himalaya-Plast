import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { QCStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      batchNumber,
      status,
      sampleSize = 5,
      pinSize,
      width,
      legThickness,
      linearWeight,
      fitTestResult,
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
        status: status as QCStatus,
        sampleSize: Number(sampleSize),
        pinSize: pinSize ? parseFloat(pinSize) : null,
        width: width ? parseFloat(width) : null,
        legThickness: legThickness ? parseFloat(legThickness) : null,
        linearWeight: linearWeight ? parseFloat(linearWeight) : null,
        fitTestResult: fitTestResult || "PASS",
        inspectorName,
        reworkNotes: reworkNotes || null,
      },
    });

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
