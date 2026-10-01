import { getOrders, getTallyLogs } from "@/lib/data";
import { TallySyncView } from "@/components/tally/TallySyncView";

export const dynamic = "force-dynamic";

export default async function TallyPage() {
  const [orders, logs] = await Promise.all([getOrders(), getTallyLogs()]);
  return <TallySyncView orders={orders} tallyLogs={logs} />;
}
