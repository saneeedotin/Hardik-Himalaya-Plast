import { prisma } from "@/lib/prisma";
import { createPayment } from "../actions";
import { redirect } from "next/navigation";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type = "INWARD" } = await searchParams;
  
  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });

  async function handleSubmit(formData: FormData) {
    "use server";
    const payment = await createPayment(formData);
    redirect(`/bookkeeper/payments/${payment.id}`);
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/bookkeeper/payments"
          className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Log New Payment
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Record incoming receipts or outgoing payments
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden p-6">
        <form action={handleSubmit} className="space-y-6">
          
          <div className="flex gap-4 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl w-fit">
            <Link
              href="/bookkeeper/payments/new?type=INWARD"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${type === 'INWARD' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Money In (Receipt)
            </Link>
            <Link
              href="/bookkeeper/payments/new?type=OUTWARD"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${type === 'OUTWARD' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Money Out (Payment)
            </Link>
          </div>
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="partyType" value={type === 'INWARD' ? 'CUSTOMER' : 'SUPPLIER'} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">
                {type === 'INWARD' ? 'Customer' : 'Supplier'}
              </label>
              <select
                name="partyId"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#0d382c] text-sm text-slate-900 dark:text-white"
              >
                <option value="">Select party...</option>
                {type === 'INWARD'
                  ? customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
                  : suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)
                }
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">
                Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                step="0.01"
                required
                placeholder="e.g. 150000"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#0d382c] text-sm text-slate-900 dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">
                Payment Mode
              </label>
              <select
                name="mode"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#0d382c] text-sm text-slate-900 dark:text-white"
              >
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">
                Reference No (Cheque No. / UTR)
              </label>
              <input
                type="text"
                name="referenceNo"
                placeholder="e.g. UTR-123456"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#0d382c] text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3">
            <Link
              href="/bookkeeper/payments"
              className="px-6 py-2.5 rounded-xl font-semibold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0d382c] hover:bg-[#0a2e24] text-white font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save Draft Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
