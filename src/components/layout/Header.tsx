"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  MessageSquare,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers,
  ShieldCheck,
  QrCode,
  Package,
  ShoppingCart,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

export function Header() {
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALERTS" | "HISTORY">("ALERTS");

  // Rich actionable alerts state
  const [alerts, setAlerts] = useState([
    {
      id: "alt-1",
      title: "Raw Material Reorder Alert",
      description: "Carbon Black Masterbatch (RM-BLACK-MB) is approaching reorder threshold.",
      severity: "WARNING", // CRITICAL, WARNING, INFO
      time: "15 mins ago",
      icon: Package,
      actions: [
        { label: "Create PO", href: "/buying/new", primary: true },
        { label: "Check Stock", href: "/stock", primary: false },
      ],
      unread: true,
    },
    {
      id: "alt-2",
      title: "Order SO-2026-00003 Ready to Confirm",
      description: "Glazing Bead C303 (3,000m) passed BOM check. Materials 100% available.",
      severity: "INFO",
      time: "45 mins ago",
      icon: ShoppingCart,
      actions: [
        { label: "Open Order Cockpit", href: "/orders/cmusvodai0016eyngczonpd3y", primary: true },
      ],
      unread: true,
    },
    {
      id: "alt-3",
      title: "Extrusion Line 01 QC Inspection Due",
      description: "5-sample dimensional check required for Batch FG-2026-00101.",
      severity: "CRITICAL",
      time: "1 hour ago",
      icon: ShieldCheck,
      actions: [
        { label: "Open QC Station", href: "/qc", primary: true },
      ],
      unread: true,
    },
    {
      id: "alt-4",
      title: "Dock Gate Scan Pending",
      description: "SAL-ORD-2026-00001 (5,000m) packed cartons awaiting transporter gate scan.",
      severity: "WARNING",
      time: "2 hours ago",
      icon: QrCode,
      actions: [
        { label: "Scan at Gate", href: "/dispatch", primary: true },
      ],
      unread: true,
    },
  ]);

  // Activity History state
  const [history, setHistory] = useState([
    {
      id: "hist-1",
      title: "Cartons Serialized",
      description: "Delivery Note DN-2026-00001 packed 4 cartons of HP-GASKET-A101.",
      time: "3 hours ago",
      icon: QrCode,
    },
    {
      id: "hist-2",
      title: "QC Report Approved",
      description: "QC-2026-00001 passed 5-sample check with perfect profile fit test.",
      time: "4 hours ago",
      icon: CheckCircle,
    },
    {
      id: "hist-3",
      title: "Work Order Completed",
      description: "PROD-WO-2026-00001 produced 5,000 meters on Line-01.",
      time: "5 hours ago",
      icon: Layers,
    },
    {
      id: "hist-4",
      title: "Opening Stock Verified",
      description: "Stock ledger balances synchronized with Book Keeper ledger.",
      time: "Yesterday",
      icon: Package,
    },
  ]);

  const hasUnread = alerts.some((a) => a.unread);
  const unreadCount = alerts.filter((a) => a.unread).length;

  const { user } = useUser();
  const router = useRouter();

  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (msgRef.current && !msgRef.current.contains(event.target as Node)) {
        setShowMessages(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search)}`);
    }
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, unread: false })));
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#f4f6f8]/90 dark:bg-[#090d12]/90 backdrop-blur-md px-4 md:px-8 py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: User Profile Identifier matching reference design */}
        <Link
          href="/account"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-[#0d382c] flex items-center justify-center text-white font-bold text-xs shadow-xs ring-2 ring-emerald-500/20">
            {user
              ? user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()
              : "HP"}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {user ? user.name : "Loading..."}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {user ? user.email : ""}
            </span>
          </div>
        </Link>

        {/* Right: Clean Pill Search Bar and Circular Icons */}
        <div className="flex items-center gap-2.5">
          <form
            action="/search"
            method="GET"
            onSubmit={handleSearch}
            className="relative w-48 sm:w-64"
          >
            <input
              name="q"
              type="text"
              placeholder="Search orders, RM, batches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-3.5 pr-8 py-1.5 text-xs rounded-full bg-white dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0d382c] transition-all shadow-2xs"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-[#0d382c] transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 hover:text-[#0d382c]" />
            </button>
          </form>

          <div className="flex items-center gap-1.5">
            {/* Messages */}
            <div className="relative" ref={msgRef}>
              <button
                type="button"
                onClick={() => {
                  setShowMessages(!showMessages);
                  setShowNotifications(false);
                }}
                className="w-8 h-8 rounded-full bg-white dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
                title="Messages"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>

              {showMessages && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-900">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Messages</h3>
                    <button
                      onClick={() => setShowMessages(false)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 text-center text-sm text-slate-500">No new messages.</div>
                </div>
              )}
            </div>

            {/* Notifications Center */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowMessages(false);
                }}
                className="w-8 h-8 rounded-full bg-white dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs relative"
                title="Alerts & Notification Center"
              >
                <Bell className="w-3.5 h-3.5" />
                {hasUnread && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-950" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 md:w-[420px] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                  {/* Top Bar */}
                  <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/70 dark:bg-zinc-900/60">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Factory Command Center
                      </h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                          {unreadCount} Action{unreadCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-slate-100 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-900/40">
                    <button
                      onClick={() => setActiveTab("ALERTS")}
                      className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === "ALERTS"
                          ? "border-[#0d382c] text-[#0d382c] dark:text-emerald-400 dark:border-emerald-400 bg-white dark:bg-zinc-950"
                          : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <span>Alerts & Action Items</span>
                      {unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-[10px] font-bold flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab("HISTORY")}
                      className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === "HISTORY"
                          ? "border-[#0d382c] text-[#0d382c] dark:text-emerald-400 dark:border-emerald-400 bg-white dark:bg-zinc-950"
                          : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Activity History</span>
                    </button>
                  </div>

                  {/* Tab Body */}
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {activeTab === "ALERTS" ? (
                      alerts.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400">
                          No pending action items. Factory floor running smoothly!
                        </div>
                      ) : (
                        alerts.map((alt) => {
                          const Icon = alt.icon;
                          const isCritical = alt.severity === "CRITICAL";
                          const isWarning = alt.severity === "WARNING";
                          return (
                            <div
                              key={alt.id}
                              className={`p-4 transition-colors ${
                                alt.unread
                                  ? "bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-900/50"
                                  : "bg-slate-50/50 dark:bg-zinc-900/20 opacity-75"
                              }`}
                            >
                              <div className="flex gap-3">
                                <div
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                    isCritical
                                      ? "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
                                      : isWarning
                                      ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                                      : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                      {alt.title}
                                    </h4>
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                      {alt.time}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                    {alt.description}
                                  </p>

                                  {/* Action Buttons */}
                                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                                    {alt.actions.map((act, actIdx) => (
                                      <Link
                                        key={actIdx}
                                        href={act.href}
                                        onClick={() => setShowNotifications(false)}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 ${
                                          act.primary
                                            ? "bg-[#0d382c] hover:bg-[#08261e] text-white"
                                            : "bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                                        }`}
                                      >
                                        <span>{act.label}</span>
                                        <ChevronRight className="w-3 h-3" />
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )
                    ) : (
                      history.map((hist) => {
                        const Icon = hist.icon;
                        return (
                          <div
                            key={hist.id}
                            className="p-4 hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors flex items-start gap-3"
                          >
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 shrink-0">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                  {hist.title}
                                </h4>
                                <span className="text-[10px] text-slate-400">{hist.time}</span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">{hist.description}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 flex items-center justify-between text-xs">
                    {hasUnread && activeTab === "ALERTS" ? (
                      <button
                        onClick={markAllAsRead}
                        className="font-semibold text-[#0d382c] dark:text-emerald-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">HPOS Real-time Event Stream</span>
                    )}

                    <Link
                      href="/stock"
                      onClick={() => setShowNotifications(false)}
                      className="font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                    >
                      <span>View Stock Ledger</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
