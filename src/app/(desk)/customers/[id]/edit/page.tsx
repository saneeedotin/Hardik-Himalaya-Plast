"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Users, Trash2 } from "lucide-react";
import { getCustomer, updateCustomer, deleteCustomer } from "../../actions";

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    gstin: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    async function load() {
      const data = await getCustomer(id);
      if (data) {
        setFormData({
          name: data.name,
          gstin: data.gstin || "",
          email: data.email || "",
          phone: data.phone || "",
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
      await updateCustomer(id, {
        name: formData.name,
        gstin: formData.gstin || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
      });
      router.push(`/customers/${id}`);
    } catch (err: any) {
      setError(err.message || "Failed to update customer");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this customer? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteCustomer(id);
      router.push("/customers");
    } catch (err: any) {
      setError(err.message || "Failed to delete customer. Ensure they have no dependent records.");
      setDeleting(false);
    }
  };

  if (initialLoad) return <div className="p-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" /></div>;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <Link href={`/customers/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Customer
      </Link>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Edit Customer
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
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Company Name *
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
            GSTIN
          </label>
          <input
            type="text"
            value={formData.gstin}
            onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all font-mono"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3">
          <Link href={`/customers/${id}`} className="px-6 py-3 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading || !formData.name} className="px-6 py-3 rounded-xl bg-[#0d382c] hover:bg-[#092b21] text-white font-semibold text-sm flex items-center justify-center transition-colors disabled:opacity-70 min-w-[140px]">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
