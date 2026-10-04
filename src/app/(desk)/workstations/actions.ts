"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { revalidatePath } from "next/cache";

function serializeData(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getWorkstations() {
  await requirePermission("Masters", "read"); // assuming workstations is a master
  const ws = await prisma.workstation.findMany({
    orderBy: { code: "asc" },
  });
  return serializeData(ws);
}

export async function getWorkstation(id: string) {
  await requirePermission("Masters", "read");
  const w = await prisma.workstation.findUnique({
    where: { id },
  });
  return w ? serializeData(w) : null;
}

export async function createWorkstation(data: any) {
  await requirePermission("Masters", "create");
  
  const w = await prisma.workstation.create({
    data: {
      code: data.code,
      name: data.name,
      hourlyRate: Number(data.hourlyRate || 0),
      status: data.status || "IDLE",
    },
  });

  revalidatePath("/workstations");
  return serializeData(w);
}

export async function updateWorkstation(id: string, data: any) {
  await requirePermission("Masters", "update");

  const w = await prisma.workstation.update({
    where: { id },
    data: {
      code: data.code,
      name: data.name,
      hourlyRate: Number(data.hourlyRate || 0),
      status: data.status,
    },
  });

  revalidatePath("/workstations");
  revalidatePath(`/workstations/${id}`);
  return serializeData(w);
}

export async function deleteWorkstation(id: string) {
  await requirePermission("Masters", "delete");
  await prisma.workstation.delete({ where: { id } });
  revalidatePath("/workstations");
}
