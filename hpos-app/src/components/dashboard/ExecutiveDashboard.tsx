"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Pause,
  Play,
  Square,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DashboardProps {
  initialData: any;
}

export function ExecutiveDashboard({ initialData }: DashboardProps) {
  // Derive real KPIs from database state
  const completedOrders = initialData.orders?.filter(
    (o: any) => o.status === "COMPLETED" || o.status === "DISPATCHED"
  ).length || 0;
  const runningOrders = initialData.activeOrders || 0;
  const pendingDispatches = initialData.readyToDispatch || 0;
  const totalCartonsPacked = initialData.cartons?.length || 0;

  // Live machine timer matching the "05:36:08" Time Tracker in reference UI
  const [seconds, setSeconds] = useState(20168); // 05:36:08
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  // Weekly extrusion telemetry data (matching bespoke bar chart in reference UI)
  const analyticsData = [
    { day: "Mon", output: 420, isSolid: false },
    { day: "Tue", output: 520, isSolid: true },
    { day: "Wed", output: 580, isSolid: true },
    { day: "Thr", output: 390, isSolid: false },
    { day: "Fri", output: 510, isSolid: true },
    { day: "Sat", output: 340, isSolid: false },
    { day: "Sun", output: 590, isSolid: true, isPeak: true },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Header matching reference UI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Plan, prioritize, and accomplish your extrusion operations with ease.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/orders"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0d382c] hover:bg-[#08261e] text-white text-xs font-semibold transition-all shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Order</span>
          </Link>
          <Link
            href="/tally"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#121820] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800 text-xs font-semibold transition-all shadow-2xs active:scale-[0.98]"
          >
            <span>Export Tally</span>
          </Link>
        </div>
      </div>

      {/* 2. Top 4 KPI Metric Cards (1 Pine Hero + 3 Pure White Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pine Hero Accent Card */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#0d382c] via-[#0f3e31] to-[#144f3f] text-white shadow-xs flex flex-col justify-between h-38 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-100/90">
              Total Extrusion Output
            </span>
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight text-white my-1">
            {initialData.totalProducedMeters.toLocaleString()} m
          </div>
          <div className="text-[11px] text-emerald-200/90 font-medium flex items-center gap-1">
            <span>↗</span>
            <span>+12.4% vs last shift</span>
          </div>
        </div>

        {/* Card 2: Completed Orders */}
        <div className="rounded-2xl p-5 bg-white dark:bg-[#121820] border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between h-38">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Completed Orders
            </span>
            <div className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white my-1">
            {completedOrders}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>↗</span>
            <span>{completedOrders > 0 ? `${completedOrders} orders fulfilled` : "No completed orders"}</span>
          </div>
        </div>

        {/* Card 3: Running Orders */}
        <div className="rounded-2xl p-5 bg-white dark:bg-[#121820] border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between h-38">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Running Orders
            </span>
            <div className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white my-1">
            {runningOrders}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>↗</span>
            <span>{runningOrders > 0 ? "Extrusion Line 01 active" : "No active orders"}</span>
          </div>
        </div>

        {/* Card 4: Pending Gate Dispatches */}
        <div className="rounded-2xl p-5 bg-white dark:bg-[#121820] border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between h-38">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Pending Dispatches
            </span>
            <div className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white my-1">
            {pendingDispatches}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>↗</span>
            <span>{totalCartonsPacked} cartons packed at dock</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Extrusion Analytics Bar Chart + Scheduled Briefing + Active Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Extrusion Analytics Bar Chart (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl p-5 bg-white dark:bg-[#121820] border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Extrusion Analytics
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Daily output meters vs target threshold
            </p>
          </div>

          <div className="h-48 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData} barGap={6}>
                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.02)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0d382c] text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-sm">
                          {payload[0].value} meters
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="output"
                  radius={[10, 10, 10, 10]}
                  barSize={24}
                >
                  {analyticsData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isSolid ? "#0d382c" : "#e2ece8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Middle: Scheduled Briefing Card (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl p-5 bg-white dark:bg-[#121820] border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
              Scheduled shift review with Apex Façade Ltd
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
              Review continuous extrusion specs for commercial window gaskets.
              Align batch lot delivery with site timeline.
            </p>
            <div className="mt-4 text-[11px] text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Time: 02.00 pm-04.00 pm</span>
            </div>
          </div>

          <Link
            href="/orders"
            className="w-full py-2.5 rounded-xl bg-[#0d382c] hover:bg-[#08261e] text-white text-xs font-semibold flex items-center justify-center transition-all mt-4 shadow-xs active:scale-[0.98]"
          >
            Review Order Specs
          </Link>
        </div>

        {/* Right: Active Profiles List (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl p-5 bg-white dark:bg-[#121820] border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Active Profiles
            </h3>
            <Link
              href="/production"
              className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            >
              + Details
            </Link>
          </div>

          <div className="space-y-3 mt-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#eaf3ef] dark:bg-[#162a24] text-[#0d382c] dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                P1
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                  uPVC Window Glazing Gasket
                </span>
                <span className="text-[11px] text-slate-400 truncate block">
                  Profile 101 • 5,000m order
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#eaf3ef] dark:bg-[#162a24] text-[#0d382c] dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                P2
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                  TPE Dynamic Door Weatherseal
                </span>
                <span className="text-[11px] text-slate-400 truncate block">
                  Profile 202 • 4,000m order
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#eaf3ef] dark:bg-[#162a24] text-[#0d382c] dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                P3
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                  Glazing Bead Co-extruded Lip
                </span>
                <span className="text-[11px] text-slate-400 truncate block">
                  Profile 303 • 3,000m order
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#eaf3ef] dark:bg-[#162a24] text-[#0d382c] dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                P4
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                  Sliding Sash Interlock Gasket
                </span>
                <span className="text-[11px] text-slate-400 truncate block">
                  Profile 404 • 2,500m order
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Team Roster + Factory Progress + Time Tracker Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Team Collaboration (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl p-5 bg-white dark:bg-[#121820] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Team Roster
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500">
              Shift A
            </span>
          </div>

          <div className="space-y-3 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                  RK
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Ramesh Kumar
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Plant Head
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#eaf3ef] dark:bg-[#162a24] text-[#0d382c] dark:text-emerald-300">
                active
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                  SS
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Suresh Sharma
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Extrusion Lead
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#e6f4f8] text-[#0b6e8a]">
                completed
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                  DY
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Dinesh Yadav
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Dispatch Officer
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#fef6e7] text-[#9a6700]">
                in progress
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                  VS
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Vikram Singh
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    QC Inspector
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#fdecef] text-[#b82c48]">
                in pending
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Factory Progress Circular Donut (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl p-5 bg-white dark:bg-[#121820] border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between items-center text-center">
          <div className="w-full text-left">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Factory Progress
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Overall shift fulfillment rate
            </p>
          </div>

          {/* Clean Donut matching pikbites "42% Project Ended" */}
          <div className="relative flex items-center justify-center my-3">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="currentColor"
                strokeWidth="11"
                className="text-slate-100 dark:text-slate-800"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="currentColor"
                strokeWidth="11"
                strokeDasharray="314"
                strokeDashoffset="80"
                className="text-[#0d382c] dark:text-emerald-400 transition-all duration-1000 ease-out"
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                75%
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                Shift Fulfilled
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-[10px] font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0d382c] dark:bg-emerald-400" />
              Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
              In Progress
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
              Pending
            </span>
          </div>
        </div>

        {/* Right: The Time Tracker Widget (4 cols) matching pikbites */}
        <div className="lg:col-span-4 rounded-2xl p-5 bg-gradient-to-br from-[#0d382c] via-[#0f3e31] to-[#144f3f] text-white shadow-xs relative overflow-hidden flex flex-col justify-between">
          {/* Subtle decorative background wave contours */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -left-8 -top-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10">
            <span className="text-xs font-medium text-emerald-100/90 block">
              Time Tracker
            </span>
            <span className="text-[10px] text-emerald-200/70 block mt-0.5">
              Extrusion Line 01 Active Job
            </span>
          </div>

          {/* Huge Clean Digital Clock */}
          <div className="my-4 text-center relative z-10">
            <div className="text-4xl font-bold font-mono tracking-wider text-white">
              {formatTimer(seconds)}
            </div>
          </div>

          {/* Two Clean Circular Buttons */}
          <div className="flex items-center justify-center gap-3 relative z-10">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="w-11 h-11 rounded-full bg-white text-[#0d382c] hover:bg-slate-100 flex items-center justify-center transition-transform active:scale-95 shadow-md"
              title={isRunning ? "Pause" : "Resume"}
            >
              {isRunning ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                setSeconds(0);
              }}
              className="w-11 h-11 rounded-full bg-[#e11d48] hover:bg-rose-600 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md"
              title="Stop Job"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
