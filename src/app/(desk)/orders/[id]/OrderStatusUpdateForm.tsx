"use client";

import { useState } from "react";
import { updateSalesOrderStatus } from "../actions";
import { Loader2, CheckCircle2, ChevronRight, Check } from "lucide-react";

export function OrderStatusUpdateForm({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [proformaRef, setProformaRef] = useState("");

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    setError("");
    try {
      await updateSalesOrderStatus(orderId, newStatus, { proformaRef });
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const statusFlow = ["DRAFT", "PROFORMA_SENT", "CONFIRMED", "IN_PRODUCTION"];

  const currentIndex = statusFlow.indexOf(currentStatus);
  const nextStatus = currentIndex >= 0 && currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
        <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Status Progress
        </h2>
      </div>
      
      <div className="p-6 space-y-6">
        {error && (
          <div className="text-sm text-red-500">{error}</div>
        )}

        <div className="space-y-4 relative">
          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" />
          
          {statusFlow.map((s, idx) => {
            const isCompleted = currentIndex >= idx;
            const isCurrent = currentStatus === s;
            const isNext = nextStatus === s;
            
            return (
              <div key={s} className="relative flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 z-10 ${
                  isCompleted 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : isNext 
                    ? 'bg-white dark:bg-zinc-950 border-emerald-500 text-emerald-500' 
                    : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-300'
                }`}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : <div className={`w-2 h-2 rounded-full ${isNext ? 'bg-emerald-500' : 'bg-transparent'}`} />}
                </div>
                <div className={`flex-1 ${isCompleted ? 'text-slate-900 dark:text-white font-medium' : isNext ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-400 font-medium'}`}>
                  {s.replace("_", " ")}
                </div>
              </div>
            );
          })}
        </div>

        {nextStatus && (
          <div className="space-y-3 mt-4">
            {nextStatus === "PROFORMA_SENT" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Proforma/Quotation Reference (Optional)
                </label>
                <input
                  type="text"
                  value={proformaRef}
                  onChange={(e) => setProformaRef(e.target.value)}
                  placeholder="e.g. PROF-2026-001"
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d382c]/20"
                />
              </div>
            )}
            <button
              onClick={() => updateStatus(nextStatus)}
              disabled={loading}
              className="w-full bg-[#0d382c] hover:bg-[#092b21] text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  Mark as {nextStatus.replace("_", " ")}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
