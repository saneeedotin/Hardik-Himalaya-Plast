const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding dummy Supplier and Purchase Order...");
  
  // 1. Get Supplier
  const supplier = await prisma.supplier.findFirst({
    where: { gstin: "27AAACR1234F1Z1" }
  });
  console.log("Found Supplier:", supplier.name);

  // 2. Create or Get Customer
  let customer = await prisma.customer.findFirst({
    where: { gstin: "24AAACA1234F1Z5" }
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: "Apex Windows & Façade Ltd",
        gstin: "24AAACA1234F1Z5",
        email: "purchasing@apexwindows.com",
        phone: "9876543211"
      }
    });
  }
  console.log("Customer:", customer.name);
  console.log("Created Customer:", customer.name);

  // Update existing Sales Orders to link to this customer
  await prisma.salesOrder.updateMany({
    data: { customerId: customer.id }
  });
  console.log("Updated existing Sales Orders with customerId.");

  // Get RM item
  const item = await prisma.item.findFirst({
    where: { category: "RAW_MATERIAL" }
  });

  if (item) {
    // 3. Create Purchase Order
    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber: "PO-2026-00001",
        supplierId: supplier.id,
        orderDate: new Date(),
        status: "SUBMITTED",
        totalAmount: 150000,
        items: {
          create: [
            {
              itemId: item.id,
              qty: 5000,
              rate: 30,
              amount: 150000
            }
          ]
        }
      }
    });
    console.log("Created Purchase Order:", po.poNumber);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
