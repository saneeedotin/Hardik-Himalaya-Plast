"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/rbac";

function serializeData(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getInventoryStatus() {
  await requirePermission("Stock", "read");

  const res = await fetch("http://127.0.0.1:8000/api/stock/inventory", {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    return [];
  }

  return await res.json();
}

export async function getStockLedgerEntries() {
  await requirePermission("Stock", "read");

  const res = await fetch("http://127.0.0.1:8000/api/stock/ledger", {
    cache: 'no-store'
  });

  if (!res.ok) {
    return [];
  }

  return await res.json();
}

export async function getBatches() {
  await requirePermission("Stock", "read");
  
  const res = await fetch("http://127.0.0.1:8000/api/stock/batches", {
    cache: 'no-store'
  });

  if (!res.ok) {
    return [];
  }

  return await res.json();
}
