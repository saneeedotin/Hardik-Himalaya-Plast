"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { revalidatePath } from "next/cache";

function serializeData(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getWorkOrders() {
  await requirePermission("WorkOrders", "read");
  const wos = await prisma.workOrder.findMany({
    include: {
      fgItem: true,
      salesOrder: true,
      jobCards: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return serializeData(wos);
}

export async function getWorkOrder(id: string) {
  await requirePermission("WorkOrders", "read");
  const wo = await prisma.workOrder.findUnique({
    where: { id },
    include: {
      fgItem: true,
      salesOrder: true,
      jobCards: {
        include: {
          workstation: true,
          assignedUser: true,
        }
      },
    },
  });
  return wo ? serializeData(wo) : null;
}

export async function createWorkOrder(data: any) {
  await requirePermission("WorkOrders", "create");
  
  const count = await prisma.workOrder.count();
  const workOrderNumber = `PROD-WO-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

  const wo = await prisma.workOrder.create({
    data: {
      workOrderNumber,
      salesOrderId: data.salesOrderId || null,
      fgItemId: data.fgItemId,
      plannedQty: Number(data.plannedQty),
      status: "PENDING",
      fgBatchNumber: data.fgBatchNumber || null,
    },
  });

  revalidatePath("/work-orders");
  return serializeData(wo);
}

export async function updateWorkOrder(id: string, data: any) {
  await requirePermission("WorkOrders", "update");

  const oldWo = await prisma.workOrder.findUnique({ where: { id } });
  if (!oldWo) throw new Error("Work order not found");

  const wo = await prisma.workOrder.update({
    where: { id },
    data: {
      salesOrderId: data.salesOrderId !== undefined ? (data.salesOrderId || null) : oldWo.salesOrderId,
      fgItemId: data.fgItemId !== undefined ? data.fgItemId : oldWo.fgItemId,
      plannedQty: data.plannedQty !== undefined ? Number(data.plannedQty) : oldWo.plannedQty,
      status: data.status !== undefined ? data.status : oldWo.status,
      fgBatchNumber: data.fgBatchNumber !== undefined ? (data.fgBatchNumber || null) : oldWo.fgBatchNumber,
    },
  });

  // If status changed to COMPLETED, add to stock ledger
  if (data.status === "COMPLETED" && oldWo.status !== "COMPLETED") {
    if (wo.producedQty > 0) {
      await prisma.stockLedgerEntry.create({
        data: {
          itemId: wo.fgItemId,
          quantity: wo.producedQty,
          movementType: "PRODUCTION",
          referenceId: wo.id,
          notes: `Work Order ${wo.workOrderNumber} Completed`,
          batchId: wo.fgBatchNumber || undefined,
        },
      });
    }
  }

  revalidatePath("/work-orders");
  revalidatePath(`/work-orders/${id}`);
  return serializeData(wo);
}

export async function deleteWorkOrder(id: string) {
  await requirePermission("WorkOrders", "delete");
  await prisma.workOrder.delete({ where: { id } });
  revalidatePath("/work-orders");
}

export async function getBOMForItem(itemId: string) {
  const bom = await prisma.bOM.findFirst({
    where: { fgItemId: itemId },
    include: {
      materials: {
        include: { rmItem: true }
      }
    }
  });
  return bom ? serializeData(bom) : null;
}
