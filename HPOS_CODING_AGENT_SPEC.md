# HPOS — Himalaya Plast Operating System
## Coding Agent Master Specification

**Client:** Himalaya Plast  
**Owner / Primary Business Stakeholder:** Inzemam  
**Implementation:** Custom Next.js application  
**Database:** PostgreSQL via Prisma  
**UI:** Tailwind CSS + Lucide React  
**Deployment target:** Vercel + managed PostgreSQL  
**Document purpose:** Detailed build specification for an AI coding agent / engineering team

---

# 0. Read This First

This document converts the current Himalaya Plast business-process understanding into a concrete implementation brief for the coding agent.

The project has deliberately pivoted away from an ERPNext/Frappe implementation. The older ERPNext documents and pitch material remain useful as business-domain reference material, but **the application being built is a custom Next.js + Prisma system**.

The updated HPOS documentation confirms the current platform direction: Next.js App Router, Prisma, PostgreSQL, Tailwind CSS, custom RBAC, Server Actions, and Route Handlers where required.

The actual factory workflow discovered from the client should take precedence over generic ERP assumptions:

> Customer order/enquiry → Proforma → Raw-material availability check → Customer confirmation → Production → Waste/scrap recovery → QC → Packing → Finished-goods inventory → Customer dispatch confirmation → Dispatch → Finished-goods inventory reduction.

A second business loop runs alongside production:

> Customer history → recurring-order pattern → expected next order → follow-up reminder → sales contact.

The goal is not to reproduce ERPNext screen-for-screen. The goal is to build a **focused manufacturing operating system specifically for Himalaya Plast**, using structured ERP-style patterns where they help.

---

# 1. Product Vision

HPOS should give Inzemam and the Himalaya Plast team one reliable place to answer:

- What orders have arrived?
- Which orders are awaiting customer confirmation?
- Can we manufacture an order with the material currently available?
- What is currently in production?
- What has been produced?
- What waste/scrap was generated?
- Which batches passed or failed QC?
- What finished goods are sitting in storage?
- Which orders are ready for dispatch?
- Which customers need to be contacted because a repeat order is expected?
- What materials are running low?
- What is currently outstanding financially?
- Who changed what and when?

The system should reduce dependence on WhatsApp, memory, paper QC sheets, scattered spreadsheets, and manual status checking.

---

# 2. Non-Negotiable Product Principles

## 2.1 Build for Himalaya Plast, not for a generic ERP

Do not introduce generic modules merely because a normal ERP contains them. Every screen should support a real Himalaya Plast workflow or a clearly documented future requirement.

## 2.2 Preserve traceability

Every important production and inventory movement must be traceable.

The system should be able to move from:

`Customer Order → Production → QC → Finished Batch → Carton → Dispatch`

and, when required, backwards from finished goods to the raw-material batch used during manufacturing.

## 2.3 Inventory is a ledger, not a manually edited number

Do not treat stock quantity as a single mutable field that users can freely overwrite.

Use transaction/ledger records for receipts, consumption, production, transfers, scrap, recovery, packing, and dispatch. Current stock should be derived from movements or maintained only as a carefully controlled projection/cache.

## 2.4 Business actions must be transactional

Operations such as confirming an order, receiving raw material, consuming stock, completing production, creating finished goods, posting QC decisions, and dispatching cartons must preserve database consistency.

Use Prisma transactions whenever multiple records must succeed/fail together.

## 2.5 Server-side security is mandatory

Client-side hiding is UX only. Every Server Action and Route Handler must re-check authentication and permissions server-side before performing business logic.

## 2.6 Do not fake operational data

Seed/demo data is acceptable in development, but production logic must not depend on hard-coded customers, products, inventory quantities, or QC values.

## 2.7 Keep current uncertainty explicit

Where Himalaya Plast has not supplied a real value, do not silently invent one. Use configuration, a pending setup state, or an explicitly marked open item.

---

# 3. Existing Updated Technical Direction

Use the updated technical documents as the implementation baseline:

- Next.js App Router + TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Lucide React
- React Server Components for read-heavy pages
- Server Actions for normal mutations
- Route Handlers/API routes for client-heavy operations and external integrations
- Custom Prisma RBAC
- Vercel + managed PostgreSQL for production
- Vitest for unit/integration testing
- Playwright or Cypress for end-to-end testing

Do not introduce Frappe, ERPNext, Vue/Frappe UI, Frappe DocTypes, Frappe permissions, or an `hpos_extensions` app architecture.

---

# 4. Recommended Application Structure

Keep the updated project structure, but organize the domain around real business workflows.

```text
hpos-app/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── ...
│   │   │
│   │   ├── (desk)/
│   │   │   ├── dashboard/
│   │   │   ├── orders/
│   │   │   ├── customers/
│   │   │   ├── items/
│   │   │   ├── suppliers/
│   │   │   ├── buying/
│   │   │   ├── selling/
│   │   │   ├── stock/
│   │   │   ├── production/
│   │   │   ├── quality/
│   │   │   ├── packing/
│   │   │   ├── dispatch/
│   │   │   ├── accounts/
│   │   │   ├── machines/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   │
│   │   ├── dispatch-scan/
│   │   └── api/
│   │
│   ├── actions/
│   │   ├── orders/
│   │   ├── customers/
│   │   ├── stock/
│   │   ├── production/
│   │   ├── quality/
│   │   ├── dispatch/
│   │   └── accounts/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── desk/
│   │   ├── tables/
│   │   ├── forms/
│   │   ├── dashboard/
│   │   ├── timeline/
│   │   ├── qc/
│   │   └── dispatch/
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth/
│   │   ├── rbac/
│   │   ├── inventory/
│   │   ├── production/
│   │   ├── traceability/
│   │   ├── reorder/
│   │   ├── validation/
│   │   └── utils/
│   │
│   └── types/
│
└── tests/
```

The exact structure may differ if the existing repository is already established. Preserve working conventions where possible rather than restructuring the entire codebase unnecessarily.

---

# 5. Main Factory Workflow

## STEP 1 — Customer Order / Enquiry

Orders can arrive through:

- WhatsApp
- Email
- Phone
- Other manual channels

The system must allow the user to create an initial order/enquiry without requiring the customer to have formally confirmed it.

### Minimum information

- Customer
- Product / Product Code
- Requested quantity
- Requested delivery date
- Contact/source
- Notes
- Created by
- Created timestamp
- Initial status

### Recommended statuses

```text
NEW
QUOTATION_DRAFT
PROFORMA_SENT
AWAITING_CONFIRMATION
CONFIRMED
IN_PRODUCTION
QC_PENDING
QC_HOLD
READY_FOR_DISPATCH
DISPATCH_CONFIRMED
DISPATCHED
COMPLETED
CANCELLED
```

Keep status transitions controlled by business logic, not unrestricted free editing.

---

# 6. Proforma / Quotation Workflow

The current real-world process is that Inzemam uses bookkeeping software to prepare a proforma and sends it to the customer.

HPOS must represent this stage clearly.

### Important open question

Do not assume HPOS immediately replaces the existing bookkeeping system.

Support the business workflow first. The final implementation decision should distinguish among:

1. HPOS generates the proforma itself.
2. HPOS prepares the commercial data and the existing bookkeeping system remains the document generator.
3. HPOS eventually integrates with the bookkeeping/Tally/accounting system.

Build the domain model so that an external reference can be stored without forcing an integration in Phase 1.

### Suggested fields

- Proforma/Quotation number
- Customer
- Items
- Quantity
- Rate
- Taxes if applicable
- Total
- Valid-until date
- Delivery expectation
- Sent timestamp
- Sent through
- External accounting reference if used
- Status

---

# 7. Raw Material Availability Check

This must be a first-class feature because the factory checks material availability before committing to an order.

When an order contains a product, the system should determine its material requirement using the applicable BOM/product recipe.

Compare:

```text
Required Material
vs
Available Stock
vs
Already Reserved Stock
vs
Shortfall
```

### Example UI

| Material | Required | Available | Reserved | Usable | Result |
|---|---:|---:|---:|---:|---|
| Hard Granules | 250 kg | 420 kg | 50 kg | 370 kg | Available |
| Soft Granules | 100 kg | 70 kg | 0 kg | 70 kg | Short |
| Black Carbon | 12 kg | 18 kg | 4 kg | 14 kg | Available |

### Important

Do not calculate availability using raw stock only. A future version must support reservation/commitment so the same inventory is not promised to multiple confirmed orders.

Recommended result states:

- `AVAILABLE`
- `PARTIAL`
- `SHORT`
- `UNKNOWN_BOM`

The system must show *why* material is unavailable.

---

# 8. Customer Confirmation

Once the customer confirms the proforma/order, convert the record into a confirmed Sales Order.

Capture:

- Confirmation date/time
- Confirmation channel: Email / WhatsApp / Phone / Verbal / Other
- Confirmed quantity
- Confirmed delivery date
- Notes
- User who recorded the confirmation

Once confirmed, the order becomes eligible for production planning.

---

# 9. Customer 360 / Repeat Order Intelligence

This is a major HPOS requirement.

A customer page should not be only a master record. It should provide the customer's operational history.

## Customer 360 should include

### Customer profile

- Name
- Company details
- Contact persons
- Phone/email
- GST information when supplied
- Customer status
- Notes

### Commercial history

- Total orders
- Total value
- Last order
- Last order date
- Most ordered products
- Order history

### Operational history

- Open orders
- Production history
- QC history relevant to their products/orders
- Dispatch history
- Outstanding payments when accounting data is available

### Reorder tracking

Create an explicit expected-order concept rather than falsely claiming that an order will happen.

Recommended fields:

- Last order date
- Previous order dates
- Observed interval between orders
- Expected next order date
- Reminder date
- Reminder status
- Manual override date
- Follow-up notes
- Assigned salesperson/user

### Important UX distinction

Never label an inferred date as a confirmed order.

Use language like:

> Expected reorder window

not:

> Next order: 29 Oct

unless the client has actually confirmed it.

The reorder reminder algorithm should be configurable and transparent. Start with a simple deterministic approach using historical order intervals; do not add AI prediction in the current phase.

---

# 10. Items / Product Master

The Item page is foundational because an item connects sales, BOM, stock, production, QC, packing, and customer history.

Suggested item data:

- Item code
- Item name
- Product category
- Description
- UOM
- Active/inactive
- Batch tracked yes/no
- QC required yes/no
- Reorder settings if needed
- Standard dimensions/specification metadata
- Default BOM
- Applicable QC template
- Packaging requirements

Do not assume every item is manufactured. The system should support:

- Finished products
- Raw materials
- Packaging materials
- Recycled/reprocessed materials
- Other purchased items

---

# 11. Himalaya Plast Material Catalogue

The current client-provided material categories are:

## Raw Materials / Granules

- Hard Granules
- Soft Granules
- LD Granules
- EVA Granules

## Colour / Additives

- Black Carbon
- Grey Colour

## Packaging

- Cartons

## Recovered / Recycled material

- Production scrap
- Reprocessed/recycled material generated from production waste

Do not hard-code the list as permanent application logic. These are initial catalogue categories and should be configurable through Item Groups / Material Categories.

Exact material grades, units, conversion ratios, supplier mappings, and recipes must be collected from Himalaya Plast before production configuration.

---

# 12. Buying / Supplier Management

Supplier management should cover:

- Supplier master
- Contact information
- Material supplied
- Purchase history
- Open purchase orders
- Previous purchase prices if required
- Delivery history
- Quality history for incoming materials

The client also mentioned a **supplier leaderboard / Google-Sheets-like view for new leads**.

Treat this separately from the formal supplier master:

### Supplier Leads

Possible fields:

- Supplier/company name
- Contact person
- Material/category
- Source
- Status
- Last contacted
- Next follow-up
- Notes
- Owner

This should not automatically become an approved supplier.

---

# 13. Stock Architecture

HPOS should visually separate three inventory domains:

## A. Raw Material Stock

Used to manufacture products.

## B. Finished Goods Stock

Manufactured, QC-cleared products available for dispatch.

## C. Recovered / Scrap Material Stock

Material created through production waste/recovery and available for future approved use.

A fourth packaging category can be shown separately when useful:

## D. Packaging Stock

Cartons and other dispatch materials.

### Ledger-based stock

Every stock movement should produce an auditable record such as:

```text
RECEIPT
CONSUMPTION
PRODUCTION_OUTPUT
TRANSFER
SCRAP
RECOVERY
PACKING
DISPATCH
ADJUSTMENT
```

Never silently alter stock numbers without recording the reason, actor, timestamp, and reference document.

---

# 14. Batch Tracking / Genealogy

Batch is a core traceability object.

A batch should support:

- Batch number
- Item/material
- Quantity
- Unit
- Source
- Supplier batch/reference
- Receipt reference
- Parent batch if applicable
- Production order
- Creation date
- Location
- Status

For finished material, the system should preserve the source raw-material relationship.

Required traceability direction:

```text
Delivery Note
    ↓
Finished Goods Batch
    ↓
Production Order / Work Order
    ↓
Raw Material Consumption
    ↓
Raw Material Batch
    ↓
Purchase Receipt
    ↓
Supplier
```

And the reverse query should be possible:

```text
Raw Material Batch
    ↓
All production runs consuming it
    ↓
All finished batches created
    ↓
All customer deliveries affected
```

This is essential for handling future quality complaints or recalls.

---

# 15. Production

Production begins only after a customer order is confirmed and the factory has accepted the production requirement.

A production order/work order should include:

- Sales order reference
- Customer
- Product
- Quantity
- Target date
- BOM
- Planned materials
- Actual material consumption
- Machine/workstation
- Operator
- Start time
- End time
- Output quantity
- Scrap quantity
- Recovered quantity
- Status
- Notes

### Suggested status sequence

```text
PLANNED
MATERIAL_READY
READY_TO_RUN
RUNNING
PAUSED
COMPLETED
QC_PENDING
CLOSED
```

Allow controlled exceptions such as `CANCELLED`.

---

# 16. Waste / Scrap / Recovery

This is a domain-specific feature and must be visible in production.

During production:

```text
Input Raw Material
        ↓
   Manufacturing
     ↙       ↘
Finished    Waste/Scrap
 Product       ↓
             Recovery
                ↓
       Reusable Material
```

Capture at least:

- Production order
- Source batch
- Waste quantity
- Waste reason/type
- Recovery quantity
- Recovered material category
- Date/time
- Operator/user

Do not assume a fixed recovery percentage. Actual recovery ratios/process rules must come from Himalaya Plast.

Recommended reporting:

- Scrap by production run
- Scrap by product
- Scrap by machine
- Recovery generated
- Material yield

---

# 17. QC Module

QC is currently paper-based and must become a persistent digital module.

The attached Himalaya Plast sheet shows a batch-level header and repeated inspection readings.

## QC header fields observed from the provided sheet

- Die No.
- Manufacturing Date
- Batch No.
- DTD
- M-
- Product Code
- Colour
- MTRS

## QC reading columns observed

- Sr. No.
- Pin Size
- Width Size
- Leg (L) Size
- Weight
- Date/Time
- Fitting
- Authorised

The implementation should reproduce this operational concept in a proper responsive table rather than simply storing a scanned image or PDF.

## QC templates

The QC sheet should be a permanent module/template, but the client must be able to configure/change the field names and specifications for different products.

Support:

- QC Template
- Product mapping
- Measurement definitions
- Target/specification ranges if supplied
- Unit
- Required/optional
- Sequence/order of fields
- Active/inactive

## QC inspection

Every QC inspection should connect to:

- Production order
- Batch
- Product
- Die
- Machine if applicable
- Operator/production context where useful
- Inspector
- Timestamp
- Readings
- Decision
- Notes

Decision states:

```text
PASS
REJECT
SCRAP
REWORK
```

The decision must control downstream movement.

### Example

`PASS` → eligible for packing  
`REWORK` → return to controlled production/rework workflow  
`SCRAP` → scrap/recovery inventory path  
`REJECT` → hold/block until disposition

Never allow users to bypass a failed QC state silently.

---

# 18. QC Form UX

Desktop/tablet users should get a spreadsheet-like inspection grid.

Requirements:

- Fast keyboard navigation
- Add measurement row
- Duplicate previous row where helpful
- Automatic timestamp
- Numeric validation
- Optional target/range indicator
- Pass/fail indicator per measurement when specification rules exist
- Batch and production context always visible
- Final QC decision clearly visible
- Inspector name + timestamp
- Immutable historical records after approval, with controlled correction/audit mechanism

For mobile/low-resolution use, allow the table to become horizontally scrollable rather than compressing fields into unreadable controls.

---

# 19. Packing

Packing occurs after successful production/QC.

A Packing record should contain:

- Sales order
- Delivery note/order reference
- Product
- Batch
- Carton count
- Quantity per carton
- Total quantity
- Carton codes
- Packed by
- Packed timestamp

Every carton should receive a unique identifier suitable for QR/barcode printing.

Example:

`HP-CTN-000481`

Carton labels should be tied to their packing record and ultimately to the production batch.

---

# 20. Finished Goods Storage

After QC and packing, goods move into finished-goods inventory.

Storage should support at least:

- Location/warehouse
- Batch
- Product
- Carton
- Quantity
- Status

The user should be able to answer:

> Where is Batch X?

and

> Which finished stock belonging to Order X is currently available?

---

# 21. Dispatch Confirmation + Dispatch

The business workflow is:

```text
Finished Goods Ready
        ↓
Customer confirms dispatch
        ↓
Warehouse prepares dispatch
        ↓
Cartons scanned
        ↓
Expected vs scanned comparison
        ↓
Dispatch confirmed
        ↓
Stock decreases
```

The QR scan page must be optimized for a phone/tablet camera.

## Scanner requirements

- Full-screen camera view
- Large scan target
- Large expected/scanned count
- Immediate success feedback
- Duplicate warning
- Wrong-delivery-note warning
- Manual retry/restart
- Good performance on mid-range Android
- Audible/haptic feedback where supported

Example:

> `14 / 20 cartons scanned`

### Hard business rule

If:

`scanned cartons != expected cartons`

then dispatch confirmation must be blocked unless an authorized user provides an explicit override reason.

Every override must be recorded with:

- User
- Timestamp
- Reason
- Delivery note
- Expected count
- Actual count

---

# 22. Order Timeline

Every confirmed order should have a visual timeline.

The timeline should reflect the actual Himalaya workflow rather than a generic ERP chain.

Recommended stages:

1. Order Received
2. Proforma / Quotation
3. Material Availability Checked
4. Customer Confirmed
5. Production Planned
6. Production Running
7. QC
8. Packing
9. Stored / Ready for Dispatch
10. Dispatched
11. Payment / Closure

The existing documentation already describes a 10-stage order timeline concept; retain that concept but align the stage definitions with actual factory operations.

Each stage should show:

- status
- timestamp
- responsible user
- linked document
- optional note

Statuses:

```text
PENDING
IN_PROGRESS
COMPLETED
BLOCKED
```

---

# 23. Founder Dashboard

The Founder Dashboard should answer operational questions at a glance.

## Top-level cards

- Active Orders
- Orders Awaiting Confirmation
- Orders In Production
- Orders At Risk
- Pending QC
- Ready for Dispatch
- Today's Dispatch
- Low Raw Materials
- Outstanding Receivables, when accounting data is available

## Customer follow-up panel

Show:

- Customers with expected reorders approaching
- Customers overdue for expected contact
- Recent customers with no follow-up

## Production panel

Show:

- Current production runs
- Production today
- Pending QC
- Scrap generated
- Recovery generated

## Inventory panel

Show:

- Raw materials below threshold
- Finished goods ready to dispatch
- Recovered material available

Use real data from Prisma. No hard-coded dashboard metrics.

---

# 24. Navigation / Desk UX

Adopt an ERP-style Desk navigation pattern without copying ERPNext implementation.

Persistent left sidebar with:

```text
Dashboard

Orders
Customers
Items
Suppliers

Selling
  Enquiries
  Proformas / Quotations
  Sales Orders
  Follow-ups

Buying
  Purchase Orders
  Purchase Receipts
  Supplier Leads

Stock
  Raw Materials
  Finished Goods
  Scrap / Recycled
  Batches
  Stock Ledger

Production
  Production Orders
  Work Orders
  Job Cards
  Waste / Recovery

Quality
  QC Dashboard
  QC Inspections
  QC Templates
  QC History

Packing & Dispatch
  Packing
  Ready for Dispatch
  Dispatch
  QR Scanner

Accounts
  Invoices
  Payments
  Outstanding

Reports

Machines

Settings
```

Keep Machines secondary as requested; do not spend major implementation time there before the core flow is stable.

---

# 25. List Views

Every major data object should have a predictable list page.

Required capabilities:

- Search
- Filtering
- Pagination
- Sort
- Status badges
- Column visibility where useful
- Date filters
- Saved filters only if genuinely useful
- Open record
- Create new record
- Bulk actions only when safe

Examples:

- Orders
- Customers
- Items
- Suppliers
- Purchase Receipts
- Batches
- Production Orders
- QC Inspections
- Delivery Notes
- Invoices

Do not make every list page visually identical at the cost of workflow clarity, but maintain one coherent system.

---

# 26. Form Views

Use a standardized form header:

```text
Record title
Status badge
Primary action
Secondary actions
More menu
```

Below it, grouped sections:

- Basic Information
- Commercial Information
- Production Information
- Inventory Information
- History / Audit

Forms should support keyboard-first workflows for office users.

---

# 27. Design System

Use the updated design system as the starting point:

- Primary: `#1B4F72` placeholder until brand color is confirmed
- Accent: `#C87941`
- Success: `#2E7D32`
- Warning: `#B8860B`
- Destructive: `#B23A2E`
- Background: `#F8FAFC`
- Card: `#FFFFFF`
- Border: `#E2E8F0`
- Typography: Inter
- Monospace: JetBrains Mono
- Icons: Lucide React

Do not treat the placeholder primary color as final brand identity. Build tokens so the value can be changed centrally.

---

# 28. Authentication / RBAC

Current documented roles include:

- System Manager
- HPOS Founder
- Sales User
- Production Planner
- HPOS Operator
- Quality Inspector
- Warehouse Staff
- Accounts User

Enforce permissions server-side.

Recommended resource/action model:

```text
resource = SalesOrder
action = create | read | update | delete | approve | confirm
```

Do not limit the permission model to CRUD if workflow actions require distinct authority.

For example:

- `confirmSalesOrder`
- `approveQC`
- `confirmDispatch`
- `overrideDispatch`
- `adjustStock`

These should be explicit permissions where necessary.

---

# 29. Recommended Prisma Domain Model

The updated schema already contains many core models. Preserve those that are correct and expand them to support the discovered workflow.

Likely core entities:

```text
User
Role
Permission
UserRole
RolePermission
Session
AuditLog

Customer
CustomerContact
CustomerFollowUp
CustomerOrderPattern / ReorderReminder

Supplier
SupplierLead

Item
ItemCategory
BOM
BOMItem

Quotation / Proforma
SalesOrder
SalesOrderItem

PurchaseOrder
PurchaseOrderItem
PurchaseReceipt
PurchaseReceiptItem

Warehouse
StockLedgerEntry
StockReservation
Batch

ProductionOrder / WorkOrder
JobCard
Workstation
ProductionOutput
ProductionWaste
MaterialRecovery

QCTemplate
QCTemplateField
QualityInspection
QualityInspectionReading

PackingSlip
CartonLabel
DeliveryNote
DeliveryNoteItem

SalesInvoice
PurchaseInvoice
PaymentEntry

Machine
MaintenanceRecord
DowntimeLog
```

Not every entity must be introduced immediately. The coding agent should inspect the existing Prisma schema first and migrate incrementally.

---

# 30. Recommended Audit Model

Important operational records need auditability.

At minimum record:

- actor/user
- action
- resource
- resource ID
- timestamp
- previous state where practical
- new state where practical
- optional reason

High-value events:

- Sales Order confirmation
- Stock adjustment
- Batch creation
- Batch consumption
- Production completion
- QC decision
- Packing completion
- Dispatch override
- Invoice/payment modification
- Role/permission changes

---

# 31. Business Rules That Must Not Be Circumvented

1. A confirmed sales order should have a confirmation method recorded.
2. Material availability should be visible before production commitment.
3. Stock consumption cannot exceed available usable stock.
4. Batch-tracked material consumption must preserve batch linkage.
5. Production output must identify its source production order and batch.
6. QC is required where the product/item configuration says QC is required.
7. Failed/rework/scrap QC decisions cannot be silently treated as passed.
8. Only QC-cleared goods should normally become dispatch-ready finished stock.
9. Duplicate carton scans must never increase scanned quantity twice.
10. A mismatched carton must not count toward the delivery.
11. Dispatch confirmation requires scanned quantity = expected quantity unless an authorized override is used.
12. Every override requires a reason and audit log.
13. Stock reduction must happen through a controlled dispatch transaction.
14. Client reorder reminders are estimates/reminders, not confirmed orders.
15. Never delete important historical production/QC/stock records merely to correct a mistake; prefer correction/void/reversal patterns with audit history.

---

# 32. API / Server Action Conventions

Use Server Actions for internal application mutations and RSCs for read-heavy screens.

Every mutation should follow this shape:

```text
authenticate
↓
check permission
↓
validate input with Zod
↓
load relevant records
↓
validate business rules
↓
Prisma transaction
↓
write audit trail
↓
return typed result
```

Use a consistent response pattern such as:

```ts
{ success: true, data }
```

or

```ts
{ success: false, error, code }
```

Errors should be user-friendly but should not leak sensitive backend details.

---

# 33. Performance Requirements

The existing technical documentation targets fast App Router/RSC experiences.

Prioritize performance for:

- Founder Dashboard
- Order Timeline
- Stock pages
- Customer 360
- QR Dispatch Scan
- QC entry grid

Avoid fetching entire historical datasets when only summaries are required.

Use indexed fields for common queries such as:

- order number
- customer ID
- status
- batch number
- item ID
- production order
- delivery note
- createdAt/date ranges

---

# 34. Testing Strategy

Use the updated testing direction:

- Vitest for utility/validation/business logic
- Vitest + test DB for Server Actions
- Playwright or Cypress for E2E
- Manual UAT with Himalaya Plast stakeholders

Minimum test groups:

### Sales
- Create order
- Proforma lifecycle
- Material check
- Confirmation

### Inventory
- Receipt
- Batch creation
- Consumption
- Stock shortage
- Stock adjustment

### Production
- Work order
- Material issue
- Production completion
- Scrap/recovery

### QC
- Template selection
- Measurement entry
- PASS
- REJECT
- SCRAP
- REWORK

### Dispatch
- Packing
- QR match
- duplicate
- mismatch
- incomplete carton count
- override
- stock reduction

### Customer intelligence
- order history
- expected reorder calculation
- reminder creation
- manual override

### RBAC
- Every role tested against authorized and unauthorized actions.

---

# 35. Seed Data Requirements

Development seed data should represent a realistic factory, but must be clearly marked as demo data.

Include:

- Several customers
- At least one repeat customer with many historical orders
- Suppliers
- All initial raw-material categories
- Sample finished products
- BOMs
- Warehouses
- Batches
- Production orders
- QC templates
- QC readings
- Packing records
- Cartons
- Dispatch records
- Users for each role

Create one customer with recurring historical orders so Customer 360 and expected-reorder functionality can be demonstrated.

---

# 36. Implementation Order

Do not try to build the entire ERP simultaneously.

## Phase 0 — Foundation

1. Inspect existing repository.
2. Confirm Next.js/Prisma/PostgreSQL configuration.
3. Authentication.
4. RBAC foundation.
5. Audit logging.
6. UI shell / Desk navigation.
7. Design tokens.
8. Prisma migration/seed strategy.

## Phase 1A — Master Data

1. Customers
2. Customer contacts
3. Items / categories
4. Suppliers
5. Warehouses
6. Workstations
7. BOMs

## Phase 1B — Sales + Material Check

1. Enquiry/order intake
2. Proforma/quotation
3. Material availability
4. Customer confirmation
5. Sales order
6. Customer history

## Phase 1C — Inventory + Buying

1. Purchase Orders
2. Purchase Receipts
3. Raw-material batches
4. Stock ledger
5. Inventory views
6. Reservations

## Phase 1D — Production

1. Production order
2. Work order
3. Job cards
4. Material consumption
5. Production output
6. Scrap
7. Recovery

## Phase 1E — QC

1. QC templates
2. QC inspection header
3. Measurement grid
4. QC decisions
5. QC history
6. Production gating

## Phase 2A — Packing + Finished Goods

1. Packing
2. Carton labels
3. Finished stock
4. Storage location

## Phase 2B — Dispatch

1. Dispatch preparation
2. QR scanner
3. Duplicate/mismatch detection
4. Dispatch confirmation
5. Overrides
6. Stock reduction

## Phase 2C — Visibility

1. Order Timeline
2. Founder Dashboard
3. Customer reorder follow-ups
4. Reports

## Later

- Advanced machine management
- Planning Board
- AI email/forecasting
- External integrations beyond required accounting/GST needs

---

# 37. Machines

There are currently 6 machines.

Keep this module available but secondary during early implementation.

Eventually support:

- Machine master
- Current status
- Current production order
- Downtime
- Maintenance schedule
- Maintenance log
- Maintenance history

Do not allow machine management to delay the core order → production → QC → dispatch workflow.

---

# 38. Open Questions That Must Be Confirmed With Inzemam

The coding agent should maintain these as project open items rather than guessing:

1. What exact bookkeeping software is currently used?
2. Is HPOS replacing it or operating alongside it?
3. Does Inzemam need HPOS itself to generate GST-compliant documents?
4. What is the exact proforma format currently used?
5. What are the exact units for each raw material?
6. What are the real material grades/names?
7. What are the actual BOM recipes?
8. Which items require QC?
9. What specification/range constitutes a pass for each QC field?
10. What exactly does `DTD` mean on the QC sheet?
11. What exactly does `M-` mean on the QC sheet?
12. What exactly is the meaning of the handwritten fitting/authorized codes?
13. How is scrap converted into reusable material?
14. Are recovered materials blended with virgin granules, and under what rules?
15. What is the exact finished-goods storage structure?
16. How are carton quantities determined?
17. How are dispatch confirmations currently received from clients?
18. Which users/roles will actually log into the system?
19. What is the required audit/history retention period?
20. What are the legal/company/GST details?
21. Which payment/accounting data must exist in HPOS vs. remain external?
22. What are the preferred notification channels for reorder reminders?
23. What is the desired domain and email provider?
24. What QR/barcode hardware will be used at dispatch?

---

# 39. Strong Recommendations Before Heavy Coding

These are recommendations derived from the current workflow understanding, not confirmed client requirements.

## Recommendation A — Build a unified Order Detail page

Instead of forcing users to jump between Sales Order, Production, QC, Packing, and Dispatch screens, create a single contextual order page with tabs:

```text
Overview
Commercial
Materials
Production
QC
Packing
Dispatch
Timeline
Documents
Activity
```

This can become the operational "single source of truth" for an order.

## Recommendation B — Add a Material Commitment concept

Raw stock may appear available while another confirmed order has already claimed it.

A reservation/commitment system prevents double-promising stock.

## Recommendation C — Treat QC measurements as structured data

Do not store QC as only a PDF/image. Structured readings enable:

- trends
- specification violations
- product comparison
- batch comparison
- defect analysis

## Recommendation D — Build an Activity Feed

For each important record, show:

> who did what, when, and why.

This will reduce arguments and improve accountability without requiring users to understand a complicated audit system.

## Recommendation E — Create "Action Required" queues

Every operational role should have a small focused queue rather than staring at dashboards:

- Sales: confirmations + follow-ups
- Production: production jobs
- QC: inspections pending
- Warehouse: packing + dispatch
- Accounts: outstanding payments
- Founder: business exceptions

## Recommendation F — Make exceptions more important than totals

A factory dashboard is more useful when it highlights exceptions:

- Material shortage
- Production delayed
- QC failed
- Carton mismatch
- Customer confirmation pending
- Expected reorder overdue
- Payment overdue

## Recommendation G — Avoid premature AI

Do not start with AI forecasting. Build clean historical data first. The existing roadmap already defers AI/forecasting. Once order, production, inventory, QC, and customer-history data is reliable, forecasting becomes much more meaningful.

---

# 40. Coding-Agent Behaviour Rules

The coding agent must:

1. Inspect the current codebase before changing architecture.
2. Read the updated HPOS documentation supplied with the project.
3. Treat this document as the business-process implementation brief.
4. Never reintroduce ERPNext/Frappe architecture.
5. Prefer extending existing models/components over duplicate implementations.
6. Use TypeScript strictly.
7. Use Zod for server-bound mutation validation.
8. Use Prisma transactions for multi-step business operations.
9. Enforce authorization on the server.
10. Add tests alongside business logic.
11. Do not hard-code client data.
12. Do not invent legal/GST/accounting details.
13. Clearly mark unresolved assumptions.
14. Keep migrations safe and reviewable.
15. Never silently destroy historical business data.
16. Build in small vertical slices that can be tested end-to-end.
17. Keep UI responsive but optimize the core Desk for desktop/tablet and QR Scan for mobile.
18. Prefer simple deterministic business rules over speculative AI.
19. Do not spend major time on Machines, Planning Board, or AI until the core order-to-dispatch workflow works.
20. Before calling a feature complete, verify its user story, permissions, database integrity, audit behavior, and relevant tests.

---

# 41. Definition of Done

A feature is not complete merely because a screen exists.

A feature is complete when:

- Database model exists and is migrated safely.
- Server action/API exists where required.
- Validation exists.
- RBAC exists.
- Business rules exist.
- Audit trail exists for important actions.
- UI exists.
- Loading/error/empty states exist.
- Relevant tests pass.
- The workflow can be executed from beginning to end using representative data.
- No hard-coded production assumptions remain.

---

# 42. Final Product Mental Model

Think of HPOS as five connected systems:

```text
1. CUSTOMER + SALES
   Who ordered what, when, and what is expected next?

2. MATERIAL + INVENTORY
   Do we have the right material, and where is it?

3. PRODUCTION
   What are we making, on which machine, using which material?

4. QUALITY + TRACEABILITY
   Is it good, and can we prove exactly how it was made?

5. PACKING + DISPATCH + FINANCE
   What left the factory, for whom, and what remains to be collected?
```

Everything in the product should reinforce those five questions.

---

# 43. Source Notes

This specification is based on:

- The updated HPOS Next.js documentation set supplied in this project.
- The previously supplied HPOS proposal/pitch material for business-domain context.
- The actual factory workflow described by the client in the current discovery conversation.
- The provided Himalaya Plast handwritten QC sheet image and digital QC format image.

Where a recommendation is marked as a recommendation, it should be validated with Inzemam before being treated as a fixed business requirement.
