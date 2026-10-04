"use client";

import { useState } from "react";
import { updatePurchaseOrderStatus, receivePurchaseOrder } from "../actions";
import { Loader2, CheckCircle2, ChevronRight, PackagePlus } from "lucide-react";

export function PurchaseOrderActionPanel({ poId, currentStatus }: { poId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdateStatus = async (newStatus: string) => {
    setLoading(true);
    setError("");
    try {
      await updatePurchaseOrderStatus(poId, newStatus);
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleReceive = async () => {
    if (!confirm("Are you sure you want to receive this PO? This will automatically update the inventory ledger.")) return;
    setLoading(true);
    setError("");
    try {
      await receivePurchaseOrder(poId);
    } catch (err: any) {
      setError(err.message || "Failed to receive PO");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
        <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          PO Actions
        </h2>
      </div>
      
      <div className="p-6 space-y-6">
        {error && (
          <div className="text-sm text-red-500">{error}</div>
        )}

        {currentStatus === "DRAFT" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">PO is in DRAFT. Once you have sent this to the supplier, submit it.</p>
            <button
              onClick={() => handleUpdateStatus("SUBMITTED")}
              disabled={loading}
              className="w-full bg-[#0d382c] hover:bg-[#092b21] text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mark as SUBMITTED"}
            </button>
          </div>
        )}

        {currentStatus === "SUBMITTED" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">PO has been sent to the supplier. When the materials arrive at the factory, click Receive.</p>
            <button
              onClick={handleReceive}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <PackagePlus className="w-4 h-4" />
                  Receive Material
                </>
              )}
            </button>
          </div>
        )}

        {currentStatus === "RECEIVED" && (
          <div className="space-y-3">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">✅ Material received into inventory</p>
            <p className="text-sm text-slate-500">You can now close this Purchase Order.</p>
            <button
              onClick={() => handleUpdateStatus("CLOSED")}
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Close PO"}
            </button>
          </div>
        )}
        
        {currentStatus === "CLOSED" && (
          <div className="text-sm text-slate-500 text-center py-4">
            This Purchase Order is closed.
          </div>
        )}

      </div>
    </div>
  );
}
