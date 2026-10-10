"use server";

import prisma from "@/lib/prisma";

export async function getTemplateForBatch(batchNumber: string) {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/batches/${batchNumber}/qc-template`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.template ? JSON.parse(data.template) : null;
  } catch (err) {
    console.error("Failed to fetch QC template:", err);
    return null;
  }
}
