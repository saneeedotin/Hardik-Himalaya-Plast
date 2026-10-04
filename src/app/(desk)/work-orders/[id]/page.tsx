import { getWorkOrder } from "../actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Cog, CheckCircle, Package, Plus, Play } from "lucide-react";
import { WorkOrderActionPanel } from "./WorkOrderActionPanel";

export const dynamic = "force-dynamic";

export default async function WorkOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const wo = await getWorkOrder(resolvedParams.id);

  if (!wo) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <Link href="/work-orders" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Work Orders
      </Link>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
            <Cog className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{wo.workOrderNumber}</h1>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase ${
                wo.status === 'COMPLETED'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : wo.status === 'IN_PROGRESS'
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}>
                {wo.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                Product: <Link href={`/items/${wo.fgItemId}`} className="text-[#0d382c] dark:text-emerald-400 hover:underline">{wo.fgItem.name}</Link>
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
          <Link
            href={`/work-orders/${wo.id}/edit`}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors w-full text-center md:w-auto"
          >
            Edit WO
          </Link>
          <div className="text-right mt-2 flex gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500">Target Qty</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{wo.plannedQty} {wo.fgItem.uom}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Produced</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{wo.producedQty} {wo.fgItem.uom}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-slate-400" />
                Job Cards (Execution)
              </h2>
              {wo.status !== 'COMPLETED' && (
                <Link
                  href={`/job-cards/new?workOrderId=${wo.id}`}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Job Card
                </Link>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
                  <tr>
                    <th className="px-6 py-3">Workstation</th>
                    <th className="px-6 py-3">Operator</th>
                    <th className="px-6 py-3 text-right">Good Qty</th>
                    <th className="px-6 py-3 text-right">Scrap Qty</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {wo.jobCards.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                        No job cards created for this work order yet.
                      </td>
                    </tr>
                  ) : (
                    wo.jobCards.map((job: any) => (
                      <tr key={job.id}>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{job.workstation?.name}</td>
                        <td className="px-6 py-4">{job.assignedUser?.name || "Unassigned"}</td>
                        <td className="px-6 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400">{job.goodQty}</td>
                        <td className="px-6 py-4 text-right text-rose-600 dark:text-rose-400">{job.scrapQty}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase ${
                            job.status === 'COMPLETED'
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : job.status === 'ACTIVE'
                              ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/job-cards/${job.id}/edit`} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Edit</Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <WorkOrderActionPanel woId={wo.id} currentStatus={wo.status} />
        </div>
      </div>
    </div>
  );
}
