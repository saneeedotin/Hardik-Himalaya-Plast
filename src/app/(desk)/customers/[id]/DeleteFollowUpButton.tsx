"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteCustomerFollowUp } from "../actions";

export function DeleteFollowUpButton({ id, customerId }: { id: string, customerId: string }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this follow-up?")) return;
    setDeleting(true);
    try {
      await deleteCustomerFollowUp(id, customerId);
    } catch (e) {
      console.error(e);
      setDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={deleting}
      className="text-slate-400 hover:text-rose-500 transition-colors"
      title="Delete Follow-up"
    >
      {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  );
}
