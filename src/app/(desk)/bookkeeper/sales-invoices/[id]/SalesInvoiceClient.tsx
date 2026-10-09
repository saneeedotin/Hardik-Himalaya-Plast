"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  CheckCircle2, 
  FileSpreadsheet, 
  CreditCard, 
  Receipt,
  AlertCircle
} from "lucide-react";
import { submitSalesInvoice } from "../actions";

export function SalesInvoiceClient({ invoice }: { invoice: Record<string, any> }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await submitSalesInvoice(invoice.id);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to submit invoice");
      } else {
        setError("Failed to submit invoice");
      }
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
            href="/bookkeeper/sales-invoices"
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
              Billed on {new Date(invoice.invoiceDate).toLocaleDateString("en-IN")} • Due {new Date(invoice.dueDate).toLocaleDateString("en-IN")}
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
            {submitting ? "Submitting..." : "Submit Invoice (Generate IRN)"}
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
              <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
              Invoice Items
            </h3>
            
            <div className="space-y-4">
              <div className="hidden sm:grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-zinc-800">
                <div className="col-span-5">Item</div>
                <div className="col-span-3 text-right">Quantity</div>
                <div className="col-span-2 text-right">Rate</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>

              {invoice.items.length === 0 ? (
                <div className="text-sm text-slate-500 py-4 text-center">No items on this invoice.</div>
              ) : (
                invoice.items.map((item: Record<string, any>) => (
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
                      <div className="font-medium text-slate-800 dark:text-slate-300">
                        {item.qty} <span className="text-xs text-slate-500">{item.item.uom}</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-left sm:text-right text-slate-600 dark:text-slate-400">
                      ₹{item.rate.toString()}
                    </div>
                    <div className="col-span-2 text-left sm:text-right font-bold text-slate-900 dark:text-white">
                      ₹{item.amount.toString()}
                    </div>
                  </div>
                ))
              )}

              <div className="pt-4 flex justify-end">
                <div className="w-48 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-900 dark:text-white">₹{(Number(invoice.subtotalAmount) > 0 ? invoice.subtotalAmount : invoice.totalAmount).toString()}</span>
                  </div>
                  {Number(invoice.cgstAmount || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">CGST (9%)</span>
                      <span className="font-medium text-slate-900 dark:text-white">₹{invoice.cgstAmount.toString()}</span>
                    </div>
                  )}
                  {Number(invoice.sgstAmount || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">SGST (9%)</span>
                      <span className="font-medium text-slate-900 dark:text-white">₹{invoice.sgstAmount.toString()}</span>
                    </div>
                  )}
                  {Number(invoice.igstAmount || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">IGST (18%)</span>
                      <span className="font-medium text-slate-900 dark:text-white">₹{invoice.igstAmount.toString()}</span>
                    </div>
                  )}
                  {Number(invoice.taxAmount || 0) > 0 && Number(invoice.cgstAmount || 0) === 0 && Number(invoice.igstAmount || 0) === 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Taxes</span>
                      <span className="font-medium text-slate-900 dark:text-white">₹{invoice.taxAmount.toString()}</span>
                    </div>
                  )}
                  {Number(invoice.taxAmount || 0) === 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Taxes</span>
                      <span className="font-medium text-slate-900 dark:text-white">₹0.00</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <span className="text-slate-900 dark:text-white">Total</span>
                    <span className="text-[#0d382c] dark:text-emerald-400">₹{invoice.totalAmount.toString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              Customer Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Billed To</label>
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-1">
                  {invoice.customer.name}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  GSTIN: {invoice.customer.gstin || "N/A"}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reference SO</label>
                <div className="font-mono text-sm text-slate-800 dark:text-slate-200 mt-1">
                  {invoice.salesOrder?.orderNumber || "-"}
                </div>
              </div>
            </div>
          </div>

          {isSubmitted && (
            <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-500" />
                Compliance (E-Way)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">E-Invoice IRN</label>
                  <div className="font-mono text-xs break-all text-slate-800 dark:text-slate-200 mt-1 bg-slate-50 dark:bg-zinc-900 p-2 rounded-lg border border-slate-100 dark:border-zinc-800">
                    {invoice.irn || "Generating..."}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">E-Way Bill No.</label>
                  <div className="font-mono text-sm text-slate-800 dark:text-slate-200 mt-1">
                    {invoice.ewayBillNumber || "Pending"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
