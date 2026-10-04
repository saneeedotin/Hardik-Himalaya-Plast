import { getItems } from "./actions";
import Link from "next/link";
import { Box, Plus, Settings2, Package, Recycle, Beaker } from "lucide-react";

export const dynamic = "force-dynamic";

function getCategoryIcon(category: string) {
  switch (category) {
    case "FINISHED_GOODS": return <Package className="w-4 h-4" />;
    case "RAW_MATERIAL": return <Beaker className="w-4 h-4" />;
    case "SCRAP": return <Recycle className="w-4 h-4" />;
    default: return <Box className="w-4 h-4" />;
  }
}

export default async function ItemsListPage() {
  const items = await getItems();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Box className="w-6 h-6 text-[#0d382c] dark:text-emerald-400" />
            Item Master
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage Raw Materials, Finished Goods, and Packaging items
          </p>
        </div>
        <Link
          href="/items/new"
          className="bg-[#0d382c] hover:bg-[#092b21] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Item
        </Link>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">Item Code</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">UOM</th>
                <th className="px-6 py-4 text-right">Std Cost</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No items found. Create your first item to get started.
                  </td>
                </tr>
              ) : (
                items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-slate-900 dark:text-white">
                        {item.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-normal min-w-[250px]">
                      <span className="font-medium">{item.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 w-max text-slate-600 dark:text-slate-400">
                        {getCategoryIcon(item.category)}
                        {item.category.replace("_", " ")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{item.uom}</td>
                    <td className="px-6 py-4 text-right font-medium">
                      ₹{item.standardCost.toString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/items/${item.id}/edit`}
                        className="text-sm font-medium text-[#0d382c] dark:text-emerald-400 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
