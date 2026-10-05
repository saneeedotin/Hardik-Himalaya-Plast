import { prisma } from "@/lib/prisma";
import { createSalesInvoice } from "../actions";
import { redirect } from "next/navigation";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewSalesInvoicePage() {
  const [customers, salesOrders] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.salesOrder.findMany({ 
      orderBy: { createdAt: "desc" }
    }),
  ]);

  async function handleSubmit(formData: FormData) {
    "use server";
    const invoice = await createSalesInvoice(formData);
    redirect(`/bookkeeper/sales-invoices/${invoice.id}`);
  }

  const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/bookkeeper/sales-invoices"
          className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Create Sales Invoice
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Bill your customers for goods delivered
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden p-6">
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">
                Customer
              </label>
              <select
                name="customerId"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#0d382c] text-sm text-slate-900 dark:text-white"
              >
                <option value="">Select a customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">
                Reference Sales Order
              </label>
              <select
                name="salesOrderId"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#0d382c] text-sm text-slate-900 dark:text-white"
              >
                <option value="">Select a sales order (optional)...</option>
                {salesOrders.map((so) => (
                  <option key={so.id} value={so.id}>
                    {so.orderNumber} — ₹{so.totalAmount.toString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">
                Invoice Date
              </label>
              <input
                type="date"
                name="invoiceDate"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#0d382c] text-sm text-slate-900 dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                required
                defaultValue={defaultDueDate}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#0d382c] text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3">
            <Link
              href="/bookkeeper/sales-invoices"
              className="px-6 py-2.5 rounded-xl font-semibold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0d382c] hover:bg-[#0a2e24] text-white font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              Create Draft Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
