"use server";

import prisma from "@/lib/prisma";

export async function getTemplateForBatch(batchNumber: string) {
  try {
    const batch = await prisma.batch.findUnique({
      where: { batchNumber },
      include: { item: true },
    });

    if (!batch || !batch.item.qcTemplate) return null;
    
    return JSON.parse(batch.item.qcTemplate);
  } catch (err) {
    console.error("Failed to fetch QC template:", err);
    return null;
  }
}
