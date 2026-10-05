"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSalesInvoices() {
  return prisma.salesInvoice.findMany({
    include: {
      customer: true,
      salesOrder: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSalesInvoiceById(id: string) {
  return prisma.salesInvoice.findUnique({
    where: { id },
    include: {
      customer: true,
      salesOrder: true,
      deliveryNote: true,
      items: {
        include: {
          item: true,
        },
      },
      payments: true,
    },
  });
}

export async function createSalesInvoice(formData: FormData) {
  const customerId = formData.get("customerId") as string;
  const salesOrderId = formData.get("salesOrderId") as string;
  const invoiceDate = formData.get("invoiceDate") as string;
  const dueDate = formData.get("dueDate") as string;

  // Generate invoice number
  const count = await prisma.salesInvoice.count();
  const invoiceNumber = `INV-2026-${String(count + 1).padStart(5, '0')}`;

  // Fetch sales order to copy items and amount
  let so = null;
  if (salesOrderId) {
    so = await prisma.salesOrder.findUnique({
      where: { id: salesOrderId },
      include: { items: true }
    });
  }

  const invoice = await prisma.salesInvoice.create({
    data: {
      invoiceNumber,
      customerId,
      salesOrderId: salesOrderId || undefined,
      invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // default 30 days
      status: "DRAFT",
      totalAmount: so ? so.totalAmount : 0,
      outstanding: so ? so.totalAmount : 0,
      items: {
        create: so?.items.map(item => ({
          itemId: item.itemId,
          qty: item.qty,
          rate: item.rate,
          amount: item.amount,
        })) || []
      }
    }
  });

  revalidatePath("/bookkeeper/sales-invoices");
  return invoice;
}

export async function submitSalesInvoice(id: string) {
  const invoice = await prisma.salesInvoice.findUnique({
    where: { id }
  });

  if (!invoice || invoice.status !== "DRAFT") {
    throw new Error("Invalid invoice or already submitted");
  }

  // Update status to UNPAID (meaning it's a confirmed, open invoice)
  await prisma.salesInvoice.update({
    where: { id },
    data: { 
      status: "UNPAID",
      irn: `IRN${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
      ewayBillNumber: `EWB${Math.floor(Math.random() * 1000000000)}`
    }
  });

  revalidatePath("/bookkeeper/sales-invoices");
  revalidatePath(`/bookkeeper/sales-invoices/${id}`);
  return { success: true };
}

