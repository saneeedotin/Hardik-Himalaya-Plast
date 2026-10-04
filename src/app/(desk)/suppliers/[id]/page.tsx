import { getSupplier } from "../actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Supplier360Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supplier = await getSupplier(resolvedParams.id);

  if (!supplier) {
    notFound();
  }

  const pos = supplier.purchaseOrders || [];
  const openPos = pos.filter((p: any) => p.status === "DRAFT" || p.status === "SUBMITTED");
  const totalSpend = pos.reduce((sum: number, p: any) => sum + Number(p.totalAmount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header Navigation */}
      <Link
        href="/suppliers"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Suppliers
      </Link>

      {/* Supplier Header Card */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl p-6 md:p-8 shadow-2xs border border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {supplier.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                ACTIVE VENDOR
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
              {supplier.gstin && (
                <span>
                  GSTIN: <strong className="font-mono text-slate-700 dark:text-slate-200">{supplier.gstin}</strong>
                </span>
              )}
              {supplier.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  <a href={`tel:${supplier.phone}`} className="hover:underline">{supplier.phone}</a>
                </span>
              )}
              {supplier.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  <a href={`mailto:${supplier.email}`} className="hover:underline">{supplier.email}</a>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <Link
            href={`/suppliers/${supplier.id}/edit`}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Profile
          </Link>
          <Link
            href={`/buying/new?supplierId=${supplier.id}`}
            className="px-4 py-2 bg-[#0d382c] hover:bg-[#08261e] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            New Purchase Order
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Purchase Orders
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {pos.length}
            </span>
            <span className="text-xs font-bold text-slate-400">POs</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Lifetime procurement orders
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Open / Pending Delivery
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {openPos.length}
            </span>
            <span className="text-xs font-bold text-slate-400">Active</span>
          </div>
          <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 block mt-1">
            Orders pending goods arrival
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Cumulative Procurement
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-[#0d382c] dark:text-emerald-400">
              {formatCurrency(totalSpend)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Total billing value
          </span>
        </div>
      </div>

      {/* PO History Table */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Purchase Order History
            </h2>
          </div>
          <Link
            href="/buying"
            className="text-xs font-semibold text-[#0d382c] dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            All Purchase Orders
          </Link>
        </div>

        {pos.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
            No purchase orders placed with this supplier yet. Click &ldquo;New Purchase Order&rdquo; above.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">PO Number</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3 text-right">Total Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {pos.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30">
                    <td className="px-4 py-3 font-mono font-bold text-[#0d382c] dark:text-emerald-400">
                      {p.poNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {p.items?.map((i: any) => `${i.item?.name || "Item"} (${i.qty} ${i.item?.uom || ""})`).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(Number(p.totalAmount))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.status === "RECEIVED" || p.status === "CLOSED"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : p.status === "SUBMITTED"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/buying/${p.id}`}
                        className="text-xs font-semibold text-[#0d382c] dark:text-emerald-400 hover:underline"
                      >
                        View PO &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
