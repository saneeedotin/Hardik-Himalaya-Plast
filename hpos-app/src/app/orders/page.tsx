import { getOrders } from "@/lib/data";
import { OrderTimelineView } from "@/components/orders/OrderTimelineView";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getOrders();
  return <OrderTimelineView orders={orders} />;
}
