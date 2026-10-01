import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, hashPassword, verifyPassword, logAudit } from "@/lib/auth/core";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
    }

    const { currentPassword, newPassword } = result.data;
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValid = await verifyPassword(user.passwordHash, currentPassword);
    if (!isValid) {
      await logAudit(user.id, "PASSWORD_CHANGE_FAILED", ip);
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    });

    await logAudit(user.id, "PASSWORD_CHANGED", ip);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
