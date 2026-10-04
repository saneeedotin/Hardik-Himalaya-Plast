import { getSalesOrder } from "../actions";
import { notFound } from "next/navigation";
import { OrderCockpitClient } from "./OrderCockpitClient";

export const dynamic = "force-dynamic";

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const order = await getSalesOrder(resolvedParams.id);

  if (!order) {
    notFound();
  }

  return <OrderCockpitClient initialOrder={order} />;
}
