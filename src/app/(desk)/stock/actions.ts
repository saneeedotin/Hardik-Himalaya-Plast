"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/rbac";

function serializeData(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getInventoryStatus() {
  await requirePermission("Stock", "read");

  const [ledgers, items, reservations] = await Promise.all([
    prisma.stockLedgerEntry.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.item.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.stockReservation.findMany({
      where: { status: "RESERVED" },
    }),
  ]);

  // Aggregate reserved stock by itemId
  const reservedMap = new Map<string, number>();
  for (const r of reservations) {
    reservedMap.set(r.itemId, (reservedMap.get(r.itemId) || 0) + r.quantity);
  }

  // Aggregate movements by itemId
  const physicalMap = new Map<string, { stock: number; lastMovement: Date | null }>();
  for (const entry of ledgers) {
    if (!physicalMap.has(entry.itemId)) {
      physicalMap.set(entry.itemId, { stock: 0, lastMovement: null });
    }
    const current = physicalMap.get(entry.itemId)!;

    if (["RECEIPT", "PRODUCTION_OUTPUT", "PRODUCTION", "RECOVERY", "ADJUSTMENT_IN"].includes(entry.movementType)) {
      current.stock += entry.quantity;
    } else if (["CONSUMPTION", "SCRAP", "DISPATCH", "ADJUSTMENT_OUT"].includes(entry.movementType)) {
      current.stock -= entry.quantity;
    }

    if (!current.lastMovement || new Date(entry.createdAt) > current.lastMovement) {
      current.lastMovement = new Date(entry.createdAt);
    }
  }

  // Compile full 3-tier inventory report for every item
  const inventory = items.map((item) => {
    const stats = physicalMap.get(item.id) || { stock: 0, lastMovement: null };
    const physicalStock = Math.round(stats.stock * 100) / 100;
    const reservedStock = Math.round((reservedMap.get(item.id) || 0) * 100) / 100;
    const availableStock = Math.max(0, Math.round((physicalStock - reservedStock) * 100) / 100);
    const minStock = Number(item.minStockLevel || 0);
    const reorderAlert = physicalStock < minStock && minStock > 0;

    return {
      item,
      physicalStock,
      reservedStock,
      availableStock,
      stock: physicalStock, // backwards compatibility
      reorderAlert,
      minStockLevel: minStock,
      lastMovement: stats.lastMovement,
      tier: item.category, // RAW_MATERIAL, FINISHED_GOODS, SCRAP
    };
  });

  return serializeData(inventory);
}

export async function getStockLedgerEntries() {
  await requirePermission("Stock", "read");

  const [entries, items] = await Promise.all([
    prisma.stockLedgerEntry.findMany({
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to 100 recent entries for UI performance
    }),
    prisma.item.findMany(),
  ]);

  const itemsMap = new Map(items.map((i: any) => [i.id, i]));

  const enrichedEntries = entries.map((entry: any) => ({
    ...entry,
    item: itemsMap.get(entry.itemId) || { id: entry.itemId, name: "Unknown Item", code: "UNKNOWN", uom: "" },
  }));

  return serializeData(enrichedEntries);
}

export async function getBatches() {
  await requirePermission("Stock", "read");
  const batches = await prisma.batch.findMany({
    include: {
      item: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return serializeData(batches);
}
