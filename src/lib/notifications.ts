import prisma from "@/lib/prisma";

export async function generateAlerts() {
  // We'll generate alerts based on certain conditions.
  // 1. Low stock for raw materials
  const rawMaterials = await prisma.item.findMany({
    where: { category: "RAW_MATERIAL" },
    include: {
      batches: true,
    }
  });

  for (const item of rawMaterials) {
    const totalStock = item.batches.reduce((sum: number, b: any) => {
      return sum + (b.quantity || 0);
    }, 0);

    const minStock = item.minStockLevel || 100; // default to 100 if not set

    if (totalStock < minStock) {
      await upsertNotification(
        "MATERIAL",
        item.id,
        "CRITICAL",
        `${item.name} stock low`,
        `${totalStock} ${item.uom} remaining (Minimum: ${minStock} ${item.uom})`,
        `/items/${item.id}/edit`
      );
    } else {
      await resolveNotification("MATERIAL", item.id, `${item.name} stock low`);
    }
  }

  // 2. Overdue or urgent orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeOrders = await prisma.salesOrder.findMany({
    where: { status: { in: ["APPROVED", "CONFIRMED", "IN_PRODUCTION"] } }
  });

  for (const order of activeOrders) {
    const deliveryDate = new Date(order.deliveryDate);
    if (deliveryDate <= today) {
      await upsertNotification(
        "ORDER",
        order.id,
        "CRITICAL",
        `Order ${order.orderNumber} due today`,
        `Production needs to be accelerated for delivery.`,
        `/orders/${order.id}`
      );
    }
  }

  // 3. Pending QC
  const pendingQC = await prisma.qualityInspection.count({
    where: { status: "PENDING" }
  });

  if (pendingQC > 0) {
    await upsertNotification(
      "QC",
      "global",
      "ACTION_REQUIRED",
      `${pendingQC} QC inspections pending`,
      `Quality checks are waiting to be processed.`,
      `/qc`
    );
  } else {
    await resolveNotification("QC", "global", `${pendingQC} QC inspections pending`);
    // Need a broader clear for old counts if it drops to 0
    await (prisma as any).notification.updateMany({
      where: { sourceType: "QC", sourceId: "global", status: { not: "RESOLVED" } },
      data: { status: "RESOLVED" }
    });
  }
}

async function upsertNotification(
  sourceType: string,
  sourceId: string,
  priority: string,
  title: string,
  message: string,
  actionUrl: string
) {
  // Check if a similar unresolved notification exists
  const existing = await (prisma as any).notification.findFirst({
    where: {
      sourceType,
      sourceId,
      title,
      status: { not: "RESOLVED" }
    }
  });

  if (!existing) {
    await (prisma as any).notification.create({
      data: {
        title,
        message,
        priority,
        sourceType,
        sourceId,
        actionUrl,
        status: "UNREAD"
      }
    });
  } else if (existing.message !== message) {
    // Update message if stock amount changed for example
    await (prisma as any).notification.update({
      where: { id: existing.id },
      data: { message }
    });
  }
}

async function resolveNotification(
  sourceType: string,
  sourceId: string,
  title: string
) {
  await (prisma as any).notification.updateMany({
    where: {
      sourceType,
      sourceId,
      title,
      status: { not: "RESOLVED" }
    },
    data: { status: "RESOLVED" }
  });
}
