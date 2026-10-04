# Dashboard Checklist

The first screen a user sees after logging in, providing an at-a-glance overview of the most relevant data, actions, and recent activity.

- [x] Welcome state — A brief summary of what's happened since the last visit immediately re-orients returning users
  - 💡 Personalised greeting ("Welcome back, Param 👋") + Shift status & open work summary
- [x] Key metrics — The numbers most relevant to the user's goals, readable without leaving the home screen
  - 💡 Time period context filter (Current Shift, Today, This Week, Month) gives numbers meaning at a glance
- [x] Recent activity & Order Timeline — The live order stage progression (Proforma → Confirmed → Production → QC → Packed → Dispatched)
- [x] Needs attention — Time-sensitive items requiring decisions (raw material threshold shortages & factory alerts) surfaced directly
- [x] Quick actions — Shortcuts to the most common tasks (New Order, Extrusion Run, 5-Sample QC, Gate Scan, Customer Loop, Tally Export)
- [x] Empty state — Informative fallbacks when queues are clear with direct first actions
- [x] Layout control & Tabs — Tab controls for Overview, Order Timeline, Needs Attention, and Customer Reorders

## Phase 2: Operational Nerve Center & Business Logic (Completed)
- [x] **Unified Order Lifecycle Cockpit (`/orders/[id]`)**: Single scrollable operating cockpit with sticky milestone jump anchors (Customer & Commercial, BOM Material Check, Confirmation & Lock, Extrusion Floor, 5-Sample QC, Carton Serialization, Dispatch Gate, Book Keeper Export).
- [x] **Strict Hard Gate BOM Check**: 100% material availability required before order confirmation (Zero Override). Calculates compound requirement taking 2.5% scrap allowance into account.
- [x] **1-Click Shortage Replenishment**: Generates prefilled draft Purchase Order (`BUY-PO-...`) for exact material deficits with 1 click.
- [x] **2-Phase Atomic Stock Reservation**: Locks raw materials upon confirmation (`Available = Physical - Reserved`). Strictly forbids negative inventory in stock ledger.
- [x] **Extrusion BOM Consumption**: Production logging automatically deducts RM compound and releases reservations.
- [x] **Book Keeper Exclusive Integration**: Replaced Tally XML with Book Keeper CSV/Excel voucher exports (`/bookkeeper`) for Sales Invoices and Material Issues.
- [x] **Factory Command Notification Center**: Expanded header bell popover with [Alerts & Action Items] cards (`[Create PO]`, `[Open Order Cockpit]`, `[Open QC Station]`, `[Scan at Gate]`) and [Activity History].
- [x] **3-Tier Stock Ledger**: Structured view for Raw Materials, Finished Goods, and Recovered Regrind with Physical, Reserved, and Net Available balances.