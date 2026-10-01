import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/core";
import prisma from "@/lib/prisma";
import { z } from "zod";

const logSchema = z.object({
  workstationId: z.string(),
  jobCardId: z.string().optional().nullable(),
  reasonCode: z.string(),
  notes: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = logSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
    }

    const { workstationId, jobCardId, reasonCode, notes } = result.data;

    const downtimeLog = await prisma.downtimeLog.create({
      data: {
        workstationId,
        jobCardId: jobCardId || undefined,
        reasonCode,
        notes,
        loggedById: session.user.id,
        startTime: new Date(),
      }
    });

    // Optionally update workstation status to "MAINTENANCE" or "IDLE"
    await prisma.workstation.update({
      where: { id: workstationId },
      data: { status: "MAINTENANCE" }, // or map based on reason code
    });

    return NextResponse.json({ success: true, logId: downtimeLog.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
