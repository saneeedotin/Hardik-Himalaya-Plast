"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, FileSpreadsheet, Building2, AlertCircle } from "lucide-react";
import { submitPurchaseInvoice } from "../actions";

export function PurchaseInvoiceClient({ invoice }: { invoice: any }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await submitPurchaseInvoice(invoice.id);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to submit bill");
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitted = invoice.status !== "DRAFT";

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/bookkeeper/purchase-invoices"
            className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {invoice.invoiceNumber}
              </h1>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase ${
                invoice.status === 'PAID'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : invoice.status === 'UNPAID'
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
              }`}>
                {invoice.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Supplier Bill logged on {new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}
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
            {submitting ? "Submitting..." : "Submit Bill (Confirm AP)"}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-500" />
            Supplier Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Billed By</label>
              <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-1">
                {invoice.supplier.name}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                GSTIN: {invoice.supplier.gstin || "N/A"}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
            Financials
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Amount</label>
              <div className="font-bold text-xl text-slate-900 dark:text-white mt-1">
                ₹{invoice.totalAmount.toString()}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Due Date</label>
              <div className="font-semibold text-sm text-rose-600 dark:text-rose-400 mt-1">
                {new Date(invoice.dueDate).toLocaleDateString("en-IN")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
