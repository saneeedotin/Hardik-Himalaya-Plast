"use client";

import { useState } from "react";
import { updateWorkOrder } from "../actions";
import { Loader2, CheckCircle2 } from "lucide-react";

export function WorkOrderActionPanel({ woId, currentStatus }: { woId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdateStatus = async (newStatus: string) => {
    setLoading(true);
    setError("");
    try {
      await updateWorkOrder(woId, { status: newStatus });
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
        <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Status Actions
        </h2>
      </div>
      
      <div className="p-6 space-y-6">
        {error && (
          <div className="text-sm text-red-500">{error}</div>
        )}

        {currentStatus === "PENDING" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">WO is PENDING. Ready to move to floor?</p>
            <button
              onClick={() => handleUpdateStatus("IN_PROGRESS")}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Work Order"}
            </button>
          </div>
        )}

        {currentStatus === "IN_PROGRESS" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">Production is in progress. Complete it when all target quantities are met.</p>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to mark this WO as completed?")) {
                  handleUpdateStatus("COMPLETED");
                }
              }}
              disabled={loading}
              className="w-full bg-[#0d382c] hover:bg-[#092b21] text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mark as COMPLETED"}
            </button>
          </div>
        )}
        
        {currentStatus === "COMPLETED" && (
          <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium text-center py-4">
            ✅ Production Completed
          </div>
        )}

      </div>
    </div>
  );
}
