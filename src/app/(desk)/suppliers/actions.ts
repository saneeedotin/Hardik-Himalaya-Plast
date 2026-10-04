"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { revalidatePath } from "next/cache";

export async function getSuppliers() {
  await requirePermission("Suppliers", "read"); // assuming you map permissions
  return prisma.supplier.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getSupplier(id: string) {
  await requirePermission("Suppliers", "read");
  return prisma.supplier.findUnique({
    where: { id },
    include: {
      purchaseOrders: {
        include: {
          items: {
            include: { item: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createSupplier(data: { name: string; gstin?: string; email?: string; phone?: string }) {
  const user = await requirePermission("Suppliers", "write");
  const supplier = await prisma.supplier.create({
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
      event: "SUPPLIER_CREATED",
      metadata: JSON.stringify({ supplierId: supplier.id }),
    },
  });

  revalidatePath("/suppliers");
  return supplier;
}

export async function updateSupplier(id: string, data: { name?: string; gstin?: string; email?: string; phone?: string; status?: string }) {
  const user = await requirePermission("Suppliers", "write");
  const supplier = await prisma.supplier.update({
    where: { id },
    data,
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      event: "SUPPLIER_UPDATED",
      metadata: JSON.stringify({ supplierId: supplier.id }),
    },
  });

  revalidatePath("/suppliers");
  return supplier;
}

export async function deleteSupplier(id: string) {
  const user = await requirePermission("Suppliers", "write");
  await prisma.supplier.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      event: "SUPPLIER_DELETED",
      metadata: JSON.stringify({ supplierId: id }),
    },
  });

  revalidatePath("/suppliers");
}

export async function getSupplierLeads() {
  await requirePermission("Suppliers", "read");
  return prisma.supplierLead.findMany({
    orderBy: { createdAt: "desc" },
  });
}
