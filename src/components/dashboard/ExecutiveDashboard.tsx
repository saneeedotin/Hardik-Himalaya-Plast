"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Pause,
  Play,
  Square,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  ShoppingCart,
  QrCode,
  FileCheck,
  TrendingUp,
  RotateCw,
  PhoneCall,
  Calendar,
  Send,
  Boxes,
  Truck,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
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
import { useUser } from "@/hooks/useUser";

interface DashboardProps {
  initialData: any;
}

export function ExecutiveDashboard({ initialData }: DashboardProps) {
  const { user } = useUser();

  // Metrics calculation
  const completedOrders =
    initialData.orders?.filter(
      (o: any) => o.status === "COMPLETED" || o.status === "DISPATCHED"
    ).length || 0;
  const runningOrders = initialData.activeOrders || 0;
  const pendingDispatches = initialData.readyToDispatch || 0;
  const totalCartonsPacked = initialData.cartons?.length || 0;

  // Timeframe filter state
  const [timeframe, setTimeframe] = useState<"shift" | "today" | "week" | "month">("shift");
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "TIMELINE" | "ATTENTION" | "REORDERS">("OVERVIEW");

  // Live timer for active extrusion line
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

  const analyticsData = initialData.analyticsData || [];
  const orders = initialData.orders || [];
  const followUps = initialData.customerFollowUps || [];
  const notifications = initialData.notifications || [];
  const rawMaterials = initialData.rawMaterials || [];

  // Identify low raw materials
  const lowStockMaterials = rawMaterials.filter((rm: any) => {
    const totalQty = rm.batches?.reduce((acc: number, b: any) => acc + (b.quantity || 0), 0) || 0;
    return totalQty < (rm.minStockLevel || 100);
  });

  // Calculate Order Timeline Stage for each order
  const getOrderTimelineStage = (order: any) => {
    // Stage 1: Draft / Proforma
    // Stage 2: Confirmed
    // Stage 3: In Production (Work Order assigned)
    // Stage 4: QC Cleared
    // Stage 5: Packed / Cartons generated
    // Stage 6: Dispatched

    const hasWorkOrders = order.workOrders && order.workOrders.length > 0;
    const workOrderCompleted = hasWorkOrders && order.workOrders.every((wo: any) => wo.status === "COMPLETED");
    const hasDeliveryNotes = order.deliveryNotes && order.deliveryNotes.length > 0;
    const isDispatched = order.status === "DISPATCHED" || (hasDeliveryNotes && order.deliveryNotes.some((dn: any) => dn.status === "DISPATCHED"));
    const allCartonsPacked = hasDeliveryNotes && order.deliveryNotes.some((dn: any) => dn.cartons?.length > 0);

    let stage = 1;
    let label = "Proforma Sent";

    if (order.status === "CONFIRMED" || order.status === "IN_PRODUCTION") {
      stage = 2;
      label = "Confirmed & Reserved";
    }
    if (hasWorkOrders) {
      stage = 3;
      label = "In Extrusion";
    }
    if (workOrderCompleted) {
      stage = 4;
      label = "QC Cleared";
    }
    if (allCartonsPacked) {
      stage = 5;
      label = "Packed at Dock";
    }
    if (isDispatched) {
      stage = 6;
      label = "Dispatched";
    }

    return { stage, label };
  };

  // Multiplier for timeframe visual adjustment
  const timeframeMultiplier = {
    shift: 1,
    today: 1.8,
    week: 8.5,
    month: 34.2,
  }[timeframe];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Welcome State & Summary Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#0d382c] via-[#0f4435] to-[#164e3f] text-white shadow-xs relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-32 -bottom-10 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                Shift A Active
              </span>
              <span className="text-emerald-200/80 text-xs">
                Line 01 Running (18.5 m/min)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5">
              Welcome back, {user ? user.name.split(" ")[0] : "Founder"} 👋
            </h1>

            {/* Structured Operational Status Listview */}
            <div className="mt-3.5 space-y-1.5 text-xs text-emerald-100/90">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 ring-2 ring-emerald-400/30" />
                <span>
                  <strong className="text-white font-semibold">Factory Status:</strong> Plant operations normal • Shift A active (Line 01 speed 18.5 m/min)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-300 shrink-0 ring-2 ring-purple-300/30" />
                <span>
                  <strong className="text-white font-semibold">In Production:</strong>{" "}
                  <Link href="/work-orders" className="underline hover:text-white font-medium">
                    {runningOrders} active work orders
                  </Link>{" "}
                  currently on the extrusion floor
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 shrink-0 ring-2 ring-amber-300/30" />
                <span>
                  <strong className="text-white font-semibold">Ready for Dispatch:</strong>{" "}
                  <Link href="/dispatch" className="underline hover:text-white font-medium">
                    {pendingDispatches} consignment{pendingDispatches !== 1 ? "s" : ""}
                  </Link>{" "}
                  staged & ready for gate QR scan
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-300 shrink-0 ring-2 ring-sky-300/30" />
                <span>
                  <strong className="text-white font-semibold">Customer Loop:</strong>{" "}
                  <Link href="/customers" className="underline hover:text-white font-medium">
                    {followUps.length} reorder reminder{followUps.length !== 1 ? "s" : ""}
                  </Link>{" "}
                  scheduled for proactive sales outreach
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <Link
              href="/orders"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-[#0d382c] text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Order</span>
            </Link>
            <Link
              href="/dispatch"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#185e4c] hover:bg-[#1f735e] text-white text-xs font-semibold border border-emerald-400/30 transition-all active:scale-[0.98]"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Gate Scan</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link
          href="/orders"
          className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 hover:border-[#0d382c] dark:hover:border-emerald-500 hover:shadow-xs transition-all flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#0d382c] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
              New Order
            </span>
            <span className="text-[10px] text-slate-400 block truncate">Create proforma</span>
          </div>
        </Link>

        <Link
          href="/work-orders"
          className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 hover:border-[#0d382c] dark:hover:border-emerald-500 hover:shadow-xs transition-all flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Boxes className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
              Extrusion Run
            </span>
            <span className="text-[10px] text-slate-400 block truncate">Job card assign</span>
          </div>
        </Link>

        <Link
          href="/qc"
          className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 hover:border-[#0d382c] dark:hover:border-emerald-500 hover:shadow-xs transition-all flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
              5-Sample QC
            </span>
            <span className="text-[10px] text-slate-400 block truncate">Inspect batch</span>
          </div>
        </Link>

        <Link
          href="/dispatch"
          className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 hover:border-[#0d382c] dark:hover:border-emerald-500 hover:shadow-xs transition-all flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
              Gate Dispatch
            </span>
            <span className="text-[10px] text-slate-400 block truncate">Barcode camera</span>
          </div>
        </Link>

        <Link
          href="/customers"
          className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 hover:border-[#0d382c] dark:hover:border-emerald-500 hover:shadow-xs transition-all flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
              Follow-Up
            </span>
            <span className="text-[10px] text-slate-400 block truncate">Reorder loop</span>
          </div>
        </Link>

        <Link
          href="/tally"
          className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 hover:border-[#0d382c] dark:hover:border-emerald-500 hover:shadow-xs transition-all flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Send className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
              Tally Sync
            </span>
            <span className="text-[10px] text-slate-400 block truncate">Export XML</span>
          </div>
        </Link>
      </div>

      {/* 3. Timeframe Filter & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-zinc-800 pb-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveTab("OVERVIEW")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "OVERVIEW"
                ? "bg-[#0d382c] text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("TIMELINE")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "TIMELINE"
                ? "bg-[#0d382c] text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            <span>Order Timeline</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px]">
              {orders.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("ATTENTION")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "ATTENTION"
                ? "bg-[#0d382c] text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            <span>Needs Attention</span>
            {(notifications.length > 0 || lowStockMaterials.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("REORDERS")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "REORDERS"
                ? "bg-[#0d382c] text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            <span>Customer Reorders</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[10px]">
              {followUps.length}
            </span>
          </button>
        </div>

        {/* Time Period Filter Context (Daily, Weekly, Monthly) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl self-start sm:self-auto">
          {(["shift", "today", "week", "month"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                timeframe === t
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {t === "shift" ? "Current Shift" : t}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          {/* 4 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Extrusion Output */}
            <div className="rounded-2xl p-5 bg-gradient-to-br from-[#0d382c] via-[#0f3e31] to-[#144f3f] text-white shadow-xs flex flex-col justify-between h-38">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-100/90">
                  Extrusion Output ({timeframe})
                </span>
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight text-white my-1 font-mono">
                {Math.round(initialData.totalProducedMeters * timeframeMultiplier).toLocaleString()} m
              </div>
              <div className="text-[11px] text-emerald-200/90 font-medium flex items-center gap-1">
                <span>↗</span>
                <span>+12.4% vs target line speed</span>
              </div>
            </div>

            {/* Card 2: Revenue */}
            <div className="rounded-2xl p-5 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between h-38">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Order Revenue ({timeframe})
                </span>
                <div className="w-7 h-7 rounded-full border border-slate-200 dark:border-zinc-800 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white my-1 font-mono">
                ₹{Math.round(initialData.totalRevenue * (timeframe === "shift" ? 0.3 : timeframeMultiplier * 0.4)).toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="text-emerald-600 font-semibold">{completedOrders} fulfilled</span>
                <span>• {orders.length} total orders</span>
              </div>
            </div>

            {/* Card 3: Running Orders */}
            <div className="rounded-2xl p-5 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between h-38">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Active Extrusion Lines
                </span>
                <div className="w-7 h-7 rounded-full border border-slate-200 dark:border-zinc-800 flex items-center justify-center">
                  <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white my-1 font-mono">
                {runningOrders}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Line 01 currently active</span>
              </div>
            </div>

            {/* Card 4: Pending Dispatches */}
            <div className="rounded-2xl p-5 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between h-38">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Ready to Dispatch
                </span>
                <div className="w-7 h-7 rounded-full border border-slate-200 dark:border-zinc-800 flex items-center justify-center">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white my-1 font-mono">
                {pendingDispatches}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span>{totalCartonsPacked} cartons verified at dock</span>
              </div>
            </div>
          </div>

          {/* Middle Section: Extrusion Analytics + Active Profiles + Time Tracker */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Extrusion Output Chart (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl p-5 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
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
                      {analyticsData.map((entry: any, index: number) => (
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

            {/* Middle: Active Profiles (3 cols) */}
            <div className="lg:col-span-3 rounded-2xl p-5 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Active Extrusions
                </h3>
                <Link
                  href="/work-orders"
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-3 mt-3">
                {initialData.activeProfiles?.length > 0 ? (
                  initialData.activeProfiles.map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#eaf3ef] dark:bg-[#162a24] text-[#0d382c] dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {p.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate block font-mono">
                          {p.code} • {p.quantity} {p.uom}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 py-6 text-center">
                    No active runs
                  </div>
                )}
              </div>

              <Link
                href="/work-orders"
                className="w-full py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center transition-all mt-4 border border-slate-200 dark:border-zinc-800"
              >
                Manage Production
              </Link>
            </div>

            {/* Right: Time Tracker Widget (4 cols) */}
            <div className="lg:col-span-4 rounded-2xl p-5 bg-gradient-to-br from-[#0d382c] via-[#0f3e31] to-[#144f3f] text-white shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                <span className="text-xs font-medium text-emerald-100/90 block">
                  Shift Run Timer
                </span>
                <span className="text-[10px] text-emerald-200/70 block mt-0.5">
                  Continuous Extrusion Line 01
                </span>
              </div>

              <div className="my-4 text-center relative z-10">
                <div className="text-4xl font-bold font-mono tracking-wider text-white">
                  {formatTimer(seconds)}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 relative z-10">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="w-10 h-10 rounded-full bg-white text-[#0d382c] hover:bg-slate-100 flex items-center justify-center transition-transform active:scale-95 shadow-md"
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
                  className="w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md"
                  title="Reset Timer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section: Order Timeline Preview + Needs Attention */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Order Timeline Live Stepper (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl p-5 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Live Order Timeline
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Stage progression from confirmed order to dock dispatch
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("TIMELINE")}
                  className="text-xs font-semibold text-[#0d382c] dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  See All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-4">
                {orders.slice(0, 3).map((order: any) => {
                  const { stage, label } = getOrderTimelineStage(order);
                  const progressPct = Math.round((stage / 6) * 100);

                  return (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eaf3ef] dark:bg-[#162a24] text-[#0d382c] dark:text-emerald-300">
                              {label}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                            {order.customerName} • Delivery:{" "}
                            {new Date(order.deliveryDate).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Stepper Dots & Progress */}
                      <div>
                        <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#0d382c] dark:bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1.5">
                          <span className={stage >= 1 ? "text-[#0d382c] dark:text-emerald-400 font-bold" : ""}>
                            1. Proforma
                          </span>
                          <span className={stage >= 2 ? "text-[#0d382c] dark:text-emerald-400 font-bold" : ""}>
                            2. Confirmed
                          </span>
                          <span className={stage >= 3 ? "text-[#0d382c] dark:text-emerald-400 font-bold" : ""}>
                            3. Production
                          </span>
                          <span className={stage >= 4 ? "text-[#0d382c] dark:text-emerald-400 font-bold" : ""}>
                            4. QC Passed
                          </span>
                          <span className={stage >= 5 ? "text-[#0d382c] dark:text-emerald-400 font-bold" : ""}>
                            5. Packed
                          </span>
                          <span className={stage >= 6 ? "text-[#0d382c] dark:text-emerald-400 font-bold" : ""}>
                            6. Dispatched
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Needs Attention & Alerts (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl p-5 bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Needs Attention
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                  {lowStockMaterials.length + notifications.length} Action Items
                </span>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {/* Low Stock Material Warnings */}
                {lowStockMaterials.map((rm: any) => {
                  const total = rm.batches?.reduce((acc: number, b: any) => acc + (b.quantity || 0), 0) || 0;
                  return (
                    <div
                      key={rm.id}
                      className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {rm.name}
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-200/60 text-amber-800 dark:bg-amber-900 dark:text-amber-300 font-semibold">
                            Low Stock
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {total} {rm.uom} left (Min: {rm.minStockLevel || 100} {rm.uom})
                        </span>
                      </div>
                      <Link
                        href="/buying"
                        className="py-1 px-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-semibold transition-colors shrink-0"
                      >
                        Create PO
                      </Link>
                    </div>
                  );
                })}

                {/* Notifications & System Alerts */}
                {notifications.map((notif: any) => (
                  <div
                    key={notif.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {notif.title}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        {notif.message}
                      </span>
                    </div>
                    {notif.actionUrl && (
                      <Link
                        href={notif.actionUrl}
                        className="py-1 px-2 rounded-lg bg-[#0d382c] hover:bg-[#08261e] text-white text-[10px] font-semibold transition-colors shrink-0"
                      >
                        Action
                      </Link>
                    )}
                  </div>
                ))}

                {lowStockMaterials.length === 0 && notifications.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                    All operational checks are green!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ORDER TIMELINE */}
      {/* ========================================================================= */}
      {activeTab === "TIMELINE" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Order Journey
              </h2>
              <p className="text-xs text-slate-500">
                End-to-end milestone tracking for all customer purchase commitments.
              </p>
            </div>
            <Link
              href="/orders"
              className="py-1.5 px-3.5 rounded-xl bg-[#0d382c] text-white text-xs font-semibold"
            >
              + Create Sales Order
            </Link>
          </div>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
                No active orders found. Create your first sales order to start the timeline.
              </div>
            ) : (
              orders.map((order: any) => {
                const { stage, label } = getOrderTimelineStage(order);
                const progressPct = Math.round((stage / 6) * 100);

                return (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-mono text-base font-bold text-slate-900 dark:text-white">
                            {order.orderNumber}
                          </h3>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#eaf3ef] dark:bg-[#162a24] text-[#0d382c] dark:text-emerald-300">
                            {label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Customer: <strong className="text-slate-800 dark:text-slate-200">{order.customerName}</strong> • Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                          ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                        </span>
                        <Link
                          href={`/orders`}
                          className="py-1 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-medium hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>

                    {/* Full Stepper */}
                    <div className="pt-2">
                      <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0d382c] dark:bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-6 text-center text-xs mt-3 gap-1">
                        <div className={`p-2 rounded-lg ${stage >= 1 ? "bg-[#eaf3ef]/50 font-bold text-[#0d382c] dark:text-emerald-300" : "text-slate-400"}`}>
                          1. Proforma Sent
                        </div>
                        <div className={`p-2 rounded-lg ${stage >= 2 ? "bg-[#eaf3ef]/50 font-bold text-[#0d382c] dark:text-emerald-300" : "text-slate-400"}`}>
                          2. Confirmed
                        </div>
                        <div className={`p-2 rounded-lg ${stage >= 3 ? "bg-[#eaf3ef]/50 font-bold text-[#0d382c] dark:text-emerald-300" : "text-slate-400"}`}>
                          3. Extrusion Run
                        </div>
                        <div className={`p-2 rounded-lg ${stage >= 4 ? "bg-[#eaf3ef]/50 font-bold text-[#0d382c] dark:text-emerald-300" : "text-slate-400"}`}>
                          4. QC Passed
                        </div>
                        <div className={`p-2 rounded-lg ${stage >= 5 ? "bg-[#eaf3ef]/50 font-bold text-[#0d382c] dark:text-emerald-300" : "text-slate-400"}`}>
                          5. Packed Cartons
                        </div>
                        <div className={`p-2 rounded-lg ${stage >= 6 ? "bg-[#eaf3ef]/50 font-bold text-[#0d382c] dark:text-emerald-300" : "text-slate-400"}`}>
                          6. Dispatched
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NEEDS ATTENTION */}
      {/* ========================================================================= */}
      {activeTab === "ATTENTION" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Action Items & Triage Queue
            </h2>
            <p className="text-xs text-slate-500">
              Operational bottlenecks, raw material threshold shortages, and supervisor approvals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Raw Material Threshold Shortages */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-500" />
                Raw Material Stock Shortages
              </h3>
              {lowStockMaterials.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  All polymer resin inventory levels are healthy.
                </div>
              ) : (
                lowStockMaterials.map((rm: any) => (
                  <div
                    key={rm.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rm.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Code: {rm.code}</p>
                    </div>
                    <Link
                      href="/buying"
                      className="py-1 px-3 rounded-lg bg-[#0d382c] text-white text-xs font-semibold"
                    >
                      Purchase PO
                    </Link>
                  </div>
                ))
              )}
            </div>

            {/* Pending QC Inspections or System Alerts */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Factory Quality & Line Alerts
              </h3>
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No active line alerts or quality holds.
                </div>
              ) : (
                notifications.map((n: any) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                    </div>
                    {n.actionUrl && (
                      <Link
                        href={n.actionUrl}
                        className="py-1 px-3 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 text-xs font-medium"
                      >
                        Resolve
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: REORDERS */}
      {/* ========================================================================= */}
      {activeTab === "REORDERS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Customer Reorder Follow-Up Loop
              </h2>
              <p className="text-xs text-slate-500">
                Track customer buying frequency and expected next reorder window to maintain proactive sales.
              </p>
            </div>
            <Link
              href="/customers"
              className="py-1.5 px-3.5 rounded-xl bg-[#0d382c] text-white text-xs font-semibold"
            >
              + Add Customer Reminder
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {followUps.length === 0 ? (
              <div className="col-span-3 p-12 text-center bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
                No pending reorder reminders. Set expected order dates on customer accounts to predict sales.
              </div>
            ) : (
              followUps.map((fu: any) => (
                <div
                  key={fu.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {fu.customer?.name || "Customer"}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {fu.customer?.phone || fu.customer?.email || "No contact info"}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                      Due Soon
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-xl space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expected Reorder:</span>
                      <span className="font-semibold">
                        {fu.expectedNextOrderDate
                          ? new Date(fu.expectedNextOrderDate).toLocaleDateString()
                          : "Not set"}
                      </span>
                    </div>
                    {fu.notes && (
                      <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-zinc-800">
                        "{fu.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Link
                      href={`/customers`}
                      className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 text-xs font-semibold text-center hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
                    >
                      Customer 360
                    </Link>
                    <Link
                      href={`/orders`}
                      className="flex-1 py-1.5 rounded-lg bg-[#0d382c] hover:bg-[#08261e] text-white text-xs font-semibold text-center transition-colors shadow-2xs"
                    >
                      Draft Proforma
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
