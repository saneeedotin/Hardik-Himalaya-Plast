"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import React from "react";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex min-h-screen">
        {/* Desktop Modern Minimal Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:pl-68 transition-all duration-300">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Dock */}
      <MobileNav />
    </>
  );
}
