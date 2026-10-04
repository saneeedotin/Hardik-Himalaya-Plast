"use client";

import React, { useState } from "react";
import {
  Download,
  Copy,
  Check,
  RefreshCw,
  Building,
  FileSpreadsheet,
  CheckCircle,
  Layers,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export function BookKeeperSyncView({
  orders,
  tallyLogs,
}: {
  orders: any[];
  tallyLogs: any[];
}) {
  const [selectedOrder, setSelectedOrder] = useState<any>(orders[0] || null);
  const [voucherType, setVoucherType] = useState<"SALES_INVOICE" | "MATERIAL_CONSUMPTION">(
    "SALES_INVOICE"
  );
  const [generatedCsv, setGeneratedCsv] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState(tallyLogs);

  const handleGenerateCsv = async (orderId: string, type: "SALES_INVOICE" | "MATERIAL_CONSUMPTION") => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/bookkeeper/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, voucherType: type }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedCsv(data.csv);
        setLogs([
          {
            id: String(Date.now()),
            documentType: `BOOK_KEEPER_${type}`,
            documentId: selectedOrder.orderNumber,
            exportedXml: data.csv,
            status: "SUCCESS",
            syncedAt: new Date().toISOString(),
          },
          ...logs,
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedCsv) return;
    navigator.clipboard.writeText(generatedCsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCsvFile = () => {
    if (!generatedCsv) return;
    const blob = new Blob([generatedCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BookKeeper_${voucherType}_${selectedOrder?.orderNumber || "Export"}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Parse CSV rows for clean table preview
  const parsedRows = generatedCsv
    ? generatedCsv
        .trim()
        .split("\n")
        .map((row) =>
          row
            .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
            .map((cell) => cell.replace(/^"|"$/g, ""))
        )
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Book Keeper Accounting Integration
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0d382c] text-white">
              CSV / Excel Standard
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            1-click Sales Voucher and Raw Material Consumption export directly imported into Book Keeper ERP.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-600 dark:text-slate-300">
          <Building className="w-3.5 h-3.5 text-[#0d382c] dark:text-emerald-400" />
          <span>Himalaya Plast • GSTIN: 24AAACH9876K1Z9</span>
        </div>
      </div>

      {/* Grid: Orders + Export Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Orders Ready for Book Keeper (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block px-1">
            Orders Ready For Book Keeper Sync
          </span>

          {orders.map((o) => {
            const isSelected = selectedOrder?.id === o.id;
            return (
              <div
                key={o.id}
                onClick={() => {
                  setSelectedOrder(o);
                  setGeneratedCsv("");
                }}
                className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                  isSelected
                    ? "bg-white dark:bg-zinc-950 border-[#0d382c] dark:border-emerald-500/60 shadow-xs ring-1 ring-[#0d382c]/10"
                    : "bg-white dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#0d382c] dark:text-emerald-400">
                    {o.orderNumber}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {o.status.replace(/_/g, " ")}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 truncate">
                  {o.customerName}
                </h3>

                <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                  <span>GSTIN: {o.customerGstin || "Unregistered"}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(Number(o.totalAmount))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: CSV Preview & Export (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl p-6 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <span className="font-mono text-xs font-bold text-[#0d382c] dark:text-emerald-400">
                {selectedOrder?.orderNumber}
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Book Keeper Voucher Generator
              </h2>
            </div>

            {/* Voucher Type Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl">
              <button
                onClick={() => {
                  setVoucherType("SALES_INVOICE");
                  setGeneratedCsv("");
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  voucherType === "SALES_INVOICE"
                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Sales Invoice
              </button>
              <button
                onClick={() => {
                  setVoucherType("MATERIAL_CONSUMPTION");
                  setGeneratedCsv("");
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  voucherType === "MATERIAL_CONSUMPTION"
                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Material Issue
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {voucherType === "SALES_INVOICE"
                ? "Generates Book Keeper standard Sales Invoice with GST breakdown & HSN codes."
                : "Generates Book Keeper Manufacturing Journal allocating RM resin and additive consumption."}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGenerateCsv(selectedOrder?.id, voucherType)}
                disabled={isExporting}
                className="py-1.5 px-3.5 rounded-xl bg-[#0d382c] hover:bg-[#08261e] text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isExporting ? "animate-spin" : ""}`} />
                <span>Generate Export</span>
              </button>

              {generatedCsv && (
                <>
                  <button
                    onClick={copyToClipboard}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Copy CSV to clipboard"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={downloadCsvFile}
                    className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Table Preview */}
          <div className="rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 overflow-x-auto max-h-[340px]">
            {parsedRows.length > 0 ? (
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-semibold sticky top-0">
                  <tr>
                    {parsedRows[0].map((col, idx) => (
                      <th key={idx} className="px-3.5 py-2">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800 font-mono text-[11px]">
                  {parsedRows.slice(1).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/60 dark:hover:bg-zinc-800/40">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">
                Click &ldquo;Generate Export&rdquo; to preview Book Keeper spreadsheet columns.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sync Audit History */}
      <div className="rounded-2xl p-5 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
          Book Keeper Export Audit Trail
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 uppercase text-[10px] font-semibold">
                <th className="py-2 px-3">Voucher Type</th>
                <th className="py-2 px-3">Sales Order Reference</th>
                <th className="py-2 px-3">Exported Timestamp</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {logs.map((log: any) => (
                <tr key={log.id}>
                  <td className="py-2 px-3 font-medium">
                    {log.documentType.replace(/_/g, " ")}
                  </td>
                  <td className="py-2 px-3 font-mono text-[#0d382c] dark:text-emerald-400 font-bold">
                    {log.documentId}
                  </td>
                  <td className="py-2 px-3 text-slate-400">{formatDate(log.syncedAt)}</td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      SUCCESS
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
