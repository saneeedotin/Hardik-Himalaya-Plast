import { getBatches } from "../actions";
import Link from "next/link";
import { PackageSearch, ArrowLeft, Beaker, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BatchesPage() {
  const batches = await getBatches();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <Link href="/stock" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Stock Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PackageSearch className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Batch Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Traceability and genealogy for all raw materials and finished goods
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Batch Number</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4 text-right">Quantity</th>
                <th className="px-6 py-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No batches found.
                  </td>
                </tr>
              ) : (
                batches.map((batch: any) => (
                  <tr key={batch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white">
                      {batch.batchNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {batch.item.category === 'FINISHED_GOODS' ? (
                          <Package className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Beaker className="w-4 h-4 text-blue-500" />
                        )}
                        <span className="font-medium">{batch.item.name}</span>
                        <span className="text-xs text-slate-500">({batch.item.code})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase ${
                        batch.source === 'PURCHASE' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        batch.source === 'EXTRUSION' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {batch.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {batch.quantity} {batch.uom}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(batch.createdAt).toLocaleString()}
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
