import { getDashboardData } from "@/lib/data";
import { ExecutiveDashboard } from "@/components/dashboard/ExecutiveDashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getDashboardData();
  return <ExecutiveDashboard initialData={data} />;
}
