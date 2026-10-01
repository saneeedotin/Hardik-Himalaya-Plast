# Data Model / Entity Relationship Document
## Himalaya Plast Operating System (HPOS)

## 1. Principle
HPOS does not introduce a parallel data model. The vast majority of entities are **native ERPNext DocTypes**, used as-is or with light customization (one custom field, one workflow). Only where explicitly noted is a **new custom DocType** introduced.

## 2. Core Order-to-Cash Chain (native DocTypes, linked)

```
Lead ──> Opportunity ──> Quotation ──> Sales Order ──> Production Plan ──> Work Order ──> Job Card
                                          │                                                  │
                                          │ (approval_method: custom field)                  ▼
                                          │                                          Quality Inspection
                                          ▼                                                  │
                                    (batch-linked)                                           ▼
                                                                                      Packing Slip
                                                                                              │
                                                                                              ▼
                                                                                      Delivery Note
                                                                                              │
                                                                                              ▼
                                                                                      Sales Invoice ──> Payment Entry
                                                                                              │
                                                                                              ▼
                                                                                    e-Invoice/IRN + E-Way Bill
                                                                                    (via India Compliance app)
```

## 3. Core Procure-to-Pay Chain (native DocTypes, linked)

```
Supplier ──> Purchase Order ──> Purchase Receipt (GRN, batch created) ──> Quality Inspection (Incoming) ──> Purchase Invoice
```

## 4. Manufacturing Chain (native DocTypes, linked)

```
BOM ──> Production Plan ──> Work Order ──> Job Card (Workstation + Employee) ──> Stock Entry (Manufacture, creates FG Batch)
                                                    │
                                                    └──> Scrap/Process Loss (linked to BOM scrap items, recorded on Job Card)
```

## 5. Batch Genealogy (the core traceability entity chain)

```
Purchase Receipt (Batch created)
      │
      ▼
Stock Entry (Consumption — raw material batch consumed into Work Order)
      │
      ▼
Work Order (batch-linked)
      │
      ▼
FG Batch (child batch created at Stock Entry — Manufacture)
      │
      ▼
Delivery Note (FG batch printed on delivery document)
```
**Traceability query pattern:** given a customer-reported defect on a Delivery Note, walk this chain backward: Delivery Note → FG Batch → Work Order → Stock Entry (Consumption) → raw material Batch → Purchase Receipt → Supplier, and forward again to find every other Delivery Note that used the same raw material batch. This is the single highest-value native capability in the system and requires zero custom development — it is a Frappe report/query against existing Batch linkages.

## 6. Native DocTypes Used — Reference Table

| DocType | Module | Customization |
|---|---|---|
| Lead, Opportunity | Selling (CRM) | None |
| Quotation | Selling | None |
| Sales Order | Selling | **+1 custom field:** `approval_method` (Select: Email/WhatsApp/Phone/Verbal) |
| Customer | Selling | None |
| Supplier | Buying | None |
| Purchase Order | Buying | None |
| Purchase Receipt | Buying/Stock | None (native GRN, batch assignment) |
| Purchase Invoice | Accounts | None |
| Item, Item Group, UOM | Stock | None |
| Batch | Stock | None (native batch genealogy) |
| Warehouse | Stock | None |
| Stock Entry | Stock/Manufacturing | None |
| BOM | Manufacturing | None |
| Production Plan | Manufacturing | None |
| Work Order | Manufacturing | None |
| Job Card | Manufacturing | None (natively carries Workstation + Employee) |
| Workstation | Manufacturing/Assets | None |
| Quality Inspection Template | Quality Management | One template per product code |
| Quality Inspection | Quality Management | **+1 Frappe Workflow:** extends native Accepted/Rejected into Pass/Reject/Scrap/Rework 4-state |
| Asset, Asset Maintenance | Assets | Evaluate scope with client (maintenance log vs. full depreciation) |
| Sales Invoice | Accounts | India Compliance app fields (IRN, QR, e-Way Bill No.) auto-populated on submit |
| Payment Entry, Payment Terms Template | Accounts | None |
| Packing Slip | Stock | Verify carton-wise fields meet requirement in the ERPNext version deployed |
| Delivery Note | Stock | Verify Transporter/Vehicle/LR fields present (native in recent ERPNext versions); add custom fields only if gaps found |
| Role, User, Workflow, Notification | Frappe Core | Configured per RBAC.md |

## 7. New Custom DocTypes (introduced by `hpos_extensions`)

| DocType | Purpose | Key Fields |
|---|---|---|
| `HPOS Settings` | Singleton — stores Founder Dashboard health-score formula weights, configurable thresholds (e.g. "days overdue" cutoff for at-risk flag) | `on_time_weight`, `payment_weight`, `qc_reject_weight`, `at_risk_days_threshold` |
| `HPOS Carton Label` | Maps a printed carton QR code to a Packing Slip Item, for dispatch scan verification | `carton_code` (unique), `packing_slip`, `packing_slip_item`, `delivery_note`, `item`, `qty`, `scanned` (bool), `scanned_by`, `scanned_at` |

No new DocTypes are required for Order Timeline or Founder Dashboard themselves — both are pure read-aggregation views over native data.

## 8. Reserved for Future Phases (not built now, named here so nothing conflicts later)

| Future Entity | Phase | Notes |
|---|---|---|
| `HPOS Planning Board Slot` (or similar) | Phase 3 — Planning Board | Drag-drop machine × date capacity grid; deliberately deferred until real production data volume exists to design against |
| AI forecast/email draft tables | Phase 4 — AI Features | Out of scope; no schema reserved yet beyond noting it will likely read from Sales Order + Work Order history |

## 9. Migration Notes
No production data migration is specified in detail here — see PRD §7 open items (migration scope not yet confirmed with client: opening balances only vs. full masters vs. historical transactions). When scope is confirmed, migration will use Frappe's native **Data Import** tool for masters (Customer, Supplier, Item) and custom Python migration scripts (`bench execute`) for anything requiring transformation (e.g., mapping a Tally chart of accounts to ERPNext's Chart of Accounts tree).
