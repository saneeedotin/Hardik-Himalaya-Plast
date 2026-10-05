import { getPurchaseReceiptById } from "../actions";
import { notFound } from "next/navigation";
import { PurchaseReceiptClient } from "./PurchaseReceiptClient";

export const dynamic = "force-dynamic";

export default async function PurchaseReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const receipt = await getPurchaseReceiptById(id);
  
  if (!receipt) {
    notFound();
  }

  const plainReceipt = JSON.parse(JSON.stringify(receipt));
  return <PurchaseReceiptClient receipt={plainReceipt} />;
}
