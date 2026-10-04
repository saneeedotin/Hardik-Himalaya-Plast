"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createJobCard, getWorkstations, getDies, getOperators } from "../actions";
import { getWorkOrder } from "@/app/(desk)/work-orders/actions";

function JobCardForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workOrderId = searchParams.get("workOrderId");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const [workstations, setWorkstations] = useState<any[]>([]);
  const [dies, setDies] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [wo, setWo] = useState<any>(null);

  const [formData, setFormData] = useState({
    workstationId: "",
    assignedUserId: "",
    dieId: "",
  });

  useEffect(() => {
    async function load() {
      if (!workOrderId) {
        setError("Missing Work Order ID");
        setInitialLoading(false);
        return;
      }
      try {
        const [w, d, o, workOrder] = await Promise.all([
          getWorkstations(),
          getDies(),
          getOperators(),
          getWorkOrder(workOrderId)
        ]);
        setWorkstations(w);
        setDies(d);
        setOperators(o);
        setWo(workOrder);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setInitialLoading(false);
      }
    }
    load();
  }, [workOrderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.workstationId) {
      setError("Please select a workstation");
      setLoading(false);
      return;
    }

    try {
      await createJobCard({
        ...formData,
        workOrderId,
      });
      router.push(`/work-orders/${workOrderId}`);
    } catch (err: any) {
      setError(err.message || "Failed to create job card");
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

  if (error && !workstations.length) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <Link href={`/work-orders/${workOrderId}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Work Order
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Job Card</h1>
        <p className="text-sm text-slate-500 mt-1">
          Assign Work Order <span className="font-mono">{wo?.workOrderNumber}</span> to a machine
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
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Workstation / Machine <span className="text-red-500">*</span></label>
              <select
                required
                value={formData.workstationId}
                onChange={(e) => setFormData({ ...formData, workstationId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="">Select a machine</option>
                {workstations.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Operator (Optional)</label>
              <select
                value={formData.assignedUserId}
                onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="">Unassigned</option>
                {operators.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Die (Optional)</label>
              <select
                value={formData.dieId}
                onChange={(e) => setFormData({ ...formData, dieId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="">Select a die</option>
                {dies.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

          </div>
        </div>
        
        <div className="px-6 py-4 md:px-8 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <Link href={`/work-orders/${workOrderId}`} className="px-6 py-3 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl bg-[#0d382c] hover:bg-[#092b21] text-white font-semibold text-sm flex items-center justify-center transition-colors disabled:opacity-70 min-w-[140px]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assign Job'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex justify-center h-96 items-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <JobCardForm />
    </Suspense>
  );
}
