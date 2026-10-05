import { getSalesInvoiceById } from "../actions";
import { notFound } from "next/navigation";
import { SalesInvoiceClient } from "./SalesInvoiceClient";

export const dynamic = "force-dynamic";

export default async function SalesInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getSalesInvoiceById(id);
  
  if (!invoice) {
    notFound();
  }

  const plainInvoice = JSON.parse(JSON.stringify(invoice));
  return <SalesInvoiceClient invoice={plainInvoice} />;
}
