"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Trash2,
  RotateCcw,
  Search,
  Loader2
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getTemplateForBatch } from "@/app/(desk)/qc/actions";

export function QualityStationView({
  initialInspections,
}: {
  initialInspections: any[];
}) {
  const [inspections, setInspections] = useState(initialInspections);
  const [batchNumber, setBatchNumber] = useState("BATCH-FG-2026-00102");
  
  // Dynamic template and data
  const [template, setTemplate] = useState<any[] | null>(null);
  const [qcData, setQcData] = useState<Record<string, any>>({});
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  
  const [reworkNotes, setReworkNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchTemplate = async () => {
    if (!batchNumber) return;
    setIsLoadingTemplate(true);
    setFeedback(null);
    try {
      const tmpl = await getTemplateForBatch(batchNumber);
      if (tmpl) {
        setTemplate(tmpl);
        // Pre-fill qcData with default or empty values
        const initialData: Record<string, any> = {};
        tmpl.forEach((field: any) => {
          if (field.type === 'select' && field.options?.length > 0) {
            initialData[field.id] = field.options[0];
          } else {
            initialData[field.id] = ""; // nominal can be displayed but user enters actual
          }
        });
        setQcData(initialData);
      } else {
        setTemplate(null);
        setFeedback("No QC Template found for this batch's product.");
      }
    } catch (err) {
      setFeedback("Failed to load template.");
      setTemplate(null);
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  const handleDecision = async (status: "PASS" | "REWORK" | "REJECT" | "SCRAP") => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/qc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchNumber,
          status,
          qcData,
          reworkNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInspections([data.inspection, ...inspections]);
        setFeedback(`Report ${data.inspection.reportNumber} recorded [${status}].`);
        setReworkNotes("");
        // Reset inputs
        const resetData: Record<string, any> = {};
        template?.forEach((field: any) => {
          if (field.type === 'select' && field.options?.length > 0) {
            resetData[field.id] = field.options[0];
          } else {
            resetData[field.id] = "";
          }
        });
        setQcData(resetData);
      } else {
        setFeedback(data.error || "Failed to record inspection.");
      }
    } catch (err: any) {
      setFeedback("Failed to record inspection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const passCount = inspections.filter((i) => i.status === "PASS").length;
  const passRate =
    inspections.length > 0
      ? Math.round((passCount / inspections.length) * 100)
      : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Quality Assurance Station
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic parameter inspection based on Product Code.
          </p>
        </div>

        <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs">
          <ShieldCheck className="w-4 h-4 text-[#0d382c] dark:text-emerald-400" />
          <span className="text-slate-700 dark:text-slate-300 font-semibold">
            First-Pass Yield: {passRate}%
          </span>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-[#eaf3ef] dark:bg-[#162a24] text-[#0d382c] dark:text-emerald-300 text-xs font-semibold">
          {feedback}
        </div>
      )}

      {/* Grid: Form + History Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl p-6 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-5">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Scan or Enter Batch Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchTemplate()}
                  placeholder="e.g. BATCH-FG-..."
                  className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
                />
                <button
                  onClick={fetchTemplate}
                  disabled={isLoadingTemplate}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                >
                  {isLoadingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Load
                </button>
              </div>
            </div>

            {template && (
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                    Inspection Template parameters
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    Product specific tolerances
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                  {template.map((field) => (
                    <div key={field.id} className="col-span-1">
                      {field.type === 'number' && (
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            {field.name} ({field.uom})
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={qcData[field.id] || ""}
                            onChange={(e) => setQcData({ ...qcData, [field.id]: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
                          />
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Nom: {field.nominal} ± {field.tolerance}
                          </span>
                        </div>
                      )}
                      
                      {field.type === 'select' && (
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            {field.name}
                          </label>
                          <select
                            value={qcData[field.id] || ""}
                            onChange={(e) => setQcData({ ...qcData, [field.id]: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
                          >
                            {field.options?.map((opt: string) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Rework / Calibration Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Calibration instructions if rework is required..."
                    value={reworkNotes}
                    onChange={(e) => setReworkNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Decision Buttons */}
          {template && (
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                Disposition Decision
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  disabled={isSubmitting}
                  onClick={() => handleDecision("PASS")}
                  className="py-2.5 px-3 rounded-xl bg-[#0d382c] dark:bg-[#164e3f] hover:bg-[#08261e] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PASS</span>
                </button>

                <button
                  disabled={isSubmitting}
                  onClick={() => handleDecision("REWORK")}
                  className="py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-950 hover:bg-slate-50 border border-amber-300 text-amber-700 dark:text-amber-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>REWORK</span>
                </button>

                <button
                  disabled={isSubmitting}
                  onClick={() => handleDecision("REJECT")}
                  className="py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-950 hover:bg-slate-50 border border-rose-300 text-rose-700 dark:text-rose-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>REJECT</span>
                </button>

                <button
                  disabled={isSubmitting}
                  onClick={() => handleDecision("SCRAP")}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>SCRAP</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: History Log (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl p-5 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Inspection Records
            </h3>
            <span className="text-[11px] text-slate-400">
              {inspections.length} logs
            </span>
          </div>

          <div className="space-y-2.5">
            {inspections.map((i: any) => {
              // Parse qcData safely
              let parsedQcData: any = {};
              if (i.qcData) {
                try {
                  parsedQcData = typeof i.qcData === 'string' ? JSON.parse(i.qcData) : i.qcData;
                } catch(e) {}
              }

              return (
                <div
                  key={i.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-zinc-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      {i.reportNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        i.status === "PASS"
                          ? "bg-[#e8f3ef] text-[#0a2e24] dark:bg-[#162a24] dark:text-emerald-300"
                          : i.status === "REWORK"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                      }`}
                    >
                      {i.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex justify-between">
                    <span className="font-mono">{i.batchNumber}</span>
                    <span>{formatDate(i.inspectedAt)}</span>
                  </div>

                  <div className="text-[10px] text-slate-500 flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
                    {Object.entries(parsedQcData).map(([k, v]) => {
                      if (!v) return null;
                      // Display first 20 chars of select fields if they are long
                      const displayVal = String(v).length > 20 ? String(v).substring(0,20) + '...' : String(v);
                      return <span key={k} className="capitalize">{k}: {displayVal}</span>;
                    })}
                  </div>

                  {i.reworkNotes && (
                    <p className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/30 p-1.5 rounded-lg mt-1">
                      {i.reworkNotes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
