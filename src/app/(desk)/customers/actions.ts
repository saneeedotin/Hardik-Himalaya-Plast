"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { revalidatePath } from "next/cache";

function serializeData(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getCustomers() {
  await requirePermission("Customers", "read");
  const customers = await prisma.customer.findMany({
    include: {
      followUps: {
        orderBy: { expectedNextOrderDate: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });
  return serializeData(customers);
}

export async function getCustomer(id: string) {
  await requirePermission("Customers", "read");
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      followUps: {
        orderBy: { createdAt: "desc" },
      },
      salesOrders: {
        orderBy: { transactionDate: "desc" },
        take: 5,
      },
    },
  });
  return customer ? serializeData(customer) : null;
}

export async function createCustomer(data: { name: string; gstin?: string; email?: string; phone?: string }) {
  const user = await requirePermission("Customers", "write");
  const customer = await prisma.customer.create({
    data: {
      name: data.name,
      gstin: data.gstin || null,
      email: data.email || null,
      phone: data.phone || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      event: "CUSTOMER_CREATED",
      metadata: JSON.stringify({ customerId: customer.id }),
    },
  });

  revalidatePath("/customers");
  return serializeData(customer);
}

export async function logCustomerFollowUp(data: {
  customerId: string;
  notes: string;
  expectedNextOrderDate?: Date;
  reminderDate?: Date;
}) {
  const user = await requirePermission("Customers", "write");

  const followUp = await prisma.customerFollowUp.create({
    data: {
      customerId: data.customerId,
      notes: data.notes,
      expectedNextOrderDate: data.expectedNextOrderDate,
      reminderDate: data.reminderDate,
      assignedUserId: user.id,
    },
  });

  revalidatePath(`/customers/${data.customerId}`);
  return serializeData(followUp);
}

export async function updateCustomer(id: string, data: { name?: string; gstin?: string; email?: string; phone?: string }) {
  const user = await requirePermission("Customers", "write");
  const customer = await prisma.customer.update({
    where: { id },
    data,
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      event: "CUSTOMER_UPDATED",
      metadata: JSON.stringify({ customerId: customer.id }),
    },
  });

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  return serializeData(customer);
}

export async function deleteCustomer(id: string) {
  const user = await requirePermission("Customers", "write");
  await prisma.customer.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      event: "CUSTOMER_DELETED",
      metadata: JSON.stringify({ customerId: id }),
    },
  });

  revalidatePath("/customers");
}

export async function deleteCustomerFollowUp(id: string, customerId: string) {
  await requirePermission("Customers", "write");
  await prisma.customerFollowUp.delete({ where: { id } });
  revalidatePath(`/customers/${customerId}`);
}
