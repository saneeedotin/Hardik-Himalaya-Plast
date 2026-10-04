"use client";

import React, { useState } from "react";
import {
  Download,
  Copy,
  Check,
  RefreshCw,
  Building,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export function TallySyncView({
  orders,
  tallyLogs,
}: {
  orders: any[];
  tallyLogs: any[];
}) {
  const [selectedOrder, setSelectedOrder] = useState<any>(orders[0] || null);
  const [generatedXml, setGeneratedXml] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState(tallyLogs);

  const handleGenerateXml = async (orderId: string) => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/tally/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedXml(data.xml);
        setLogs([
          {
            id: String(Date.now()),
            documentType: "SALES_INVOICE",
            documentId: selectedOrder.orderNumber,
            exportedXml: data.xml,
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
    if (!generatedXml) return;
    navigator.clipboard.writeText(generatedXml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadXmlFile = () => {
    if (!generatedXml) return;
    const blob = new Blob([generatedXml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Tally_Invoice_${selectedOrder?.orderNumber || "Export"}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Tally Integration
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            1-click Sales Voucher XML export for TallyPrime accounting.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-600 dark:text-slate-300">
          <Building className="w-3.5 h-3.5 text-[#0d382c] dark:text-emerald-400" />
          <span>Company: Himalaya Plast</span>
        </div>
      </div>

      {/* Grid: Orders + XML Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Orders Ready for Tally (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block px-1">
            Orders Ready For Sync
          </span>

          {orders.map((o) => {
            const isSelected = selectedOrder?.id === o.id;
            return (
              <div
                key={o.id}
                onClick={() => {
                  setSelectedOrder(o);
                  setGeneratedXml("");
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

        {/* Right Column: XML Preview & Export (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl p-6 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <span className="font-mono text-xs font-bold text-[#0d382c] dark:text-emerald-400">
                {selectedOrder?.orderNumber}
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Tally Sales Voucher XML
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGenerateXml(selectedOrder?.id)}
                disabled={isExporting}
                className="py-1.5 px-3 rounded-xl bg-[#0d382c] dark:bg-[#164e3f] hover:bg-[#08261e] text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isExporting ? "animate-spin" : ""}`}
                />
                <span>Generate XML</span>
              </button>

              {generatedXml && (
                <>
                  <button
                    onClick={copyToClipboard}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                    title="Copy XML"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={downloadXmlFile}
                    className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* XML Code Viewer */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 p-3.5 font-mono text-[11px] overflow-x-auto max-h-[300px] text-slate-700 dark:text-slate-300">
            {generatedXml ? (
              <pre className="whitespace-pre">{generatedXml}</pre>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Click &ldquo;Generate XML&rdquo; above to preview voucher code.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sync Audit History */}
      <div className="rounded-2xl p-5 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
          Export Audit Trail
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800 text-slate-400 uppercase text-[10px] font-semibold">
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Reference</th>
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {logs.map((log: any) => (
                <tr key={log.id}>
                  <td className="py-2 px-3 font-medium">
                    {log.documentType.replace(/_/g, " ")}
                  </td>
                  <td className="py-2 px-3 font-mono text-[#0a2e24] dark:text-emerald-400 font-bold">
                    {log.documentId}
                  </td>
                  <td className="py-2 px-3 text-slate-400">
                    {formatDate(log.syncedAt)}
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#e8f3ef] text-[#0a2e24] dark:bg-[#162a24] dark:text-emerald-300">
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
