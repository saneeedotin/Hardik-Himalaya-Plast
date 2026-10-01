# Roles & Permissions (RBAC)
## Himalaya Plast Operating System (HPOS)

Built on Frappe's native Role-Permission-Manager (Role → DocType permission matrix) plus User Permissions for record-level restriction (e.g., restricting a plant manager to their own Warehouse/Plant). Custom app API endpoints re-check these same permissions server-side (see TRD §7, API_SPEC.md).

## 1. Roles (mapped to personas from the PRD)

| Frappe Role | Persona | Notes |
|---|---|---|
| `System Manager` | Admin/IT (Param) | Full access; used sparingly, day-to-day admin should use a scoped custom role where possible |
| `HPOS Founder` (custom role) | Founder/Owner | Read access across all modules + exclusive access to Founder Dashboard; no create/write on transactional documents unless also holding another role |
| `Sales User` / `Sales Manager` (native ERPNext roles) | Sales Executive | Create/edit Lead, Opportunity, Quotation, Sales Order; read-only on Stock/Manufacturing |
| `Manufacturing User` / `Manufacturing Manager` (native) | Production Planner | Create/edit Production Plan, Work Order; read on BOM, Stock |
| `HPOS Operator` (custom role, scoped from Manufacturing User) | Machine Operator | Create/edit assigned Job Cards only (via User Permission scoping to their Employee record); no access to Sales/Accounts data |
| `Quality Manager` (native) | QC Inspector | Create/edit Quality Inspection, Quality Inspection Template; read on Stock, Manufacturing |
| `Stock User` / `Stock Manager` (native) | Store/Warehouse Staff | Create/edit Purchase Receipt, Stock Entry, Packing Slip, Delivery Note; access to QR Dispatch Scan screen |
| `Accounts User` / `Accounts Manager` (native) | Accounts Executive | Create/edit Sales Invoice, Purchase Invoice, Payment Entry; read on Sales Order/Purchase Order |
| `HPOS Warehouse Scan` (custom role, minimal) | Shop-floor scan users on shared devices | **Only** permission needed: access to QR Dispatch Scan page + its API endpoints. Deliberately narrow — a shared warehouse tablet shouldn't have broader Desk access |

## 2. Permission Matrix — Native Modules

| Module / DocType | Sales | Production Planner | Operator | QC Inspector | Warehouse Staff | Accounts | Founder | Admin |
|---|---|---|---|---|---|---|---|---|
| Lead / Opportunity / Quotation | RW | R | – | – | – | R | R | RW |
| Sales Order | RW | R | – | – | R | R | R | RW |
| Purchase Order / Supplier | R | R | – | – | RW | RW | R | RW |
| Purchase Receipt | – | R | – | R | RW | R | R | RW |
| BOM / Production Plan / Work Order | R | RW | R (own) | R | R | – | R | RW |
| Job Card | – | RW | RW (own, assigned only) | R | – | – | R | RW |
| Quality Inspection / Template | – | R | – | RW | R | – | R | RW |
| Stock Entry / Batch / Warehouse | – | R | – | R | RW | R | R | RW |
| Packing Slip / Delivery Note | R | – | – | R | RW | R | R | RW |
| Sales Invoice / Payment Entry | R | – | – | – | R | RW | R | RW |
| Asset / Asset Maintenance | – | R | R (own machine) | – | – | – | R | RW |
| Reports (P&L, GST, etc.) | – | – | – | – | – | R | R | RW |

*R = Read, RW = Read/Write, "–" = no access, "(own)" = User Permission-scoped to records linked to that user's Employee record.*

## 3. Permission Matrix — Custom Screens

| Screen | Sales | Production Planner | Operator | QC Inspector | Warehouse Staff | Accounts | Founder | Admin |
|---|---|---|---|---|---|---|---|---|
| Order Timeline | ✅ | ✅ | – | ✅ | ✅ | ✅ | ✅ | ✅ |
| Founder Dashboard | – | – | – | – | – | – | ✅ | ✅ |
| QR Dispatch Scan | – | – | – | – | ✅ | – | – | ✅ |

**Rationale:** Order Timeline surfaces no financial data beyond order/stage status, so it's broadly readable by anyone with a legitimate reason to check order progress. Founder Dashboard aggregates payment/financial data and is deliberately restricted. QR Dispatch Scan is an operational tool restricted to warehouse staff + admin.

## 4. Row-Level Restrictions (User Permissions)
- **Machine Operators** are restricted via User Permission to only see/edit Job Cards where the assigned Employee matches their linked Employee record.
- **Plant-level restriction** (if Himalaya Plast confirms multiple manufacturing plants — see PRD open items): User Permission on Warehouse/Company field to restrict staff to their own plant's data, once plant count and structure are confirmed.

## 5. Audit & Accountability
- Native Frappe document versioning covers all standard DocTypes (who changed what, when) — no extra work needed.
- `HPOS Carton Label` scan events (custom DocType) log `scanned_by` + `scanned_at` explicitly, since this is a new record type without native version history relevance for a physical scan action.
- Dispatch override events (API_SPEC.md §3, `confirm_dispatch` with `override=true`) must always log the override reason and the confirming user — this is a compliance-sensitive action (goods leaving without a reconciled carton count).

## 6. Open Items
- [ ] Confirm actual department/organization structure and user list from client (PRD §7 — "Organization & Users" section of the Initial Data Request docx not yet completed) to finalize exact role assignments per named user.
- [ ] Confirm number of manufacturing plants/warehouses to determine whether plant-level User Permission scoping is needed in Phase 1 or can be deferred.
