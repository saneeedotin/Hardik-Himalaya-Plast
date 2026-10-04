"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { revalidatePath } from "next/cache";

function serializeData(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getItems() {
  await requirePermission("Items", "read");
  const items = await prisma.item.findMany({
    orderBy: { category: "asc" },
  });
  return serializeData(items);
}

export async function getItem(id: string) {
  await requirePermission("Items", "read");
  const [item, ledgerAgg, resAgg] = await Promise.all([
    prisma.item.findUnique({
      where: { id },
      include: {
        boms: {
          include: {
            materials: {
              include: { rmItem: true },
            },
          },
        },
        bomItems: {
          include: {
            bom: {
              include: { fgItem: true },
            },
          },
        },
      },
    }),
    prisma.stockLedgerEntry.aggregate({
      where: { itemId: id },
      _sum: { quantity: true },
    }),
    prisma.stockReservation.aggregate({
      where: { itemId: id, status: "RESERVED" },
      _sum: { quantity: true },
    }),
  ]);

  if (!item) return null;

  const physicalStock = ledgerAgg._sum.quantity || 0;
  const reservedStock = resAgg._sum.quantity || 0;
  const availableStock = Math.max(0, physicalStock - reservedStock);

  return serializeData({
    ...item,
    physicalStock,
    reservedStock,
    availableStock,
  });
}

export async function createItem(data: {
  code: string;
  name: string;
  category: string;
  uom: string;
  hsnCode?: string;
  standardCost: number;
  minStockLevel: number;
}) {
  const user = await requirePermission("Items", "write");
  const item = await prisma.item.create({
    data: {
      code: data.code,
      name: data.name,
      category: data.category as any, // bypass ts error
      uom: data.uom,
      hsnCode: data.hsnCode || null,
      standardCost: data.standardCost,
      minStockLevel: data.minStockLevel,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      event: "ITEM_CREATED",
      metadata: JSON.stringify({ itemId: item.id, itemCode: item.code }),
    },
  });

  revalidatePath("/items");
  return serializeData(item);
}

export async function updateItem(id: string, data: {
  code?: string;
  name?: string;
  category?: string;
  uom?: string;
  hsnCode?: string;
  standardCost?: number;
  minStockLevel?: number;
}) {
  const user = await requirePermission("Items", "write");
  const item = await prisma.item.update({
    where: { id },
    data: { ...data, category: data.category as any },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      event: "ITEM_UPDATED",
      metadata: JSON.stringify({ itemId: item.id, itemCode: item.code }),
    },
  });

  revalidatePath("/items");
  return serializeData(item);
}

export async function deleteItem(id: string) {
  const user = await requirePermission("Items", "write");
  await prisma.item.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      event: "ITEM_DELETED",
      metadata: JSON.stringify({ itemId: id }),
    },
  });

  revalidatePath("/items");
}
