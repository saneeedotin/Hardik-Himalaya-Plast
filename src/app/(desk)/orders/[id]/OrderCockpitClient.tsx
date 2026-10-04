"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Calendar,
  FileText,
  CheckCircle,
  AlertTriangle,
  PackageSearch,
  Lock,
  Layers,
  ShieldCheck,
  QrCode,
  Truck,
  FileSpreadsheet,
  Share2,
  Check,
  Loader2,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Phone,
  Mail,
  PlusCircle,
  Clock,
  Printer,
  XCircle,
  Download,
  Copy,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import {
  checkMaterialAvailability,
  confirmSalesOrderWithReservation,
  createPurchaseOrderForShortage,
  updateOrderDispatchGate,
  updateSalesOrderStatus,
  advanceOrderStatus,
  quickLogExtrusion,
  quickSubmitQC,
  quickSerializeCarton,
} from "../actions";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OrderCockpitClientProps {
  initialOrder: any;
}

export function OrderCockpitClient({ initialOrder }: OrderCockpitClientProps) {
  const [order, setOrder] = useState<any>(initialOrder);
  const [activeSection, setActiveSection] = useState("customer-commercial");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Material Check State
  const [materialCheckLoading, setMaterialCheckLoading] = useState(false);
  const [materials, setMaterials] = useState<any[] | null>(null);
  const [materialError, setMaterialError] = useState<string | null>(null);

  // 1-Click PO State
  const [poLoading, setPoLoading] = useState(false);
  const [createdPo, setCreatedPo] = useState<any | null>(null);

  // Order Confirmation State
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [approvalMethod, setApprovalMethod] = useState(order.approvalMethod || "WHATSAPP");
  const [confirmationNotes, setConfirmationNotes] = useState("");
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Quick Production Log Modal
  const [showProdModal, setShowProdModal] = useState(false);
  const [prodMeters, setProdMeters] = useState("500");
  const [prodScrap, setProdScrap] = useState("2.5");
  const [prodLoading, setProdLoading] = useState(false);

  // Quick QC Modal
  const [showQcModal, setShowQcModal] = useState(false);
  const [qcStatus, setQcStatus] = useState("PASS");
  const [qcPinSize, setQcPinSize] = useState("4.2");
  const [qcWidth, setQcWidth] = useState("18.5");
  const [qcLeg, setQcLeg] = useState("1.8");
  const [qcWeight, setQcWeight] = useState("78.5");
  const [qcFit, setQcFit] = useState("PASS");
  const [qcLoading, setQcLoading] = useState(false);

  // Quick Carton Packing Modal
  const [showPackModal, setShowPackModal] = useState(false);
  const [packQuantity, setPackQuantity] = useState("250");
  const [packLoading, setPackLoading] = useState(false);

  // Dispatch Logistics State
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const dn = order.deliveryNotes?.[0];
  const [transporterName, setTransporterName] = useState(dn?.transporterName || "");
  const [vehicleNumber, setVehicleNumber] = useState(dn?.vehicleNumber || "");
  const [lrNumber, setLrNumber] = useState(dn?.lrNumber || "");
  const [consentChannel, setConsentChannel] = useState(order.approvalMethod || "WHATSAPP");

  // Book Keeper Export State
  const [bkExporting, setBkExporting] = useState<string | null>(null);
  const [bkPreview, setBkPreview] = useState<string | null>(null);
  const [csvCopied, setCsvCopied] = useState(false);
  const [quoteCopied, setQuoteCopied] = useState(false);

  // Run Material Check on mount
  useEffect(() => {
    runMaterialCheck();
  }, [order.id]);

  const runMaterialCheck = async () => {
    setMaterialCheckLoading(true);
    setMaterialError(null);
    try {
      const data = await checkMaterialAvailability(order.id);
      setMaterials(data);
    } catch (err: any) {
      console.error(err);
      setMaterialError(err.message || "Failed to calculate material availability.");
    } finally {
      setMaterialCheckLoading(false);
    }
  };

  const hasDeficits = materials?.some((m) => m.status === "DEFICIT") ?? false;
  const deficitCount = materials?.filter((m) => m.status === "DEFICIT").length ?? 0;
  const isOrderConfirmed = ["CONFIRMED", "IN_PRODUCTION", "READY_TO_DISPATCH", "DISPATCHED", "COMPLETED"].includes(
    order.status
  );

  // 1-Click Purchase Order for Shortage
  const handleCreateShortagePO = async () => {
    setPoLoading(true);
    try {
      const res = await createPurchaseOrderForShortage(order.id);
      if (res.success) {
        setCreatedPo(res);
        showToast(`Created Purchase Order: ${res.poNumber} for ${res.itemsCount} shortage items.`);
        await runMaterialCheck();
      } else {
        alert(res.message || "No deficits found.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to create Purchase Order.");
    } finally {
      setPoLoading(false);
    }
  };

  // Strict Hard Gate Confirmation
  const handleConfirmOrder = async () => {
    setConfirmLoading(true);
    setConfirmError(null);
    try {
      const updated = await confirmSalesOrderWithReservation(order.id, approvalMethod, confirmationNotes);
      setOrder(updated);
      showToast("Order confirmed successfully! Raw materials reserved in stock ledger.");
      await runMaterialCheck();
    } catch (err: any) {
      setConfirmError(err.message || "Failed to confirm order.");
    } finally {
      setConfirmLoading(false);
    }
  };

  // Quick Advance Status
  const handleAdvanceStatus = async (targetStatus: string) => {
    try {
      const updated = await updateSalesOrderStatus(order.id, targetStatus);
      setOrder(updated);
      showToast(`Order status updated to ${targetStatus.replace(/_/g, " ")}`);
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
    }
  };

  // Quick Production Log
  const handleQuickLogProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdLoading(true);
    try {
      const res = await quickLogExtrusion(order.id, Number(prodMeters), Number(prodScrap));
      if (res.success) {
        setOrder(res.order);
        setShowProdModal(false);
        showToast(`Logged +${prodMeters}m extrusion and consumed BOM compounds.`);
      }
    } catch (err: any) {
      alert(err.message || "Failed to log production.");
    } finally {
      setProdLoading(false);
    }
  };

  // Quick Submit QC
  const handleQuickSubmitQC = async (e: React.FormEvent) => {
    e.preventDefault();
    setQcLoading(true);
    try {
      const res = await quickSubmitQC(order.id, {
        status: qcStatus,
        pinSize: Number(qcPinSize),
        width: Number(qcWidth),
        legThickness: Number(qcLeg),
        linearWeight: Number(qcWeight),
        fitTestResult: qcFit,
      });
      if (res.success) {
        setOrder(res.order);
        setShowQcModal(false);
        showToast(`Recorded 5-sample QC report with status: ${qcStatus}`);
      }
    } catch (err: any) {
      alert(err.message || "Failed to submit QC.");
    } finally {
      setQcLoading(false);
    }
  };

  // Quick Pack Carton
  const handleQuickPackCarton = async (e: React.FormEvent) => {
    e.preventDefault();
    setPackLoading(true);
    try {
      const res = await quickSerializeCarton(order.id, { quantity: Number(packQuantity) });
      if (res.success) {
        setOrder(res.order);
        setShowPackModal(false);
        showToast(`Serialized new carton with ${packQuantity} meters.`);
      }
    } catch (err: any) {
      alert(err.message || "Failed to pack carton.");
    } finally {
      setPackLoading(false);
    }
  };

  // Dispatch Logistics Update
  const handleUpdateDispatchGate = async (e: React.FormEvent) => {
    e.preventDefault();
    setDispatchLoading(true);
    try {
      const res = await updateOrderDispatchGate(order.id, {
        transporterName,
        vehicleNumber,
        lrNumber,
        customerConsentMethod: consentChannel,
      });
      if (res.success) {
        setOrder(res.order);
        showToast("Dispatch logistics and customer consent recorded.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to save dispatch details.");
    } finally {
      setDispatchLoading(false);
    }
  };

  // Book Keeper Export
  const handleBookKeeperExport = async (voucherType: "SALES_INVOICE" | "MATERIAL_CONSUMPTION") => {
    setBkExporting(voucherType);
    try {
      const res = await fetch("/api/bookkeeper/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, voucherType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Export failed.");

      setBkPreview(data.csv);

      // Trigger browser CSV download
      const blob = new Blob([data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `BookKeeper_${voucherType}_${order.orderNumber}_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Book Keeper ${voucherType.replace(/_/g, " ")} CSV downloaded.`);
    } catch (err: any) {
      alert(err.message || "Book Keeper export failed.");
    } finally {
      setBkExporting(null);
    }
  };

  // Copy CSV to clipboard
  const copyCsvToClipboard = () => {
    if (!bkPreview) return;
    navigator.clipboard.writeText(bkPreview);
    setCsvCopied(true);
    setTimeout(() => setCsvCopied(false), 2000);
    showToast("Book Keeper CSV copied to clipboard!");
  };

  // Generate WhatsApp Share Text
  const getQuoteText = () => {
    const lines = [
      `*Himalaya Plast - Sales Order Confirmation*`,
      `Order: *${order.orderNumber}*`,
      `Customer: ${order.customerName}`,
      `Delivery Date: ${new Date(order.deliveryDate).toLocaleDateString("en-IN")}`,
      `Total Value: Rs. ${Number(order.totalAmount).toLocaleString("en-IN")}`,
      ``,
      `*Items:*`,
      ...order.items.map(
        (it: any) => `- ${it.item.name} (${it.qty} ${it.item.uom}) @ Rs. ${it.rate}/${it.item.uom}`
      ),
      ``,
      `Status: ${order.status.replace(/_/g, " ")}`,
      `Thank you for choosing Himalaya Plast uPVC Profiles.`,
    ];
    return lines.join("\n");
  };

  const copyQuoteToClipboard = () => {
    navigator.clipboard.writeText(getQuoteText());
    setQuoteCopied(true);
    setTimeout(() => setQuoteCopied(false), 2000);
    showToast("Formatted quotation copied to clipboard!");
  };

  const sections = [
    { id: "customer-commercial", label: "1. Commercial Info", icon: ShoppingCart },
    {
      id: "material-gate",
      label: "2. BOM Material Gate",
      icon: Lock,
      badge: hasDeficits ? "Deficit" : "100% Ready",
      badgeColor: hasDeficits ? "bg-rose-500 text-white" : "bg-emerald-500 text-white",
    },
    {
      id: "confirmation",
      label: "3. Confirmation & Lock",
      icon: CheckCircle,
      badge: isOrderConfirmed ? "Locked" : "Pending",
      badgeColor: isOrderConfirmed ? "bg-emerald-500 text-white" : "bg-amber-500 text-white",
    },
    { id: "extrusion-production", label: "4. Extrusion Floor", icon: Layers },
    { id: "quality-control", label: "5. 5-Sample QC", icon: ShieldCheck },
    { id: "cartons-packing", label: "6. Carton Packing", icon: QrCode },
    { id: "dispatch-gate", label: "7. Dispatch Gate", icon: Truck },
    { id: "bookkeeper-export", label: "8. Book Keeper", icon: FileSpreadsheet },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0d382c] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Back & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sales Orders
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={copyQuoteToClipboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-900 hover:bg-slate-50 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl transition-colors shadow-2xs"
          >
            {quoteCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {quoteCopied ? "Copied!" : "Copy Quote"}
          </button>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getQuoteText())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share WhatsApp
          </a>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-900 hover:bg-slate-50 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Order
          </button>
        </div>
      </div>

      {/* Main Order Header Cockpit Banner */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl p-6 md:p-8 shadow-xs border border-slate-200/80 dark:border-zinc-800 flex flex-col lg:flex-row gap-6 justify-between items-start">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0d382c]/10 dark:bg-emerald-500/10 flex items-center justify-center text-[#0d382c] dark:text-emerald-400 shrink-0">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {order.orderNumber}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                  isOrderConfirmed
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                }`}
              >
                {order.status.replace(/_/g, " ")}
              </span>
              {hasDeficits && !isOrderConfirmed && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white animate-pulse">
                  Hard Gate: Stock Deficit
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Customer:{" "}
                <Link
                  href={order.customerId ? `/customers/${order.customerId}` : "/customers"}
                  className="text-[#0d382c] dark:text-emerald-400 font-bold hover:underline"
                >
                  {order.customerName}
                </Link>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                GSTIN: {order.customerGstin || order.customer?.gstin || "Unregistered"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Delivery: {formatDate(order.deliveryDate)}
              </span>
            </div>

            {order.confirmedAt && (
              <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800">
                <CheckCircle className="w-3.5 h-3.5" />
                Confirmed on {new Date(order.confirmedAt).toLocaleDateString("en-IN")} via{" "}
                <span className="font-bold">{order.approvalMethod}</span>
                {order.confirmedBy?.name && ` by ${order.confirmedBy.name}`}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 w-full lg:w-auto">
          <div className="text-left lg:text-right">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Contract Value
            </span>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(Number(order.totalAmount))}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Link
              href={`/orders/${order.id}/edit`}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Edit Order
            </Link>
            {order.status === "DRAFT" && (
              <button
                onClick={() => handleAdvanceStatus("PROFORMA_SENT")}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
              >
                Mark Proforma Sent
              </button>
            )}
            {order.status === "IN_PRODUCTION" && (
              <button
                onClick={() => handleAdvanceStatus("READY_TO_DISPATCH")}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
              >
                Mark Ready to Dispatch
              </button>
            )}
            {order.status === "READY_TO_DISPATCH" && (
              <button
                onClick={() => handleAdvanceStatus("DISPATCHED")}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#0d382c] hover:bg-[#08261e] text-white shadow-xs transition-colors"
              >
                Mark Dispatched
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Milestone Navigation Bar */}
      <div className="sticky top-16 z-20 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#0d382c] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
                {sec.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tight ${sec.badgeColor}`}
                  >
                    {sec.badge}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: Customer & Commercial Info */}
      <section
        id="customer-commercial"
        className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 md:p-8 space-y-6 shadow-2xs scroll-mt-36"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-[#0d382c] dark:text-emerald-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                1. Customer & Commercial Specifications
              </h2>
              <p className="text-xs text-slate-400">
                Billing details, product lines, quantities, and proforma generation.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-zinc-900/40 p-4 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Customer / Client</span>
            <span className="font-bold text-slate-800 dark:text-white text-sm">
              {order.customerName}
            </span>
            <span className="text-slate-500 block mt-0.5">
              Phone: {order.customer?.phone || "+91 98250 88776"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">GST Identification (GSTIN)</span>
            <span className="font-mono font-bold text-slate-800 dark:text-white">
              {order.customerGstin || order.customer?.gstin || "24AAACH9876K1Z9"}
            </span>
            <span className="text-slate-500 block mt-0.5">Place of Supply: Gujarat (24)</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Commercial Approval Channel</span>
            <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 mt-0.5">
              {order.approvalMethod === "WHATSAPP" && <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />}
              {order.approvalMethod === "PHONE" && <Phone className="w-3.5 h-3.5 text-blue-500" />}
              {order.approvalMethod === "EMAIL" && <Mail className="w-3.5 h-3.5 text-amber-500" />}
              {order.approvalMethod || "WHATSAPP"} Confirmation
            </span>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Profile Code</th>
                <th className="px-4 py-3">Product Description</th>
                <th className="px-4 py-3 text-right">Order Qty</th>
                <th className="px-4 py-3 text-right">Standard Rate</th>
                <th className="px-4 py-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {order.items?.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30">
                  <td className="px-4 py-3 font-mono font-bold text-[#0d382c] dark:text-emerald-400">
                    {item.item.code}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                    {item.item.name}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {item.qty.toLocaleString("en-IN")} {item.item.uom}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                    ₹{Number(item.rate).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    ₹{Number(item.amount).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {order.notes && (
          <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Internal & Delivery Instructions:
            </span>
            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">{order.notes}</p>
          </div>
        )}
      </section>

      {/* SECTION 2: BOM Material Check & Strict Hard Gate */}
      <section
        id="material-gate"
        className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 md:p-8 space-y-6 shadow-2xs scroll-mt-36"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                hasDeficits
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
              }`}
            >
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  2. Strict BOM Material Check & Reservation Gate
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 uppercase">
                  Zero Override Rule
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Formula: Required = (Qty / Output) * RM Ratio / (1 - Scrap Factor 2.5%). Available =
                Physical Stock - Reserved Stock.
              </p>
            </div>
          </div>

          <button
            onClick={runMaterialCheck}
            disabled={materialCheckLoading}
            className="self-start sm:self-center px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors flex items-center gap-1.5"
          >
            {materialCheckLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PackageSearch className="w-3.5 h-3.5" />}
            Re-check Ledger
          </button>
        </div>

        {/* Gate Status Banner */}
        {hasDeficits ? (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  Strict Hard Gate Active: Material Shortage Detected ({deficitCount} item{deficitCount > 1 ? "s" : ""})
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                  Order confirmation is locked. Himalaya Plast policy strictly prohibits launching
                  extrusion jobs without 100% physically available raw materials.
                </p>
              </div>
            </div>

            <button
              onClick={handleCreateShortagePO}
              disabled={poLoading}
              className="shrink-0 px-4 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              {poLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <PlusCircle className="w-3.5 h-3.5" />
              )}
              1-Click Create Shortage PO
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                100% Raw Materials Available & Ready to Lock
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                All compound and stabilizer requirements can be fully allocated from unreserved
                physical warehouse stock.
              </p>
            </div>
          </div>
        )}

        {/* Notification when PO was created */}
        {createdPo && (
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-semibold">
              <Check className="w-4 h-4 text-blue-600" />
              Created Purchase Order: <span className="font-mono font-bold">{createdPo.poNumber}</span>{" "}
              ({createdPo.itemsCount} shortage items)
            </div>
            <Link
              href={`/buying/${createdPo.poId}`}
              className="text-blue-700 dark:text-blue-300 font-bold hover:underline flex items-center gap-1"
            >
              Open Purchase Order <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Exploded BOM Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Raw Material Ingredient</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3 text-right">Required (inc. 2.5% scrap)</th>
                <th className="px-4 py-3 text-right">Physical Stock</th>
                <th className="px-4 py-3 text-right">Reserved (Other SOs)</th>
                <th className="px-4 py-3 text-right">Available Stock</th>
                <th className="px-4 py-3 text-center">Gate Status</th>
                <th className="px-4 py-3 text-right">Deficit to Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {materialCheckLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0d382c]" />
                    Evaluating real-time stock ledger & reservations...
                  </td>
                </tr>
              ) : !materials || materials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No BOM configured for the ordered profile items.
                  </td>
                </tr>
              ) : (
                materials.map((m: any, idx: number) => {
                  const isAvailable = m.status === "AVAILABLE";
                  return (
                    <tr
                      key={idx}
                      className={
                        !isAvailable
                          ? "bg-rose-50/40 dark:bg-rose-950/20"
                          : "hover:bg-slate-50/50 dark:hover:bg-zinc-900/30"
                      }
                    >
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {m.rmItem.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">{m.rmItem.code}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {m.requiredQty.toFixed(2)} {m.rmItem.uom}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        {m.physicalStock.toFixed(2)} {m.rmItem.uom}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-400">
                        {m.reservedStock.toFixed(2)} {m.rmItem.uom}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {m.availableStock.toFixed(2)} {m.rmItem.uom}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isAvailable
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                              : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400"
                          }`}
                        >
                          {isAvailable ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> AVAILABLE
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3" /> DEFICIT
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        {m.deficitQty > 0 ? `+${m.deficitQty.toFixed(2)} ${m.rmItem.uom}` : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 3: Customer Confirmation & Stock Lock */}
      <section
        id="confirmation"
        className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 md:p-8 space-y-6 shadow-2xs scroll-mt-36"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-[#0d382c] dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                3. Customer Confirmation & Stock Reservation
              </h2>
              <p className="text-xs text-slate-400">
                Log customer go-ahead channel and atomically reserve raw materials in stock ledger.
              </p>
            </div>
          </div>
        </div>

        {confirmError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
            {confirmError}
          </div>
        )}

        {isOrderConfirmed ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Confirmation Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1.5 mt-0.5">
                  <CheckCircle className="w-4 h-4" /> Order Confirmed & Stock Locked
                </span>
                <span className="text-slate-500 block mt-1">
                  Channel: <span className="font-semibold text-slate-700 dark:text-slate-300">{order.approvalMethod}</span> • Confirmed on{" "}
                  {new Date(order.confirmedAt || Date.now()).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-slate-400 block font-medium">Confirmed By</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {order.confirmedBy?.name || "System Admin"}
                </span>
                <span className="text-slate-500 font-mono block">
                  {order.confirmedBy?.employeeCode || "HP-001"}
                </span>
              </div>
            </div>

            {/* Locked Stock Reservations Table */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2">
                Active Stock Ledger Reservations ({order.reservations?.length || 0} Ingredients)
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Reservation ID</th>
                      <th className="px-4 py-2.5">Material</th>
                      <th className="px-4 py-2.5">Code</th>
                      <th className="px-4 py-2.5 text-right">Locked Quantity</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {order.reservations && order.reservations.length > 0 ? (
                      order.reservations.map((res: any) => (
                        <tr key={res.id}>
                          <td className="px-4 py-2.5 font-mono text-slate-500">{res.id}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                            {res.item?.name || "Raw Material"}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-slate-500">{res.item?.code}</td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {res.quantity.toFixed(2)} {res.item?.uom || "Kg"}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                              {res.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-center text-slate-400">
                          Reservations locked and allocated.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Approval Channel Received From Client
                </label>
                <select
                  value={approvalMethod}
                  onChange={(e) => setApprovalMethod(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
                >
                  <option value="WHATSAPP">WhatsApp Approval Message</option>
                  <option value="PHONE">Phone Call Recorded</option>
                  <option value="EMAIL">Formal Email PO / Go-ahead</option>
                  <option value="VERBAL">Verbal Agreement / Site Visit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Client PO Reference / Verbal Notes (Optional)
                </label>
                <input
                  type="text"
                  value={confirmationNotes}
                  onChange={(e) => setConfirmationNotes(e.target.value)}
                  placeholder="e.g. Approved by client via WhatsApp at 2:30 PM"
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleConfirmOrder}
                disabled={confirmLoading || hasDeficits}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0d382c] hover:bg-[#08261e] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {confirmLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                Confirm Order & Atomically Lock Stock
              </button>

              {hasDeficits && (
                <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Cannot confirm: Resolve material deficits in Section 2 first.
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* SECTION 4: Extrusion & Work Orders */}
      <section
        id="extrusion-production"
        className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 md:p-8 space-y-6 shadow-2xs scroll-mt-36"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-[#0d382c] dark:text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                4. Extrusion Floor & Work Orders
              </h2>
              <p className="text-xs text-slate-400">
                Extrusion lines, die tooling, meters extruded vs planned, and scrap generation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowProdModal(true)}
              className="px-3 py-1.5 text-xs font-bold bg-[#0d382c] hover:bg-[#08261e] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Quick Log Extrusion Output
            </button>
            <Link
              href={`/work-orders/new?orderId=${order.id}`}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors flex items-center gap-1.5"
            >
              New Work Order
            </Link>
          </div>
        </div>

        {/* Modal: Quick Log Extrusion */}
        {showProdModal && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Log Real-Time Extrusion Run for {order.orderNumber}
            </h4>
            <form onSubmit={handleQuickLogProduction} className="flex flex-wrap items-end gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Meters Extruded</label>
                <input
                  type="number"
                  value={prodMeters}
                  onChange={(e) => setProdMeters(e.target.value)}
                  className="w-32 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Scrap Purge (Kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={prodScrap}
                  onChange={(e) => setProdScrap(e.target.value)}
                  className="w-28 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={prodLoading}
                className="px-4 py-1.5 rounded-lg bg-[#0d382c] text-white font-bold text-xs flex items-center gap-1.5"
              >
                {prodLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Log Production & Consume BOM
              </button>
              <button
                type="button"
                onClick={() => setShowProdModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {order.workOrders && order.workOrders.length > 0 ? (
          <div className="space-y-4">
            {order.workOrders.map((wo: any) => {
              const jobCard = wo.jobCards?.[0];
              const produced = wo.producedQty || jobCard?.goodQty || 0;
              const planned = wo.plannedQty || 1;
              const percent = Math.min(100, Math.round((produced / planned) * 100));

              return (
                <div
                  key={wo.id}
                  className="p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#0d382c] dark:text-emerald-400">
                        {wo.workOrderNumber}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                        {wo.fgItem?.name || "Extrusion Profile"}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                        {wo.status}
                      </span>
                      <Link
                        href={`/work-orders/${wo.id}`}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                      >
                        Open Floor Card
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Extrusion Line</span>
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {jobCard?.workstation?.name || "Extrusion Line 01 (uPVC)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Tooling / Die</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-white">
                        {jobCard?.die?.code || "DIE-A101-01"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Assigned Operator</span>
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {jobCard?.assignedUser?.name || "Dinesh Yadav"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Scrap Purge Logged</span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                        {jobCard?.scrapQty || 0} Kg
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Production Progress</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {produced.toLocaleString("en-IN")} / {planned.toLocaleString("en-IN")} Meters (
                        {percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0d382c] dark:bg-emerald-500 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
            No work orders created yet. Click &ldquo;Quick Log Extrusion Output&rdquo; above to start production.
          </div>
        )}
      </section>

      {/* SECTION 5: 5-Sample QC Inspection */}
      <section
        id="quality-control"
        className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 md:p-8 space-y-6 shadow-2xs scroll-mt-36"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-[#0d382c] dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                5. 5-Sample Dimensional Quality Control (QC)
              </h2>
              <p className="text-xs text-slate-400">
                Physical test reports: Pin size, Width, Leg thickness, Linear weight, and Profile fit test.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowQcModal(true)}
              className="px-3 py-1.5 text-xs font-bold bg-[#0d382c] hover:bg-[#08261e] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Quick Submit 5-Sample QC
            </button>
            <Link
              href="/qc"
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors flex items-center gap-1.5"
            >
              Open QC Station
            </Link>
          </div>
        </div>

        {/* Modal: Quick Submit QC */}
        {showQcModal && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Log 5-Sample Quality Check for Extrusion Batch
            </h4>
            <form onSubmit={handleQuickSubmitQC} className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Pin Size (mm)</label>
                <input
                  type="number"
                  step="0.01"
                  value={qcPinSize}
                  onChange={(e) => setQcPinSize(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Width (mm)</label>
                <input
                  type="number"
                  step="0.01"
                  value={qcWidth}
                  onChange={(e) => setQcWidth(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Leg Thickness</label>
                <input
                  type="number"
                  step="0.01"
                  value={qcLeg}
                  onChange={(e) => setQcLeg(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Linear Wt (g/m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={qcWeight}
                  onChange={(e) => setQcWeight(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Fit Test</label>
                <select
                  value={qcFit}
                  onChange={(e) => setQcFit(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1.5"
                >
                  <option value="PASS">PASS (Perfect)</option>
                  <option value="TIGHT">TIGHT</option>
                  <option value="LOOSE">LOOSE</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Result</label>
                <select
                  value={qcStatus}
                  onChange={(e) => setQcStatus(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1.5"
                >
                  <option value="PASS">PASS</option>
                  <option value="REWORK">REWORK</option>
                  <option value="SCRAP">SCRAP</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-6 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQcModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={qcLoading}
                  className="px-4 py-1.5 rounded-lg bg-[#0d382c] text-white font-bold text-xs flex items-center gap-1.5"
                >
                  {qcLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Submit QC Report
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Display QC inspection results */}
        {(() => {
          const inspections =
            order.workOrders?.flatMap((wo: any) =>
              wo.jobCards?.flatMap((jc: any) => jc.inspections || []) || []
            ) || [];

          if (inspections.length === 0) {
            return (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                No 5-sample QC inspections submitted yet for this order. Click &ldquo;Quick Submit 5-Sample QC&rdquo; to record inspection.
              </div>
            );
          }

          return (
            <div className="space-y-4">
              {inspections.map((qc: any) => {
                const isPass = qc.status === "PASS";
                return (
                  <div
                    key={qc.id}
                    className="p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0d382c] dark:text-emerald-400">
                          {qc.reportNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isPass
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                              : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400"
                          }`}
                        >
                          {qc.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        Inspector: <strong className="text-slate-700 dark:text-slate-300">{qc.inspectorName}</strong> •{" "}
                        {new Date(qc.inspectedAt).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                        <span className="text-slate-400 block text-[11px]">Pin Size</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {qc.pinSize ? `${qc.pinSize} mm` : "—"}
                        </span>
                      </div>
                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                        <span className="text-slate-400 block text-[11px]">Profile Width</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {qc.width ? `${qc.width} mm` : "—"}
                        </span>
                      </div>
                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                        <span className="text-slate-400 block text-[11px]">Leg Thickness</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {qc.legThickness ? `${qc.legThickness} mm` : "—"}
                        </span>
                      </div>
                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                        <span className="text-slate-400 block text-[11px]">Linear Weight</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {qc.linearWeight ? `${qc.linearWeight} g/m` : "—"}
                        </span>
                      </div>
                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                        <span className="text-slate-400 block text-[11px]">Profile Fit Test</span>
                        <span
                          className={`font-bold ${
                            qc.fitTestResult === "PASS"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {qc.fitTestResult || "PASS"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </section>

      {/* SECTION 6: Carton Packing & Labels */}
      <section
        id="cartons-packing"
        className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 md:p-8 space-y-6 shadow-2xs scroll-mt-36"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-[#0d382c] dark:text-emerald-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                6. Carton Packing & QR Serialization
              </h2>
              <p className="text-xs text-slate-400">
                Individual box barcodes, meter coils, and warehouse label assignment.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPackModal(true)}
              className="px-3 py-1.5 text-xs font-bold bg-[#0d382c] hover:bg-[#08261e] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Quick Serialize Carton
            </button>
            <Link
              href={`/packing/new?orderId=${order.id}`}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors flex items-center gap-1.5"
            >
              Packing Desk
            </Link>
          </div>
        </div>

        {/* Modal: Quick Serialize Carton */}
        {showPackModal && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Pack & Generate QR Carton Code for Order
            </h4>
            <form onSubmit={handleQuickPackCarton} className="flex flex-wrap items-end gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Meters in Carton</label>
                <input
                  type="number"
                  value={packQuantity}
                  onChange={(e) => setPackQuantity(e.target.value)}
                  className="w-36 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={packLoading}
                className="px-4 py-1.5 rounded-lg bg-[#0d382c] text-white font-bold text-xs flex items-center gap-1.5"
              >
                {packLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5" />}
                Generate QR Label
              </button>
              <button
                type="button"
                onClick={() => setShowPackModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {(() => {
          const cartons = order.deliveryNotes?.flatMap((d: any) => d.cartons || []) || [];
          if (cartons.length === 0) {
            return (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                No packed cartons serialized yet for this order. Click &ldquo;Quick Serialize Carton&rdquo; to pack coils.
              </div>
            );
          }

          return (
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Carton QR Code</th>
                    <th className="px-4 py-3">Batch Reference</th>
                    <th className="px-4 py-3 text-right">Quantity (Meters)</th>
                    <th className="px-4 py-3 text-center">Dock Gate Scanned</th>
                    <th className="px-4 py-3">Scanned Timestamp</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {cartons.map((ctn: any) => (
                    <tr key={ctn.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30">
                      <td className="px-4 py-3 font-mono font-bold text-[#0d382c] dark:text-emerald-400 flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-slate-400" />
                        {ctn.cartonCode}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                        {ctn.batch?.batchNumber || "BATCH-PRIMARY"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {ctn.quantity} Meters
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ctn.scanned
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-500 dark:bg-zinc-800"
                          }`}
                        >
                          {ctn.scanned ? "SCANNED" : "PENDING SCAN"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {ctn.scannedAt ? new Date(ctn.scannedAt).toLocaleString("en-IN") : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            window.open(
                              `/api/dispatch/scan?cartonCode=${ctn.cartonCode}`,
                              "_blank",
                              "width=400,height=500"
                            );
                          }}
                          className="px-2.5 py-1 text-[11px] rounded bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 font-semibold"
                        >
                          Print Label
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </section>

      {/* SECTION 7: Customer Dispatch Gate */}
      <section
        id="dispatch-gate"
        className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 md:p-8 space-y-6 shadow-2xs scroll-mt-36"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-[#0d382c] dark:text-emerald-400">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                7. Customer Dispatch Confirmation Gate
              </h2>
              <p className="text-xs text-slate-400">
                Log customer consent and transporter credentials before triggering dock gate barcode release.
              </p>
            </div>
          </div>

          <Link
            href="/dispatch"
            className="px-3.5 py-2 text-xs font-bold bg-[#0d382c] hover:bg-[#08261e] text-white rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5" />
            Open Gate Scanner
          </Link>
        </div>

        <form onSubmit={handleUpdateDispatchGate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Customer Consent Go-Ahead
              </label>
              <select
                value={consentChannel}
                onChange={(e) => setConsentChannel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
              >
                <option value="WHATSAPP">WhatsApp Dispatch Confirmation</option>
                <option value="PHONE">Phone Go-Ahead Call</option>
                <option value="EMAIL">Customer Site Delivery Request</option>
                <option value="VERBAL">Transporter Pickup Token</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Transporter Name
              </label>
              <input
                type="text"
                value={transporterName}
                onChange={(e) => setTransporterName(e.target.value)}
                placeholder="e.g. V-Trans Logistics / SafeX"
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Vehicle Number
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. GJ-01-AB-1234"
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                LR / Bilty Number
              </label>
              <input
                type="text"
                value={lrNumber}
                onChange={(e) => setLrNumber(e.target.value)}
                placeholder="e.g. LR-987654"
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0d382c]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={dispatchLoading}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              {dispatchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save Logistics & Consent
            </button>

            {order.status !== "DISPATCHED" && (
              <button
                type="button"
                onClick={() => handleAdvanceStatus("DISPATCHED")}
                className="px-5 py-2.5 rounded-xl bg-[#0d382c] hover:bg-[#08261e] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                Confirm & Mark Dispatched
              </button>
            )}
          </div>
        </form>
      </section>

      {/* SECTION 8: Book Keeper Accounting Export */}
      <section
        id="bookkeeper-export"
        className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 md:p-8 space-y-6 shadow-2xs scroll-mt-36"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-[#0d382c] dark:text-emerald-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                8. Book Keeper Accounting Export
              </h2>
              <p className="text-xs text-slate-400">
                Direct CSV voucher export strictly formatted for Book Keeper accounting software.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBookKeeperExport("SALES_INVOICE")}
              disabled={bkExporting !== null}
              className="px-3.5 py-2 text-xs font-bold bg-[#0d382c] hover:bg-[#08261e] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              {bkExporting === "SALES_INVOICE" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Export Sales Voucher (CSV)
            </button>

            <button
              onClick={() => handleBookKeeperExport("MATERIAL_CONSUMPTION")}
              disabled={bkExporting !== null}
              className="px-3.5 py-2 text-xs font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
            >
              {bkExporting === "MATERIAL_CONSUMPTION" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Export Material Issue (CSV)
            </button>
          </div>
        </div>

        {bkPreview && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Book Keeper CSV Export Generated:
              </span>
              <button
                onClick={copyCsvToClipboard}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 flex items-center gap-1"
              >
                {csvCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {csvCopied ? "Copied" : "Copy CSV"}
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-emerald-400 text-xs font-mono rounded-xl overflow-x-auto max-h-56">
              {bkPreview}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}
