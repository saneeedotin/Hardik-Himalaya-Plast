import { getPurchaseOrder } from "../actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Calendar, FileText, CheckCircle } from "lucide-react";
import { PurchaseOrderActionPanel } from "./PurchaseOrderActionPanel";

export const dynamic = "force-dynamic";

export default async function PurchaseOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const po = await getPurchaseOrder(resolvedParams.id);

  if (!po) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <Link href="/buying" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Purchase Orders
      </Link>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
            <ShoppingBag className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{po.poNumber}</h1>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase ${
                po.status === 'RECEIVED' || po.status === 'CLOSED'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : po.status === 'SUBMITTED'
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}>
                {po.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                Supplier: <Link href={`/suppliers/${po.supplierId}`} className="text-[#0d382c] dark:text-emerald-400 hover:underline">{po.supplier.name}</Link>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4"/> 
                Date: {new Date(po.createdAt).toLocaleDateString("en-IN")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
          <Link
            href={`/buying/${po.id}/edit`}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors w-full text-center md:w-auto"
          >
            Edit PO
          </Link>
          <div className="text-right mt-2">
            <p className="text-xs text-slate-500">Total Value</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{po.totalAmount.toString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                PO Items
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
                  <tr>
                    <th className="px-6 py-3">Item Code</th>
                    <th className="px-6 py-3">Material Name</th>
                    <th className="px-6 py-3 text-right">Qty</th>
                    <th className="px-6 py-3 text-right">Rate</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {po.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white">{item.item.code}</td>
                      <td className="px-6 py-4">{item.item.name}</td>
                      <td className="px-6 py-4 text-right font-medium">{item.qty} {item.item.uom}</td>
                      <td className="px-6 py-4 text-right">₹{item.rate.toString()}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">₹{item.amount.toString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {po.notes && (
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-zinc-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Internal Notes</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{po.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <PurchaseOrderActionPanel poId={po.id} currentStatus={po.status} />
        </div>
      </div>
    </div>
  );
}
