"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { revalidatePath } from "next/cache";

export async function getBOMs() {
  await requirePermission("Items", "read"); // BOM falls under items/production
  return prisma.bOM.findMany({
    include: {
      fgItem: true,
      materials: {
        include: {
          rmItem: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getBOM(id: string) {
  await requirePermission("Items", "read");
  return prisma.bOM.findUnique({
    where: { id },
    include: {
      fgItem: true,
      materials: {
        include: {
          rmItem: true,
        },
      },
    },
  });
}

export async function createBOM(data: {
  name: string;
  fgItemId: string;
  outputQty: number;
  scrapFactor: number;
  materials: { rmItemId: string; qtyPerUnit: number }[];
}) {
  const user = await requirePermission("Items", "write");

  const bom = await prisma.bOM.create({
    data: {
      name: data.name,
      fgItemId: data.fgItemId,
      outputQty: data.outputQty,
      scrapFactor: data.scrapFactor,
      materials: {
        create: data.materials.map(m => ({
          rmItemId: m.rmItemId,
          qtyPerUnit: m.qtyPerUnit,
        })),
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      event: "BOM_CREATED",
      metadata: JSON.stringify({ bomId: bom.id }),
    },
  });

  revalidatePath("/boms");
  return bom;
}

export async function updateBOM(id: string, data: {
  name: string;
  fgItemId: string;
  outputQty: number;
  scrapFactor: number;
  materials: { rmItemId: string; qtyPerUnit: number }[];
}) {
  const user = await requirePermission("Items", "write");

  const bom = await prisma.bOM.update({
    where: { id },
    data: {
      name: data.name,
      fgItemId: data.fgItemId,
      outputQty: data.outputQty,
      scrapFactor: data.scrapFactor,
      materials: {
        deleteMany: {}, // Delete old materials
        create: data.materials.map(m => ({ // Recreate them
          rmItemId: m.rmItemId,
          qtyPerUnit: m.qtyPerUnit,
        })),
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      event: "BOM_UPDATED",
      metadata: JSON.stringify({ bomId: bom.id }),
    },
  });

  revalidatePath("/boms");
  return bom;
}

export async function deleteBOM(id: string) {
  const user = await requirePermission("Items", "write");
  await prisma.bOM.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      event: "BOM_DELETED",
      metadata: JSON.stringify({ bomId: id }),
    },
  });

  revalidatePath("/boms");
}
