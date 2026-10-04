# Data Model / Entity Relationship Document
## Himalaya Plast Operating System (HPOS)

## 1. Principle
The data model is defined entirely in `prisma/schema.prisma`. It mirrors the complexity of a lightweight ERP, specifically tailored for Himalaya Plast's operations.

## 2. Core Order-to-Cash Chain
```
Customer ──> Sales Order ──> Work Order ──> Job Card ──> Quality Inspection
                                 │
                                 ▼
                         Delivery Note ──> Carton Label (Scan)
                                 │
                                 ▼
                         Sales Invoice
```

## 3. Current Prisma Schema Highlights
The current `schema.prisma` already implements substantial portions of the system:
- **Auth & Roles:** `User`, `Role`, `Permission`, `UserRole`, `RolePermission`, `Session`, `AuditLog`.
- **Master Data:** `Item`, `Workstation`, `Batch`.
- **Selling & Production:** `SalesOrder`, `SalesOrderItem`, `BOM`, `BOMItem`, `WorkOrder`, `JobCard`.
- **Quality:** `QualityInspection` (4-state QCStatus: PASS, REJECT, SCRAP, REWORK).
- **Dispatch:** `DeliveryNote`, `CartonLabel`.
- **Operations:** `DowntimeLog`, `ShiftHandover`, `Die`, `MaterialScanLog`, `Customer`.

## 4. Planned Schema Additions (Next Phase)
To support the prioritized modules (Buying/Stock, Accounts/Invoicing), we will add/refine the following models in upcoming migrations:

### Buying & Stock
- **Supplier:** Master data for vendors.
- **PurchaseOrder / PurchaseOrderItem:** Buying pipeline.
- **PurchaseReceipt:** GRN documentation, creates `Batch` records.
- **Warehouse:** Multi-location tracking.
- **StockLedgerEntry:** Immutable ledger of all item movements (Receipt, Issue, Transfer) replacing simple quantity fields for robust inventory tracking.

### Accounts & Invoicing
- **SalesInvoice / PurchaseInvoice:** Financial records linked to Delivery Notes / Purchase Receipts.
- **PaymentTerm / PaymentEntry:** Tracking receivables and payables.
- **ChartOfAccounts / GL_Entry:** (If full accounting is implemented, otherwise integration logs for Tally).

## 5. Batch Genealogy
The core traceability entity chain runs through the `Batch` model. A `Batch` has a `parentBatchId` to trace backward.
- A raw material `Batch` is created upon `PurchaseReceipt`.
- A finished goods `Batch` is created upon manufacturing completion, with its `parentBatchId` pointing to the consumed raw material batch.
