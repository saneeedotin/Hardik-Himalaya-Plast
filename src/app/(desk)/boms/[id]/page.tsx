import { getBOM } from "../actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Layers,
  ArrowLeft,
  Package,
  Plus,
  Edit,
  Beaker,
  Percent,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BOMDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const bom = await getBOM(resolvedParams.id);

  if (!bom) {
    notFound();
  }

  const materials = bom.materials || [];
  const totalCompoundWeight = materials.reduce((sum: number, m: any) => sum + (m.qtyPerUnit || 0), 0);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header Navigation */}
      <Link
        href="/boms"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to BOMs
      </Link>

      {/* Main Header */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl p-6 md:p-8 shadow-2xs border border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0d382c]/10 dark:bg-emerald-500/10 flex items-center justify-center text-[#0d382c] dark:text-emerald-400 shrink-0">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {bom.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                ACTIVE FORMULATION
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Target Profile:{" "}
                <Link
                  href={`/items/${bom.fgItemId}`}
                  className="font-bold text-[#0d382c] dark:text-emerald-400 hover:underline"
                >
                  {bom.fgItem?.name} ({bom.fgItem?.code})
                </Link>
              </span>
              <span>•</span>
              <span>Output Batch Unit: <strong className="text-slate-700 dark:text-slate-200">{bom.outputQty} {bom.fgItem?.uom || "Meters"}</strong></span>
              <span>•</span>
              <span>Scrap Allowance: <strong className="text-slate-700 dark:text-slate-200">{(bom.scrapFactor * 100).toFixed(1)}%</strong></span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <Link
            href={`/boms/${bom.id}/edit`}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Recipe
          </Link>
          <Link
            href={`/work-orders/new?itemId=${bom.fgItemId}`}
            className="px-4 py-2 bg-[#0d382c] hover:bg-[#08261e] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Launch Work Order
          </Link>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Compound Ingredients
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {materials.length}
            </span>
            <span className="text-xs font-bold text-slate-400">Resins & Additives</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            PVC resin, plasticizer, thermal stabilizers
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Theoretical Output Weight
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-[#0d382c] dark:text-emerald-400">
              {totalCompoundWeight.toFixed(3)}
            </span>
            <span className="text-xs font-bold text-slate-400">Kg / unit</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Base density per unit of output
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Extrusion Purge Allowance
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {(bom.scrapFactor * 100).toFixed(1)}%
            </span>
          </div>
          <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 block mt-1">
            Standard start-up purge and trim factor
          </span>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Beaker className="w-5 h-5 text-[#0d382c] dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Raw Material Formulation (Per Unit Output)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Formula: Required = (Qty / Output) * QtyPerUnit / (1 - Scrap Factor)
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Compound Component</th>
                <th className="px-4 py-3">Item Code</th>
                <th className="px-4 py-3 text-right">Dosage Ratio</th>
                <th className="px-4 py-3 text-right">Effective with 2.5% Scrap</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {materials.map((m: any) => {
                const effectiveQty = m.qtyPerUnit / (1 - (bom.scrapFactor || 0.025));
                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {m.rmItem?.name || "Raw Material"}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">
                      {m.rmItem?.code || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {m.qtyPerUnit} {m.rmItem?.uom || "Kg"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[#0d382c] dark:text-emerald-400 font-bold">
                      {effectiveQty.toFixed(4)} {m.rmItem?.uom || "Kg"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/items/${m.rmItemId}`}
                        className="text-xs font-semibold text-[#0d382c] dark:text-emerald-400 hover:underline"
                      >
                        Item Ledger &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
