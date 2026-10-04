import { getProductionLines } from "@/lib/data";
import { ShopFloorView } from "@/components/production/ShopFloorView";

export const dynamic = "force-dynamic";

export default async function ProductionPage() {
  const lines = await getProductionLines();
  return <ShopFloorView lines={lines} />;
}
