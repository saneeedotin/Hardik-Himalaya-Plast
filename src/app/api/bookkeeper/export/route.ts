import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { orderId, voucherType = "SALES_INVOICE" } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const order = await prisma.salesOrder.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        items: { include: { item: true } },
        workOrders: {
          include: {
            fgItem: true,
            jobCards: { include: { workstation: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Sales Order not found." }, { status: 404 });
    }

    const dateStr = new Date(order.transactionDate || order.createdAt).toLocaleDateString("en-IN");
    const invoiceNumber = `HP-INV-${order.orderNumber.replace(/^(SAL-ORD-|SO-)/, "")}`;
    const partyName = order.customerName.replace(/,/g, " ");
    const gstin = order.customerGstin || (order.customer as any)?.gstin || "Unregistered";

    if (voucherType === "MATERIAL_CONSUMPTION") {
      // Explode BOM consumption for Book Keeper
      const reservations = await prisma.stockReservation.findMany({
        where: { salesOrderId: orderId },
      });
      const itemsList = await prisma.item.findMany();
      const itemsMap = new Map(itemsList.map((i) => [i.id, i]));

      const csvRows = [
        "Voucher Type,Voucher No,Date,Sales Order,Work Order,Item Code,Item Name,Category,Quantity,Unit,Standard Cost,Amount,Narration",
      ];

      reservations.forEach((res, idx) => {
        const item = itemsMap.get(res.itemId);
        const code = item?.code || "UNKNOWN";
        const name = (item?.name || "Raw Material").replace(/,/g, " ");
        const uom = item?.uom || "Kg";
        const rate = Number(item?.standardCost || 100);
        const amount = (res.quantity * rate).toFixed(2);
        const woNumber = order.workOrders[0]?.workOrderNumber || "PROD-WO-DIRECT";

        csvRows.push(
          `Material Issue,${invoiceNumber}-MAT-${idx + 1},${dateStr},${order.orderNumber},${woNumber},${code},${name},RAW_MATERIAL,${res.quantity.toFixed(2)},${uom},${rate.toFixed(2)},${amount},Raw material consumed for ${order.orderNumber}`
        );
      });

      const csvContent = csvRows.join("\n");

      // Log sync record
      await prisma.tallySyncLog.create({
        data: {
          documentType: "BOOK_KEEPER_CONSUMPTION",
          documentId: order.orderNumber,
          exportedXml: csvContent, // Store formatted CSV
          status: "SUCCESS",
        },
      });

      return NextResponse.json({
        success: true,
        invoiceNumber: `${invoiceNumber}-CONSUMPTION`,
        csv: csvContent,
        voucherType: "MATERIAL_CONSUMPTION",
      });
    }

    // Default: Sales Invoice CSV for Book Keeper
    const csvRows = [
      "Voucher Type,Voucher No,Date,Party Name,GSTIN,Item Code,Item Name,HSN Code,Quantity,Unit,Price,Taxable Amount,GST Rate %,Tax Amount,Total Amount,Narration",
    ];

    order.items.forEach((item) => {
      const taxable = Number(item.amount);
      const isGujarat = gstin.startsWith("24");
      const gstRate = 18; // Standard 18% GST for industrial plastics/UPVC profiles
      const taxAmount = (taxable * gstRate) / 100;
      const totalWithTax = taxable + taxAmount;
      const itemName = item.item.name.replace(/,/g, " ");

      csvRows.push(
        `Sales,${invoiceNumber},${dateStr},"${partyName}",${gstin},${item.item.code},"${itemName}",${item.item.hsnCode || "39169090"},${item.qty},${item.item.uom},${Number(item.rate).toFixed(2)},${taxable.toFixed(2)},${gstRate},${taxAmount.toFixed(2)},${totalWithTax.toFixed(2)},"Extrusion Dispatch for Order ${order.orderNumber} via HPOS"`
      );
    });

    const csvContent = csvRows.join("\n");

    // Log the sync event
    await prisma.tallySyncLog.create({
      data: {
        documentType: "BOOK_KEEPER_SALES_INVOICE",
        documentId: order.orderNumber,
        exportedXml: csvContent,
        status: "SUCCESS",
      },
    });

    return NextResponse.json({
      success: true,
      invoiceNumber,
      csv: csvContent,
      voucherType: "SALES_INVOICE",
    });
  } catch (error: any) {
    console.error("Book Keeper export error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate Book Keeper export." },
      { status: 500 }
    );
  }
}
