import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/core";
import prisma from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    // Omit sensitive data
    const { passwordHash, ...safeUser } = session.user;
    
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  dob: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
});

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
    }

    const { name, dob, phone, bio } = result.data;
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (dob !== undefined) updateData.dob = dob ? new Date(dob) : null;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    const { passwordHash, ...safeUser } = updatedUser;
    
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
