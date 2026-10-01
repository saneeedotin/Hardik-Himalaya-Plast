# API Specification
## `hpos_extensions` Custom App — Whitelisted API Methods

All endpoints below are Frappe whitelisted methods (`@frappe.whitelist()`), authenticated via standard Frappe session cookie or API key/secret, and **must** re-check permissions server-side via `frappe.has_permission()` against the underlying DocType — the frontend never assumes access.

Base path: `/api/method/hpos_extensions.hpos_extensions.api.<module>.<method>`

---

## 1. Order Timeline

### `GET/POST order_timeline.get_order_timeline`
**Params:** `sales_order` (string, required — Sales Order name)

**Response:**
```json
{
  "sales_order": "SO-2026-00042",
  "customer": "ABC Auto Components",
  "current_stage": "job_card",
  "stages": [
    {"stage": "quotation", "label": "Quotation", "status": "completed", "doc": "QTN-00042", "timestamp": "2026-09-01T10:00:00"},
    {"stage": "sales_order", "label": "Sales Order", "status": "completed", "doc": "SO-2026-00042", "timestamp": "2026-09-02T09:00:00", "meta": {"approval_method": "WhatsApp"}},
    {"stage": "production_plan", "label": "Production Plan", "status": "completed", "doc": "PP-00017", "timestamp": "2026-09-03T08:00:00"},
    {"stage": "work_order", "label": "Work Order", "status": "completed", "doc": "WO-00088", "timestamp": "2026-09-03T09:00:00"},
    {"stage": "job_card", "label": "Job Card", "status": "in_progress", "doc": "JC-00201", "timestamp": null},
    {"stage": "quality_inspection", "label": "Quality Inspection", "status": "pending", "doc": null, "timestamp": null},
    {"stage": "packing_slip", "label": "Packing Slip", "status": "pending", "doc": null, "timestamp": null},
    {"stage": "delivery_note", "label": "Delivery Note", "status": "pending", "doc": null, "timestamp": null},
    {"stage": "sales_invoice", "label": "Sales Invoice", "status": "pending", "doc": null, "timestamp": null}
  ]
}
```
**Errors:** `404` if Sales Order not found; `403` if user lacks read permission on Sales Order.

---

## 2. Founder Dashboard

### `GET founder_dashboard.get_business_health`
**Params:** `date_range` (optional string enum: `today`, `week`, `month`; default `today`)

**Response:**
```json
{
  "health_score": 78,
  "health_score_note": "beta — formula not yet validated against real data volume",
  "at_risk_orders": {
    "count": 5,
    "orders": [
      {"sales_order": "SO-2026-00040", "customer": "XYZ Traders", "expected_delivery": "2026-09-15", "days_overdue": 5, "stage": "job_card"}
    ]
  },
  "payments_overdue": {
    "count": 3,
    "total_amount": 412500.00,
    "invoices": [
      {"sales_invoice": "SINV-2026-00120", "customer": "ABC Auto Components", "due_date": "2026-09-10", "outstanding_amount": 150000.00, "days_overdue": 10}
    ]
  },
  "production_status": {
    "open_work_orders": 12,
    "by_status": {"Not Started": 2, "In Process": 8, "Completed": 2},
    "machine_utilization": [
      {"workstation": "Extruder-1", "utilization_pct": 82},
      {"workstation": "Extruder-2", "utilization_pct": 61}
    ]
  },
  "todays_dispatch": {
    "count": 4,
    "total_cartons": 96,
    "delivery_notes": ["DN-2026-00301", "DN-2026-00302", "DN-2026-00303", "DN-2026-00304"]
  }
}
```
**Errors:** `403` if user's role isn't permitted to view aggregate financials (see RBAC.md — Founder Dashboard access is restricted to Founder/Owner + Admin roles by default).

### `GET/POST founder_dashboard.get_settings` / `update_settings`
Get/set health-score formula weights, stored in a `HPOS Settings` singleton DocType. `update_settings` restricted to System Manager role.

---

## 3. QR Dispatch Scan

### `POST dispatch_scan.get_expected_cartons`
**Params:** `delivery_note` (string, required)

**Response:**
```json
{
  "delivery_note": "DN-2026-00301",
  "expected_carton_count": 20,
  "scanned_carton_count": 0,
  "cartons": [
    {"carton_code": "HP-CTN-000481", "item": "Gasket-Type-A", "qty": 500, "status": "pending"}
  ]
}
```

### `POST dispatch_scan.verify_carton_scan`
**Params:** `delivery_note` (string, required), `carton_code` (string, required)

**Response (match):**
```json
{"result": "match", "carton_code": "HP-CTN-000481", "scanned_count": 14, "expected_count": 20}
```
**Response (mismatch — wrong DN or unknown code):**
```json
{"result": "mismatch", "reason": "carton_not_in_this_delivery_note", "carton_code": "HP-CTN-000481"}
```
**Response (duplicate scan):**
```json
{"result": "duplicate", "carton_code": "HP-CTN-000481", "first_scanned_at": "2026-09-20T14:02:11", "first_scanned_by": "warehouse.staff@himalayaplast.com"}
```

### `POST dispatch_scan.confirm_dispatch`
**Params:** `delivery_note` (string, required), `override` (bool, optional — required `true` if scanned_count != expected_count), `override_reason` (string, required if `override=true`)

**Response:**
```json
{"result": "confirmed", "delivery_note": "DN-2026-00301", "confirmed_by": "warehouse.staff@himalayaplast.com", "confirmed_at": "2026-09-20T14:10:00", "override_used": false}
```
**Errors:** `400` if counts don't reconcile and `override` not set to `true`.

---

## 4. Common Conventions
- All timestamps ISO 8601, server timezone (Asia/Kolkata).
- All list responses paginated where relevant (`limit`, `offset` params), default limit 20.
- All errors follow Frappe's standard `{"exc_type": ..., "exception": ...}` shape surfaced via `frappe.throw()`.
- Every write endpoint (`verify_carton_scan`, `confirm_dispatch`, `update_settings`) logs `frappe.session.user` + timestamp against the relevant record for audit purposes (see TRD §7).
