"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, PackageSearch, Package } from "lucide-react";
import { getSalesOrder } from "@/app/(desk)/orders/actions";
import { getFGBatches, generateDeliveryNoteAndPack } from "../actions";

function PackingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const [order, setOrder] = useState<any>(null);
  const [batchesCache, setBatchesCache] = useState<Record<string, any[]>>({});
  
  // packing configuration state
  const [packingData, setPackingData] = useState<Record<string, { batchId: string, cartonCount: number, qtyPerCarton: number }>>({});

  useEffect(() => {
    async function load() {
      if (!orderId) {
        setError("No Order ID specified.");
        setInitialLoading(false);
        return;
      }
      try {
        const o = await getSalesOrder(orderId);
        if (!o) throw new Error("Order not found");
        setOrder(o);

        // Fetch batches for each item in the order
        const caches: Record<string, any[]> = {};
        for (const item of o.items) {
          caches[item.itemId] = await getFGBatches(item.itemId);
        }
        setBatchesCache(caches);

      } catch (err: any) {
        setError(err.message || "Failed to load order");
      } finally {
        setInitialLoading(false);
      }
    }
    load();
  }, [orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const itemsToPack = [];
      for (const item of order.items) {
        const conf = packingData[item.id];
        if (conf && conf.batchId && conf.cartonCount > 0 && conf.qtyPerCarton > 0) {
          itemsToPack.push({
            itemId: item.itemId,
            batchId: conf.batchId,
            cartonCount: Number(conf.cartonCount),
            qtyPerCarton: Number(conf.qtyPerCarton)
          });
        }
      }

      if (itemsToPack.length === 0) {
        throw new Error("No items configured for packing.");
      }

      await generateDeliveryNoteAndPack({
        salesOrderId: order.id,
        customerName: order.customerName,
        items: itemsToPack
      });

      router.push(`/dispatch`);
    } catch (err: any) {
      setError(err.message || "Failed to pack");
      setLoading(false);
    }
  };

  const handleUpdatePacking = (lineItemId: string, field: string, value: any) => {
    setPackingData(prev => ({
      ...prev,
      [lineItemId]: {
        ...(prev[lineItemId] || { batchId: "", cartonCount: 0, qtyPerCarton: 0 }),
        [field]: value
      }
    }));
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#0d382c]" />
      </div>
    );
  }

  if (error && !order) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href={`/orders/${orderId}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Order
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PackageSearch className="w-6 h-6 text-[#0d382c]" />
          Pack Order {order.orderNumber}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Select FG Batches and generate Carton Labels for dispatch.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2">
              Order Items to Pack
            </h3>

            {order.items.map((item: any) => {
              const batches = batchesCache[item.itemId] || [];
              const pData = packingData[item.id] || { batchId: "", cartonCount: 0, qtyPerCarton: 0 };
              const totalPacked = pData.cartonCount * pData.qtyPerCarton;

              return (
                <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{item.item.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">{item.item.code}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Ordered Qty</span>
                      <p className="font-bold text-slate-900 dark:text-white">{item.qty} {item.item.uom}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200 dark:border-zinc-700">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select FG Batch</label>
                      <select
                        value={pData.batchId}
                        onChange={e => handleUpdatePacking(item.id, 'batchId', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-xs"
                      >
                        <option value="">-- Choose Batch --</option>
                        {batches.map(b => (
                          <option key={b.id} value={b.id}>{b.batchNumber} (Avail: {b.quantity})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Carton Count</label>
                      <input
                        type="number" min="0" step="1"
                        value={pData.cartonCount}
                        onChange={e => handleUpdatePacking(item.id, 'cartonCount', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-xs"
                        placeholder="e.g. 10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Qty Per Carton ({item.item.uom})</label>
                      <input
                        type="number" min="0" step="0.01"
                        value={pData.qtyPerCarton}
                        onChange={e => handleUpdatePacking(item.id, 'qtyPerCarton', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-xs"
                        placeholder="e.g. 50"
                      />
                    </div>
                  </div>
                  
                  {totalPacked > 0 && (
                    <div className="flex justify-end pt-2">
                      <span className={`text-xs font-bold ${totalPacked > item.qty ? 'text-amber-500' : 'text-emerald-500'}`}>
                        Packing {totalPacked} {item.item.uom} total
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>
        
        <div className="px-6 py-4 md:px-8 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl bg-[#0d382c] hover:bg-[#092b21] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-70">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
            Generate Carton Labels & DN
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PackingPage() {
  return (
    <div className="p-4 md:p-8">
      <Suspense fallback={<div>Loading packing station...</div>}>
        <PackingForm />
      </Suspense>
    </div>
  );
}
