export type UserRole =
  | "FOUNDER"
  | "ADMIN"
  | "SALES"
  | "PLANNER"
  | "OPERATOR"
  | "WAREHOUSE_SCAN"
  | "ACCOUNTS";

export type OrderStatus =
  | "DRAFT"
  | "APPROVED"
  | "IN_PRODUCTION"
  | "READY_TO_DISPATCH"
  | "DISPATCHED"
  | "COMPLETED"
  | "CANCELLED";

export type QCStatus = "DRAFT" | "PASS" | "REJECT" | "SCRAP" | "REWORK";

export interface DashboardMetrics {
  healthScore: number;
  totalRevenueMonth: number;
  activeOrdersCount: number;
  readyToDispatchCount: number;
  runningMachinesCount: number;
  totalMachinesCount: number;
  todayProductionMeters: number;
  todayScrapKg: number;
  scrapPercentage: number;
  lineStatus: {
    id: string;
    code: string;
    name: string;
    status: string;
    currentJob?: string;
    activeMeters?: number;
    targetMeters?: number;
    runDurationSeconds?: number;
    tempZone1?: number;
    tempZone2?: number;
    tempZone3?: number;
    screwRpm?: number;
    lineSpeed?: number;
  }[];
}
