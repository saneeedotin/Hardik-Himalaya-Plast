# Test Plan
## Himalaya Plast Operating System (HPOS)

## 1. Test Levels
- **Unit tests:** Vitest for individual utility functions, specialized calculations (e.g. BOM material requirements), and Zod schema validations.
- **Integration tests:** Vitest with a test database for all Next.js Server Actions. Target: every action in the Buying, Selling, and Manufacturing modules has at least one happy-path + one permission-denied + one edge-case test.
- **End-to-End (E2E) tests:** Playwright or Cypress for document flow tests (create Quotation → Sales Order → Work Order → Job Card → Quality Inspection → Delivery Note → Sales Invoice).
- **UAT (User Acceptance Testing):** Manual, persona-driven, run with client stakeholders on staging before each phase go-live, directly against the User Stories in `06_USER_STORIES.md`.

## 2. Test Scenarios by Module

### 2.1 Selling
| ID | Scenario | Expected Result |
|---|---|---|
| SELL-01 | Create Quotation from Opportunity | Customer/contact pre-filled, prices from Price List |
| SELL-02 | Change Sales Order status to Approved without `approvalMethod` set | Action blocked, Zod validation error |
| SELL-03 | Change Sales Order status to Approved with `approvalMethod` = WhatsApp | Action succeeds |

### 2.2 Buying & Stock
| ID | Scenario | Expected Result |
|---|---|---|
| BUY-01 | Submit Purchase Receipt for batch-tracked item | `Batch` record created and linked via `StockLedgerEntry` |
| BUY-02 | Attempt to consume received stock in Work Order before QC passed | Blocked (if QC-required item) |

### 2.3 Manufacturing
| ID | Scenario | Expected Result |
|---|---|---|
| MFG-01 | Create Production Plan from confirmed Sales Orders | Raw material requirement correctly calculated from BOM |
| MFG-02 | Start Job Card without Workstation/Employee assigned | Blocked |
| MFG-03 | Complete Work Order via Stock Entry (Manufacture) | FG Batch created |

### 2.4 Quality Management
| ID | Scenario | Expected Result |
|---|---|---|
| QC-01 | Create Quality Inspection for a product code | Correct Reading parameters pre-loaded from template |
| QC-02 | Mark inspection Reject | Rework process triggered |

### 2.5 Inventory & Traceability
| ID | Scenario | Expected Result |
|---|---|---|
| INV-01 | Trace Delivery Note backward to raw material batch | Full chain returned via Prisma recursive/joined query |
| INV-02 | Traceability query performance | Completes in < 10s against realistic data volume |

### 2.6 Packing & Dispatch
| ID | Scenario | Expected Result |
|---|---|---|
| DISP-01 | Scan valid carton against correct Delivery Note | Count increments, positive feedback shown |
| DISP-02 | Scan same carton twice | "Duplicate" warning shown |
| DISP-03 | Scan carton belonging to a different Delivery Note | "Mismatch" error shown |
| DISP-04 | Attempt `confirmDispatch` with scanned ≠ expected, no override | Blocked with clear error |

### 2.7 Accounts & GST
| ID | Scenario | Expected Result |
|---|---|---|
| ACC-01 | Submit Sales Invoice | Third-party API integration generates IRN + QR |

### 2.8 Custom Screens
| ID | Scenario | Expected Result |
|---|---|---|
| DASH-01 | Founder Dashboard loads for a non-Founder/Admin user | 403 / Access Denied page |
| DASH-02 | Founder Dashboard load time under realistic data volume | < 1 second |

## 3. Permission/RBAC Test Pass
For every role in `07_RBAC.md`, write a Vitest suite to verify the Server Actions properly block or allow access based on the logged-in mock session. Specifically test:
- `HPOS Operator` cannot view another operator's Job Cards via the `getJobCards` action.
- `HPOS Warehouse Scan` role gets a `403` when trying to call `createSalesOrder`.

## 4. Non-Functional Test Pass
- Load Founder Dashboard and Order Timeline with a synthetic dataset (~500 Sales Orders, ~2000 Job Cards) seeded via `prisma/seed.ts` and confirm performance targets.

## 5. UAT Sign-off Checklist (per phase)
- [ ] Phase 0: Company/masters setup reviewed and confirmed accurate by client
- [ ] Phase 1: Each module's native flow walked through end-to-end with a real (or representative) order by client stakeholders
- [ ] Phase 2: Order Timeline, Founder Dashboard, QR Dispatch Scan demoed and approved by Founder + Warehouse staff
