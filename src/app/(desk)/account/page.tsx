"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { Loader2, User as UserIcon, Save, Calendar, Phone, AtSign, Shield } from "lucide-react";

export default function AccountPage() {
  const { user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          dob: formData.dob || null,
          phone: formData.phone || null,
          bio: formData.bio || null,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        // Could technically update UserContext here or just force a page reload
        window.location.reload();
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#0d382c]" /></div>;
  }

  if (!user) {
    return <div className="p-8 text-center text-rose-500">You must be logged in to view this page.</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Account</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal information and profile settings.</p>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
        
        {/* Header Profile Section */}
        <div className="p-6 sm:p-8 bg-slate-50 dark:bg-[#090d12]/50 border-b border-slate-200/80 dark:border-zinc-800 flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-[#0d382c] text-white flex items-center justify-center text-2xl font-bold shadow-inner">
            {user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><AtSign className="w-3.5 h-3.5" /> {user.email}</span>
              <span className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-mono">
                <Shield className="w-3 h-3" /> {user.roles[0]?.role?.name || "User"}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm font-medium border border-rose-200 dark:border-rose-900/50">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-[#eaf3ef] dark:bg-[#162a24] text-[#0d382c] dark:text-emerald-400 text-sm font-medium border border-emerald-200 dark:border-emerald-900/50">
              Profile updated successfully!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Date of Birth
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                About Me (Bio)
              </label>
              <textarea
                rows={3}
                placeholder="Write a little bit about your role in the factory..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-[#090d12] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d382c] transition-all text-sm resize-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0d382c] hover:bg-[#08261e] text-white font-semibold text-sm transition-colors disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
