import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { jobCardId, type, amount } = await request.json();

    if (!type || !amount) {
      return NextResponse.json(
        { error: "Type and amount are required" },
        { status: 400 }
      );
    }

    // Find the active job card (or use provided id)
    let jobCard;
    if (jobCardId) {
      jobCard = await prisma.jobCard.findUnique({ where: { id: jobCardId } });
    } else {
      // Default to the first ACTIVE job card
      jobCard = await prisma.jobCard.findFirst({
        where: { status: "ACTIVE" },
        include: { workOrder: true },
      });
    }

    if (!jobCard) {
      return NextResponse.json(
        { error: "No active job card found" },
        { status: 404 }
      );
    }

    if (type === "METERS") {
      // Update good qty on job card and produced qty on work order
      const updatedJobCard = await prisma.jobCard.update({
        where: { id: jobCard.id },
        data: { goodQty: { increment: amount } },
      });

      await prisma.workOrder.update({
        where: { id: jobCard.workOrderId },
        data: { producedQty: { increment: amount } },
      });

      return NextResponse.json({
        success: true,
        message: `Logged +${amount} meters`,
        goodQty: updatedJobCard.goodQty,
      });
    } else if (type === "SCRAP") {
      const updatedJobCard = await prisma.jobCard.update({
        where: { id: jobCard.id },
        data: { scrapQty: { increment: amount } },
      });

      return NextResponse.json({
        success: true,
        message: `Logged ${amount}kg scrap`,
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
