# User Stories & Acceptance Criteria
## Himalaya Plast Operating System (HPOS)

Format: `As a <persona>, I want <capability>, so that <outcome>.` Each story includes acceptance criteria (AC) in Given/When/Then form where useful.

---

## Epic 1: Sales (Selling Module)

### US-1.1 — Create Quotation from Lead
As a **Sales Executive**, I want to convert a Lead/Opportunity into a Quotation, so that I can send pricing without re-entering customer details.
- **AC1:** Given an Opportunity exists, when I click "Create Quotation," then customer/contact details are pre-filled.
- **AC2:** Quotation must pull item prices from the configured Price List model.

### US-1.2 — Capture Approval Method on Sales Order
As a **Sales Executive**, I want to record how a customer approved an order (Email/WhatsApp/Phone/Verbal), so that there's an audit trail even for informal approvals.
- **AC1:** Given a Sales Order in Draft, when status is changed to Approved, then the `approvalMethod` field is required (Select field, one of the 4 options) before the Server Action succeeds.
- **AC2:** `approvalMethod` is visible on the Sales Order print format and in the Order Timeline.

### US-1.3 — See order status without asking anyone
As a **Sales Executive / Founder**, I want to look up any Sales Order and see exactly which of the 10 process stages it's at.
- **AC1:** Given a valid Sales Order number, when I open the Order Timeline screen, then I see each of the 10 stages marked completed/in-progress/pending with timestamps.

---

## Epic 2: Procurement (Buying Module)

### US-2.1 — Receive raw material with batch tracking
As a **Store/Warehouse Staff**, I want a Purchase Receipt to automatically create a batch number.
- **AC1:** Given an Item with batch tracking enabled, when a Purchase Receipt is submitted, then a `Batch` record is created and linked to the received stock in the `StockLedgerEntry`.

### US-2.2 — Incoming QC before stock is usable
As a **QC Inspector**, I want incoming raw material to require a Quality Inspection before it's available for production.
- **AC1:** Given a Purchase Receipt with QC required on the item, a `QualityInspection` is auto-created.
- **AC2:** Stock is not released for consumption in a Work Order until the linked Quality Inspection is marked as PASS.

---

## Epic 3: Manufacturing

### US-3.1 — Plan production from Sales Orders
As a **Production Planner**, I want to generate a Production Plan and Work Orders from confirmed Sales Orders.
- **AC1:** Given one or more confirmed Sales Orders, when I create a Production Plan, then required raw materials are calculated against the linked `BOM`.

### US-3.2 — Assign machine and operator to a Job Card
As a **Production Planner**, I want each Job Card to specify which machine (Workstation) and operator (Employee) will run it.
- **AC1:** Job Card requires a Workstation and Employee before it can be started (status → In Process).

### US-3.3 — Record scrap/process loss
As a **Machine Operator**, I want to log scrap or process loss against a Job Card.
- **AC1:** Given a Job Card in progress, when I record scrap quantity, then it is tied to the relevant BOM scrap item and reflected in the resulting Stock Entry.

---

## Epic 4: Quality Management

### US-4.1 — Inspect against product-specific parameters
As a **QC Inspector**, I want a Quality Inspection Template per product code.
- **AC1:** Given a product code, when I create a Quality Inspection, then the correct template's Reading parameters are pre-loaded.

### US-4.2 — Four-state QC decision
As a **QC Inspector**, I want to mark a Quality Inspection as Pass, Reject, Scrap, or send it to Rework.
- **AC1:** Given a completed Quality Inspection, when I select "Reject" or "Scrap," a Rework process is initiated via Next.js Server Action.
- **AC2:** QC decision history is queryable for trend analysis via Prisma.

### US-4.3 — Digital QC history, no paper
As a **Founder**, I want zero paper QC sheets after go-live.
- **AC1:** 100% of Incoming/In-Process/Final QC events are logged as Quality Inspection records post go-live.

---

## Epic 5: Inventory & Traceability

### US-5.1 — Trace a defect back to its raw material batch
As a **QC Inspector / Founder**, I want to trace a customer-reported defect on a Delivery Note back to the exact raw material batch.
- **AC1:** Given a Delivery Note, when I query batch genealogy, then I see the chain: Delivery Note → FG Batch → Work Order → consumed raw material Batch → Purchase Receipt → Supplier.
- **AC2:** The Server Action completes this recursive Prisma query in under 5 minutes.

---

## Epic 6: Packing & Dispatch

### US-6.1 — Pack cartons against a Delivery Note
As a **Store/Warehouse Staff**, I want to create a carton/case-wise Packing Slip against a Delivery Note.
- **AC1:** Packing Slip line items sum to the Delivery Note's item quantities.

### US-6.2 — Scan cartons at the gate before dispatch
As a **Store/Warehouse Staff**, I want to scan each carton's QR code at the dispatch gate.
- **AC1:** Given a Delivery Note with N expected cartons, when I scan a valid carton code, then the scanned count increments.
- **AC2:** Given a carton code already scanned, when I scan it again, I get a "duplicate" warning.
- **AC3:** Given scanned count ≠ expected count, when I try to confirm dispatch, I'm blocked unless I provide an explicit override reason.

---

## Epic 7: Accounts & GST

### US-7.1 — Generate e-Invoice and E-Way Bill automatically
As an **Accounts Executive**, I want e-Invoice IRN and E-Way Bill to generate automatically when I submit a Sales Invoice.
- **AC1:** Given a Sales Invoice is submitted, API integration with GST services generates IRN + QR.

### US-7.2 — See outstanding payments
As an **Accounts Executive / Founder**, I want to see all outstanding Accounts Receivable.
- **AC1:** Founder Dashboard's "payments overdue" section pulls directly from unpaid `Invoice` records.

---

## Epic 8: Founder Visibility

### US-8.1 — Single-screen business health view
As a **Founder**, I want one dashboard showing at-risk orders, overdue payments, production status, and today's dispatch.
- **AC1:** Dashboard loads in under 1 second using RSCs.
- **AC2:** Access restricted to Founder/Owner + Admin roles via custom RBAC.

---

## Epic 9: Administration

### US-9.1 — Role-appropriate access
As an **Admin**, I want each user to only see/do what their role permits.
- **AC1:** See RBAC.md for full role→permission matrix; every Server Action re-validates permission.
