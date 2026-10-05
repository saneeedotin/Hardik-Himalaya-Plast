"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPayments() {
  return prisma.paymentEntry.findMany({
    include: {
      customer: true,
      supplier: true,
      salesInvoice: true,
      purchaseInvoice: true
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPaymentById(id: string) {
  return prisma.paymentEntry.findUnique({
    where: { id },
    include: {
      customer: true,
      supplier: true,
      salesInvoice: true,
      purchaseInvoice: true
    }
  });
}

export async function createPayment(formData: FormData) {
  const partyType = formData.get("partyType") as string;
  const partyId = formData.get("partyId") as string;
  const type = formData.get("type") as "INWARD" | "OUTWARD";
  const amount = formData.get("amount") as string;
  const mode = formData.get("mode") as string;
  const referenceNo = formData.get("referenceNo") as string;
  
  const count = await prisma.paymentEntry.count();
  const paymentNumber = `PAY-2026-${String(count + 1).padStart(5, '0')}`;

  const payment = await prisma.paymentEntry.create({
    data: {
      paymentNumber,
      paymentDate: new Date(),
      partyType,
      modeOfPayment: mode,
      referenceNumber: referenceNo,
      amount: parseFloat(amount) || 0,
      status: "DRAFT",
      customerId: partyType === "CUSTOMER" ? partyId : undefined,
      supplierId: partyType === "SUPPLIER" ? partyId : undefined,
    }
  });

  revalidatePath("/bookkeeper/payments");
  return payment;
}

export async function submitPayment(id: string) {
  const payment = await prisma.paymentEntry.update({
    where: { id },
    data: { status: "COMPLETED" }
  });
  revalidatePath("/bookkeeper/payments");
  revalidatePath(`/bookkeeper/payments/${id}`);
  return payment;
}
