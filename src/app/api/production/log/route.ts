import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { jobCardId, type, amount } = await request.json();

    if (!type || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Valid type (METERS or SCRAP) and positive amount are required." },
        { status: 400 }
      );
    }

    const logAmount = Number(amount);

    // Find the active job card (or use provided id)
    let jobCard;
    if (jobCardId) {
      jobCard = await prisma.jobCard.findUnique({
        where: { id: jobCardId },
        include: { workOrder: true },
      });
    } else {
      jobCard = await prisma.jobCard.findFirst({
        where: { status: "ACTIVE" },
        include: { workOrder: true },
      });
    }

    if (!jobCard) {
      return NextResponse.json(
        { error: "No active job card found." },
        { status: 404 }
      );
    }

    if (type === "METERS") {
      // 1. Check raw material stock availability from BOM to prevent negative inventory
      if (jobCard.workOrder?.fgItemId) {
        const bom = await prisma.bOM.findFirst({
          where: { fgItemId: jobCard.workOrder.fgItemId },
          include: { materials: { include: { rmItem: true } } },
        });

        if (bom) {
          const multiplier = logAmount / (bom.outputQty > 0 ? bom.outputQty : 1);
          const scrapMultiplier = 1 / (1 - (bom.scrapFactor || 0.025));

          // Pre-flight check: ensure every ingredient has sufficient stock
          for (const mat of bom.materials) {
            const rmConsumed = Math.round(mat.qtyPerUnit * multiplier * scrapMultiplier * 100) / 100;
            const ledgers = await prisma.stockLedgerEntry.findMany({
              where: { itemId: mat.rmItemId },
            });

            let currentPhysicalStock = 0;
            for (const l of ledgers) {
              if (["RECEIPT", "PRODUCTION_OUTPUT", "PRODUCTION", "RECOVERY", "ADJUSTMENT_IN"].includes(l.movementType)) {
                currentPhysicalStock += l.quantity;
              } else if (["CONSUMPTION", "SCRAP", "DISPATCH", "ADJUSTMENT_OUT"].includes(l.movementType)) {
                currentPhysicalStock -= l.quantity;
              }
            }

            if (currentPhysicalStock < rmConsumed) {
              return NextResponse.json(
                {
                  error: `Strict Negative Stock Protection: Insufficient physical stock for ${mat.rmItem.name} (${mat.rmItem.code}). In Stock: ${currentPhysicalStock.toFixed(2)} ${mat.rmItem.uom}, Required: ${rmConsumed.toFixed(2)} ${mat.rmItem.uom}.`,
                },
                { status: 400 }
              );
            }
          }

          // Atomically record RM consumption in stock ledger & update reservations
          for (const mat of bom.materials) {
            const rmConsumed = Math.round(mat.qtyPerUnit * multiplier * scrapMultiplier * 100) / 100;

            await prisma.stockLedgerEntry.create({
              data: {
                itemId: mat.rmItemId,
                warehouse: "MAIN",
                quantity: rmConsumed,
                movementType: "CONSUMPTION",
                referenceId: jobCard.workOrderId,
                notes: `BOM Consumption for +${logAmount}m extrusion on Job Card ${jobCard.id}`,
              },
            });

            // If linked to SalesOrder with reservation, release reservation
            if (jobCard.workOrder.salesOrderId) {
              const res = await prisma.stockReservation.findFirst({
                where: {
                  salesOrderId: jobCard.workOrder.salesOrderId,
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
        }
      }

      // 2. Update good qty on job card and produced qty on work order
      const updatedJobCard = await prisma.jobCard.update({
        where: { id: jobCard.id },
        data: { goodQty: { increment: logAmount } },
      });

      await prisma.workOrder.update({
        where: { id: jobCard.workOrderId },
        data: { producedQty: { increment: logAmount } },
      });

      // 3. Stock ledger for PRODUCTION_OUTPUT of Finished Goods
      if (jobCard.workOrder?.fgItemId) {
        await prisma.stockLedgerEntry.create({
          data: {
            itemId: jobCard.workOrder.fgItemId,
            warehouse: "MAIN",
            quantity: logAmount,
            movementType: "PRODUCTION_OUTPUT",
            referenceId: jobCard.workOrderId,
            notes: `Extruded +${logAmount} meters on Job Card ${jobCard.id}`,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Logged +${logAmount} meters with BOM compound consumption`,
        goodQty: updatedJobCard.goodQty,
      });
    } else if (type === "SCRAP") {
      const updatedJobCard = await prisma.jobCard.update({
        where: { id: jobCard.id },
        data: { scrapQty: { increment: logAmount } },
      });

      // Log scrap in ledger
      if (jobCard.workOrder?.fgItemId) {
        await prisma.stockLedgerEntry.create({
          data: {
            itemId: jobCard.workOrder.fgItemId,
            warehouse: "QC_HOLD",
            quantity: logAmount,
            movementType: "SCRAP",
            referenceId: jobCard.workOrderId,
            notes: `Logged ${logAmount}kg purge/trim scrap on Job Card ${jobCard.id}`,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Logged ${logAmount}kg scrap purge`,
        scrapQty: updatedJobCard.scrapQty,
      });
    }

    return NextResponse.json(
      { error: "Invalid type. Must be METERS or SCRAP." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Production log error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to log production data." },
      { status: 500 }
    );
  }
}
