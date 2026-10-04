import { getDeliveryNote } from "../actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Printer,
  Calendar,
  Layers,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DeliveryNoteDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const dn = await getDeliveryNote(resolvedParams.id);

  if (!dn) {
    notFound();
  }

  const cartons = dn.cartons || [];
  const scannedCount = cartons.filter((c: any) => c.scanned).length;
  const totalMeters = cartons.reduce((sum: number, c: any) => sum + (c.quantity || 0), 0);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header Navigation */}
      <Link
        href="/packing"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Packing Desk
      </Link>

      {/* Main Delivery Note Header */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl p-6 md:p-8 shadow-2xs border border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0d382c]/10 dark:bg-emerald-500/10 flex items-center justify-center text-[#0d382c] dark:text-emerald-400 shrink-0">
            <QrCode className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {dn.dnNumber}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
                {dn.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Customer: <strong className="text-slate-900 dark:text-white">{dn.customerName}</strong></span>
              <span>•</span>
              <span>
                Sales Order:{" "}
                <Link
                  href={`/orders/${dn.salesOrderId}`}
                  className="font-bold text-[#0d382c] dark:text-emerald-400 hover:underline"
                >
                  {dn.salesOrder?.orderNumber || dn.salesOrderId}
                </Link>
              </span>
              <span>•</span>
              <span>Packed On: {formatDate(dn.createdAt)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600 dark:text-slate-300">
              <span>Transporter: <strong>{dn.transporterName || "Assigned at dock"}</strong></span>
              <span>•</span>
              <span>Vehicle: <strong>{dn.vehicleNumber || "Pending"}</strong></span>
              <span>•</span>
              <span>LR No: <strong>{dn.lrNumber || "Pending"}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <Link
            href="/dispatch"
            className="px-4 py-2 bg-[#0d382c] hover:bg-[#08261e] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Truck className="w-3.5 h-3.5" />
            Open Gate Scanner
          </Link>
          <Link
            href={`/orders/${dn.salesOrderId}`}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            Order Cockpit &rarr;
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Serialized Cartons
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {cartons.length}
            </span>
            <span className="text-xs font-bold text-slate-400">Boxes</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            All coils serialized with unique barcodes
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Consignment Total
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-[#0d382c] dark:text-emerald-400">
              {totalMeters.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-bold text-slate-400">Meters</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Total length across all packed boxes
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Dock Gate Scan Status
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-extrabold ${
                scannedCount === cartons.length && cartons.length > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {scannedCount} / {cartons.length}
            </span>
            <span className="text-xs font-bold text-slate-400">Verified</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Physical gate barcode confirmation
          </span>
        </div>
      </div>

      {/* Cartons Table */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#0d382c] dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Serialized Cartons in Delivery Consignment
            </h2>
          </div>
        </div>

        {cartons.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
            No cartons serialized in this delivery note.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Carton QR Code</th>
                  <th className="px-4 py-3">Batch Lot Ref</th>
                  <th className="px-4 py-3 text-right">Quantity (Meters)</th>
                  <th className="px-4 py-3 text-center">Dock Gate Scanned</th>
                  <th className="px-4 py-3">Scanned Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {cartons.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30">
                    <td className="px-4 py-3 font-mono font-bold text-[#0d382c] dark:text-emerald-400 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-slate-400" />
                      {c.cartonCode}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                      {c.batch?.batchNumber || "BATCH-PRIMARY"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {c.quantity} Meters
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.scanned
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-600 dark:bg-zinc-800"
                        }`}
                      >
                        {c.scanned ? "SCANNED" : "PENDING"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {c.scannedAt ? formatDate(c.scannedAt) : "—"}
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
