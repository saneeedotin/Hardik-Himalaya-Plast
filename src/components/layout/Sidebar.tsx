"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ShoppingCart,
  Cpu,
  ShieldCheck,
  QrCode,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Layers,
  Users,
  Box,
  Truck,
  Workflow,
  ShoppingBag,
  Package,
  Server,
  ArrowRightLeft,
  LogOut,
  FileSpreadsheet,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutGrid,
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Buying (POs)",
    href: "/buying",
    icon: ShoppingBag,
  },
  {
    title: "Purchase Receipts",
    href: "/buying/receipts",
    icon: ShoppingBag,
  },
  {
    title: "Inventory Ledger",
    href: "/stock",
    icon: Package,
  },
  {
    title: "Extrusion Floor",
    href: "/production",
    icon: Cpu,
  },
  {
    title: "Shift Handovers",
    href: "/shift-handovers",
    icon: ArrowRightLeft,
  },
  {
    title: "Work Orders",
    href: "/work-orders",
    icon: Workflow,
  },
  {
    title: "Quality Station",
    href: "/qc",
    icon: ShieldCheck,
  },
  {
    title: "Dispatch Scanner",
    href: "/dispatch",
    icon: QrCode,
  },
];

const masterItems: NavItem[] = [
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Items",
    href: "/items",
    icon: Box,
  },
  {
    title: "Suppliers",
    href: "/suppliers",
    icon: Truck,
  },
  {
    title: "BOMs",
    href: "/boms",
    icon: Workflow,
  },
  {
    title: "Workstations",
    href: "/workstations",
    icon: Server,
  },
];

const accountingItems: NavItem[] = [
  {
    title: "Book Keeper",
    href: "/bookkeeper",
    icon: FileSpreadsheet,
  },
  {
    title: "Sales Invoices",
    href: "/bookkeeper/sales-invoices",
    icon: FileSpreadsheet,
  },
  {
    title: "Purchase Invoices",
    href: "/bookkeeper/purchase-invoices",
    icon: FileSpreadsheet,
  },
  {
    title: "Payments",
    href: "/bookkeeper/payments",
    icon: FileSpreadsheet,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col justify-between fixed left-4 top-4 bottom-4 z-40 transition-all duration-300 ease-in-out bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 rounded-[28px] p-4 shadow-sm",
        collapsed ? "w-20" : "w-60"
      )}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2 py-2 mb-6 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#0d382c] flex items-center justify-center text-white shrink-0 shadow-xs">
            <Layers className="w-4 h-4 text-emerald-200" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                himalaya plast
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                Factory OS
              </span>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="space-y-6 overflow-y-auto flex-1 pr-2 pb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-800">
          {/* Main Menu */}
          <div>
            {!collapsed && (
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3 block mb-2">
                Menu
              </span>
            )}
            <nav className="flex flex-col gap-1">
              {menuItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.title : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs transition-colors",
                      isActive
                        ? "bg-[#eaf3ef] text-[#0d382c] dark:bg-[#162a24] dark:text-emerald-300 font-semibold"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0",
                        isActive
                          ? "text-[#0d382c] dark:text-emerald-300"
                          : "text-slate-400 dark:text-slate-500"
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.title}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Master Data */}
          <div>
            {!collapsed && (
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3 block mb-2">
                Masters
              </span>
            )}
            <nav className="flex flex-col gap-1">
              {masterItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.title : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs transition-colors",
                      isActive
                        ? "bg-[#eaf3ef] text-[#0d382c] dark:bg-[#162a24] dark:text-emerald-300 font-semibold"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0",
                        isActive
                          ? "text-[#0d382c] dark:text-emerald-300"
                          : "text-slate-400 dark:text-slate-500"
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.title}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Operations & Finance */}

          <div>
            {!collapsed && (
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3 block mb-2">
                Finance
              </span>
            )}
            <nav className="flex flex-col gap-1">
              {accountingItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.title : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs transition-colors",
                      isActive
                        ? "bg-[#eaf3ef] text-[#0d382c] dark:bg-[#162a24] dark:text-emerald-300 font-semibold"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0",
                        isActive
                          ? "text-[#0d382c] dark:text-emerald-300"
                          : "text-slate-400 dark:text-slate-500"
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.title}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Area: Clean status & Collapse button */}
      <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800 shrink-0 mt-2">
        {!collapsed && (
          <div className="p-3.5 rounded-2xl bg-[#0d382c] text-white space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-100">
                Extrusion Line 01
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-emerald-200/80 leading-relaxed">
              Profile A101 • 18.5 m/min
            </p>
          </div>
        )}

        <div className="flex items-center justify-between px-1 py-0.5">
          <div className="flex gap-1 items-center">
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {mounted ? (
                theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-500" />
                )
              ) : (
                <span className="w-4 h-4 block" />
              )}
            </button>
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
