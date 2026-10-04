"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { Loader2, ArrowRightLeft, Cpu, FileText, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ShiftHandoverPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  
  const [workstations, setWorkstations] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    shiftType: "MORNING",
    workstationId: "",
    scrapGeneratedQty: 0,
    notes: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // In a real app, we would fetch the list of workstations. We can just hardcode or fetch from an API.
  useEffect(() => {
    // For demo purposes, we'll fetch from a generic endpoint or hardcode a couple.
    // In production, we'd fetch `/api/production/workstations`.
    setWorkstations([
      { id: "cm1shk1aa0000abc123", name: "Extrusion Line 01" },
      { id: "cm1shk1bb0000def456", name: "Extrusion Line 02" }
    ]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/production/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shiftType: formData.shiftType,
          workstationId: formData.workstationId || workstations[0]?.id,
          scrapGeneratedQty: Number(formData.scrapGeneratedQty),
          notes: formData.notes
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/production"), 2000);
      } else {
        setError(data.error || "Failed to submit handover");
      }
    } catch (err) {
      setError("An offline error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <ArrowRightLeft className="w-6 h-6 text-[#0d382c]" />
          Shift Handover
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete this form at the end of your shift to pass machine status to the next operator.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
        
        {success ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Handover Logged Successfully!</h2>
            <p className="text-slate-500">Redirecting to production floor...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-600 text-sm font-medium border border-rose-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Shift
                </label>
                <select
                  value={formData.shiftType}
                  onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d382c]"
                >
                  <option value="MORNING">Morning (08:00 - 16:00)</option>
                  <option value="EVENING">Evening (16:00 - 00:00)</option>
                  <option value="NIGHT">Night (00:00 - 08:00)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Workstation
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <select
                    value={formData.workstationId}
                    onChange={(e) => setFormData({ ...formData, workstationId: e.target.value })}
                    className="w-full pl-10 p-2.5 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d382c]"
                  >
                    {workstations.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Total Purge Scrap (Kg)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  required
                  value={formData.scrapGeneratedQty}
                  onChange={(e) => setFormData({ ...formData, scrapGeneratedQty: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d382c]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Operator Notes / Issues
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 flex items-start pointer-events-none text-slate-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <textarea
                    rows={4}
                    required
                    placeholder="Mention any machine issues, material shortages, or pending tasks..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full pl-10 p-2.5 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d382c] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-zinc-800">
              <div className="text-xs text-slate-500">
                Handing over as <strong>{user?.name}</strong>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0d382c] hover:bg-[#08261e] text-white font-semibold text-sm transition-colors disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Handover"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
