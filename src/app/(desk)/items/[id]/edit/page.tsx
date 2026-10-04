"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Box, Trash2 } from "lucide-react";
import { getItem, updateItem, deleteItem } from "../../actions";

export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "FINISHED_GOODS",
    uom: "Meter",
    hsnCode: "",
    standardCost: 0,
    minStockLevel: 0,
  });

  useEffect(() => {
    async function load() {
      const data = await getItem(id);
      if (data) {
        setFormData({
          code: data.code,
          name: data.name,
          category: data.category,
          uom: data.uom,
          hsnCode: data.hsnCode || "",
          standardCost: Number(data.standardCost),
          minStockLevel: Number(data.minStockLevel),
        });
      }
      setInitialLoad(false);
    }
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await updateItem(id, {
        code: formData.code,
        name: formData.name,
        category: formData.category,
        uom: formData.uom,
        hsnCode: formData.hsnCode || undefined,
        standardCost: Number(formData.standardCost),
        minStockLevel: Number(formData.minStockLevel),
      });
      router.push(`/items`);
    } catch (err: any) {
      setError(err.message || "Failed to update item");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteItem(id);
      router.push("/items");
    } catch (err: any) {
      setError(err.message || "Failed to delete item. It might be used in BOMs or Orders.");
      setDeleting(false);
    }
  };

  if (initialLoad) return <div className="p-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" /></div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      <Link href="/items" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Items
      </Link>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Box className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Edit Item
          </h1>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete
        </button>
      </div>

      {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Item Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all"
            >
              <option value="FINISHED_GOODS">Finished Goods</option>
              <option value="RAW_MATERIAL">Raw Material</option>
              <option value="PACKAGING">Packaging</option>
              <option value="SCRAP">Scrap</option>
              <option value="CONSUMABLE">Consumable</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Unit of Measure (UOM) *
            </label>
            <select
              required
              value={formData.uom}
              onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all"
            >
              <option value="Meter">Meter (m)</option>
              <option value="Kg">Kilogram (kg)</option>
              <option value="Nos">Numbers (Nos)</option>
              <option value="Litre">Litre (L)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              HSN Code
            </label>
            <input
              type="text"
              value={formData.hsnCode}
              onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Standard Cost (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.standardCost}
              onChange={(e) => setFormData({ ...formData, standardCost: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Minimum Stock Level
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.minStockLevel}
              onChange={(e) => setFormData({ ...formData, minStockLevel: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all font-mono"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3">
          <Link href="/items" className="px-6 py-3 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading || !formData.name || !formData.code} className="px-6 py-3 rounded-xl bg-[#0d382c] hover:bg-[#092b21] text-white font-semibold text-sm flex items-center justify-center transition-colors disabled:opacity-70 min-w-[140px]">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
