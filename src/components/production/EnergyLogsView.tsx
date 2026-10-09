"use client";

import React, { useState } from "react";
import { Zap, Bolt, ArrowRight, Activity, Cpu } from "lucide-react";

export function EnergyLogsView() {
  const [startReading, setStartReading] = useState<string>("");
  const [endReading, setEndReading] = useState<string>("");
  const [costPerUnit, setCostPerUnit] = useState<string>("8.50"); // 8.50 INR per unit
  const [totalYield, setTotalYield] = useState<string>("1500"); // Kg produced

  const [calcResult, setCalcResult] = useState<{
    unitsConsumed: number;
    totalCost: number;
    costPerKg: number;
  } | null>(null);

  // Mock Active Jobs
  const activeJobs = [
    { id: "JC-1002", product: "Glazing Bead Co-extruded Soft Lip", line: "Line 01", status: "COMPLETED_PENDING_LOGS" },
    { id: "JC-1003", product: "PVC Garden Pipe 1/2 inch", line: "Line 02", status: "RUNNING" },
  ];

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseFloat(startReading);
    const end = parseFloat(endReading);
    const rate = parseFloat(costPerUnit);
    const yieldKg = parseFloat(totalYield);

    if (start && end && end > start && yieldKg > 0) {
      const unitsConsumed = end - start;
      const totalCost = unitsConsumed * rate;
      const costPerKg = totalCost / yieldKg;
      
      setCalcResult({
        unitsConsumed,
        totalCost,
        costPerKg
      });
    } else {
      alert("Please enter valid readings (End reading must be greater than Start reading).");
    }
  };

  const handleSave = () => {
    alert("Mock: Energy logs saved successfully!");
    setCalcResult(null);
    setStartReading("");
    setEndReading("");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-100 dark:border-amber-500/20">
            <Zap className="w-3.5 h-3.5" />
            Energy Management
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Job Card Energy Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track electricity consumption per work order to accurately calculate power cost per Kg of production.
          </p>
        </div>
        
        <div className="bg-white dark:bg-zinc-950 px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500">
            <Bolt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Grid Rate</div>
            <div className="font-bold text-slate-900 dark:text-white">₹{costPerUnit} / kWh</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Log Meter Readings
            </h3>

            <form onSubmit={handleCalculate} className="space-y-6">
              {/* Job Selection */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Select Active Job Card</label>
                <div className="space-y-3">
                  {activeJobs.map(job => (
                    <label key={job.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-500/10">
                      <input type="radio" name="jobCard" className="mt-1" defaultChecked={job.status === "COMPLETED_PENDING_LOGS"} />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{job.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${job.status === "RUNNING" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {job.status === "RUNNING" ? "Running" : "Pending Log"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{job.product}</p>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Cpu className="w-3 h-3"/> {job.line}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Readings */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Start Meter (kWh)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={startReading}
                    onChange={(e) => setStartReading(e.target.value)}
                    placeholder="e.g. 145020.5"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">End Meter (kWh)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={endReading}
                    onChange={(e) => setEndReading(e.target.value)}
                    placeholder="e.g. 146120.0"
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                    required
                  />
                </div>
              </div>

              {/* Yield & Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Yield Produced (Kg)</label>
                  <input 
                    type="number" 
                    value={totalYield}
                    onChange={(e) => setTotalYield(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Grid Rate (₹/kWh)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20"
              >
                Calculate Power Cost
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Results & History */}
        <div className="lg:col-span-5 space-y-6">
          {calcResult ? (
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-950 rounded-3xl p-6 shadow-xl border border-indigo-900/50 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
              
              <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-6 relative z-10">
                Calculation Results
              </h3>

              <div className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-indigo-200 mb-1">Units Consumed</div>
                    <div className="text-2xl font-black font-mono text-amber-400">{calcResult.unitsConsumed.toFixed(1)} <span className="text-sm text-indigo-300 font-medium">kWh</span></div>
                  </div>
                  <div>
                    <div className="text-xs text-indigo-200 mb-1">Total Cost</div>
                    <div className="text-2xl font-black font-mono">₹{calcResult.totalCost.toFixed(2)}</div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center">
                  <div className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2">Power Cost Per Kg</div>
                  <div className="text-5xl font-black text-white">₹{calcResult.costPerKg.toFixed(2)}</div>
                  <div className="text-xs text-indigo-300 mt-2">Based on {totalYield} Kg yield</div>
                </div>

                <button 
                  onClick={handleSave}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  Save Energy Log <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
             <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-3xl border border-slate-200 dark:border-zinc-800 border-dashed p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
               <div className="w-16 h-16 bg-white dark:bg-zinc-950 rounded-full flex items-center justify-center text-slate-300 dark:text-zinc-700 mb-4 shadow-sm">
                 <Zap className="w-8 h-8" />
               </div>
               <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Ready to Calculate</h3>
               <p className="text-sm text-slate-500">Enter the start and end meter readings to instantly calculate the exact power cost per Kg for your production runs.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
