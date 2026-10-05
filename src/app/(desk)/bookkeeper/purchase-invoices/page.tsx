import { getPurchaseInvoices } from "./actions";
import Link from "next/link";
import { FileSpreadsheet, Plus, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PurchaseInvoicesPage() {
  const invoices = await getPurchaseInvoices();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-rose-500" />
            Purchase Invoices (AP)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage supplier bills and accounts payable
          </p>
        </div>
        <Link
          href="/bookkeeper/purchase-invoices/new"
          className="bg-[#0d382c] hover:bg-[#092b21] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Bill
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Bill No.</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Outstanding</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No purchase invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(inv.invoiceDate).toLocaleDateString("en-IN")}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {inv.supplier.name}
                    </td>
                    <td className="px-6 py-4 font-medium text-right">
                      ₹{inv.totalAmount.toString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-right text-rose-600 dark:text-rose-400">
                      ₹{inv.outstanding.toString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : inv.status === 'UNPAID'
                          ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {inv.status}
                      </span>
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
