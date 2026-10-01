# User Stories & Acceptance Criteria
## Himalaya Plast Operating System (HPOS)

Format: `As a <persona>, I want <capability>, so that <outcome>.` Each story includes acceptance criteria (AC) in Given/When/Then form where useful.

---

## Epic 1: Sales (Selling Module)

### US-1.1 — Create Quotation from Lead
As a **Sales Executive**, I want to convert a Lead/Opportunity into a Quotation, so that I can send pricing without re-entering customer details.
- **AC1:** Given an Opportunity exists, when I click "Create Quotation," then customer/contact details are pre-filled.
- **AC2:** Quotation must pull item prices from the configured Price List.

### US-1.2 — Capture Approval Method on Sales Order
As a **Sales Executive**, I want to record how a customer approved an order (Email/WhatsApp/Phone/Verbal), so that there's an audit trail even for informal approvals.
- **AC1:** Given a Sales Order in Draft, when status is changed to Approved, then the `approval_method` field is required (Select field, one of the 4 options) before save succeeds.
- **AC2:** `approval_method` is visible on the Sales Order print format and in the Order Timeline stage metadata.

### US-1.3 — See order status without asking anyone
As a **Sales Executive / Founder**, I want to look up any Sales Order and see exactly which of the 10 process stages it's at, so that I don't need to call production or the warehouse.
- **AC1:** Given a valid Sales Order number, when I open the Order Timeline screen, then I see each of the 10 stages marked completed/in-progress/pending with timestamps and linked documents.
- **AC2:** If a stage has multiple documents (e.g., multiple Job Cards for one Work Order), all are listed, not just the first.

---

## Epic 2: Procurement (Buying Module)

### US-2.1 — Receive raw material with batch tracking
As a **Store/Warehouse Staff**, I want a Purchase Receipt to automatically create a batch number, so that I can trace which raw material lot went into which production run.
- **AC1:** Given an Item with `has_batch_no` enabled, when a Purchase Receipt is submitted, then a Batch record is created and linked to the received stock.

### US-2.2 — Incoming QC before stock is usable
As a **QC Inspector**, I want incoming raw material to require a Quality Inspection before it's available for production, so that defective material isn't used.
- **AC1:** Given a Purchase Receipt with QC required on the item, when the receipt is submitted, then a Quality Inspection is auto-created in Draft/pending state.
- **AC2:** Stock is not released for consumption in a Work Order until the linked Quality Inspection is Accepted (or Pass, under the 4-state workflow).

---

## Epic 3: Manufacturing

### US-3.1 — Plan production from Sales Orders
As a **Production Planner**, I want to generate a Production Plan and Work Orders from confirmed Sales Orders, so that shop floor work is driven by real demand.
- **AC1:** Given one or more confirmed Sales Orders, when I create a Production Plan, then required raw materials are calculated against the linked BOM(s).

### US-3.2 — Assign machine and operator to a Job Card
As a **Production Planner**, I want each Job Card to specify which machine (Workstation) and operator (Employee) will run it, so that machine load and operator accountability are tracked.
- **AC1:** Job Card requires a Workstation and Employee before it can be started (status → In Process).

### US-3.3 — Record scrap/process loss
As a **Machine Operator**, I want to log scrap or process loss against a Job Card, so that yield and material loss are tracked per production run.
- **AC1:** Given a Job Card in progress, when I record scrap quantity, then it is tied to the relevant BOM scrap item and reflected in the resulting Stock Entry.

---

## Epic 4: Quality Management

### US-4.1 — Inspect against product-specific parameters
As a **QC Inspector**, I want a Quality Inspection Template per product code with the right Reading parameters (Pin Size, Width, Leg, Weight, Profile Fit Test), so that I'm checking the right specs for each product.
- **AC1:** Given a product code, when I create a Quality Inspection, then the correct template's Reading parameters are pre-loaded.

### US-4.2 — Four-state QC decision
As a **QC Inspector**, I want to mark a Quality Inspection as Pass, Reject, Scrap, or send it to Rework — not just Accepted/Rejected — so that the decision reflects real shop-floor outcomes.
- **AC1:** Given a completed Quality Inspection, when I select "Reject" or "Scrap," then a Rework Stock Entry is auto-suggested/created per the Frappe Workflow.
- **AC2:** QC decision history is queryable for trend analysis (replacing the paper QC sheets — see PRD success metric).

### US-4.3 — Digital QC history, no paper
As a **Founder**, I want zero paper QC sheets after go-live, so that quality trends are analyzable over time.
- **AC1:** 100% of Incoming/In-Process/Final QC events are logged as Quality Inspection documents post go-live (tracked as a PRD success metric, not a single feature to "build," but a rollout/adoption target).

---

## Epic 5: Inventory & Traceability

### US-5.1 — Trace a defect back to its raw material batch
As a **QC Inspector / Founder**, I want to trace a customer-reported defect on a Delivery Note back to the exact raw material batch, so that I can identify whether other orders are affected.
- **AC1:** Given a Delivery Note, when I query batch genealogy, then I see the chain: Delivery Note → FG Batch → Work Order → consumed raw material Batch → Purchase Receipt → Supplier.
- **AC2:** The same query also surfaces every other Delivery Note that used the same raw material batch.
- **AC3:** This query completes in under 5 minutes end-to-end (replacing a multi-day paper investigation — PRD success metric).

---

## Epic 6: Packing & Dispatch

### US-6.1 — Pack cartons against a Delivery Note
As a **Store/Warehouse Staff**, I want to create a carton/case-wise Packing Slip against a Delivery Note, so that dispatch documentation matches what's physically packed.
- **AC1:** Packing Slip line items sum to the Delivery Note's item quantities.

### US-6.2 — Scan cartons at the gate before dispatch
As a **Store/Warehouse Staff**, I want to scan each carton's QR code at the dispatch gate and see a running count against the expected total, so that mismatches are caught before the truck leaves.
- **AC1:** Given a Delivery Note with N expected cartons, when I scan a valid carton code, then the scanned count increments and I get clear visual/audible feedback.
- **AC2:** Given a carton code already scanned, when I scan it again, then I get a "duplicate" warning, not a silent re-count.
- **AC3:** Given a carton code that doesn't belong to this Delivery Note, when I scan it, then I get a clear "mismatch" error.
- **AC4:** Given scanned count ≠ expected count, when I try to confirm dispatch, then I'm blocked unless I provide an explicit override reason (logged).

---

## Epic 7: Accounts & GST

### US-7.1 — Generate e-Invoice and E-Way Bill automatically
As an **Accounts Executive**, I want e-Invoice IRN and E-Way Bill to generate automatically when I submit a Sales Invoice, so that I don't manage GST compliance manually.
- **AC1:** Given a Sales Invoice is submitted and India Compliance app is configured, then IRN + QR code are generated and printed on the invoice; E-Way Bill is generated from the same document.

### US-7.2 — See outstanding payments
As an **Accounts Executive / Founder**, I want to see all outstanding Accounts Receivable, so that I can follow up on overdue payments.
- **AC1:** Founder Dashboard's "payments overdue" section matches the native Accounts Receivable report for the same date range.

---

## Epic 8: Founder Visibility

### US-8.1 — Single-screen business health view
As a **Founder**, I want one dashboard showing at-risk orders, overdue payments, production status, and today's dispatch, so that I don't need to ask staff for status updates.
- **AC1:** Dashboard loads in under 2 seconds for current data volume.
- **AC2:** "At-risk orders" definition (days overdue threshold) is configurable via `HPOS Settings`, not hardcoded.
- **AC3:** Access restricted to Founder/Owner + Admin roles (see RBAC.md).

---

## Epic 9: Administration

### US-9.1 — Role-appropriate access
As an **Admin**, I want each user to only see/do what their role permits (e.g., Machine Operator can't see financial data), so that sensitive data is protected.
- **AC1:** See RBAC.md for full role→permission matrix; every custom API endpoint re-validates permission server-side, not just via frontend role hiding.

### US-9.2 — Configure company details once
As an **Admin**, I want to set up company legal name, GSTIN(s), plant locations, and financial year once during Phase 0, so that all downstream documents (invoices, print formats) are correct from day one.
- **AC1:** Blocked until client supplies company information (see PRD §7 open items) — this story cannot be marked "done" until real data is provided.
