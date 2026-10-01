"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Boxes,
  FileCheck,
  Cpu,
  ShieldCheck,
  QrCode,
  Truck,
  ChevronRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const STAGES = [
  { id: 1, label: "Order Created", icon: Boxes },
  { id: 2, label: "Price Approved", icon: FileCheck },
  { id: 3, label: "Advance Payment", icon: FileCheck },
  { id: 4, label: "Material Allocated", icon: Boxes },
  { id: 5, label: "Extrusion Running", icon: Cpu },
  { id: 6, label: "QC 4-Point Passed", icon: ShieldCheck },
  { id: 7, label: "Packed & Barcoded", icon: QrCode },
  { id: 8, label: "Dispatch Scanned", icon: Truck },
  { id: 9, label: "Tally Invoiced", icon: FileCheck },
];

export function OrderTimelineView({ orders }: { orders: any[] }) {
  const [selectedOrder, setSelectedOrder] = useState<any>(orders[0] || null);

  const getActiveStep = (status: string) => {
    switch (status) {
      case "DRAFT":
        return 1;
      case "APPROVED":
        return 3;
      case "IN_PRODUCTION":
        return 5;
      case "READY_TO_DISPATCH":
        return 7;
      case "DISPATCHED":
        return 8;
      case "COMPLETED":
        return 9;
      default:
        return 2;
    }
  };

  const activeStep = selectedOrder ? getActiveStep(selectedOrder.status) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Order Timeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            End-to-end tracking of sales contracts through the 9-stage fulfillment cycle.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-[#121820] border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300">
          {orders.length} Active Orders
        </span>
      </div>

      {/* Master-Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Orders List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {orders.map((o) => {
            const isSelected = selectedOrder?.id === o.id;
            return (
              <div
                key={o.id}
                onClick={() => setSelectedOrder(o)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-white dark:bg-[#121820] border-[#0d382c] dark:border-emerald-500/60 shadow-xs ring-1 ring-[#0d382c]/10"
                    : "bg-white dark:bg-[#121820] border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#0d382c] dark:text-emerald-400">
                    {o.orderNumber}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {o.status.replace(/_/g, " ")}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2 truncate">
                  {o.customerName}
                </h3>

                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Due: {formatDate(o.deliveryDate)}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(Number(o.totalAmount))}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {o.items[0]?.qty?.toLocaleString("en-IN")} m •{" "}
                    {o.items[0]?.item?.code}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? "text-[#0d382c] dark:text-emerald-400 translate-x-0.5" : "text-slate-300"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: 9-Stage Stepper (7 cols) */}
        {selectedOrder ? (
          <div className="lg:col-span-7 rounded-2xl p-6 bg-white dark:bg-[#121820] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6">
            {/* Order Details Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-[#0d382c] dark:text-emerald-400">
                  {selectedOrder.orderNumber}
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedOrder.customerName}
                </h2>
                <span className="text-[11px] text-slate-400">
                  GSTIN: {selectedOrder.customerGstin || "Unregistered"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Contract Total
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(Number(selectedOrder.totalAmount))}
                </span>
              </div>
            </div>

            {/* Visual Stepper */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Fulfillment Pipeline
                </h3>
                <span className="text-xs font-semibold text-[#0d382c] dark:text-emerald-400">
                  Stage {activeStep} of 9 ({Math.round((activeStep / 9) * 100)}%)
                </span>
              </div>

              <div className="space-y-2.5">
                {STAGES.map((stage) => {
                  const isDone = stage.id <= activeStep;
                  const isCurrent = stage.id === activeStep;

                  return (
                    <div
                      key={stage.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isCurrent
                          ? "bg-[#eaf3ef] dark:bg-[#162a24] text-[#0d382c] dark:text-emerald-300 font-semibold"
                          : isDone
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-slate-400 opacity-50"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                          isDone
                            ? "bg-[#0d382c] text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          stage.id
                        )}
                      </div>

                      <span className="text-xs flex-1">{stage.label}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d382c] dark:text-emerald-400">
                          Active
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <a
                href="/dispatch"
                className="py-2 px-4 rounded-xl bg-[#0d382c] hover:bg-[#08261e] text-white text-xs font-semibold transition-all shadow-xs"
              >
                Scan at Gate
              </a>
              <a
                href="/tally"
                className="py-2 px-4 rounded-xl bg-white dark:bg-[#121820] hover:bg-slate-50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all shadow-2xs"
              >
                Generate Tally XML
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
