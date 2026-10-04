"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { revalidatePath } from "next/cache";

function serializeData(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function createJobCard(data: any) {
  await requirePermission("WorkOrders", "create");
  
  const jc = await prisma.jobCard.create({
    data: {
      workOrderId: data.workOrderId,
      workstationId: data.workstationId,
      assignedUserId: data.assignedUserId || null,
      dieId: data.dieId || null,
      status: "QUEUED",
      goodQty: 0,
      scrapQty: 0,
    },
  });

  revalidatePath(`/work-orders/${data.workOrderId}`);
  revalidatePath("/production");
  return serializeData(jc);
}

export async function updateJobCard(id: string, data: any) {
  await requirePermission("WorkOrders", "update");

  const jc = await prisma.jobCard.update({
    where: { id },
    data: {
      workstationId: data.workstationId,
      assignedUserId: data.assignedUserId || null,
      dieId: data.dieId || null,
      status: data.status,
      goodQty: Number(data.goodQty || 0),
      scrapQty: Number(data.scrapQty || 0),
    },
  });

  if (data.status === "COMPLETED") {
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: jc.workOrderId },
      include: { fgItem: true }
    });

    if (workOrder && workOrder.fgItemId) {
      const batchNumber = workOrder.fgBatchNumber || `FG-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${jc.id.slice(-4).toUpperCase()}`;
      
      const existingBatch = await prisma.batch.findUnique({
        where: { batchNumber }
      });

      if (!existingBatch) {
        await prisma.batch.create({
          data: {
            batchNumber,
            itemId: workOrder.fgItemId,
            quantity: workOrder.producedQty,
            uom: workOrder.fgItem.uom,
            source: "EXTRUSION"
          }
        });

        // Also if the fgBatchNumber wasn't explicitly set in the workOrder, update it
        if (!workOrder.fgBatchNumber) {
          await prisma.workOrder.update({
            where: { id: workOrder.id },
            data: { fgBatchNumber: batchNumber }
          });
        }
      }
    }
  }

  revalidatePath(`/work-orders/${jc.workOrderId}`);
  revalidatePath("/production");
  return serializeData(jc);
}

export async function deleteJobCard(id: string) {
  await requirePermission("WorkOrders", "delete");
  const jc = await prisma.jobCard.findUnique({ where: { id } });
  if (jc) {
    await prisma.jobCard.delete({ where: { id } });
    revalidatePath(`/work-orders/${jc.workOrderId}`);
    revalidatePath("/production");
  }
}

// These functions fetch support data for the job card form
export async function getWorkstations() {
  await requirePermission("WorkOrders", "read"); // using WorkOrders permission for now
  const w = await prisma.workstation.findMany({ orderBy: { name: "asc" } });
  return serializeData(w);
}

export async function getDies() {
  await requirePermission("WorkOrders", "read");
  const d = await prisma.die.findMany({ orderBy: { code: "asc" } });
  return serializeData(d);
}

export async function getJobCard(id: string) {
  await requirePermission("WorkOrders", "read");
  const jc = await prisma.jobCard.findUnique({
    where: { id },
    include: {
      workOrder: true,
      workstation: true,
    }
  });
  return jc ? serializeData(jc) : null;
}

export async function getOperators() {
  await requirePermission("WorkOrders", "read");
  // Assuming all users can be operators for now
  const u = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return serializeData(u);
}
