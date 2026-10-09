import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const invoices = await prisma.salesInvoice.findMany({
    where: { subtotalAmount: 0 } // those that were defaulted
  });

  for (const inv of invoices) {
    const sub = Number(inv.totalAmount);
    await prisma.salesInvoice.update({
      where: { id: inv.id },
      data: {
        subtotalAmount: sub,
        cgstAmount: sub * 0.09,
        sgstAmount: sub * 0.09,
        taxAmount: sub * 0.18,
        totalAmount: sub * 1.18,
        outstanding: sub * 1.18,
      }
    });
    console.log(`Updated invoice ${inv.invoiceNumber}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
