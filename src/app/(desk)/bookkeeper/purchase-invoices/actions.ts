"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPurchaseInvoices() {
  return prisma.purchaseInvoice.findMany({
    include: {
      supplier: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPurchaseInvoiceById(id: string) {
  return prisma.purchaseInvoice.findUnique({
    where: { id },
    include: {
      supplier: true,
    }
  });
}

export async function createPurchaseInvoice(formData: FormData) {
  const supplierId = formData.get("supplierId") as string;
  const invoiceDate = formData.get("invoiceDate") as string;
  const amount = formData.get("totalAmount") as string;
  
  const count = await prisma.purchaseInvoice.count();
  const invoiceNumber = `PI-2026-${String(count + 1).padStart(5, '0')}`;

  const inv = await prisma.purchaseInvoice.create({
    data: {
      invoiceNumber,
      supplierId,
      invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 3600000),
      totalAmount: parseFloat(amount) || 0,
      outstanding: parseFloat(amount) || 0,
      status: "DRAFT"
    }
  });

  revalidatePath("/bookkeeper/purchase-invoices");
  return inv;
}

export async function submitPurchaseInvoice(id: string) {
  const inv = await prisma.purchaseInvoice.update({
    where: { id },
    data: { status: "UNPAID" }
  });
  revalidatePath("/bookkeeper/purchase-invoices");
  revalidatePath(`/bookkeeper/purchase-invoices/${id}`);
  return inv;
}
