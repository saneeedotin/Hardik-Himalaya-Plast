"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export function QualityStationView({
  initialInspections,
}: {
  initialInspections: any[];
}) {
  const [inspections, setInspections] = useState(initialInspections);
  const [batchNumber, setBatchNumber] = useState("BATCH-FG-2026-00102");
  const [pinSize, setPinSize] = useState("4.03");
  const [width, setWidth] = useState("12.08");
  const [legThickness, setLegThickness] = useState("1.51");
  const [linearWeight, setLinearWeight] = useState("75.2");
  const [fitTestResult, setFitTestResult] = useState("PASS");
  const [reworkNotes, setReworkNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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
          pinSize,
          width,
          legThickness,
          linearWeight,
          fitTestResult,
          reworkNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInspections([data.inspection, ...inspections]);
        setFeedback(`Report ${data.inspection.reportNumber} recorded [${status}].`);
        setReworkNotes("");
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
            4-point dimensional calibration &amp; sash groove fit test.
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

      {/* Grid: 4-Point Form + History Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl p-6 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Dimensional Measurements (5-Piece Sample)
            </h2>
            <span className="text-[11px] text-slate-400">
              Tooling Spec Nominal
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Extrusion Lot / Batch Number
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Pin Size (mm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={pinSize}
                  onChange={(e) => setPinSize(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Nom: 4.00</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Width (mm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Nom: 12.00</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Leg (mm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={legThickness}
                  onChange={(e) => setLegThickness(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Nom: 1.50</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Weight (g/m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={linearWeight}
                  onChange={(e) => setLinearWeight(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Nom: 75.0</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Sash Corner Fit &amp; Elastic Recovery
              </label>
              <select
                value={fitTestResult}
                onChange={(e) => setFitTestResult(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
              >
                <option value="PASS">PASS - Snug Corner Fit &amp; Elastic Recovery</option>
                <option value="TIGHT_FIT">TIGHT - Profile tight in sash groove</option>
                <option value="LOOSE_FIT">LOOSE - Slips out of sash groove</option>
              </select>
            </div>

            <div>
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

          {/* 4 Decision Buttons */}
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
            {inspections.map((i: any) => (
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

                <div className="text-[10px] text-slate-500 flex gap-3 pt-0.5">
                  <span>Pin: {i.pinSize}mm</span>
                  <span>Width: {i.width}mm</span>
                  <span>Weight: {i.linearWeight}g/m</span>
                </div>

                {i.reworkNotes && (
                  <p className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/30 p-1.5 rounded-lg mt-1">
                    {i.reworkNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
