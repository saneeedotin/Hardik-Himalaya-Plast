import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Search,
  Package,
  FileText,
  Users,
  ShoppingCart,
  UserCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const rawQuery = typeof params.q === "string" ? params.q : "";
  const query = rawQuery.trim();

  // If query is empty, show prompt
  if (!query) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Search
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Search across work orders, inventory items, customers, orders, and team members.
          </p>
        </div>
        <div className="py-16 flex flex-col items-center justify-center bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Type to search</h3>
          <p className="text-xs text-slate-500 mt-1">Enter a query in the top bar to find any record.</p>
        </div>
      </div>
    );
  }

  // Perform parallel database queries across all core business entities
  const [customers, orders, workOrders, items, users] = await Promise.all([
    prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
          { phone: { contains: query } },
          { gstin: { contains: query } },
        ],
      },
      take: 10,
    }),
    prisma.salesOrder.findMany({
      where: {
        OR: [
          { orderNumber: { contains: query } },
          { customerName: { contains: query } },
          { customerGstin: { contains: query } },
        ],
      },
      include: {
        items: {
          include: { item: true },
        },
      },
      take: 10,
    }),
    prisma.workOrder.findMany({
      where: {
        OR: [
          { workOrderNumber: { contains: query } },
          { fgItem: { name: { contains: query } } },
        ],
      },
      include: {
        fgItem: true,
      },
      take: 10,
    }),
    prisma.item.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { code: { contains: query } },
          { category: { contains: query } },
        ],
      },
      take: 10,
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
          { employeeCode: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeCode: true,
      },
      take: 5,
    }),
  ]);

  const totalResults =
    customers.length + orders.length + workOrders.length + items.length + users.length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Search Results
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Found <span className="font-semibold text-slate-900 dark:text-white">{totalResults}</span> results for{" "}
            <span className="font-semibold text-[#0d382c] dark:text-emerald-400">"{rawQuery}"</span>
          </p>
        </div>
      </div>

      {totalResults === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No results found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
            We couldn't find any customers, orders, work orders, or inventory items matching "{rawQuery}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Customers Section */}
          {customers.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Customers ({customers.length})
                  </h3>
                </div>
                <Link
                  href="/customers"
                  className="text-[11px] text-[#0d382c] dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {customers.map((c) => (
                  <Link
                    key={c.id}
                    href={`/customers`}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors block group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0d382c] dark:group-hover:text-emerald-400 transition-colors">
                          {c.name}
                        </h4>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                          {c.email && <span>{c.email}</span>}
                          {c.phone && <span>• {c.phone}</span>}
                          {c.gstin && <span className="font-mono text-[11px]">• GST: {c.gstin}</span>}
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Sales Orders Section */}
          {orders.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Sales Orders ({orders.length})
                  </h3>
                </div>
                <Link
                  href="/orders"
                  className="text-[11px] text-[#0d382c] dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {orders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/orders`}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors block group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#0d382c] dark:group-hover:text-emerald-400">
                            {o.orderNumber}
                          </span>
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
                            {o.status}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                          {o.customerName}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Amount: ₹{Number(o.totalAmount).toLocaleString("en-IN")} • {o.items.length} items
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Work Orders Section */}
          {workOrders.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Work Orders ({workOrders.length})
                  </h3>
                </div>
                <Link
                  href="/work-orders"
                  className="text-[11px] text-[#0d382c] dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {workOrders.map((wo) => (
                  <Link
                    key={wo.id}
                    href={`/work-orders`}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors block group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#0d382c] dark:group-hover:text-emerald-400">
                            {wo.workOrderNumber}
                          </span>
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
                            {wo.status}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                          {wo.fgItem.name}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Target: {wo.plannedQty} {wo.fgItem.uom}
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Items / Inventory Section */}
          {items.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Items & Inventory ({items.length})
                  </h3>
                </div>
                <Link
                  href="/items"
                  className="text-[11px] text-[#0d382c] dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/items`}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors block group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#0d382c] dark:group-hover:text-emerald-400">
                            {item.code}
                          </span>
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
                            {item.category}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          UOM: {item.uom} {item.hsnCode ? `• HSN: ${item.hsnCode}` : ""}
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Team / Users Section */}
          {users.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Team Members ({users.length})
                  </h3>
                </div>
                <Link
                  href="/users"
                  className="text-[11px] text-[#0d382c] dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {users.map((u) => (
                  <Link
                    key={u.id}
                    href={`/users`}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors block group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0d382c] dark:group-hover:text-emerald-400">
                          {u.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {u.email} {u.employeeCode ? `• EMP: ${u.employeeCode}` : ""}
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
