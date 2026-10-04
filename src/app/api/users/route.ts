import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { hashPassword, logAudit } from "@/lib/auth/core";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  employeeCode: z.string().optional(),
  roleIds: z.array(z.string()).min(1, "At least one role is required")
});

export async function GET(request: Request) {
  try {
    await requirePermission("users", "read");
    
    const users = await prisma.user.findMany({
      include: {
        roles: { include: { role: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const safeUsers = users.map(u => {
      const { passwordHash, ...safe } = u;
      return safe;
    });

    return NextResponse.json({ users: safeUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 });
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requirePermission("users", "create");
    
    const body = await request.json();
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
    }

    const { email, name, password, employeeCode, roleIds } = result.data;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        employeeCode,
        roles: {
          create: roleIds.map(roleId => ({ roleId }))
        }
      }
    });

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    await logAudit(actor.id, "USER_CREATED", ip, { targetUserId: newUser.id, email });

    return NextResponse.json({ success: true, userId: newUser.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 });
  }
}
