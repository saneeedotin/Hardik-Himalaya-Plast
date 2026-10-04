import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { cartonCode, override = false, overrideNote = "" } = await request.json();

    if (!cartonCode) {
      return NextResponse.json(
        { error: "Carton code is required" },
        { status: 400 }
      );
    }

    // Find carton label
    const carton = await prisma.cartonLabel.findUnique({
      where: { cartonCode },
      include: {
        deliveryNote: {
          include: { cartons: true },
        },
        batch: {
          include: { item: true },
        },
      },
    });

    if (!carton) {
      return NextResponse.json(
        { error: `Carton code "${cartonCode}" not recognized in system.` },
        { status: 404 }
      );
    }

    if (carton.scanned && !override) {
      return NextResponse.json(
        {
          error: `Carton "${cartonCode}" was already scanned previously.`,
          alreadyScanned: true,
          carton,
        },
        { status: 409 }
      );
    }

    // Mark as scanned
    const updated = await prisma.cartonLabel.update({
      where: { id: carton.id },
      data: {
        scanned: true,
        scannedAt: new Date(),
        dispatchOverride: override,
        dispatchOverrideNote: override ? overrideNote : null,
      },
      include: {
        deliveryNote: {
          include: {
            cartons: true,
          },
        },
        batch: {
          include: { item: true },
        },
      },
    });

    const allCartons = updated.deliveryNote.cartons;
    const scannedCount = allCartons.filter((c) => c.scanned).length;
    const totalCount = allCartons.length;
    const isComplete = scannedCount === totalCount;

    if (isComplete) {
      await prisma.deliveryNote.update({
        where: { id: updated.deliveryNoteId },
        data: {
          status: "DISPATCHED",
          dispatchedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Scanned carton ${cartonCode} (${updated.quantity}m ${updated.batch.item.name})`,
      carton: updated,
      scannedCount,
      totalCount,
      isComplete,
    });
  } catch (error: any) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during scan." },
      { status: 500 }
    );
  }
}
