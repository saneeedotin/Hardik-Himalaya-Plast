import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/core";
import prisma from "@/lib/prisma";
import { z } from "zod";

const handoverSchema = z.object({
  shiftType: z.string(),
  workstationId: z.string(),
  scrapGeneratedQty: z.number().min(0),
  notes: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = handoverSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
    }

    const { shiftType, workstationId, scrapGeneratedQty, notes } = result.data;

    // Determine shiftDate based on current time
    // If it's night shift (e.g., past midnight), the logical date might be the previous day, 
    // but we'll use simple current date for simplicity.
    const handover = await prisma.shiftHandover.create({
      data: {
        shiftDate: new Date(),
        shiftType,
        workstationId,
        outgoingOperatorId: session.user.id,
        scrapGeneratedQty,
        notes,
        status: "PENDING",
      }
    });

    return NextResponse.json({ success: true, handoverId: handover.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { handoverId } = await request.json();

    const handover = await prisma.shiftHandover.update({
      where: { id: handoverId },
      data: {
        incomingOperatorId: session.user.id,
        status: "ACCEPTED",
        acceptedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, handover });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
