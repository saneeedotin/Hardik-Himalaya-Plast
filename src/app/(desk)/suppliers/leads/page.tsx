import { getSupplierLeads } from "../actions";
import Link from "next/link";
import { Users2, ArrowLeft, Target, CalendarDays, Contact2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SupplierLeadsPage() {
  const leads = await getSupplierLeads();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <Link href="/suppliers" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Suppliers
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-amber-500" />
            Supplier Leads
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track potential new vendors and materials sourcing
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Material</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Next Follow Up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No leads found.
                  </td>
                </tr>
              ) : (
                leads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {lead.companyName}
                      </div>
                      {lead.source && (
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                          Src: {lead.source}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {lead.material ? (
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                          {lead.material}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Contact2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lead.contactName || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase ${
                        lead.status === 'NEW' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        lead.status === 'CONTACTED' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        lead.status === 'QUALIFIED' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {lead.nextFollowUp ? (
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5" />
                          <span>{new Date(lead.nextFollowUp).toLocaleDateString()}</span>
                        </div>
                      ) : "-"}
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
