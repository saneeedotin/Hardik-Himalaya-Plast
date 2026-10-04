import { getBOMs } from "./actions";
import Link from "next/link";
import { Workflow, Plus, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BOMsListPage() {
  const boms = await getBOMs();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Workflow className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Bill of Materials (BOM)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage product recipes, raw material consumption, and scrap factors
          </p>
        </div>
        <Link
          href="/boms/new"
          className="bg-[#0d382c] hover:bg-[#092b21] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New BOM
        </Link>
      </div>

      {/* List */}
      <div className="space-y-4">
        {boms.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800">
            No BOMs found.
          </div>
        ) : (
          boms.map((bom) => (
            <div key={bom.id} className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                    {bom.name}
                    <Link
                      href={`/boms/${bom.id}/edit`}
                      className="text-xs font-medium text-[#0d382c] dark:text-emerald-400 hover:underline"
                    >
                      Edit
                    </Link>
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                    <Package className="w-4 h-4" />
                    Produces {bom.outputQty} {bom.fgItem.uom} of {bom.fgItem.name}
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
                  Scrap Factor: {(bom.scrapFactor * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold">
                    <tr>
                      <th className="px-5 py-3">Raw Material / Component</th>
                      <th className="px-5 py-3 text-right">Qty Needed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {bom.materials.map(mat => (
                      <tr key={mat.id} className="text-slate-700 dark:text-slate-300">
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs mr-2">{mat.rmItem.code}</span>
                          {mat.rmItem.name}
                        </td>
                        <td className="px-5 py-3 text-right font-medium">
                          {mat.qtyPerUnit} {mat.rmItem.uom}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
