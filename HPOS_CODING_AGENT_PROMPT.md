# HPOS — Coding Agent Prompt

You are building **HPOS (Himalaya Plast Operating System)** for **Himalaya Plast**, owner/stakeholder **Inzemam**.

Read and follow `HPOS_CODING_AGENT_SPEC.md` as the detailed business-process and implementation brief.

Also read the updated project docs:
- `00_README.md`
- `01_PRD.md`
- `02_TRD.md`
- `03_DESIGN_SYSTEM.md`
- `04_API_SPEC.md`
- `05_DATA_MODEL.md`
- `06_USER_STORIES.md`
- `07_RBAC.md`
- `08_TEST_PLAN.md`
- `09_DEPLOYMENT.md`

## Critical architecture rule

Build **custom Next.js + TypeScript + Prisma + PostgreSQL + Tailwind CSS**.

**Do NOT use ERPNext, Frappe, Vue/Frappe UI, or an ERPNext backend.** The old ERPNext documents are historical business reference only.

## Build around the real factory workflow

```text
Customer order/enquiry
→ Proforma
→ Raw-material availability check
→ Customer confirmation
→ Production
→ Waste/scrap + recovery
→ Detailed QC
→ Packing
→ Finished-goods inventory
→ Customer dispatch confirmation
→ QR/carton dispatch
→ Stock reduction
```

Also implement the parallel customer loop:

```text
Customer history
→ expected reorder window
→ follow-up reminder
→ sales contact
```

## Core modules

Build a clean ERP-style Desk UI for:

- Dashboard
- Orders
- Customers + Customer 360
- Items
- Suppliers + Supplier Leads
- Selling / Proformas / Sales Orders
- Buying
- Raw Material Stock
- Finished Goods Stock
- Scrap / Recycled Material
- Production / Work Orders / Job Cards
- Detailed QC templates + inspections
- Packing
- Dispatch + QR Scanner
- Accounts
- Reports
- Settings
- Machines later/secondary

## Important domain rules

- Inventory must be ledger-based and auditable.
- Batch genealogy must work both forward and backward.
- Material availability must compare required vs available vs reserved stock.
- Confirmed orders should require a confirmation method.
- Production output must be tied to production and batch records.
- QC must support PASS / REJECT / SCRAP / REWORK.
- QC must use structured measurement rows based on the supplied Himalaya Plast QC sheet.
- Only QC-cleared goods should normally become dispatch-ready.
- Carton scans must detect duplicate and wrong-order scans.
- Dispatch must block when expected cartons != scanned cartons unless an authorized override with a reason is supplied.
- Reorder dates are reminders/estimates, never fabricated confirmed orders.
- Important mutations require authentication, permission checks, validation, Prisma transactions, and audit logging.

## Implementation approach

First inspect the existing repository and current Prisma schema. Do not blindly rebuild architecture that already exists.

Build in vertical slices:

1. Foundation/auth/RBAC/audit/UI shell
2. Customers/items/suppliers/BOM
3. Order → Proforma → Material Check → Confirmation
4. Buying + raw-material inventory + batch ledger
5. Production + waste/recovery
6. QC
7. Packing + finished inventory
8. Dispatch + QR scanner
9. Order Timeline + Founder Dashboard + reorder follow-ups
10. Testing, UAT, hardening, deployment

Use Server Components for reads, Server Actions for normal mutations, and Route Handlers where client-heavy operations or external integrations need them.

Use Zod validation, strict TypeScript, Prisma transactions, server-side RBAC, responsive Tailwind UI, and Vitest/Playwright testing.

Do not invent client-specific BOMs, GST details, QC limits, material grades, accounting integrations, or legal information. Mark unresolved points clearly and build configurable placeholders where appropriate.

Before declaring a feature complete, verify the database model, business rules, RBAC, audit trail, UI states, tests, and end-to-end workflow.

**Start by reading `HPOS_CODING_AGENT_SPEC.md`, inspecting the existing repo, and producing a short implementation assessment before making destructive architectural changes.**
