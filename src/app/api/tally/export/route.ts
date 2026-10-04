import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { orderId, deliveryNoteId } = await request.json();

    let order = null;
    if (orderId) {
      order = await prisma.salesOrder.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { item: true } },
          deliveryNotes: true,
        },
      });
    } else if (deliveryNoteId) {
      const dn = await prisma.deliveryNote.findUnique({
        where: { id: deliveryNoteId },
        include: {
          salesOrder: {
            include: {
              items: { include: { item: true } },
            },
          },
        },
      });
      order = dn?.salesOrder;
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order or Delivery Note not found." },
        { status: 404 }
      );
    }

    const invoiceNumber = `HP-INV-${order.orderNumber.replace("SAL-ORD-", "")}`;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const partyName = order.customerName.replace(/&/g, "&amp;");
    const totalAmount = Number(order.totalAmount).toFixed(2);

    const itemsXml = order.items
      .map(
        (it) => `
        <ALLINVENTORYENTRIES.LIST>
          <STOCKITEMNAME>${it.item.name.replace(/&/g, "&amp;")}</STOCKITEMNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <RATE>${Number(it.rate).toFixed(2)}/${it.item.uom}</RATE>
          <AMOUNT>-${Number(it.amount).toFixed(2)}</AMOUNT>
          <ACTUALQTY>${it.qty} ${it.item.uom}</ACTUALQTY>
          <BILLEDQTY>${it.qty} ${it.item.uom}</BILLEDQTY>
          <BATCHALLOCATIONS.LIST>
            <GODOWNNAME>Finished Goods Store</GODOWNNAME>
            <BATCHNAME>Primary Extrusion Lot</BATCHNAME>
            <AMOUNT>-${Number(it.amount).toFixed(2)}</AMOUNT>
            <ACTUALQTY>${it.qty} ${it.item.uom}</ACTUALQTY>
            <BILLEDQTY>${it.qty} ${it.item.uom}</BILLEDQTY>
          </BATCHALLOCATIONS.LIST>
        </ALLINVENTORYENTRIES.LIST>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Himalaya Plast</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Invoice Voucher View">
            <DATE>${dateStr}</DATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${invoiceNumber}</VOUCHERNUMBER>
            <REFERENCE>${order.orderNumber}</REFERENCE>
            <PARTYLEDGERNAME>${partyName}</PARTYLEDGERNAME>
            <PARTYNAME>${partyName}</PARTYNAME>
            <BASICBUYERNAME>${partyName}</BASICBUYERNAME>
            <PARTYGSTIN>${order.customerGstin || "Unregistered"}</PARTYGSTIN>
            <PLACEOFSUPPLY>Gujarat</PLACEOFSUPPLY>
            <NARRATION>Extrusion Dispatch for Order ${order.orderNumber} via HPOS Factory OS</NARRATION>
            
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${partyName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>${totalAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Sales - Plastic Extrusion Profiles</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>-${totalAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            ${itemsXml}
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    // Log the sync event
    await prisma.tallySyncLog.create({
      data: {
        documentType: "SALES_INVOICE",
        documentId: order.orderNumber,
        exportedXml: xml,
        status: "SUCCESS",
      },
    });

    return NextResponse.json({
      success: true,
      invoiceNumber,
      xml,
    });
  } catch (error: any) {
    console.error("Tally export error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate Tally XML." },
      { status: 500 }
    );
  }
}
