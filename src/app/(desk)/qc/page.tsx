import { getQualityInspections } from "@/lib/data";
import { QualityStationView } from "@/components/qc/QualityStationView";

export const dynamic = "force-dynamic";

export default async function QCPage() {
  const inspections = await getQualityInspections();
  return <QualityStationView initialInspections={inspections} />;
}
