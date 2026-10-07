import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Get an existing PO
  const po = await prisma.purchaseOrder.findFirst({
    include: { items: true }
  });
  
  if (po) {
    const pr = await prisma.purchaseReceipt.create({
      data: {
        receiptNumber: "GRN-2026-00001",
        supplierId: po.supplierId,
        purchaseOrderId: po.id,
        status: "DRAFT",
        totalAmount: po.totalAmount,
        notes: "Test seed receipt",
        items: {
          create: po.items.map(item => ({
            itemId: item.itemId,
            qty: item.qty,
            rate: item.rate,
            amount: item.amount,
          }))
        }
      }
    });
    console.log("Created Purchase Receipt:", pr.receiptNumber);
  }

  // Get an existing SO
  const so = await prisma.salesOrder.findFirst({
    include: { items: true }
  });
  
  if (so && so.customerId) {
    const si = await prisma.salesInvoice.create({
      data: {
        invoiceNumber: "INV-2026-00001",
        customerId: so.customerId,
        salesOrderId: so.id,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "DRAFT",
        totalAmount: so.totalAmount,
        outstanding: so.totalAmount,
        items: {
          create: so.items.map(item => ({
            itemId: item.itemId,
            qty: item.qty,
            rate: item.rate,
            amount: item.amount,
          }))
        }
      }
    });
    console.log("Created Sales Invoice:", si.invoiceNumber);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
