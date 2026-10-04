"use client";

import { useState } from "react";
import { logCustomerFollowUp } from "../actions";
import { Loader2, Plus, Calendar } from "lucide-react";

export function LogFollowUpForm({ customerId }: { customerId: string }) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [nextOrderDate, setNextOrderDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await logCustomerFollowUp({
        customerId,
        notes,
        expectedNextOrderDate: nextOrderDate ? new Date(nextOrderDate) : undefined,
      });
      setNotes("");
      setNextOrderDate("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to log follow-up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden p-6 space-y-4">
      <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
        <Plus className="w-4 h-4 text-emerald-600" />
        Log Follow-Up
      </h3>

      {error && <div className="text-xs text-rose-500 bg-rose-50 p-2 rounded">{error}</div>}
      {success && <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded">Follow-up saved!</div>}

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
          Discussion Notes
        </label>
        <textarea
          required
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Discussed new profiles..."
          className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
          Expected Next Order (Optional)
        </label>
        <div className="relative">
          <input
            type="date"
            value={nextOrderDate}
            onChange={(e) => setNextOrderDate(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all"
          />
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !notes.trim()}
        className="w-full py-2.5 rounded-xl bg-[#0d382c] hover:bg-[#08261e] text-white font-semibold text-sm flex items-center justify-center transition-colors disabled:opacity-70"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Record"}
      </button>
    </form>
  );
}
