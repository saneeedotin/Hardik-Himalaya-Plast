import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { logAudit } from "@/lib/auth/core";
import { z } from "zod";

const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  roleIds: z.array(z.string()).optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requirePermission("users", "update");
    const { id } = await params;
    
    const body = await request.json();
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
    }

    const { isActive, roleIds } = result.data;
    
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    
    if (roleIds) {
      // Replace existing roles
      await prisma.userRole.deleteMany({ where: { userId: id } });
      updateData.roles = {
        create: roleIds.map(roleId => ({ roleId }))
      };
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    });

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    await logAudit(actor.id, "USER_UPDATED", ip, { targetUserId: id, updates: result.data });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 });
  }
}
