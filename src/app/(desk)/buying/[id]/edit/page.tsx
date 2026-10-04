"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { getPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } from "../../actions";
import { getSuppliers } from "@/app/(desk)/suppliers/actions";
import { getItems } from "@/app/(desk)/items/actions";

export default function EditPurchaseOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    supplierId: "",
    notes: "",
  });

  const [orderItems, setOrderItems] = useState<{ itemId: string; qty: number; rate: number }[]>([]);

  useEffect(() => {
    async function load() {
      const [supps, itms, po] = await Promise.all([getSuppliers(), getItems(), getPurchaseOrder(id)]);
      setSuppliers(supps);
      setItems(itms);
      if (po) {
        setFormData({
          supplierId: po.supplierId || "",
          notes: po.notes || "",
        });
        setOrderItems(po.items.map((i: any) => ({
          itemId: i.itemId,
          qty: i.qty,
          rate: i.rate,
        })));
      }
      setInitialLoading(false);
    }
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.supplierId) {
      setError("Please select a supplier");
      setLoading(false);
      return;
    }

    if (orderItems.some(item => !item.itemId || item.qty <= 0 || item.rate < 0)) {
      setError("Please complete all items with valid quantity and rate");
      setLoading(false);
      return;
    }

    try {
      await updatePurchaseOrder(id, {
        ...formData,
        items: orderItems,
      });
      router.push(`/buying/${id}`);
    } catch (err: any) {
      setError(err.message || "Failed to update PO");
      setLoading(false);
    }
  };

  const addItem = () => {
    setOrderItems([...orderItems, { itemId: "", qty: 1, rate: 0 }]);
  };

  const removeItem = (index: number) => {
    if (orderItems.length === 1) return;
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...orderItems];
    (newItems[index] as any)[field] = value;
    
    if (field === "itemId" && value) {
      const selectedItem = items.find(i => i.id === value);
      if (selectedItem) {
        newItems[index].rate = Number(selectedItem.standardCost) || 0;
      }
    }
    
    setOrderItems(newItems);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this purchase order? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      await deletePurchaseOrder(id);
      router.push("/buying");
    } catch (err: any) {
      setError(err.message || "Failed to delete PO");
      setDeleting(false);
    }
  };

  const totalAmount = orderItems.reduce((sum, item) => {
    if (isNaN(item.qty) || isNaN(item.rate)) return sum;
    return sum + (item.qty * item.rate);
  }, 0);

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <Link href={`/buying/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Purchase Order
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete PO
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Purchase Order</h1>
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
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Supplier <span className="text-red-500">*</span></label>
              <select
                required
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="">Select a supplier</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2">Materials / Items</h3>
            
            <div className="space-y-4">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  <div className="flex-1 w-full">
                    <label className="text-xs font-medium text-slate-500 block mb-1">Item <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={item.itemId}
                      onChange={(e) => updateItem(idx, "itemId", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    >
                      <option value="">Select material...</option>
                      {items.map(i => (
                        <option key={i.id} value={i.id}>{i.code} - {i.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-full md:w-32">
                    <label className="text-xs font-medium text-slate-500 block mb-1">Quantity <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      required
                      min="0.1"
                      step="0.1"
                      value={isNaN(item.qty) ? "" : item.qty}
                      onChange={(e) => updateItem(idx, "qty", e.target.value === "" ? NaN : parseFloat(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="w-full md:w-32">
                    <label className="text-xs font-medium text-slate-500 block mb-1">Rate (₹) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={isNaN(item.rate) ? "" : item.rate}
                      onChange={(e) => updateItem(idx, "rate", e.target.value === "" ? NaN : parseFloat(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  
                  <div className="w-full md:w-32">
                    <label className="text-xs font-medium text-slate-500 block mb-1">Amount (₹)</label>
                    <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-white">
                      {isNaN(item.qty * item.rate) ? "0.00" : (item.qty * item.rate).toFixed(2)}
                    </div>
                  </div>

                  {orderItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="mt-6 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="mt-4 flex items-center gap-2 text-sm font-medium text-[#0d382c] dark:text-emerald-400 hover:underline"
            >
              <Plus className="w-4 h-4" />
              Add Material
            </button>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-zinc-800">
            <div className="text-right">
              <div className="text-sm text-slate-500">Total Value</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">₹{totalAmount.toFixed(2)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900 dark:text-white">Notes / Internal Remarks</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
              placeholder="Any special instructions..."
            />
          </div>

        </div>
        
        <div className="px-6 py-4 md:px-8 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <Link href={`/buying/${id}`} className="px-6 py-3 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
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
