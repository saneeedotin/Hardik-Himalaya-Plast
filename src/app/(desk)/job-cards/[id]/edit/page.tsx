"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { getJobCard, updateJobCard, deleteJobCard, getWorkstations, getDies, getOperators } from "../../actions";

export default function EditJobCardPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const [workstations, setWorkstations] = useState<any[]>([]);
  const [dies, setDies] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [jobCard, setJobCard] = useState<any>(null);

  const [formData, setFormData] = useState({
    workstationId: "",
    assignedUserId: "",
    dieId: "",
    status: "",
    goodQty: 0,
    scrapQty: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        const [w, d, o, jc] = await Promise.all([
          getWorkstations(),
          getDies(),
          getOperators(),
          getJobCard(id)
        ]);
        setWorkstations(w);
        setDies(d);
        setOperators(o);
        setJobCard(jc);
        
        if (jc) {
          setFormData({
            workstationId: jc.workstationId || "",
            assignedUserId: jc.assignedUserId || "",
            dieId: jc.dieId || "",
            status: jc.status || "QUEUED",
            goodQty: jc.goodQty || 0,
            scrapQty: jc.scrapQty || 0,
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

    if (!formData.workstationId) {
      setError("Please select a workstation");
      setLoading(false);
      return;
    }

    try {
      await updateJobCard(id, formData);
      router.push(`/work-orders/${jobCard.workOrderId}`);
    } catch (err: any) {
      setError(err.message || "Failed to update job card");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this job card?")) return;
    setDeleting(true);
    try {
      await deleteJobCard(id);
      router.push(`/work-orders/${jobCard.workOrderId}`);
    } catch (err: any) {
      setError(err.message || "Failed to delete job card");
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

  if (error && !workstations.length) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <Link href={`/work-orders/${jobCard?.workOrderId}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Work Order
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete Job Card
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Job Card</h1>
        <p className="text-sm text-slate-500 mt-1">
          Work Order: <span className="font-mono">{jobCard?.workOrder?.workOrderNumber}</span>
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
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="QUEUED">QUEUED</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

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
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Good Qty Produced</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.goodQty}
                onChange={(e) => setFormData({ ...formData, goodQty: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Scrap Qty Produced</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.scrapQty}
                onChange={(e) => setFormData({ ...formData, scrapQty: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

          </div>
        </div>
        
        <div className="px-6 py-4 md:px-8 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <Link href={`/work-orders/${jobCard?.workOrderId}`} className="px-6 py-3 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
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
