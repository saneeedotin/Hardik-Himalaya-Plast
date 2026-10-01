# Test Plan
## Himalaya Plast Operating System (HPOS)

## 1. Test Levels
- **Unit tests:** Python (Frappe's `FrappeTestCase`) for all `hpos_extensions` whitelisted methods and any custom Workflow/hook logic. Target: every method in API_SPEC.md has at least one happy-path + one permission-denied + one edge-case test.
- **Integration tests:** End-to-end document flow tests using Frappe's test framework (create Quotation → Sales Order → Work Order → Job Card → Quality Inspection → Delivery Note → Sales Invoice, asserting each link and status transition).
- **UAT (User Acceptance Testing):** Manual, persona-driven, run by Param with client stakeholders on staging before each phase go-live, directly against the User Stories in `06_USER_STORIES.md`.
- **Regression:** Re-run integration test suite after every ERPNext/Frappe version bump or `hpos_extensions` change before deploying to production.

## 2. Test Scenarios by Module

### 2.1 Selling
| ID | Scenario | Expected Result |
|---|---|---|
| SELL-01 | Create Quotation from Opportunity | Customer/contact pre-filled, prices from Price List |
| SELL-02 | Change Sales Order status to Approved without `approval_method` set | Save blocked, validation error |
| SELL-03 | Change Sales Order status to Approved with `approval_method` = WhatsApp | Save succeeds, field visible on print format |

### 2.2 Buying
| ID | Scenario | Expected Result |
|---|---|---|
| BUY-01 | Submit Purchase Receipt for batch-tracked item | Batch record created and linked |
| BUY-02 | Attempt to consume received stock in Work Order before Quality Inspection passed | Blocked (if QC-required item) |
| BUY-03 | Submit Purchase Invoice against Purchase Receipt | Amounts reconcile correctly |

### 2.3 Manufacturing
| ID | Scenario | Expected Result |
|---|---|---|
| MFG-01 | Create Production Plan from confirmed Sales Orders | Raw material requirement correctly calculated from BOM |
| MFG-02 | Start Job Card without Workstation/Employee assigned | Blocked |
| MFG-03 | Record scrap quantity on Job Card | Reflected in resulting Stock Entry, tied to BOM scrap item |
| MFG-04 | Complete Work Order via Stock Entry (Manufacture) | FG Batch created |

### 2.4 Quality Management
| ID | Scenario | Expected Result |
|---|---|---|
| QC-01 | Create Quality Inspection for a product code | Correct Reading parameters pre-loaded from template |
| QC-02 | Mark inspection Reject | Rework Stock Entry auto-suggested per Workflow |
| QC-03 | Mark inspection Scrap | Routed correctly, no false "Accepted" state exposed anywhere downstream |
| QC-04 | Query QC history for a product over a date range | Returns digital records only, no gaps (validates "zero paper" success metric assumption once live) |

### 2.5 Inventory & Traceability
| ID | Scenario | Expected Result |
|---|---|---|
| INV-01 | Trace Delivery Note backward to raw material batch | Full chain returned: DN → FG Batch → Work Order → consumed Batch → Purchase Receipt → Supplier |
| INV-02 | Query all Delivery Notes sharing a given raw material batch | Correct, complete list returned |
| INV-03 | Traceability query performance | Completes in <5 min against realistic data volume (PRD success metric) |

### 2.6 Packing & Dispatch
| ID | Scenario | Expected Result |
|---|---|---|
| DISP-01 | Create Packing Slip against Delivery Note | Line item quantities reconcile |
| DISP-02 | Scan valid carton against correct Delivery Note | Count increments, positive feedback shown |
| DISP-03 | Scan same carton twice | "Duplicate" warning shown, count does not double-increment |
| DISP-04 | Scan carton belonging to a different Delivery Note | "Mismatch" error shown |
| DISP-05 | Attempt `confirm_dispatch` with scanned ≠ expected, no override | Blocked with clear error |
| DISP-06 | `confirm_dispatch` with override + reason | Succeeds, override event logged with user + reason |
| DISP-07 | QR scan on mid-range Android device, warehouse lighting | Camera scan reliably reads carton QR code |

### 2.7 Accounts & GST
| ID | Scenario | Expected Result |
|---|---|---|
| ACC-01 | Submit Sales Invoice with India Compliance app configured | IRN + QR generated, E-Way Bill generated from same document |
| ACC-02 | Submit Sales Invoice with invalid/incomplete GSTIN config | Clear error, no silent failure |
| ACC-03 | Record partial Payment Entry against Sales Invoice with Payment Terms | Outstanding amount correctly reduced, still shows as overdue if due date passed |

### 2.8 Custom Screens
| ID | Scenario | Expected Result |
|---|---|---|
| ORD-01 | Open Order Timeline for a Sales Order with all 9 downstream docs created | All stages show "completed" with correct timestamps and linked docs |
| ORD-02 | Open Order Timeline for a brand-new Sales Order | Only Quotation/Sales Order stages completed, rest "pending" |
| DASH-01 | Founder Dashboard loads for a non-Founder/Admin user | 403 — access denied |
| DASH-02 | Founder Dashboard load time under realistic data volume | <2 seconds |
| DASH-03 | At-risk order threshold changed in `HPOS Settings` | Dashboard reflects new threshold on next load |

## 3. Permission/RBAC Test Pass
For every role in `07_RBAC.md`, verify (a) the role CAN do everything the matrix says it should, and (b) the role CANNOT do anything the matrix says it shouldn't — including via direct API call (not just hidden UI elements). Specifically test:
- `HPOS Operator` cannot view another operator's Job Cards.
- `HPOS Warehouse Scan` role cannot access any Desk module beyond the QR scan page.
- Non-Founder/Admin roles get `403` calling `founder_dashboard.get_business_health` directly via API, not just via UI hiding.

## 4. Non-Functional Test Pass
- Load Founder Dashboard and Order Timeline with a synthetic dataset (~500 Sales Orders, ~2000 Job Cards) and confirm performance targets in TRD §8.
- Confirm QR Dispatch Scan works offline-tolerant enough for brief connectivity drops on shop floor Wi-Fi (define acceptable behavior: queue-and-retry vs. hard block — **flag as open item**, not yet specified).

## 5. UAT Sign-off Checklist (per phase)
- [ ] Phase 0: Company/masters setup reviewed and confirmed accurate by client
- [ ] Phase 1: Each module's native flow walked through end-to-end with a real (or representative) order by client stakeholders
- [ ] Phase 2 subset: Order Timeline, Founder Dashboard, QR Dispatch Scan demoed and approved by Founder + Warehouse staff specifically (the two personas these screens target)

## 6. Open Items
- [ ] Offline/connectivity-drop behavior for QR Dispatch Scan not yet specified — confirm with client whether shop floor Wi-Fi reliability is a real concern.
- [ ] Realistic data volume assumptions (500 SOs / 2000 Job Cards) are estimates — confirm actual order volume with client to validate performance targets are set correctly.
