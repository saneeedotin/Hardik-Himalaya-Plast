import { getPaymentById } from "../actions";
import { notFound } from "next/navigation";
import { PaymentClient } from "./PaymentClient";

export const dynamic = "force-dynamic";

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payment = await getPaymentById(id);
  
  if (!payment) {
    notFound();
  }

  const plainPayment = JSON.parse(JSON.stringify(payment));
  return <PaymentClient payment={plainPayment} />;
}
