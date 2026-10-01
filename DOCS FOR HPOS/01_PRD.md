# Product Requirements Document (PRD)
## Himalaya Plast Operating System (HPOS) — Built on ERPNext

**Scope covered by this document:** Phase 0 (Foundation) + Phase 1 (Core Native Modules) + a subset of Phase 2 (Custom Extensions: Order Timeline, Founder Dashboard, QR Dispatch Scan).
**Out of scope for this phase:** Planning Board (deferred to Phase 3), AI Email & Demand Forecast (deferred to Phase 4). These are stubbed as "future phase" in the Data Model and TRD so nothing built now blocks them later.

**Status:** Draft — working from the HPOS pitch deck's assumptions. No real Himalaya Plast operational data (chart of accounts, item master, BOMs, customer/supplier lists) has been supplied yet. Every numeric/process assumption below is sourced from the pitch deck and must be re-validated against the completed "ERPNext Initial Data & Information Request" before Phase 1 sign-off.

---

## 1. Background & Problem Statement

Himalaya Plast is a manufacturer of uPVC Gaskets & TPE Extrusion Profiles. The business currently runs on a combination of WhatsApp, Excel, phone calls, and paper QC sheets. Six specific pain points motivate this project:

| # | Area | Current State |
|---|------|----------------|
| 1 | Order Tracking | No live visibility — status only exists by asking people directly |
| 2 | Production Planning | Machine scheduling lives in one person's experience, not a system |
| 3 | Quality Control | QC sheets are paper — no digital history, no trend analysis |
| 4 | Inventory | No batch tracking, no consumption tracking, no material traceability |
| 5 | Dispatch | Manual document handling — no centralized dispatch screen |
| 6 | Founder Visibility | No single dashboard for business health, at-risk orders, or payments due |

## 2. Goal

Replace ad-hoc, paper/WhatsApp-based operations with a single connected system — ERPNext configured natively for Himalaya Plast's order-to-cash and procure-to-pay flows, plus a small set of custom screens where ERPNext's native Desk UI doesn't fit the shop-floor/founder use case.

**Guiding principle (from the pitch deck):** This is "not a new system, a new screen." ERPNext's native data model (customers, quotations, batches, machines, operators, quality inspections, cartons, invoices, payments) already matches the business almost object-for-object. Custom work should stay a thin layer on top of native DocTypes, never a parallel system.

## 3. Users / Personas

| Persona | Role | Primary Needs |
|---|---|---|
| **Founder / Owner** | Business owner | Single-screen visibility into order health, at-risk orders, payments due, production status — without asking staff |
| **Sales Executive** | Order intake | Fast quotation → sales order creation, order status visibility, approval trail |
| **Production Planner** | Shop floor scheduling | Convert sales orders into work orders/job cards, see machine load |
| **Machine Operator** | Shop floor execution | Job card start/stop, record output & scrap against a machine |
| **QC Inspector** | Quality | Log incoming/in-process/final inspections against templates, record pass/reject/scrap decisions |
| **Store/Warehouse Staff** | Inventory & dispatch | Receive raw material (GRN/batch), pack cartons, generate delivery notes, scan cartons at dispatch |
| **Accounts Executive** | Finance | Sales/purchase invoicing, e-Invoice/e-Way Bill, payment tracking, outstanding reports |
| **Admin/IT (Param)** | System owner | Configuration, user/role management, data migration, uptime |

## 4. Scope: Feature List (Phase 0–1 + Phase 2 subset)

### 4.1 Phase 0 — Foundation
- ERPNext/Frappe instance provisioned (hosting decision: see TRD)
- Company setup: legal name, address(es), GSTIN(s), plant location(s), financial year, default currency, logo
- Departments, users, roles created; org chart reflected in Frappe User/Department structure
- Chart of Accounts configured (from Tally export or built fresh if unavailable)
- India Compliance app installed (GST, e-Invoice, e-Way Bill)
- Item Groups, UOMs, Warehouses configured

### 4.2 Phase 1 — Core Native Modules
Native ERPNext modules configured, no custom DocTypes required except where noted:

1. **Selling** — Lead/Opportunity → Quotation → Sales Order. **Custom field:** "Approval Method" (Select: Email/WhatsApp/Phone/Verbal) captured on Sales Order when status moves to Approved.
2. **Buying** — Supplier master → Purchase Order → Purchase Receipt (native GRN, batch assigned at receipt) → Purchase Invoice.
3. **Stock** — Item master, Batch tracking, multi-warehouse. Batch genealogy: Purchase Receipt (batch created) → Stock Entry (consumption) → Work Order (batch-linked) → FG Batch (child batch) → Delivery Note (batch printed on document).
4. **Manufacturing** — BOM → Production Plan → Work Order → Job Card (carries Workstation/Machine + Employee/Operator natively) → Stock Entry (Manufacture, creates FG batch). Scrap/process loss recorded on Job Card, tied to BOM scrap items.
5. **Quality Management** — Quality Inspection Template per product code (Pin Size, Width, Leg, Weight, Profile Fit Test as Reading parameters). Incoming QC, In-Process QC, Final QC as Quality Inspection documents. **Customization required:** native Quality Inspection is binary (Accepted/Rejected); a Frappe Workflow is needed on top to support the four-state outcome (Pass / Reject / Scrap / Rework), with Reject/Scrap routing to a Rework Stock Entry.
6. **Assets** — Machine maintenance tracking (basic; maintenance schedule/log only, not full asset depreciation accounting unless later requested).
7. **Accounts** — Sales Invoice → e-Invoice/IRN (via India Compliance app) → E-Way Bill (via India Compliance app) → Payment Entry (against Payment Terms) → Outstanding (Accounts Receivable). Purchase Invoice on the buying side.
8. **Packing & Dispatch** — Packing Slip (carton/case-wise, native ERPNext DocType) generated against a Delivery Note; Delivery Note carries Transporter/Vehicle/LR fields.
9. **Frappe Core** — Roles, notifications, audit trail (native — no custom work).

### 4.3 Phase 2 subset — Custom App (`hpos_extensions`)
Three of the five originally proposed custom screens, built as a single Frappe custom app reading/writing native DocTypes (Sales Order, Work Order, Job Card, Quality Inspection, Delivery Note) — not a parallel data store.

1. **Order Timeline** — Visual stage-stepper showing an order's progress across the ~10 process steps from Quotation through Sales Invoice (see Master Process Flow in TRD). Read-only aggregation view; no new source-of-truth data.
2. **Founder Dashboard** — Single-screen "Business Health Score" view: at-risk orders (late/blocked), payments overdue, production status by machine, today's dispatch summary. Read-only aggregation view.
3. **QR Dispatch Scan** — Mobile-friendly page for warehouse staff to scan carton QR/barcodes at the dispatch gate and verify scanned cartons against the Packing Slip/Delivery Note before goods leave.

**Explicitly deferred (not built in this phase, but data model leaves room for them):**
- Planning Board (drag-drop machine × date capacity grid) — Phase 3, deliberately deferred until real production data exists to design the capacity view against.
- AI Email & Forecast (auto-draft orders, delay/demand prediction) — Phase 4.

## 5. Non-Goals (this phase)
- No fully custom UI replacing ERPNext's Desk for master-data entry (customers, items, BOMs) — native ERPNext forms are used as-is.
- No mobile native app — QR Dispatch Scan is a responsive web page, not an iOS/Android build.
- No historical data migration beyond opening balances (per pitch deck scoping question — to be confirmed with client; assumed "opening balances + masters only" until stated otherwise).
- No integration with company website, email marketing, or shipping-provider APIs in this phase.
- No AI/forecasting features.

## 6. Success Metrics

| Metric | Target |
|---|---|
| Order status lookup time | From "ask 3 people" → single Order Timeline screen, <10 seconds |
| Batch traceability query (defect investigation) | From multi-day paper trace → <5 minutes via batch genealogy |
| QC records digitized | 100% of Incoming/In-Process/Final QC logged in-system, zero paper sheets post go-live |
| Founder daily visibility | Single dashboard replaces ad-hoc status-asking; used daily by founder |
| Dispatch accuracy | Carton-count mismatches at dispatch caught by QR scan before truck departure |
| Time to working core system | Live core system within 16 weeks of Phase 0 start (Phase 0–1 per pitch deck) |

## 7. Assumptions & Open Questions (must be resolved before Phase 1 build starts)

These map directly to the unanswered sections of the "ERPNext Initial Data & Information Request" docx:

- [ ] Company legal name, address(es), GSTIN(s), plant location(s), financial year start, default currency, logo — **not yet supplied**
- [ ] Chart of Accounts, bank account list, current accounting software (Tally?), whether ERPNext becomes primary accounting system or runs alongside Tally
- [ ] Customer master, supplier master, item master, BOMs — **not yet supplied**, assumed to be created during Phase 1 configuration workshops
- [ ] Data migration scope: opening balances only vs. customers/suppliers vs. items/inventory vs. open SO/PO vs. historical transactions (and how many years)
- [ ] Barcode/QR hardware availability for QR Dispatch Scan (scanner type, or camera-based scan on phone/tablet)
- [ ] E-Invoicing / E-Way Bill applicability thresholds for Himalaya Plast's GST registration(s)
- [ ] Go-live approach: single go-live vs. phased by module vs. phased by plant; desired go-live date and blackout periods

## 8. Dependencies
- India Compliance app (open-source, no license cost) for GST e-Invoice/IRN and E-Way Bill.
- Frappe Cloud or self-hosted infrastructure decision (see TRD/Deployment doc).
- Client-side data collection (item master, BOMs, customer/supplier lists) — Param does not have this yet; flagged as a blocking dependency for Phase 1 completion, not for Phase 0/environment setup.
