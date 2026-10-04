import { getInventoryStatus, getStockLedgerEntries } from "./actions";
import { StockViewClient } from "./StockViewClient";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const [inventory, ledger] = await Promise.all([
    getInventoryStatus(),
    getStockLedgerEntries(),
  ]);

  return <StockViewClient inventory={inventory} ledger={ledger} />;
}
