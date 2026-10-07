"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createWorkOrder, getBOMForItem } from "../actions";
import { getItems } from "@/app/(desk)/items/actions";
import { getSalesOrders } from "@/app/(desk)/orders/actions";
import { Layers } from "lucide-react";

export default function NewWorkOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const [items, setItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    fgItemId: "",
    salesOrderId: "",
    plannedQty: "",
    fgBatchNumber: "",
  });
  const [bom, setBom] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const [itms, ords] = await Promise.all([getItems(), getSalesOrders()]);
      setItems(itms);
      setOrders(ords);
      setInitialLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    async function loadBom() {
      if (formData.fgItemId) {
        const b = await getBOMForItem(formData.fgItemId);
        setBom(b);
      } else {
        setBom(null);
      }
    }
    loadBom();
  }, [formData.fgItemId]);

  const handleSalesOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const soId = e.target.value;
    const so = orders.find((o) => o.id === soId);
    
    if (so && so.items && so.items.length > 0) {
      // Auto-populate based on the first item of the sales order for simplicity
      const targetItem = so.items[0];
      setFormData({
        ...formData,
        salesOrderId: soId,
        fgItemId: targetItem.itemId,
        plannedQty: targetItem.quantity.toString(),
      });
    } else {
      setFormData({ ...formData, salesOrderId: soId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.fgItemId || !formData.plannedQty) {
      setError("Please fill all required fields");
      setLoading(false);
      return;
    }

    try {
      const wo = await createWorkOrder(formData);
      router.push(`/work-orders/${wo.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create work order");
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <Link href="/work-orders" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Work Orders
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Work Order</h1>
        <p className="text-sm text-slate-500 mt-1">Create a new production plan</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Finished Good (FG) Item <span className="text-red-500">*</span></label>
              <select
                required
                value={formData.fgItemId}
                onChange={(e) => setFormData({ ...formData, fgItemId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="">Select a product</option>
                {items.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Linked Sales Order (Optional)</label>
              <select
                value={formData.salesOrderId}
                onChange={handleSalesOrderChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="">None (Make to Stock)</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>{o.orderNumber} - {o.customer.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Planned Target Quantity <span className="text-red-500">*</span></label>
              <input
                type="number"
                required
                min="0.1"
                step="0.1"
                value={formData.plannedQty}
                onChange={(e) => setFormData({ ...formData, plannedQty: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="e.g. 5000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Assigned FG Batch Number (Optional)</label>
              <input
                type="text"
                value={formData.fgBatchNumber}
                onChange={(e) => setFormData({ ...formData, fgBatchNumber: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="e.g. BATCH-001"
              />
            </div>
          </div>

          {/* Production Plan BOM Projection */}
          {bom && formData.plannedQty && Number(formData.plannedQty) > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                Raw Material Requirements (Production Plan)
              </h3>
              <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-200/60 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-100/50 dark:bg-zinc-900 text-slate-500 dark:text-slate-400 font-medium">
                    <tr>
                      <th className="px-4 py-3">Raw Material</th>
                      <th className="px-4 py-3 text-right">Qty Per Unit</th>
                      <th className="px-4 py-3 text-right">Target Output</th>
                      <th className="px-4 py-3 text-right">Required (inc Scrap)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {bom.materials.map((mat: any) => {
                      const multiplier = Number(formData.plannedQty) / (bom.outputQty > 0 ? bom.outputQty : 1);
                      const scrapMultiplier = 1 / (1 - (bom.scrapFactor || 0.025));
                      const required = Math.round(mat.qtyPerUnit * multiplier * scrapMultiplier * 100) / 100;
                      
                      return (
                        <tr key={mat.id} className="text-slate-700 dark:text-slate-300">
                          <td className="px-4 py-3 font-medium">{mat.rmItem.name}</td>
                          <td className="px-4 py-3 text-right">{mat.qtyPerUnit} {mat.rmItem.uom}</td>
                          <td className="px-4 py-3 text-right font-medium">{Number(formData.plannedQty).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                            {required.toLocaleString()} {mat.rmItem.uom}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
        
        <div className="px-6 py-4 md:px-8 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <Link href="/work-orders" className="px-6 py-3 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl bg-[#0d382c] hover:bg-[#092b21] text-white font-semibold text-sm flex items-center justify-center transition-colors disabled:opacity-70 min-w-[140px]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create WO'}
          </button>
        </div>
      </form>
    </div>
  );
}
