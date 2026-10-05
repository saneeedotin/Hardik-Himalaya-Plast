import { getCustomers } from "./actions";
import Link from "next/link";
import { Users, Plus, Building2, Phone, Calendar, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomersListPage() {
  const customers = await getCustomers();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Customers
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your B2B customers and CRM follow-ups
          </p>
        </div>
        <Link
          href="/customers/new"
          className="bg-[#0d382c] hover:bg-[#092b21] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Customer
        </Link>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">GSTIN</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Next Expected Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No customers found. Create your first customer to get started.
                  </td>
                </tr>
              ) : (
                customers.map((c: any) => {
                  const latestFollowUp = c.followUps[0];
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {c.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs font-mono">
                          {c.gstin || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          {c.phone ? (
                            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3"/> {c.phone}</span>
                          ) : (
                            <span className="text-slate-400">No phone</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {latestFollowUp?.expectedNextOrderDate ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded w-max text-xs">
                            <Calendar className="w-3 h-3" />
                            {latestFollowUp.expectedNextOrderDate.toLocaleDateString("en-IN")}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Unknown</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/customers/${c.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-[#0d382c] dark:text-emerald-400 hover:opacity-80 transition-opacity"
                        >
                          View 360 <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
