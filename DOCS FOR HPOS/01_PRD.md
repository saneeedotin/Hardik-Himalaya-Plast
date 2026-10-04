# Product Requirements Document (PRD)
## Himalaya Plast Operating System (HPOS) — Built on Next.js

**Scope covered by this document:** Phase 0 (Foundation) + Phase 1 (Core Modules) + a subset of Phase 2 (Custom Extensions: Order Timeline, Founder Dashboard, QR Dispatch Scan).
**Out of scope for this phase:** Planning Board (deferred to Phase 3), AI Email & Demand Forecast (deferred to Phase 4). 

**Status:** Draft — working from the HPOS pitch deck's assumptions. No real Himalaya Plast operational data (chart of accounts, item master, BOMs, customer/supplier lists) has been supplied yet.

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

Replace ad-hoc, paper/WhatsApp-based operations with a single connected system — a custom Next.js application tailored for Himalaya Plast's order-to-cash and procure-to-pay flows.

**Guiding principle:** We are building a custom Next.js application that draws heavy inspiration from ERPNext's architecture and feature set (e.g., standard list/form views, workspace navigation). This allows us to map the business's real-world objects exactly to our Prisma database without the bloat of a generalized ERP, while retaining a familiar, structured UX.

## 3. Users / Personas

| Persona | Role | Primary Needs |
|---|---|---|
| **Founder / Owner** | Business owner | Single-screen visibility into order health, at-risk orders, payments due, production status |
| **Sales Executive** | Order intake | Fast quotation → sales order creation, order status visibility |
| **Production Planner** | Shop floor scheduling | Convert sales orders into work orders/job cards, see machine load |
| **Machine Operator** | Shop floor execution | Job card start/stop, record output & scrap against a machine |
| **QC Inspector** | Quality | Log incoming/in-process/final inspections against templates |
| **Store/Warehouse Staff** | Inventory & dispatch | Receive raw material, pack cartons, generate delivery notes, scan cartons at dispatch |
| **Accounts Executive** | Finance | Sales/purchase invoicing, e-Invoice/e-Way Bill, payment tracking |
| **Admin/IT (Param)** | System owner | Configuration, user/role management, data migration, uptime |

## 4. Scope: Feature List

### 4.1 Phase 0 — Foundation
- Next.js application scaffolding, Prisma ORM, PostgreSQL database.
- Company setup parameters and environment variables.
- Custom RBAC implementation (Roles, Permissions).

### 4.2 Phase 1 — Core Modules
We will build the following modules in Next.js, prioritizing Buying/Stock, Accounts/Invoicing, and Advanced Manufacturing/Assets:

1. **Selling** — Lead/Opportunity → Quotation → Sales Order.
2. **Buying** — Supplier master → Purchase Order → Purchase Receipt (GRN, batch assigned).
3. **Stock** — Item master, Batch tracking, multi-warehouse. Batch genealogy: Purchase Receipt → Stock Entry → Work Order → FG Batch → Delivery Note.
4. **Manufacturing** — BOM → Production Plan → Work Order → Job Card. Scrap/process loss recorded on Job Card.
5. **Quality Management** — Quality Inspection Template per product code. Four-state outcome (Pass / Reject / Scrap / Rework) with workflows.
6. **Assets** — Machine maintenance tracking (downtime logs, maintenance schedules).
7. **Accounts** — Sales Invoice → e-Invoice/IRN → E-Way Bill → Payment Entry → Outstanding. Purchase Invoice on the buying side.
8. **Packing & Dispatch** — Packing Slip generated against a Delivery Note; Delivery Note carries Transporter/Vehicle/LR fields.

### 4.3 Phase 2 — Custom Views
1. **Order Timeline** — Visual stage-stepper showing an order's progress.
2. **Founder Dashboard** — Single-screen "Business Health Score" view.
3. **QR Dispatch Scan** — Mobile-friendly page for warehouse staff to scan carton QR/barcodes.

## 5. Non-Goals (this phase)
- No mobile native app — QR Dispatch Scan is a responsive web page.
- No integration with company website, email marketing, or shipping-provider APIs in this phase.
- No AI/forecasting features.

## 6. Success Metrics
- Order status lookup time: <10 seconds via Order Timeline.
- Batch traceability query: <5 minutes via batch genealogy.
- QC records digitized: 100% of QC logged in-system.
- Dispatch accuracy: Carton-count mismatches caught before truck departure.

## 7. Assumptions & Open Questions
- Chart of Accounts, bank account list, current accounting software (Tally integration?).
- Customer master, supplier master, item master, BOMs.
- E-Invoicing / E-Way Bill applicability thresholds.
