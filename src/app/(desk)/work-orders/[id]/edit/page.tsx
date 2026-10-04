"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { updateWorkOrder, deleteWorkOrder } from "../../actions";
import { getItems } from "@/app/(desk)/items/actions";
import { getSalesOrders } from "@/app/(desk)/orders/actions";
import { getWorkOrder } from "../../actions";

export default function EditWorkOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const [items, setItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [wo, setWo] = useState<any>(null);

  const [formData, setFormData] = useState({
    fgItemId: "",
    salesOrderId: "",
    plannedQty: "",
    fgBatchNumber: "",
    status: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const [itms, ords, workOrder] = await Promise.all([
          getItems(),
          getSalesOrders(),
          getWorkOrder(id)
        ]);
        setItems(itms);
        setOrders(ords);
        setWo(workOrder);
        
        if (workOrder) {
          setFormData({
            fgItemId: workOrder.fgItemId || "",
            salesOrderId: workOrder.salesOrderId || "",
            plannedQty: workOrder.plannedQty || "",
            fgBatchNumber: workOrder.fgBatchNumber || "",
            status: workOrder.status || "PENDING",
          });
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setInitialLoading(false);
      }
    }
    load();
  }, [id]);

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
      await updateWorkOrder(id, formData);
      router.push(`/work-orders/${id}`);
    } catch (err: any) {
      setError(err.message || "Failed to update work order");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this Work Order?")) return;
    setDeleting(true);
    try {
      await deleteWorkOrder(id);
      router.push(`/work-orders`);
    } catch (err: any) {
      setError(err.message || "Failed to delete work order");
      setDeleting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error && !items.length) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <Link href={`/work-orders/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Work Order
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete Work Order
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Work Order</h1>
        <p className="text-sm text-slate-500 mt-1">
          {wo?.workOrderNumber}
        </p>
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
                onChange={(e) => setFormData({ ...formData, salesOrderId: e.target.value })}
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
        </div>
        
        <div className="px-6 py-4 md:px-8 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <Link href={`/work-orders/${id}`} className="px-6 py-3 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl bg-[#0d382c] hover:bg-[#092b21] text-white font-semibold text-sm flex items-center justify-center transition-colors disabled:opacity-70 min-w-[140px]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
