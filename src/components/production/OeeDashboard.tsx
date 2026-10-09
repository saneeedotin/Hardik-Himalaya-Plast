"use client";

import React from "react";
import {
  Activity,
  AlertTriangle,
  Clock,
  Zap,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown
} from "lucide-react";

export function OeeDashboard() {
  // Mocked analytics data
  const oeeScore = 78.4;
  const availability = 85.2;
  const performance = 95.0;
  const quality = 96.8;

  const downtimeReasons = [
    { id: 1, reason: "Power Cut / Utility Failure", minutes: 340, incidents: 12, color: "bg-rose-500" },
    { id: 2, reason: "Die Change / Setup", minutes: 210, incidents: 8, color: "bg-amber-500" },
    { id: 3, reason: "No Material Availability", minutes: 120, incidents: 5, color: "bg-orange-500" },
    { id: 4, reason: "Heater / Band Failure", minutes: 95, incidents: 3, color: "bg-pink-500" },
    { id: 5, reason: "Mechanical Breakdown", minutes: 45, incidents: 2, color: "bg-purple-500" },
  ];

  const totalDowntime = downtimeReasons.reduce((acc, curr) => acc + curr.minutes, 0);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2 border border-indigo-100 dark:border-indigo-500/20">
            <Activity className="w-3.5 h-3.5" />
            Live Telemetry
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            OEE & Downtime Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Overall Equipment Effectiveness across all extrusion lines for the last 30 days.
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* OEE Score */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
            <Activity className="w-24 h-24 text-indigo-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Factory OEE
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 dark:text-white">{oeeScore}%</span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-lg w-max">
            <TrendingDown className="w-3.5 h-3.5" />
            -2.1% vs last month
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Availability
            </h3>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">{availability}%</div>
          <div className="w-full bg-slate-100 dark:bg-zinc-900 rounded-full h-1.5">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${availability}%` }}></div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Performance
            </h3>
            <Zap className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">{performance}%</div>
          <div className="w-full bg-slate-100 dark:bg-zinc-900 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${performance}%` }}></div>
          </div>
        </div>

        {/* Quality */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Quality Rate
            </h3>
            <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">{quality}%</div>
          <div className="w-full bg-slate-100 dark:bg-zinc-900 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${quality}%` }}></div>
          </div>
        </div>
      </div>

      {/* Middle Row: Pareto Chart & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Downtime Pareto (List view) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Top Downtime Reasons (Pareto)
            </h3>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-zinc-900 px-3 py-1 rounded-full">
              Total: {Math.round(totalDowntime / 60)} hrs
            </span>
          </div>

          <div className="space-y-5">
            {downtimeReasons.map((item) => {
              const percentage = (item.minutes / totalDowntime) * 100;
              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.reason}
                    </span>
                    <div className="flex gap-4 text-slate-500 font-medium">
                      <span>{item.incidents} incidents</span>
                      <span className="w-20 text-right">{Math.round(item.minutes / 60)}h {item.minutes % 60}m</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.color}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost Impact */}
        <div className="bg-gradient-to-b from-slate-900 to-indigo-950 rounded-3xl border border-indigo-900/50 p-6 shadow-lg text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-500/20 blur-3xl rounded-full"></div>
          
          <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-6 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Financial Impact
          </h3>
          
          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-indigo-200 text-xs font-medium mb-1">Estimated Revenue Lost</p>
              <div className="text-4xl font-black tracking-tight text-white mb-2">₹1.42L</div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-rose-300">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +12% vs last month
              </div>
            </div>

            <div className="pt-6 border-t border-indigo-800/50">
              <p className="text-indigo-200 text-xs font-medium mb-3">Biggest Bottleneck</p>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="font-bold text-sm mb-1">Power Cut / Utility Failure</div>
                <div className="text-xs text-indigo-200">Accounts for 42% of all lost production time. Recommend checking DG set auto-start delay.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
