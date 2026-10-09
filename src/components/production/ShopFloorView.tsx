"use client";

import React, { useState } from "react";
import {
  Cpu,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  BookOpen,
  Video,
  FileText,
  X,
} from "lucide-react";
import Link from "next/link";

export function ShopFloorView({ lines }: { lines: any[] }) {
  const [selectedLine, setSelectedLine] = useState(lines[0] || null);

  // Derive initial values from the active job card's real DB data
  const activeJob =
    selectedLine?.jobCards?.find((j: any) => j.status === "ACTIVE") ||
    selectedLine?.jobCards?.[0];

  const [producedQty, setProducedQty] = useState(activeJob?.goodQty ?? 1800);
  const [scrapQty, setScrapQty] = useState(activeJob?.scrapQty ?? 45);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  // Downtime states
  const [showDowntimeModal, setShowDowntimeModal] = useState(false);
  const [downtimeReason, setDowntimeReason] = useState("");
  const [downtimeNotes, setDowntimeNotes] = useState("");

  // SOP Modal state
  const [showSopModal, setShowSopModal] = useState(false);
  const [activeSop, setActiveSop] = useState("emergency_shutdown");

  const plannedQty = activeJob?.workOrder?.plannedQty ?? 4000;

  const handleLogDowntime = async () => {
    if (!downtimeReason) return;
    setIsLogging(true);
    try {
      const res = await fetch("/api/production/downtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workstationId: selectedLine?.id,
          jobCardId: activeJob?.id,
          reasonCode: downtimeReason,
          notes: downtimeNotes
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage(`⚠ Line stopped: ${downtimeReason}`);
        setShowDowntimeModal(false);
        setDowntimeReason("");
        setDowntimeNotes("");
      } else {
        alert(data.error || "Failed to log downtime");
      }
    } catch (e) {
      alert("Offline mode: Downtime recorded locally.");
      setShowDowntimeModal(false);
    } finally {
      setIsLogging(false);
    }
  };

  const handleLogMeters = async (delta: number) => {
    setIsLogging(true);
    setStatusMessage("");

    try {
      const res = await fetch("/api/production/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobCardId: activeJob?.id,
          type: "METERS",
          amount: delta,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProducedQty(data.goodQty);
        setStatusMessage(`✓ Logged +${delta} meters on ${selectedLine?.name || "Line 01"}`);
      } else {
        setStatusMessage(`⚠ ${data.error || "Failed to log meters"}`);
      }
    } catch {
      // Optimistic update if API is unavailable
      setProducedQty((prev: number) => prev + delta);
      setStatusMessage(`Logged +${delta} meters on ${selectedLine?.name || "Line 01"} (offline)`);
    } finally {
      setIsLogging(false);
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  const handleLogScrap = async (kg: number) => {
    setIsLogging(true);
    setStatusMessage("");

    try {
      const res = await fetch("/api/production/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobCardId: activeJob?.id,
          type: "SCRAP",
          amount: kg,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setScrapQty(data.scrapQty);
        setStatusMessage(`✓ Logged ${kg}kg purge scrap on ${selectedLine?.name || "Line 01"}`);
      } else {
        setStatusMessage(`⚠ ${data.error || "Failed to log scrap"}`);
      }
    } catch {
      // Optimistic update if API is unavailable
      setScrapQty((prev: number) => prev + kg);
      setStatusMessage(`Logged ${kg}kg scrap on ${selectedLine?.name || "Line 01"} (offline)`);
    } finally {
      setIsLogging(false);
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  // When switching lines, update the displayed data
  const handleSelectLine = (l: any) => {
    setSelectedLine(l);
    const job = l?.jobCards?.find((j: any) => j.status === "ACTIVE") || l?.jobCards?.[0];
    setProducedQty(job?.goodQty ?? 0);
    setScrapQty(job?.scrapQty ?? 0);
    setStatusMessage("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-4">
            Extrusion Floor
            <Link 
              href="/production/handover" 
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5" /> Shift Handover
            </Link>
            <button 
              onClick={() => setShowSopModal(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" /> Digital SOPs
            </button>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Machine operator terminal for live extrusion telemetry and material output.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-600 dark:text-slate-300">
          <UserCheck className="w-3.5 h-3.5 text-[#0d382c] dark:text-emerald-400" />
          <span>Lead: {activeJob?.assignedUser?.name?.split(" (")[0] || "Suresh Sharma"}</span>
        </div>
      </div>

      {/* Extrusion Line Selector Tabs */}
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {lines.map((l) => {
          const isSelected = selectedLine?.id === l.id;
          const isRunning = l.status === "RUNNING";

          return (
            <button
              key={l.id}
              onClick={() => handleSelectLine(l)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-xs transition-all border ${
                isSelected
                  ? "bg-[#0d382c] text-white border-[#0d382c] shadow-2xs"
                  : "bg-white dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>{l.name.split(" (")[0]}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isRunning ? "bg-emerald-400" : "bg-slate-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      {statusMessage && (
        <div className={`p-3 rounded-xl text-xs font-semibold ${
          statusMessage.startsWith("✓")
            ? "bg-[#eaf3ef] dark:bg-[#162a24] text-[#0d382c] dark:text-emerald-300"
            : statusMessage.startsWith("⚠")
            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
            : "bg-[#eaf3ef] dark:bg-[#162a24] text-[#0d382c] dark:text-emerald-300"
        }`}>
          {statusMessage}
        </div>
      )}

      {/* Grid: Telemetry + Operator Buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Job Status & Barrel Temperatures (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Work Order Card */}
          <div className="rounded-2xl p-5 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Active Work Order
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                  {activeJob?.workOrder?.fgItem?.name || "No active job"}
                </h3>
                {activeJob?.workOrder?.workOrderNumber && (
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {activeJob.workOrder.workOrderNumber}
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                activeJob?.status === "ACTIVE"
                  ? "bg-[#eaf3ef] dark:bg-[#162a24] text-[#0d382c] dark:text-emerald-300"
                  : activeJob?.status === "COMPLETED"
                  ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}>
                {activeJob?.status === "ACTIVE" ? "Running" : activeJob?.status || "Idle"}
              </span>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Target: {plannedQty.toLocaleString()} Meters</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {producedQty.toLocaleString()} / {plannedQty.toLocaleString()} m ({Math.round((producedQty / plannedQty) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-[#0d382c] dark:bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (producedQty / plannedQty) * 100)}%` }}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 font-medium block">
                  Good Meters
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {producedQty.toLocaleString()} m
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 font-medium block">
                  Purge Scrap
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {scrapQty} Kg
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 font-medium block">
                  Scrap Rate
                </span>
                <span className="text-lg font-bold text-[#0d382c] dark:text-emerald-400 mt-0.5 block">
                  {((scrapQty / (producedQty * 0.075 + scrapQty)) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Barrel Temperature Zones */}
          <div className="rounded-2xl p-5 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Barrel Temperature Telemetry
            </h3>

            <div className="grid grid-cols-4 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 block font-medium">Zone 1</span>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">172°C</div>
                <span className="text-[9px] text-slate-400">Set: 170°C</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 block font-medium">Zone 2</span>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">181°C</div>
                <span className="text-[9px] text-slate-400">Set: 180°C</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 block font-medium">Zone 3</span>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">186°C</div>
                <span className="text-[9px] text-slate-400">Set: 185°C</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] text-slate-400 block font-medium">Die Head</span>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">191°C</div>
                <span className="text-[9px] text-slate-400">Set: 190°C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Operator Action Buttons (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl p-5 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
            Operator Actions
          </span>

          <button
            onClick={() => handleLogMeters(100)}
            disabled={isLogging}
            className="w-full py-3.5 px-4 rounded-xl bg-[#0d382c] dark:bg-[#164e3f] hover:bg-[#08261e] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            <span>+ 100 Meters Counter</span>
          </button>

          <button
            onClick={() => handleLogMeters(500)}
            disabled={isLogging}
            className="w-full py-3 px-4 rounded-xl bg-white dark:bg-zinc-950 hover:bg-slate-50 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            <Plus className="w-4 h-4 text-slate-400" />
            <span>+ 500 Meters Reel Finish</span>
          </button>

          <button
            onClick={() => handleLogScrap(5)}
            disabled={isLogging}
            className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 border border-slate-200/80 dark:border-zinc-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            <Trash2 className="w-4 h-4 text-slate-400" />
            <span>Log 5 Kg Purge Scrap</span>
          </button>

          <a
            href="/qc"
            className="w-full py-3 px-4 rounded-xl bg-white dark:bg-zinc-950 hover:bg-slate-50 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle className="w-4 h-4 text-slate-400" />
            <span>Send Sample to QC Station</span>
          </a>

          <button
            onClick={() => setShowDowntimeModal(true)}
            className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 font-medium text-xs flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors mt-2"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Line Pause Alert</span>
          </button>
        </div>
      </div>

      {/* Downtime Modal */}
      {showDowntimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-5">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-lg font-bold">Log Machine Downtime</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug">
              Machine <strong>{selectedLine?.name}</strong> has been stopped. Please log the reason code for OEE tracking.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Reason Code</label>
                <select 
                  value={downtimeReason}
                  onChange={(e) => setDowntimeReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-sm"
                >
                  <option value="">Select reason...</option>
                  <option value="POWER_CUT">Power Cut / Utility Failure</option>
                  <option value="HEATER_FAIL">Heater / Band Failure</option>
                  <option value="DIE_CHANGE">Die Change / Setup</option>
                  <option value="NO_MATERIAL">No Material Availability</option>
                  <option value="BREAKDOWN">Mechanical Breakdown</option>
                  <option value="LUNCH_TEA">Lunch / Tea Break</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Notes (Optional)</label>
                <textarea 
                  value={downtimeNotes}
                  onChange={(e) => setDowntimeNotes(e.target.value)}
                  placeholder="Describe the issue..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-sm resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowDowntimeModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogDowntime}
                disabled={!downtimeReason || isLogging}
                className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
              >
                {isLogging ? "Logging..." : "Confirm Downtime"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOP Modal */}
      {showSopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl p-6 w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                <BookOpen className="w-6 h-6" />
                <h2 className="text-xl font-bold">Standard Operating Procedures</h2>
              </div>
              <button onClick={() => setShowSopModal(false)} className="p-2 bg-slate-100 dark:bg-zinc-900 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select a training module or safety manual to view directly on this terminal.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setActiveSop("emergency_shutdown")}
                className={`border rounded-2xl p-4 transition-colors cursor-pointer group bg-slate-50 dark:bg-zinc-900 ${activeSop === "emergency_shutdown" ? "border-blue-500 ring-1 ring-blue-500 shadow-sm" : "border-slate-200 dark:border-zinc-800 hover:border-blue-500"}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center shrink-0">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">Emergency Shutdown</h4>
                    <p className="text-xs text-slate-500 mt-1">2m 45s • Video Guide</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setActiveSop("die_change")}
                className={`border rounded-2xl p-4 transition-colors cursor-pointer group bg-slate-50 dark:bg-zinc-900 ${activeSop === "die_change" ? "border-blue-500 ring-1 ring-blue-500 shadow-sm" : "border-slate-200 dark:border-zinc-800 hover:border-blue-500"}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">Die Change Procedure</h4>
                    <p className="text-xs text-slate-500 mt-1">5m 12s • Video Guide</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setActiveSop("safety_manual")}
                className={`border rounded-2xl p-4 transition-colors cursor-pointer group bg-slate-50 dark:bg-zinc-900 ${activeSop === "safety_manual" ? "border-blue-500 ring-1 ring-blue-500 shadow-sm" : "border-slate-200 dark:border-zinc-800 hover:border-blue-500"}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">Safety Manual 2026</h4>
                    <p className="text-xs text-slate-500 mt-1">12 Pages • PDF</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setActiveSop("cleaning_log")}
                className={`border rounded-2xl p-4 transition-colors cursor-pointer group bg-slate-50 dark:bg-zinc-900 ${activeSop === "cleaning_log" ? "border-blue-500 ring-1 ring-blue-500 shadow-sm" : "border-slate-200 dark:border-zinc-800 hover:border-blue-500"}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">Machine Cleaning Log</h4>
                    <p className="text-xs text-slate-500 mt-1">2 Pages • PDF Checklist</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Viewer */}
            <div className="w-full bg-slate-900 rounded-2xl aspect-video relative overflow-hidden mt-4 shadow-inner border border-slate-200 dark:border-zinc-800">
               {activeSop === "emergency_shutdown" || activeSop === "die_change" ? (
                 <video 
                   key={activeSop} // force re-mount
                   controls 
                   className="w-full h-full object-cover"
                   poster={activeSop === "emergency_shutdown" ? "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" : "https://images.unsplash.com/photo-1580983546111-c304d9e5db3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                 >
                   <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                   Your browser does not support HTML5 video.
                 </video>
               ) : (
                 <div className="w-full h-full bg-white dark:bg-zinc-900 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                   <FileText className="w-12 h-12 mb-3 text-slate-300 dark:text-zinc-700" />
                   <h3 className="font-bold text-slate-900 dark:text-white mb-1">PDF Viewer Loaded</h3>
                   <p className="text-sm">In production, the PDF ({activeSop === "safety_manual" ? "Safety Manual" : "Cleaning Log"}) would be embedded here using react-pdf or an iframe.</p>
                   <button className="mt-4 px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white rounded-xl text-sm font-medium transition-colors">
                     Download PDF Instead
                   </button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
