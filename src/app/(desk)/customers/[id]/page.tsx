import { getCustomer } from "../actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar, 
  ShoppingCart,
  CheckCircle2,
  Clock
} from "lucide-react";
import { LogFollowUpForm } from "./LogFollowUpForm";
import { DeleteFollowUpButton } from "./DeleteFollowUpButton";

export const dynamic = "force-dynamic";

export default async function Customer360Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const customer = await getCustomer(resolvedParams.id);

  if (!customer) {
    notFound();
  }

  const activeOrders = customer.salesOrders.filter((o: any) => o.status !== "DISPATCHED" && o.status !== "DELIVERED");
  const pastOrders = customer.salesOrders.filter((o: any) => o.status === "DISPATCHED" || o.status === "DELIVERED");

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header Navigation */}
      <Link href="/customers" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Customers
      </Link>

      {/* Customer Header Card */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{customer.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
              {customer.gstin && (
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">GST:</span> {customer.gstin}
                </span>
              )}
              {customer.phone && (
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> {customer.phone}</span>
              )}
              {customer.email && (
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> {customer.email}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 text-sm">
          <Link
            href={`/customers/${customer.id}/edit`}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
          >
            Edit Profile
          </Link>
          <div className="px-3 py-1.5 bg-[#0d382c]/10 text-[#0d382c] dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg font-medium flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            {customer.salesOrders.length} Lifetime Orders
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Orders & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Orders */}
          <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Active Orders
              </h2>
            </div>
            <div className="p-0">
              {activeOrders.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">No active orders.</div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {activeOrders.map((order: any) => (
                    <li key={order.id} className="p-4 px-6 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{order.orderNumber}</div>
                        <div className="text-xs text-slate-500 mt-1">Due: {new Date(order.deliveryDate).toLocaleDateString("en-IN")}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">₹{order.totalAmount.toString()}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          {order.status.replace("_", " ")}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* CRM Follow Ups Timeline */}
          <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
              <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                Follow-Up History
              </h2>
            </div>
            <div className="p-6">
              {customer.followUps.length === 0 ? (
                <div className="text-center text-sm text-slate-500 py-4">No follow-ups recorded yet.</div>
              ) : (
                <div className="space-y-6">
                  {customer.followUps.map((fu: any, idx: any) => (
                    <div key={fu.id} className="relative pl-6 border-l-2 border-slate-200 dark:border-zinc-800 last:border-transparent pb-1">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-white dark:border-[#121820]" />
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(fu.createdAt).toLocaleString()}
                        </div>
                        <DeleteFollowUpButton id={fu.id} customerId={customer.id} />
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-sm text-slate-700 dark:text-slate-300">
                        {fu.notes}
                      </div>
                      {fu.expectedNextOrderDate && (
                        <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Expected next order: {new Date(fu.expectedNextOrderDate).toLocaleDateString("en-IN")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Add Follow Up Form */}
        <div className="space-y-6">
          <LogFollowUpForm customerId={customer.id} />
        </div>
      </div>
    </div>
  );
}
