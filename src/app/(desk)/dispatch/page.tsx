import { getDispatchNotes } from "@/lib/data";
import { DispatchScannerView } from "@/components/dispatch/DispatchScannerView";

export const dynamic = "force-dynamic";

export default async function DispatchPage() {
  const deliveryNotes = await getDispatchNotes();
  return <DispatchScannerView deliveryNotes={deliveryNotes} />;
}
