"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ShoppingCart,
  Cpu,
  ShieldCheck,
  QrCode,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileItems = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/production", label: "Floor", icon: Cpu },
  { href: "/qc", label: "QC", icon: ShieldCheck },
  { href: "/dispatch", label: "Scan", icon: QrCode },
  { href: "/tally", label: "Tally", icon: ArrowLeftRight },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-white/95 dark:bg-[#121820]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-md flex items-center justify-around">
      {mobileItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] font-medium transition-colors",
              isActive
                ? "bg-[#eaf3ef] text-[#0d382c] dark:bg-[#162a24] dark:text-emerald-300 font-semibold"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
