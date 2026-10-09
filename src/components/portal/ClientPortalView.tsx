"use client";

import React, { useState } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  LogOut,
  Building2,
  Search,
  FileText
} from "lucide-react";

export function ClientPortalView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const mockOrders = [
    {
      id: "SAL-ORD-2026-00003",
      date: "Oct 5, 2026",
      status: "IN_PRODUCTION",
      items: [
        { name: "Glazing Bead Co-extruded Soft Lip (Profile 303)", qty: "3000 Meter" },
        { name: "PVC Casing Capping 1 inch", qty: "1000 Meter" }
      ],
      progress: 65,
      timeline: [
        { status: "Order Received", date: "Oct 5, 2026 09:00 AM", done: true },
        { status: "Production Started", date: "Oct 6, 2026 14:30 PM", done: true },
        { status: "Quality Check", date: "Pending", done: false },
        { status: "Ready for Dispatch", date: "Pending", done: false },
      ]
    },
    {
      id: "SAL-ORD-2026-00001",
      date: "Sep 28, 2026",
      status: "DISPATCHED",
      items: [
        { name: "UPVC Window Profile A101", qty: "5000 Meter" }
      ],
      progress: 100,
      timeline: [
        { status: "Order Received", date: "Sep 28, 2026 10:15 AM", done: true },
        { status: "Production Started", date: "Sep 29, 2026 08:00 AM", done: true },
        { status: "Quality Check", date: "Oct 1, 2026 11:20 AM", done: true },
        { status: "Ready for Dispatch", date: "Oct 2, 2026 16:45 PM", done: true },
        { status: "Dispatched", date: "Oct 3, 2026 09:30 AM", done: true },
      ],
      trackingNo: "EWB405786880"
    }
  ];

  const handleLogout = () => {
    alert("Logged out. Redirecting to login page...");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d12]">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block leading-tight">Apex Windows</span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Client Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Tracking Connected
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden border border-indigo-500/20">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Welcome back, Rajesh.</h1>
              <p className="text-indigo-200 max-w-xl">
                Track your active orders with Himalaya Plast in real-time. No need to call the factory—your production status is synced directly from our shop floor to this dashboard.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex gap-6">
              <div>
                <div className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">Active Orders</div>
                <div className="text-3xl font-black">1</div>
              </div>
              <div>
                <div className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">Total Shipped</div>
                <div className="text-3xl font-black">12</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Order List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search order number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-3">
              {mockOrders.map(order => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`w-full text-left rounded-2xl p-4 border transition-all duration-200 ${
                    selectedOrder?.id === order.id 
                      ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 shadow-md ring-1 ring-indigo-500" 
                      : "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{order.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                      order.status === "IN_PRODUCTION" 
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" 
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                    }`}>
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">Placed on {order.date}</div>
                  
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${order.status === "DISPATCHED" ? "bg-emerald-500" : "bg-indigo-500"}`}
                      style={{ width: `${order.progress}%` }}
                    ></div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-7">
            {selectedOrder ? (
              <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedOrder.id}</h2>
                      <p className="text-sm text-slate-500 mt-1">Order Details & Tracking</p>
                    </div>
                    {selectedOrder.status === "DISPATCHED" && (
                      <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors">
                        <FileText className="w-4 h-4" /> Download Invoice
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Items List */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Items Ordered</h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4 items-start">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{item.name}</div>
                            <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-1">{item.qty}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedOrder.trackingNo && (
                      <div className="mt-8 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm mb-1">
                          <Truck className="w-4 h-4" /> E-Way Bill Number
                        </div>
                        <div className="font-mono text-emerald-900 dark:text-emerald-300">{selectedOrder.trackingNo}</div>
                      </div>
                    )}
                  </div>

                  {/* Tracking Timeline */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Live Tracking</h3>
                    <div className="relative pl-6 space-y-6">
                      <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-zinc-800"></div>
                      
                      {selectedOrder.timeline.map((step: any, idx: number) => (
                        <div key={idx} className="relative z-10 flex gap-4">
                          {step.done ? (
                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 -ml-[23px] shadow-[0_0_0_4px_white] dark:shadow-[0_0_0_4px_#090d12]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 border-2 border-slate-300 dark:border-zinc-700 flex items-center justify-center shrink-0 -ml-[23px] shadow-[0_0_0_4px_white] dark:shadow-[0_0_0_4px_#090d12]">
                              <Clock className="w-3 h-3 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <div className={`font-bold text-sm ${step.done ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                              {step.status}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{step.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-900 rounded-full flex items-center justify-center text-slate-300 dark:text-zinc-700 mb-4">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Select an Order</h3>
                <p className="text-sm text-slate-500 max-w-[250px]">
                  Click on any of your active or past orders on the left to track its live factory status.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
