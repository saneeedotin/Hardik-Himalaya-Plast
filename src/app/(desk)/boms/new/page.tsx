"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Workflow, Plus, Trash2 } from "lucide-react";
import { createBOM } from "../actions";
import { getItems } from "@/app/(desk)/items/actions";

export default function NewBOMPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const [items, setItems] = useState<any[]>([]);
  const finishedGoods = items.filter((i: any) => i.category === "FINISHED_GOODS");
  const rawMaterials = items.filter((i: any) => i.category !== "FINISHED_GOODS");

  const [formData, setFormData] = useState({
    name: "",
    fgItemId: "",
    outputQty: 1,
    scrapFactor: 0.02,
  });

  const [materials, setMaterials] = useState<{ rmItemId: string; qtyPerUnit: number }[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getItems();
      setItems(data);
      if (data.filter((i: any) => i.category === "FINISHED_GOODS").length > 0) {
        setFormData(f => ({ ...f, fgItemId: data.filter((i: any) => i.category === "FINISHED_GOODS")[0].id }));
      }
      setInitialLoading(false);
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (materials.length === 0) {
      setError("Please add at least one raw material.");
      setLoading(false);
      return;
    }

    try {
      await createBOM({
        name: formData.name,
        fgItemId: formData.fgItemId,
        outputQty: Number(formData.outputQty),
        scrapFactor: Number(formData.scrapFactor),
        materials: materials.map(m => ({ ...m, qtyPerUnit: Number(m.qtyPerUnit) }))
      });
      router.push(`/boms`);
    } catch (err: any) {
      setError(err.message || "Failed to create BOM");
      setLoading(false);
    }
  };

  const addMaterial = () => {
    if (rawMaterials.length > 0) {
      setMaterials([...materials, { rmItemId: rawMaterials[0].id, qtyPerUnit: 1 }]);
    }
  };

  if (initialLoading) return <div className="p-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <Link href="/boms" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to BOMs
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Workflow className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Create New BOM
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Define the recipe and materials for a finished good
        </p>
      </div>

      {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 p-6 space-y-6">
          <h2 className="text-lg font-semibold border-b border-slate-100 dark:border-zinc-800 pb-2">BOM Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                BOM Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all"
                placeholder="e.g. Standard 60mm Frame Profile"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Finished Good *
              </label>
              <select
                required
                value={formData.fgItemId}
                onChange={(e) => setFormData({ ...formData, fgItemId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all"
              >
                {finishedGoods.map((fg: any) => (
                  <option key={fg.id} value={fg.id}>{fg.name} ({fg.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Output Quantity
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.outputQty}
                onChange={(e) => setFormData({ ...formData, outputQty: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Scrap Factor (e.g. 0.02 = 2%)
              </label>
              <input
                type="number"
                step="0.001"
                required
                value={formData.scrapFactor}
                onChange={(e) => setFormData({ ...formData, scrapFactor: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all font-mono"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
            <h2 className="text-lg font-semibold">Raw Materials</h2>
            <button
              type="button"
              onClick={addMaterial}
              className="text-sm font-medium text-[#0d382c] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="space-y-4">
            {materials.length === 0 ? (
              <div className="text-center text-slate-500 py-4 text-sm">No raw materials added yet.</div>
            ) : (
              materials.map((mat, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-slate-50 dark:bg-[#090d12] p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Item</label>
                    <select
                      value={mat.rmItemId}
                      onChange={(e) => {
                        const newMats = [...materials];
                        newMats[idx].rmItemId = e.target.value;
                        setMaterials(newMats);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d382c]"
                    >
                      {rawMaterials.map((rm: any) => (
                        <option key={rm.id} value={rm.id}>{rm.name} ({rm.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Qty per Unit</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={mat.qtyPerUnit}
                      onChange={(e) => {
                        const newMats = [...materials];
                        newMats[idx].qtyPerUnit = parseFloat(e.target.value) || 0;
                        setMaterials(newMats);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d382c] font-mono"
                    />
                  </div>
                  <div className="sm:pt-5">
                    <button
                      type="button"
                      onClick={() => setMaterials(materials.filter((_, i) => i !== idx))}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/boms" className="px-6 py-3 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading || !formData.name || materials.length === 0} className="px-6 py-3 rounded-xl bg-[#0d382c] hover:bg-[#092b21] text-white font-semibold text-sm flex items-center justify-center transition-colors disabled:opacity-70 min-w-[140px]">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save BOM"}
          </button>
        </div>
      </form>
    </div>
  );
}
