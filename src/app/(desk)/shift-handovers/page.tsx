import { getShiftHandovers } from "./actions";
import Link from "next/link";
import { Plus, ArrowRightLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ShiftHandoversListPage() {
  const handovers = await getShiftHandovers();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-[#0d382c]" />
            Shift Handovers
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage operator shift handover logs
          </p>
        </div>
        <Link
          href="/shift-handovers/new"
          className="bg-[#0d382c] hover:bg-[#092b21] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Handover
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Date & Shift</th>
                <th className="px-6 py-4">Workstation</th>
                <th className="px-6 py-4">Outgoing Op.</th>
                <th className="px-6 py-4">Incoming Op.</th>
                <th className="px-6 py-4">Scrap Qty</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {handovers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No handovers found.
                  </td>
                </tr>
              ) : (
                handovers.map((h: any) => (
                  <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {new Date(h.shiftDate).toLocaleDateString()} - {h.shiftType}
                    </td>
                    <td className="px-6 py-4">
                      {h.workstation.name}
                    </td>
                    <td className="px-6 py-4 text-rose-600 dark:text-rose-400 font-medium">
                      {h.outgoingOperator?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-medium">
                      {h.incomingOperator?.name || "Not set"}
                    </td>
                    <td className="px-6 py-4">
                      {h.scrapGeneratedQty} kg
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase ${
                        h.status === 'ACCEPTED'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : h.status === 'PENDING'
                          ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/shift-handovers/${h.id}`}
                        className="text-sm font-medium text-[#0d382c] dark:text-emerald-400 hover:underline"
                      >
                        Edit
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
