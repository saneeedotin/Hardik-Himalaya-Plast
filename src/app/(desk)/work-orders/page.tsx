import { getWorkOrders } from "./actions";
import Link from "next/link";
import { Plus, Cog, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WorkOrdersListPage() {
  const workOrders = await getWorkOrders();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cog className="w-6 h-6 text-indigo-500" />
            Work Orders
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage production plans and manufacturing orders
          </p>
        </div>
        <Link
          href="/work-orders/new"
          className="bg-[#0d382c] hover:bg-[#092b21] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Work Order
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">WO Number</th>
                <th className="px-6 py-4">Product (FG)</th>
                <th className="px-6 py-4">Linked Sales Order</th>
                <th className="px-6 py-4 text-right">Target Qty</th>
                <th className="px-6 py-4 text-right">Produced Qty</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {workOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No work orders found.
                  </td>
                </tr>
              ) : (
                workOrders.map((wo: any) => (
                  <tr key={wo.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white">
                      {wo.workOrderNumber}
                    </td>
                    <td className="px-6 py-4 font-medium whitespace-normal min-w-[250px]">
                      {wo.fgItem.name}
                    </td>
                    <td className="px-6 py-4">
                      {wo.salesOrder ? (
                        <Link href={`/orders/${wo.salesOrderId}`} className="text-[#0d382c] dark:text-emerald-400 hover:underline flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {wo.salesOrder.orderNumber}
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Internal</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-right">
                      {wo.plannedQty} {wo.fgItem.uom}
                    </td>
                    <td className="px-6 py-4 font-medium text-right text-emerald-600 dark:text-emerald-400">
                      {wo.producedQty} {wo.fgItem.uom}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase ${
                        wo.status === 'COMPLETED'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : wo.status === 'IN_PROGRESS'
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {wo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/work-orders/${wo.id}`}
                        className="text-sm font-medium text-[#0d382c] dark:text-emerald-400 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
