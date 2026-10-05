"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  CheckCircle2, 
  Package, 
  Truck, 
  FileText,
  AlertCircle
} from "lucide-react";
import { submitPurchaseReceipt } from "../actions";

export function PurchaseReceiptClient({ receipt }: { receipt: any }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await submitPurchaseReceipt(receipt.id);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to submit receipt");
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitted = receipt.status === "SUBMITTED" || receipt.status === "CLOSED";

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/buying/receipts"
            className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {receipt.receiptNumber}
              </h1>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase ${
                isSubmitted
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
              }`}>
                {receipt.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Received on {new Date(receipt.receiptDate).toLocaleDateString("en-IN")} • From {receipt.supplier.name}
            </p>
          </div>
        </div>
        
        {!isSubmitted && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#0d382c] hover:bg-[#092b21] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {submitting ? "Submitting..." : "Submit Receipt (Update Stock)"}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-500" />
              Received Items
            </h3>
            
            <div className="space-y-4">
              <div className="hidden sm:grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-zinc-800">
                <div className="col-span-5">Item</div>
                <div className="col-span-3 text-right">Received Qty</div>
                <div className="col-span-4">Batch Reference</div>
              </div>

              {receipt.items.map((item: any) => (
                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center py-2 border-b border-slate-50 dark:border-zinc-800/50 last:border-0">
                  <div className="col-span-5">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                      {item.item.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {item.item.itemCode}
                    </div>
                  </div>
                  <div className="col-span-3 text-left sm:text-right">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      {item.qty} <span className="text-xs font-normal text-slate-500">{item.item.uom}</span>
                    </div>
                  </div>
                  <div className="col-span-4">
                    {item.batch ? (
                      <span className="font-mono text-xs px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded text-slate-700 dark:text-slate-300">
                        {item.batch.batchNumber}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 dark:text-amber-500 italic">
                        Batch pending submission
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              Reference Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Purchase Order</label>
                <div className="font-mono text-sm text-slate-800 dark:text-slate-200 mt-1">
                  {receipt.purchaseOrder?.poNumber || "-"}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Value</label>
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-1">
                  ₹{receipt.totalAmount.toString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-500" />
              Transport Notes
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
              {receipt.notes || "No transport details provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
