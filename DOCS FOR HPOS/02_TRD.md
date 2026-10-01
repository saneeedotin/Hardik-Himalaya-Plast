# Technical Requirements Document (TRD)
## Himalaya Plast Operating System (HPOS)

This document is written to be executable by an AI coding agent (Claude Code / Cursor) with terminal/bench access. It specifies platform, environment, module configuration strategy, custom app architecture, and integration points.

---

## 1. Platform Decision

**Core platform:** Frappe Framework v15 + ERPNext (latest stable release compatible with v15). No separate backend/frontend stack is built for Phase 0–1 — ERPNext's native modules ARE the product for this phase.

**Rationale (per pitch deck's own argument):** The business's real-world objects (customers, quotations, batches, machines, operators, quality inspections, cartons, invoices, payments) map close to 1:1 onto ERPNext's native DocTypes. Estimated coverage: ~70% native configuration, ~30% custom development (`hpos_extensions` app), vs. 6–9 months to reach the same baseline building from zero. Rebuilding this as a standalone webapp would mean re-implementing accounting, inventory, manufacturing, and GST compliance logic that ERPNext already provides and is legally/functionally non-trivial (especially GST e-Invoicing/e-Way Bill).

**Custom app architecture:**
- All Phase 2 custom screens live in **one custom Frappe app**, `hpos_extensions`, installed on the same site as ERPNext.
- `hpos_extensions` reads/writes native DocTypes (Sales Order, Work Order, Job Card, Quality Inspection, Delivery Note, Packing Slip) via the Frappe ORM/API — it does **not** maintain its own duplicate data store.
- Backend: Python, using Frappe's `frappe.client` API patterns — whitelisted methods (`@frappe.whitelist()`), Server Scripts where appropriate for lightweight logic, and a proper custom app (not Server Scripts alone) for anything with real business logic, migrations, or fixtures.
- Frontend for Desk-embedded screens (Order Timeline, Founder Dashboard): **Vue 3 via Frappe UI** (`frappe-ui` npm package) — this is the officially supported way to build custom pages inside the Frappe Desk, gives you session auth, realtime socket, and consistent styling "for free."
- Frontend for QR Dispatch Scan: a **standalone responsive web page** served from the same Frappe app (Frappe's `www/` folder or a dedicated route), using the browser's `getUserMedia`/`BarcodeDetector` API (or a JS barcode library such as `html5-qrcode` if `BarcodeDetector` support is insufficient on target devices) — built this way because it's used on shop-floor mobile devices where a full Desk session may be heavier than needed, but still authenticates via the same Frappe session/API key.

## 2. Environments

| Environment | Purpose | Notes |
|---|---|---|
| **Local dev** | Development, bench setup, custom app work | `bench` CLI, Docker-based `frappe_docker` recommended for reproducibility |
| **Staging** | Client review, UAT before each phase go-live | Mirrors production site config; seeded with anonymized/sample data |
| **Production** | Live Himalaya Plast operations | Frappe Cloud (recommended) or self-hosted — see Deployment doc |

## 3. Local Development Setup (for the coding agent)

```bash
# Prerequisites: Python 3.11+, Node 18+, Redis, MariaDB 10.6+/PostgreSQL 14+, wkhtmltopdf
pip install frappe-bench

bench init hpos-bench --frappe-branch version-15
cd hpos-bench

bench new-site hpos.local --admin-password <set-securely>
bench get-app erpnext --branch version-15
bench get-app india_compliance https://github.com/resilient-tech/india-compliance --branch version-15
bench --site hpos.local install-app erpnext
bench --site hpos.local install-app india_compliance

# Scaffold the custom app
bench new-app hpos_extensions
bench --site hpos.local install-app hpos_extensions

bench start
```

**Custom app structure (`hpos_extensions`):**
```
hpos_extensions/
├── hpos_extensions/
│   ├── hooks.py                    # app hooks, doc_events, fixtures list
│   ├── config/
│   ├── fixtures/                   # custom fields, workflows, roles, print formats — exported for repeatable deploys
│   ├── hpos_extensions/
│   │   ├── doctype/                # only if new DocTypes are needed (see Data Model doc — none required for Order Timeline/Founder Dashboard; possibly one for QR scan logs)
│   │   ├── api/
│   │   │   ├── order_timeline.py   # whitelisted methods for Order Timeline aggregation
│   │   │   ├── founder_dashboard.py
│   │   │   └── dispatch_scan.py
│   │   └── www/
│   │       └── dispatch-scan/      # standalone QR scan page
│   └── public/
│       └── js/                     # Vue components for Desk-embedded pages
```

## 4. Module-by-Module Configuration Notes (Phase 1)

| Module | ERPNext DocTypes Used | Configuration Required | Custom Work |
|---|---|---|---|
| Selling | Lead, Opportunity, Quotation, Sales Order | Standard setup, price lists, tax templates | Custom Select field `approval_method` on Sales Order, set via a client script or workflow action when status → Approved |
| Buying | Supplier, Purchase Order, Purchase Receipt, Purchase Invoice | Standard setup | None |
| Stock | Item, Item Group, Batch, Warehouse, Stock Entry | Enable batch-wise tracking (`has_batch_no`) on relevant items; configure warehouses per plant | None |
| Manufacturing | BOM, Production Plan, Work Order, Job Card | Configure Workstations (machines), Operations; enable Job Card time logs | None — Job Card natively carries Workstation + Employee |
| Quality Management | Quality Inspection Template, Quality Inspection | One QIT per product code with Reading parameters (Pin Size, Width, Leg, Weight, Profile Fit Test) | **Frappe Workflow** on Quality Inspection to extend binary Accepted/Rejected into 4-state (Pass/Reject/Scrap/Rework), with a linked Stock Entry (Rework) triggered on Reject/Scrap outcome |
| Assets | Asset, Asset Maintenance | Register machines as Assets or use Asset Maintenance module for scheduling | None (evaluate if simple maintenance log suffices vs. full Assets depreciation — flag to client) |
| Accounts | Sales Invoice, Purchase Invoice, Payment Entry, Payment Terms Template | Chart of Accounts, tax templates, payment terms | India Compliance app handles e-Invoice/IRN + E-Way Bill generation on Sales Invoice submit — configure GSTIN, e-Invoice API credentials |
| Packing & Dispatch | Packing Slip, Delivery Note | Standard setup; add Transporter/Vehicle/LR custom fields if not already present in the ERPNext version in use | Verify Packing Slip carton-wise fields meet requirement; add custom fields only if gaps found |
| Frappe Core | Role, User, Workflow, Notification | Role-based permissions per RBAC doc | None |

## 5. Custom App — Feature Specs (Phase 2 subset)

### 5.1 Order Timeline
- **Trigger:** Opened from a button/link on Sales Order, or as a standalone search-by-order-number page.
- **Backend:** `get_order_timeline(sales_order)` whitelisted method — queries linked Quotation, Sales Order, Production Plan, Work Order(s), Job Card(s), Quality Inspection(s), Packing Slip, Delivery Note, Sales Invoice via Frappe's `frappe.get_all` with `sales_order` link filters; returns a structured stage list with status + timestamp per stage.
- **Frontend:** Vue 3 stepper component rendering the 10-stage flow (Lead/Opportunity → Quotation → Sales Order → Production Plan → Work Order → Job Card → Quality Inspection → Packing Slip → Delivery Note → Sales Invoice), highlighting current stage, with drill-down links to each native document.
- **No new DocType required** — pure read aggregation.

### 5.2 Founder Dashboard
- **Backend:** `get_business_health()` whitelisted method aggregating:
  - At-risk orders: Sales Orders past expected delivery date and not yet delivered.
  - Payments overdue: Sales Invoices past due date per Payment Terms, unpaid/partially paid.
  - Production status: open Work Orders by status, machine utilization from Job Card time logs.
  - Today's dispatch: Delivery Notes created/submitted today.
  - **Business Health Score:** a computed composite (e.g., weighted score from on-time delivery %, overdue payment %, QC reject rate) — exact formula to be defined with the client once real data volume exists; ship a v1 formula behind a clearly labeled "beta" indicator.
- **Frontend:** Vue 3 single-screen dashboard, card-based layout (see Design System doc), auto-refresh via polling or Frappe realtime socket.
- **No new DocType required** for the dashboard itself; if the health-score formula needs configurable weights, add one small Singleton DocType (`HPOS Settings`) to store them.

### 5.3 QR Dispatch Scan
- **Backend:** `verify_carton_scan(delivery_note, carton_code)` whitelisted method — looks up the scanned carton code against Packing Slip items linked to the Delivery Note; returns match/mismatch status.
- **New DocType required:** `HPOS Carton Label` (or reuse Packing Slip Item with a `carton_code`/QR field) to store the carton→packing-slip-item mapping generated at packing time, printed as a QR code on the carton label.
- **Frontend:** Standalone mobile-responsive page (`www/dispatch-scan`), camera-based scan using `BarcodeDetector` API with `html5-qrcode` fallback, shows running tally of scanned vs. expected cartons for the selected Delivery Note, blocks dispatch confirmation until counts reconcile (or allows override with a reason, logged).
- **Print format:** Carton label print format generating the QR code (Frappe supports QR code generation natively via `frappe.utils.barcode` or a barcode field type).

## 6. Integrations

| Integration | Status this phase | Notes |
|---|---|---|
| India Compliance app (GST e-Invoice, e-Way Bill) | **In scope** | Open-source Frappe app, no license cost |
| Company website | Out of scope | Deferred per client scoping questions |
| Email | Out of scope this phase (native Frappe email/notifications only) | AI Email drafting is Phase 4 |
| Shipping providers | Out of scope | Not requested |
| Barcode scanners/printers | **In scope for QR Dispatch Scan** | Confirm with client: dedicated hardware scanners vs. phone/tablet camera-based scanning — affects whether `BarcodeDetector`/camera flow is sufficient or a hardware SDK integration is needed |

## 7. Security & Compliance Notes
- GSTIN(s), e-Invoicing, and E-Way Bill thresholds must be confirmed with the client (open item in PRD §7) before India Compliance app configuration is finalized.
- Role-based access control per RBAC.md — no custom screen should expose data a user's native ERPNext role wouldn't already permit; `hpos_extensions` API methods must re-check permissions server-side (`frappe.has_permission`), not rely on frontend hiding.
- Audit trail: use Frappe's native document versioning/audit trail (Phase 0 Frappe Core module) — no separate audit logging needed for native DocTypes. Custom `HPOS Carton Label` scans should be logged with user + timestamp for dispatch accountability.

## 8. Non-Functional Requirements
- **Performance:** Founder Dashboard and Order Timeline should load in <2s for typical data volumes (assume low-hundreds of open orders at a time for a factory this size — revisit if actual volume differs).
- **Availability:** Standard Frappe Cloud SLA if hosted there; if self-hosted, target 99% uptime with daily backups (see Deployment doc).
- **Mobile:** QR Dispatch Scan must work on mid-range Android devices with a rear camera, in a warehouse/shop-floor lighting environment.
- **Browser support:** Latest Chrome/Edge/Safari (Desk UI is a Frappe framework constraint); QR scan page tested specifically on Chrome for Android given shop-floor device assumption.
