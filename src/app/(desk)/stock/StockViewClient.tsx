"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Package,
  ArrowDownRight,
  ArrowUpRight,
  History,
  PackageSearch,
  Layers,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  Search,
} from "lucide-react";

interface StockViewClientProps {
  inventory: any[];
  ledger: any[];
}

export function StockViewClient({ inventory, ledger }: StockViewClientProps) {
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInventory = inventory.filter((item) => {
    const matchesTier = selectedTier === "ALL" || item.tier === selectedTier;
    const matchesSearch =
      item.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.item.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  // Calculate totals
  const totalRMKg = inventory
    .filter((i) => i.tier === "RAW_MATERIAL")
    .reduce((sum, i) => sum + Math.max(0, i.physicalStock), 0);

  const totalFGMeters = inventory
    .filter((i) => i.tier === "FINISHED_GOODS")
    .reduce((sum, i) => sum + Math.max(0, i.physicalStock), 0);

  const totalScrapKg = inventory
    .filter((i) => i.tier === "SCRAP")
    .reduce((sum, i) => sum + Math.max(0, i.physicalStock), 0);

  const totalReservedCount = inventory.filter((i) => i.reservedStock > 0).length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-[#0d382c] dark:text-emerald-400" />
            3-Tier Factory Stock & Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of Physical Warehouse Stock, Order Allocations, and Available Net Balance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/stock/cartons"
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <PackageSearch className="w-3.5 h-3.5 text-indigo-500" />
            Serialized Cartons
          </Link>
          <Link
            href="/stock/batches"
            className="bg-[#0d382c] hover:bg-[#08261e] text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Layers className="w-3.5 h-3.5" />
            Batch Lots & Sources
          </Link>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Raw Materials (Resins)
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalRMKg.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-bold text-slate-400">Kg</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
            PVC K-67, DOP, Ca-Zn
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Finished Goods (Profiles)
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalFGMeters.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-bold text-slate-400">Meters</span>
          </div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block mt-1">
            Gaskets, Weatherseals & Beads
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Recovered / Purge Regrind
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalScrapKg.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-bold text-slate-400">Kg</span>
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-1">
            Trim & Regrind Ready
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Order Reservations
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-[#0d382c] dark:text-emerald-400">
              {totalReservedCount}
            </span>
            <span className="text-xs font-bold text-slate-400">Allocated Materials</span>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block mt-1">
            Locked by Confirmed Sales Orders
          </span>
        </div>
      </div>

      {/* Main Grid: 3-Tier Inventory Table + Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3-Tier Inventory Table (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 space-y-4 shadow-2xs">
          {/* Controls: Search + Category Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl text-xs">
              <button
                onClick={() => setSelectedTier("ALL")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedTier === "ALL"
                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All ({inventory.length})
              </button>
              <button
                onClick={() => setSelectedTier("RAW_MATERIAL")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedTier === "RAW_MATERIAL"
                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Raw Materials
              </button>
              <button
                onClick={() => setSelectedTier("FINISHED_GOODS")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedTier === "FINISHED_GOODS"
                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Finished Goods
              </button>
              <button
                onClick={() => setSelectedTier("SCRAP")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedTier === "SCRAP"
                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Recovered / Purge
              </button>
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search item code/name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Item Code</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Physical Stock</th>
                  <th className="px-4 py-3 text-right">Reserved (SOs)</th>
                  <th className="px-4 py-3 text-right">Available Net</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No matching items found.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((inv) => (
                    <tr
                      key={inv.item.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold">
                        <Link
                          href={`/items/${inv.item.id}`}
                          className="text-[#0d382c] dark:text-emerald-400 hover:underline"
                        >
                          {inv.item.code}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/items/${inv.item.id}`}
                          className="text-slate-800 dark:text-slate-200 hover:underline"
                        >
                          {inv.item.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {inv.physicalStock.toLocaleString("en-IN")} {inv.item.uom}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-400">
                        {inv.reservedStock > 0
                          ? `${inv.reservedStock.toLocaleString("en-IN")} ${inv.item.uom}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {inv.availableStock.toLocaleString("en-IN")} {inv.item.uom}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {inv.reorderAlert ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Reorder Alert
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Healthy
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Ledger Movements (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Recent Ledger Stream
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Top 100</span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {ledger.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No ledger transactions yet.</div>
            ) : (
              ledger.map((entry: any) => {
                const isPositive = [
                  "RECEIPT",
                  "PRODUCTION_OUTPUT",
                  "PRODUCTION",
                  "RECOVERY",
                  "ADJUSTMENT_IN",
                ].includes(entry.movementType);

                return (
                  <div
                    key={entry.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(entry.createdAt).toLocaleDateString("en-IN")}
                      </span>
                      <span
                        className={`font-mono font-bold flex items-center gap-0.5 ${
                          isPositive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {isPositive ? "+" : "-"}
                        {entry.quantity} {entry.item?.uom}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-800 dark:text-white truncate">
                      {entry.item?.name}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-zinc-800 font-mono uppercase">
                        {entry.movementType}
                      </span>
                      <span className="truncate max-w-[150px]">{entry.notes || "Movement"}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
