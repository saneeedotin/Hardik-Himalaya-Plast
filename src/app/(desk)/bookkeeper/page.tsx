import { getOrders, getTallyLogs } from "@/lib/data";
import { BookKeeperSyncView } from "@/components/bookkeeper/BookKeeperSyncView";

export const dynamic = "force-dynamic";

export default async function BookKeeperPage() {
  const [orders, logs] = await Promise.all([getOrders(), getTallyLogs()]);
  return <BookKeeperSyncView orders={orders} tallyLogs={logs} />;
}
