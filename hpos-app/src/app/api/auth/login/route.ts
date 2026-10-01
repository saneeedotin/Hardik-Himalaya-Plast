import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSession, handleFailedLogin, resetFailedLogin, logAudit } from "@/lib/auth/core";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
    }

    const { email, password } = result.data;
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Avoid time-based enumeration attacks by doing a dummy verify
      // await verifyPassword("dummy", password);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.isActive) {
      await logAudit(user.id, "LOGIN_FAILED_INACTIVE", ip);
      return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await logAudit(user.id, "LOGIN_FAILED_LOCKED", ip);
      return NextResponse.json({ error: "Account locked. Try again later." }, { status: 403 });
    }

    const isValid = await verifyPassword(user.passwordHash, password);

    if (!isValid) {
      await handleFailedLogin(user.id);
      await logAudit(user.id, "LOGIN_FAILED_BAD_PASSWORD", ip);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await resetFailedLogin(user.id);
    await logAudit(user.id, "LOGIN_SUCCESS", ip, { userAgent });

    await createSession(user.id, userAgent, ip);

    return NextResponse.json({ success: true, redirect: "/" });
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
