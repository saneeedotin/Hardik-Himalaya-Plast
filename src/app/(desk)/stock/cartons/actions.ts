"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/rbac";

export async function getFGCartons() {
  await requirePermission("Stock", "read");
  const cartons = await prisma.cartonLabel.findMany({
    include: {
      batch: {
        include: { item: true }
      },
      deliveryNote: {
        include: { salesOrder: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  
  return JSON.parse(JSON.stringify(cartons));
}
