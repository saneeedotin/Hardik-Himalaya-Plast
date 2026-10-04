import { getDeliveryNotes } from "./actions";
import Link from "next/link";
import {
  QrCode,
  Plus,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  Layers,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PackingListPage() {
  const deliveryNotes = await getDeliveryNotes();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-6 h-6 text-[#0d382c] dark:text-emerald-400" />
            Packing &amp; Carton Serialization Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pack extruded coils into serialized cartons and generate dock gate QR labels
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dispatch"
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-2xs"
          >
            <Truck className="w-4 h-4 text-indigo-500" />
            Open Gate Scanner
          </Link>
          <Link
            href="/packing/new"
            className="bg-[#0d382c] hover:bg-[#092b21] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Pack New Consignment
          </Link>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Delivery Note</th>
                <th className="px-6 py-4">Order Ref</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-center">Cartons</th>
                <th className="px-6 py-4 text-center">Dock Gate Scanned</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {deliveryNotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No packing delivery notes generated yet. Click &ldquo;Pack New Consignment&rdquo; to start.
                  </td>
                </tr>
              ) : (
                deliveryNotes.map((dn: any) => {
                  const totalCartons = dn.cartons?.length || 0;
                  const scannedCartons = dn.cartons?.filter((c: any) => c.scanned).length || 0;
                  const isFullyScanned = totalCartons > 0 && scannedCartons === totalCartons;

                  return (
                    <tr
                      key={dn.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-[#0d382c] dark:text-emerald-400">
                        <Link href={`/packing/${dn.id}`} className="hover:underline">
                          {dn.dnNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-mono">
                        <Link
                          href={`/orders/${dn.salesOrderId}`}
                          className="text-slate-700 dark:text-slate-300 hover:underline"
                        >
                          {dn.salesOrder?.orderNumber || "Order"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {dn.customerName}
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold">
                        {totalCartons} Boxes
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isFullyScanned
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                              : scannedCartons > 0
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                              : "bg-slate-100 text-slate-600 dark:bg-zinc-800"
                          }`}
                        >
                          {scannedCartons} / {totalCartons} Scanned
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400">
                          {dn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/packing/${dn.id}`}
                          className="text-sm font-medium text-[#0d382c] dark:text-emerald-400 hover:underline"
                        >
                          View Consignment &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
