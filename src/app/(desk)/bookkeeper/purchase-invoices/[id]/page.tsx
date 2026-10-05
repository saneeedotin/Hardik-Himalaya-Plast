import { getPurchaseInvoiceById } from "../actions";
import { notFound } from "next/navigation";
import { PurchaseInvoiceClient } from "./PurchaseInvoiceClient";

export const dynamic = "force-dynamic";

export default async function PurchaseInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getPurchaseInvoiceById(id);
  
  if (!invoice) {
    notFound();
  }

  const plainInvoice = JSON.parse(JSON.stringify(invoice));
  return <PurchaseInvoiceClient invoice={plainInvoice} />;
}
