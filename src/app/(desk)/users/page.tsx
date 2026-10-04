"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { Loader2, UserPlus, Shield, Check, X, RefreshCw } from "lucide-react";

export default function UsersPage() {
  const { user, can, loading: userLoading } = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && can("users", "read")) {
      fetchUsers();
    }
  }, [user]);

  if (userLoading || loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#0d382c]" /></div>;
  }

  if (!can("users", "read")) {
    return <div className="p-8 text-center text-rose-500">You do not have permission to view this page.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">User Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage factory access and roles.</p>
        </div>
        {can("users", "create") && (
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0d382c] text-white rounded-xl text-sm font-semibold hover:bg-[#08261e] transition-colors">
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-[#090d12] border-b border-slate-200/80 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">User</th>
              <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Roles</th>
              <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-[#090d12]/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map((r: any) => (
                      <span key={r.roleId} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                        <Shield className="w-3 h-3" />
                        {r.role.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {u.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eaf3ef] dark:bg-[#162a24] text-[#0d382c] dark:text-emerald-400 text-xs font-medium">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
                      <X className="w-3 h-3" /> Inactive
                    </span>
                  )}
                  {u.lockedUntil && new Date(u.lockedUntil) > new Date() && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs font-medium">
                      Locked
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {can("users", "update") && (
                    <button className="text-xs text-[#0d382c] dark:text-emerald-400 font-semibold hover:underline">
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
