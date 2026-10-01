"use client";

import React, { useState } from "react";
import { Search, Bell, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";

export function Header() {
  const [search, setSearch] = useState("");
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-30 w-full bg-[#f4f6f8]/90 dark:bg-[#090d12]/90 backdrop-blur-md px-4 md:px-8 py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: User Profile Identifier matching reference design */}
        <Link href="/account" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-[#0d382c] flex items-center justify-center text-white font-bold text-xs shadow-xs ring-2 ring-emerald-500/20">
            {user ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "PP"}
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
          <div className="relative w-48 sm:w-64">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-3.5 pr-8 py-1.5 text-xs rounded-full bg-white dark:bg-[#121820] border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0d382c] transition-all shadow-2xs"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              className="w-8 h-8 rounded-full bg-white dark:bg-[#121820] border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
              title="Notifications"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <button
              className="w-8 h-8 rounded-full bg-white dark:bg-[#121820] border border-slate-200/90 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs relative"
              title="Alerts"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
