import { getItem } from "../actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Box,
  ArrowLeft,
  Package,
  Layers,
  FileSpreadsheet,
  Plus,
  Edit,
  AlertTriangle,
  CheckCircle,
  Tag,
  ShieldAlert,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ItemDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const item = await getItem(resolvedParams.id);

  if (!item) {
    notFound();
  }

  const isLowStock = item.availableStock < item.minStockLevel;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header Navigation */}
      <Link
        href="/items"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Items
      </Link>

      {/* Main Item Header Card */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl p-6 md:p-8 shadow-2xs border border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0d382c]/10 dark:bg-emerald-500/10 flex items-center justify-center text-[#0d382c] dark:text-emerald-400 shrink-0">
            <Box className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-lg font-bold text-slate-500 dark:text-slate-400">
                {item.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
                {item.category.replace(/_/g, " ")}
              </span>
              {isLowStock && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Below Min Level
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {item.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span>UOM: <strong className="text-slate-700 dark:text-slate-200">{item.uom}</strong></span>
              <span>•</span>
              <span>HSN Code: <strong className="font-mono text-slate-700 dark:text-slate-200">{item.hsnCode || "N/A"}</strong></span>
              <span>•</span>
              <span>Min Stock: <strong className="text-slate-700 dark:text-slate-200">{item.minStockLevel} {item.uom}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <Link
            href={`/items/${item.id}/edit`}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Item
          </Link>
          {item.category === "FINISHED_GOODS" ? (
            <Link
              href={`/work-orders/new?itemId=${item.id}`}
              className="px-4 py-2 bg-[#0d382c] hover:bg-[#08261e] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Launch Work Order
            </Link>
          ) : (
            <Link
              href={`/buying/new?itemId=${item.id}`}
              className="px-4 py-2 bg-[#0d382c] hover:bg-[#08261e] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Create PO
            </Link>
          )}
        </div>
      </div>

      {/* 3-Tier Inventory Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Physical Warehouse Stock
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {Number(item.physicalStock).toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-bold text-slate-400">{item.uom}</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Actual count in warehouse bin
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Reserved Allocation
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {Number(item.reservedStock).toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-bold text-slate-400">{item.uom}</span>
          </div>
          <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 block mt-1">
            Committed to confirmed orders
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Available Net Stock
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-extrabold ${
                item.availableStock > 0
                  ? "text-[#0d382c] dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {Number(item.availableStock).toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-bold text-slate-400">{item.uom}</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Free to commit to new orders
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Standard Valuation
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(Number(item.standardCost))}
            </span>
            <span className="text-xs font-bold text-slate-400">/ {item.uom}</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Inventory balance rate
          </span>
        </div>
      </div>

      {/* Relations: BOMs or Where-Used */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#0d382c] dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {item.category === "FINISHED_GOODS"
                ? "Bill of Materials (BOM) Recipes"
                : "BOM Where-Used Matrix"}
            </h2>
          </div>
          <Link
            href="/stock"
            className="text-xs font-semibold text-[#0d382c] dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Open Stock Ledger
          </Link>
        </div>

        {item.category === "FINISHED_GOODS" ? (
          <div>
            {item.boms?.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                No active BOM configured for this profile.
              </div>
            ) : (
              <div className="space-y-4">
                {item.boms?.map((bom: any) => (
                  <div
                    key={bom.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {bom.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        Output: {bom.outputQty} {item.uom} • Scrap Factor: {(bom.scrapFactor * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-zinc-800">
                          <tr>
                            <th className="px-3.5 py-2.5">Compound Ingredient</th>
                            <th className="px-3.5 py-2.5">Material Code</th>
                            <th className="px-3.5 py-2.5 text-right">Qty Ratio</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                          {bom.materials?.map((m: any) => (
                            <tr key={m.id}>
                              <td className="px-3.5 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                                {m.rmItem?.name}
                              </td>
                              <td className="px-3.5 py-2.5 font-mono text-slate-500">
                                {m.rmItem?.code}
                              </td>
                              <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                                {m.qtyPerUnit} {m.rmItem?.uom}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {item.bomItems?.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                This raw material is currently not linked to any active extrusion BOM recipes.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-zinc-800">
                    <tr>
                      <th className="px-4 py-3">BOM Name</th>
                      <th className="px-4 py-3">Finished Profile</th>
                      <th className="px-4 py-3 text-right">Dosage Ratio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {item.bomItems?.map((bi: any) => (
                      <tr key={bi.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30">
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                          {bi.bom?.name}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/items/${bi.bom?.fgItem?.id}`}
                            className="text-[#0d382c] dark:text-emerald-400 hover:underline font-medium"
                          >
                            {bi.bom?.fgItem?.name} ({bi.bom?.fgItem?.code})
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {bi.qtyPerUnit} {item.uom}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
