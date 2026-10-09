import { MaintenanceDashboard } from "@/components/maintenance/MaintenanceDashboard";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  // Normally we would fetch this from the database via getDies()
  // Since the user asked to focus on the frontend, we'll pass mocked data
  const mockedDies = [
    {
      id: "die-1",
      code: "DIE-A101",
      name: "Profile A101 Mold",
      totalRunningHours: 4900,
      maintenanceThresholdHours: 5000,
      status: "ACTIVE",
    },
    {
      id: "die-2",
      code: "DIE-B202",
      name: "Profile B202 Mold",
      totalRunningHours: 1200,
      maintenanceThresholdHours: 5000,
      status: "ACTIVE",
    },
    {
      id: "die-3",
      code: "DIE-C303",
      name: "Profile C303 Mold",
      totalRunningHours: 5100,
      maintenanceThresholdHours: 5000,
      status: "MAINTENANCE_REQUIRED",
    },
  ];

  return <MaintenanceDashboard dies={mockedDies} />;
}
