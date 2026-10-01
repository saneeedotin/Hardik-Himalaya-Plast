import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { UserProvider } from "@/components/auth/UserProvider";
import { MainLayout } from "@/components/layout/MainLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Himalaya Plast • HPOS Factory OS",
  description: "Next-Gen Extrusion Manufacturing Execution System & Dispatch Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-[#f4f6f8] dark:bg-[#090d12]">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen bg-[#f4f6f8] dark:bg-[#090d12] text-slate-900 dark:text-slate-100 antialiased selection:bg-[#0d382c] selection:text-white transition-colors duration-150`}
      >
        <ThemeProvider defaultTheme="light">
          <UserProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
