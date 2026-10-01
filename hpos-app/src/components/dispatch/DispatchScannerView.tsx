"use client";

import React, { useState } from "react";
import {
  QrCode,
  CheckCircle2,
  Volume2,
  VolumeX,
  ShieldAlert,
} from "lucide-react";
import confetti from "canvas-confetti";

export function DispatchScannerView({
  deliveryNotes,
}: {
  deliveryNotes: any[];
}) {
  const [selectedNote, setSelectedNote] = useState<any>(
    deliveryNotes[0] || null
  );
  const [manualCode, setManualCode] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<any>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");

  const playChime = () => {
    if (!audioEnabled || typeof window === "undefined") return;
    try {
      const ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Audio fallback
    }
  };

  const playBuzzer = () => {
    if (!audioEnabled || typeof window === "undefined") return;
    try {
      const ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Audio fallback
    }
  };

  const executeScan = async (code: string, isOverride = false) => {
    if (!code) return;
    setScanning(true);

    try {
      const res = await fetch("/api/dispatch/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartonCode: code,
          override: isOverride,
          overrideNote: isOverride ? overrideReason : "",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        playChime();
        setLastScanResult({
          success: true,
          message: data.message,
          code,
        });

        const updatedCartons = selectedNote.cartons.map((c: any) =>
          c.cartonCode === code
            ? { ...c, scanned: true, scannedAt: new Date() }
            : c
        );
        setSelectedNote({ ...selectedNote, cartons: updatedCartons });

        if (data.isComplete) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
      } else {
        playBuzzer();
        setLastScanResult({
          success: false,
          message: data.error || "Scan rejected.",
          code,
        });
      }
    } catch (err: any) {
      playBuzzer();
      setLastScanResult({
        success: false,
        message: err.message || "Network error",
        code,
      });
    } finally {
      setScanning(false);
      setManualCode("");
      if (isOverride) setOverrideModalOpen(false);
    }
  };

  const cartons = selectedNote?.cartons || [];
  const scannedCount = cartons.filter((c: any) => c.scanned).length;
  const totalCount = cartons.length;
  const progressPercent =
    totalCount > 0 ? Math.round((scannedCount / totalCount) * 100) : 0;
  const isAllComplete = totalCount > 0 && scannedCount === totalCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dispatch Gate Scanner
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Loading dock QR barcode scanner for zero-error dispatch verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Delivery Note Selector */}
          {deliveryNotes.length > 1 && (
            <select
              value={selectedNote?.id || ""}
              onChange={(e) => {
                const dn = deliveryNotes.find((d: any) => d.id === e.target.value);
                setSelectedNote(dn || null);
                setLastScanResult(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#121820] border border-slate-200/80 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
            >
              {deliveryNotes.map((dn: any) => (
                <option key={dn.id} value={dn.id}>
                  {dn.dnNumber} — {dn.customerName}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#121820] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 transition-colors"
          >
            {audioEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#0d382c] dark:text-emerald-400" />
                <span>Audio On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span>Audio Muted</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: Viewfinder & Progress + Cartons Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Viewport & Count (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Minimalist Viewport */}
          <div className="rounded-2xl p-6 md:p-8 bg-white dark:bg-[#121820] border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col items-center justify-between min-h-[340px]">
            {/* Target Reticle */}
            <div className="relative w-56 h-56 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col items-center justify-center p-4">
              <QrCode className="w-20 h-20 text-slate-300 dark:text-slate-600" />
              <span className="text-[11px] font-medium text-slate-400 mt-3 uppercase tracking-wider">
                Align Carton QR Code
              </span>
            </div>

            {/* Arm's Length Counter */}
            <div className="w-full mt-6 text-center">
              <div className="text-4xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                <span className="text-[#0d382c] dark:text-emerald-400">
                  {scannedCount}
                </span>{" "}
                / {totalCount}
              </div>
              <span className="text-xs uppercase font-medium text-slate-400 mt-1 block">
                Cartons Verified ({progressPercent}%)
              </span>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 mt-3 overflow-hidden">
                <div
                  className="h-full bg-[#0d382c] dark:bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Scan Notification */}
            {lastScanResult && (
              <div
                className={`w-full mt-4 p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
                  lastScanResult.success
                    ? "bg-[#eaf3ef] text-[#0d382c] dark:bg-[#162a24] dark:text-emerald-300"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                }`}
              >
                <span>{lastScanResult.message}</span>
                <span className="font-mono text-[10px] opacity-75">
                  {lastScanResult.code}
                </span>
              </div>
            )}
          </div>

          {/* Manual Code Input */}
          <div className="p-3 rounded-2xl bg-white dark:bg-[#121820] border border-slate-200/80 dark:border-slate-800 shadow-2xs flex gap-2">
            <input
              type="text"
              placeholder="Or enter carton code manually..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && executeScan(manualCode)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
            />
            <button
              onClick={() => executeScan(manualCode)}
              disabled={scanning || !manualCode}
              className="py-1.5 px-3.5 rounded-xl bg-[#0d382c] dark:bg-[#164e3f] hover:bg-[#08261e] text-white font-semibold text-xs transition-all shadow-2xs"
            >
              Verify
            </button>
          </div>
        </div>

        {/* Right Column: Cartons Checklist & Simulation (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl p-5 bg-white dark:bg-[#121820] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-mono text-xs font-bold text-[#0d382c] dark:text-emerald-400">
                {selectedNote?.dnNumber || "DN-26-00001"}
              </span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                {selectedNote?.customerName || "Apex Windows & Façade Ltd"}
              </h3>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isAllComplete
                  ? "bg-[#eaf3ef] text-[#0d382c] dark:bg-[#162a24] dark:text-emerald-300"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {isAllComplete ? "Dispatched" : "In Progress"}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Cartons In Consignment
            </span>

            {cartons.map((c: any) => (
              <div
                key={c.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                  c.scanned
                    ? "bg-[#eaf3ef]/40 dark:bg-[#162a24]/40 border-[#0d382c]/20 text-slate-800 dark:text-slate-200"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold">
                      {c.cartonCode}
                    </span>
                    {c.scanned && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0d382c] dark:text-emerald-400" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {c.quantity} m • {c.scanned ? "Verified" : "Pending scan"}
                  </span>
                </div>

                {!c.scanned ? (
                  <button
                    onClick={() => executeScan(c.cartonCode)}
                    disabled={scanning}
                    className="py-1 px-2.5 rounded-lg bg-[#0d382c] hover:bg-[#08261e] text-white font-semibold text-[11px] transition-all"
                  >
                    Simulate
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-[#0d382c] dark:text-emerald-400">
                    Done
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            {isAllComplete ? (
              <a
                href="/tally"
                className="w-full py-2.5 px-4 rounded-xl bg-[#0d382c] dark:bg-[#164e3f] hover:bg-[#08261e] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
              >
                <span>Proceed to Tally Invoicing &rarr;</span>
              </a>
            ) : (
              <button
                onClick={() => setOverrideModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>Supervisor Override</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Override Modal */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121820] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-lg space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Supervisor Count Override
            </h3>
            <p className="text-xs text-slate-500">
              Provide authorization reason for manual carton verification.
            </p>

            <textarea
              rows={2}
              placeholder="e.g. Scuffed label on carton 5..."
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0a2e24]"
            />

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setOverrideModalOpen(false)}
                className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const pending = cartons.find((c: any) => !c.scanned);
                  if (pending) executeScan(pending.cartonCode, true);
                }}
                className="flex-1 py-1.5 rounded-lg bg-[#0a2e24] text-white text-xs font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
