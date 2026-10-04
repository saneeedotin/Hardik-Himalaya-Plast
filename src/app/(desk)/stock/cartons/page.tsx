import { getFGCartons } from "./actions";
import Link from "next/link";
import { Package, ArrowLeft, PackageCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FGCartonsPage() {
  const cartons = await getFGCartons();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <Link href="/stock" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Stock Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            FG Carton Storage
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track packed Finished Goods cartons, locations, and dispatch status
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Carton Code</th>
                <th className="px-6 py-4">Product / Batch</th>
                <th className="px-6 py-4">Sales Order</th>
                <th className="px-6 py-4 text-right">Quantity</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {cartons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No packed cartons found.
                  </td>
                </tr>
              ) : (
                cartons.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-slate-400" />
                      {c.cartonCode}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{c.batch.item.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">Batch: {c.batch.batchNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/orders/${c.deliveryNote.salesOrderId}`} className="font-medium text-[#0d382c] dark:text-emerald-400 hover:underline">
                        {c.deliveryNote.salesOrder.orderNumber}
                      </Link>
                      <div className="text-[10px] text-slate-500 mt-0.5">{c.deliveryNote.customerName}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {c.quantity} {c.batch.item.uom}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase ${
                        c.dispatchConfirmed ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        c.scanned ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {c.dispatchConfirmed ? "Dispatched" : c.scanned ? "Staged at Gate" : "In Storage"}
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
