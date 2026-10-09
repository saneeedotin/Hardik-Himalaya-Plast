"use client";

import React, { useState, useEffect } from "react";
import {
  ScanLine,
  CheckCircle2,
  AlertCircle,
  PackagePlus,
  RefreshCw,
  Box,
  Layers,
  ArrowRight
} from "lucide-react";

import { receiveRM, verifyMixingBOM } from "@/actions/warehouse";

export function RmInwardView() {
  const [activeTab, setActiveTab] = useState<"inward" | "mixing">("inward");
  
  // Inward Tab State
  const [scannedBag, setScannedBag] = useState("");
  const [inwardStatus, setInwardStatus] = useState<"idle" | "success" | "error" | "loading">("idle");
  const [inwardLogs, setInwardLogs] = useState<{ id: string; material: string; qty: number; time: string }[]>([]);

  // Mixing Tab State
  const [scannedJobCard, setScannedJobCard] = useState("");
  const [scannedResin, setScannedResin] = useState("");
  const [scannedMasterbatch, setScannedMasterbatch] = useState("");
  const [mixingStatus, setMixingStatus] = useState<"idle" | "validating" | "approved" | "rejected">("idle");

  const handleInwardScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedBag) return;
    
    setInwardStatus("loading");
    
    const result = await receiveRM(scannedBag);
    
    if (result.success && result.batch) {
      setInwardStatus("success");
      setInwardLogs((prev) => [
        result.batch!,
        ...prev
      ]);
      setScannedBag("");
    } else {
      setInwardStatus("error");
    }
    
    setTimeout(() => setInwardStatus("idle"), 3000);
  };

  const handleMixingValidation = async () => {
    setMixingStatus("validating");
    
    const result = await verifyMixingBOM(scannedJobCard, scannedResin, scannedMasterbatch);
    
    if (result.success) {
      setMixingStatus("approved");
    } else {
      setMixingStatus("rejected");
    }
  };

  const resetMixing = () => {
    setScannedJobCard("");
    setScannedResin("");
    setScannedMasterbatch("");
    setMixingStatus("idle");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-100 dark:border-emerald-500/20">
            <ScanLine className="w-3.5 h-3.5" />
            Warehouse Tablet App
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            RM Inward & Mixing
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Scan raw materials to instantly update inventory or verify BOM mixtures to prevent operator errors.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-zinc-900 rounded-2xl w-max">
        <button
          onClick={() => setActiveTab("inward")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "inward"
              ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <PackagePlus className="w-4 h-4" />
          Bag Inwarding (GRN)
        </button>
        <button
          onClick={() => setActiveTab("mixing")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "mixing"
              ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Layers className="w-4 h-4" />
          Mixing Station BOM Check
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 md:p-8 shadow-xl">
        {activeTab === "inward" ? (
          // --- TAB 1: BAG INWARDING ---
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Scan Incoming Bags</h3>
                <p className="text-sm text-slate-500">Focus the field below and use a barcode scanner to scan the RM bags directly off the truck.</p>
              </div>

              <form onSubmit={handleInwardScan} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Barcode / Batch ID</label>
                  <div className="relative">
                    <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      value={scannedBag}
                      onChange={(e) => setScannedBag(e.target.value)}
                      placeholder="Scan bag barcode..."
                      className="w-full bg-slate-50 dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-2xl py-4 pl-12 pr-4 text-lg font-mono outline-none transition-all"
                      disabled={inwardStatus === "loading"}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!scannedBag || inwardStatus === "loading"}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg flex justify-center items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                >
                  {inwardStatus === "loading" ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    "Add to Stock"
                  )}
                </button>
              </form>

              {/* Status Indicators */}
              {inwardStatus === "success" && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Bag Successfully Added!</h4>
                    <p className="text-xs opacity-80">Inventory updated in real-time.</p>
                  </div>
                </div>
              )}

              {inwardStatus === "error" && (
                <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-700 dark:text-rose-400">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Invalid Barcode</h4>
                    <p className="text-xs opacity-80">This barcode does not match any pending Purchase Orders.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Inward History List */}
            <div className="bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Box className="w-4 h-4" />
                Recent Scans (Current Session)
              </h4>
              <div className="space-y-3">
                {inwardLogs.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">No bags scanned yet.</div>
                ) : (
                  inwardLogs.map((log, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl shadow-sm">
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{log.material}</div>
                        <div className="font-mono text-[10px] text-slate-500">{log.id}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">+{log.qty} Kg</div>
                        <div className="text-[10px] text-slate-400">{log.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          // --- TAB 2: MIXING BOM CHECK ---
          <div className="max-w-xl mx-auto space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">BOM Verification</h3>
              <p className="text-sm text-slate-500">Scan the materials you are about to mix into the hopper. The system will verify if it matches the active Job Card's Bill of Materials.</p>
            </div>

            {mixingStatus === "approved" ? (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-500 rounded-3xl p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400">Mixture Approved!</h3>
                  <p className="text-emerald-600/80 dark:text-emerald-500/80 mt-1 font-medium">BOM match verified. You may proceed to load the hopper.</p>
                </div>
                <button
                  onClick={resetMixing}
                  className="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors"
                >
                  Start Next Mix
                </button>
              </div>
            ) : mixingStatus === "rejected" ? (
              <div className="bg-rose-50 dark:bg-rose-500/10 border-2 border-rose-500 rounded-3xl p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-rose-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-rose-500/30">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-rose-700 dark:text-rose-400">Mismatch Detected!</h3>
                  <p className="text-rose-600/80 dark:text-rose-500/80 mt-1 font-medium">The scanned Masterbatch does not match the recipe for this Job Card.</p>
                </div>
                <button
                  onClick={resetMixing}
                  className="mt-6 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-colors"
                >
                  Clear & Try Again
                </button>
              </div>
            ) : (
              <div className="space-y-5 relative">
                
                {/* Connecting Line */}
                <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-slate-200 dark:bg-zinc-800 z-0"></div>

                <div className="relative z-10 flex gap-4 items-start">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white dark:border-zinc-950 font-bold ${scannedJobCard ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-zinc-800 text-slate-500"}`}>1</div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Step 1: Job Card Barcode</label>
                    <input
                      type="text"
                      value={scannedJobCard}
                      onChange={(e) => setScannedJobCard(e.target.value)}
                      placeholder="Scan active job card..."
                      className="w-full bg-slate-50 dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl p-3 font-mono outline-none"
                    />
                  </div>
                </div>

                <div className="relative z-10 flex gap-4 items-start">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white dark:border-zinc-950 font-bold ${scannedResin ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-zinc-800 text-slate-500"}`}>2</div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Step 2: Base Resin Barcode</label>
                    <input
                      type="text"
                      value={scannedResin}
                      onChange={(e) => setScannedResin(e.target.value)}
                      disabled={!scannedJobCard}
                      placeholder="Scan PVC resin bag..."
                      className="w-full bg-slate-50 dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl p-3 font-mono outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="relative z-10 flex gap-4 items-start">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white dark:border-zinc-950 font-bold ${scannedMasterbatch ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-zinc-800 text-slate-500"}`}>3</div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Step 3: Masterbatch Barcode</label>
                    <input
                      type="text"
                      value={scannedMasterbatch}
                      onChange={(e) => setScannedMasterbatch(e.target.value)}
                      disabled={!scannedResin}
                      placeholder="Scan masterbatch/color..."
                      className="w-full bg-slate-50 dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl p-3 font-mono outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  onClick={handleMixingValidation}
                  disabled={!scannedJobCard || !scannedResin || !scannedMasterbatch || mixingStatus === "validating"}
                  className="w-full py-4 mt-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg flex justify-center items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                >
                  {mixingStatus === "validating" ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Verify Mixture <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
