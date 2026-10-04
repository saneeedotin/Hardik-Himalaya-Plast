"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { revalidatePath } from "next/cache";

function serializeData(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getShiftHandovers() {
  await requirePermission("WorkOrders", "read"); // Using WorkOrders permissions for production tracking
  const handovers = await prisma.shiftHandover.findMany({
    include: {
      workstation: true,
      outgoingOperator: true,
      incomingOperator: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return serializeData(handovers);
}

export async function getShiftHandover(id: string) {
  await requirePermission("WorkOrders", "read");
  const h = await prisma.shiftHandover.findUnique({
    where: { id },
    include: {
      workstation: true,
      outgoingOperator: true,
      incomingOperator: true,
    },
  });
  return h ? serializeData(h) : null;
}

export async function createShiftHandover(data: any) {
  await requirePermission("WorkOrders", "create");
  
  const h = await prisma.shiftHandover.create({
    data: {
      shiftDate: new Date(data.shiftDate),
      shiftType: data.shiftType,
      workstationId: data.workstationId,
      outgoingOperatorId: data.outgoingOperatorId,
      incomingOperatorId: data.incomingOperatorId || null,
      scrapGeneratedQty: Number(data.scrapGeneratedQty || 0),
      notes: data.notes || null,
      status: data.status || "PENDING",
    },
  });

  revalidatePath("/shift-handovers");
  return serializeData(h);
}

export async function updateShiftHandover(id: string, data: any) {
  await requirePermission("WorkOrders", "update");

  const h = await prisma.shiftHandover.update({
    where: { id },
    data: {
      shiftDate: new Date(data.shiftDate),
      shiftType: data.shiftType,
      workstationId: data.workstationId,
      outgoingOperatorId: data.outgoingOperatorId,
      incomingOperatorId: data.incomingOperatorId || null,
      scrapGeneratedQty: Number(data.scrapGeneratedQty || 0),
      notes: data.notes || null,
      status: data.status,
    },
  });

  revalidatePath("/shift-handovers");
  revalidatePath(`/shift-handovers/${id}`);
  return serializeData(h);
}

export async function deleteShiftHandover(id: string) {
  await requirePermission("WorkOrders", "delete");
  await prisma.shiftHandover.delete({ where: { id } });
  revalidatePath("/shift-handovers");
}
