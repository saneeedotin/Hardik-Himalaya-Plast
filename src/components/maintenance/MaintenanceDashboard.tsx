"use client";

import React, { useState } from "react";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Settings,
  Tool,
  Hammer
} from "lucide-react";

export function MaintenanceDashboard({ dies }: { dies: any[] }) {
  const [selectedDie, setSelectedDie] = useState<any | null>(null);

  // Stats
  const requiresMaintenance = dies.filter(
    (d) => d.totalRunningHours >= d.maintenanceThresholdHours
  ).length;
  const upcomingMaintenance = dies.filter(
    (d) =>
      d.totalRunningHours >= d.maintenanceThresholdHours * 0.9 &&
      d.totalRunningHours < d.maintenanceThresholdHours
  ).length;

  const handleMaintenanceDone = () => {
    alert("Mock: Maintenance marked as complete! Running hours reset to 0.");
    setSelectedDie(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header section with gradient */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 p-8 shadow-xl border border-slate-800">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Wrench className="w-3.5 h-3.5" />
              Tooling & Maintenance
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
              Die Health Center
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-xl">
              Track running hours of extrusion dies and molds. Preventive maintenance minimizes unexpected breakdowns and ensures consistent product quality.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center min-w-[120px]">
              <span className="text-3xl font-black text-rose-400 mb-1">{requiresMaintenance}</span>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Critical</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center min-w-[120px]">
              <span className="text-3xl font-black text-amber-400 mb-1">{upcomingMaintenance}</span>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Upcoming</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Die List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500" />
            Active Extrusion Dies
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dies.map((die) => {
              const progress = Math.min(100, (die.totalRunningHours / die.maintenanceThresholdHours) * 100);
              const isCritical = progress >= 100;
              const isWarning = progress >= 90 && progress < 100;
              const isSelected = selectedDie?.id === die.id;

              return (
                <div
                  key={die.id}
                  onClick={() => setSelectedDie(die)}
                  className={`group relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-300 border ${
                    isSelected 
                      ? "bg-white dark:bg-zinc-900 border-indigo-500 shadow-[0_0_0_1px_rgba(99,102,241,1)]" 
                      : "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {die.name}
                      </h4>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">{die.code}</p>
                    </div>
                    {isCritical ? (
                      <span className="flex items-center gap-1 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        <AlertTriangle className="w-3 h-3" /> Due
                      </span>
                    ) : isWarning ? (
                      <span className="flex items-center gap-1 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        <Clock className="w-3 h-3" /> Soon
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" /> Healthy
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Running Hours</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-white">
                        {die.totalRunningHours.toLocaleString()} / {die.maintenanceThresholdHours.toLocaleString()} h
                      </span>
                    </div>
                    
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${
                          isCritical ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1">
          {selectedDie ? (
            <div className="sticky top-6 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-1">
                  {selectedDie.name}
                </h3>
                <p className="text-sm font-mono text-slate-500">{selectedDie.code}</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Maintenance Checklist</h4>
                  
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Clean die head & remove burnt material</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Inspect heating bands for damage</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Lubricate locking mechanisms</span>
                  </label>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Technician Notes</label>
                  <textarea 
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                    rows={3}
                    placeholder="Enter any issues found..."
                  ></textarea>
                </div>

                <button 
                  onClick={handleMaintenanceDone}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Log Maintenance & Reset Counter
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-zinc-950/50 rounded-3xl border border-slate-200 dark:border-zinc-800 border-dashed">
              <div className="w-16 h-16 bg-slate-200 dark:bg-zinc-900 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <Hammer className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Select a Tool/Die</h3>
              <p className="text-sm text-slate-500 max-w-[200px]">
                Click on any die from the list to view its maintenance checklist or log a service.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
