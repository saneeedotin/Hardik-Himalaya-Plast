"use client";

import { useState } from "react";
import { checkMaterialAvailability } from "../actions";
import { Loader2, PackageSearch, CheckCircle, AlertTriangle } from "lucide-react";

export function MaterialCheckPanel({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const handleCheck = async () => {
    setLoading(true);
    try {
      const data = await checkMaterialAvailability(orderId);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
        <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <PackageSearch className="w-4 h-4 text-emerald-500" />
          Material Availability Check
        </h2>
        {!results && (
          <button
            onClick={handleCheck}
            disabled={loading}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-300"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Run Check"}
          </button>
        )}
      </div>

      <div className="p-0">
        {!results ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Run a material check to see if we have enough raw materials to fulfill this order based on the item BOMs.
          </div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No materials required or no BOM found for the ordered items.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
                <tr>
                  <th className="px-6 py-3">Raw Material</th>
                  <th className="px-6 py-3 text-right">Required Qty</th>
                  <th className="px-6 py-3 text-right">Available Qty</th>
                  <th className="px-6 py-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {results.map((req, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{req.rmItem.name}</td>
                    <td className="px-6 py-4 text-right font-mono">{req.requiredQty.toFixed(2)} {req.rmItem.uom}</td>
                    <td className="px-6 py-4 text-right font-mono">{req.availableQty.toFixed(2)} {req.rmItem.uom}</td>
                    <td className="px-6 py-4">
                      {req.status === "AVAILABLE" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                          <CheckCircle className="w-3.5 h-3.5" />
                          AVAILABLE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          SHORT
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
