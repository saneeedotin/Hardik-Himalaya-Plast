"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createWorkstation } from "../actions";

export default function NewWorkstationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    hourlyRate: 0,
    status: "IDLE",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createWorkstation(formData);
      router.push("/workstations");
    } catch (err: any) {
      setError(err.message || "Failed to create workstation");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      <Link href="/workstations" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Workstations
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Workstation</h1>
        <p className="text-sm text-slate-500 mt-1">Add a new machine or production line</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Code (e.g., EX-01)</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="Unique machine code"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="Extrusion Line 01"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Hourly Rate (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="IDLE">IDLE</option>
                <option value="RUNNING">RUNNING</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 md:px-8 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <Link href="/workstations" className="px-6 py-3 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl bg-[#0d382c] hover:bg-[#092b21] text-white font-semibold text-sm flex items-center justify-center transition-colors disabled:opacity-70 min-w-[140px]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Workstation'}
          </button>
        </div>
      </form>
    </div>
  );
}
