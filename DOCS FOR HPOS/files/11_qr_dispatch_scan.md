# Prompt 11 — QR Dispatch Scan Screen

## Before You Start
- Read `PROGRESS.md`. Confirm Prompt 10 is `done`.
- Reference docs: `02_TRD.md` §5.3, `04_API_SPEC.md` §3, `03_DESIGN_SYSTEM.md` Part B.4 (QR scan-specific UI spec), `06_USER_STORIES.md` Epic 6 (US-6.2), `05_DATA_MODEL.md` §7 (`HPOS Carton Label` DocType).

## Context
This is the one custom screen NOT embedded in the Frappe Desk — it's a standalone mobile-responsive page for shop-floor/warehouse use, per `02_TRD.md`'s reasoning (camera access, lighter session, used on shared warehouse devices).

## Objective
1. Create the `HPOS Carton Label` DocType.
2. Build the carton-code-to-QR print format for cartons.
3. Implement the three dispatch-scan API endpoints per `04_API_SPEC.md` §3.
4. Build the standalone camera-scan page per the Design System spec.

## Instructions
1. Create `HPOS Carton Label` DocType (per `05_DATA_MODEL.md` §7): fields `carton_code` (unique), `packing_slip`, `packing_slip_item`, `delivery_note`, `item`, `qty`, `scanned` (bool), `scanned_by`, `scanned_at`.
2. Wire carton label creation into the Packing Slip flow (from Prompt 06): when a Packing Slip is submitted, auto-generate one `HPOS Carton Label` record per carton with a unique `carton_code` (use the batch naming convention decided in Prompt 03 as a component of the carton code, so codes are traceable back to source batch by inspection).
3. Build a print format for the carton label generating a QR code encoding `carton_code`, using Frappe's native barcode/QR utilities (`frappe.utils.barcode` or equivalent) — per `02_TRD.md` §5.3.
4. Implement `hpos_extensions/hpos_extensions/api/dispatch_scan.py` with `get_expected_cartons`, `verify_carton_scan`, and `confirm_dispatch` exactly per the request/response contracts and error cases in `04_API_SPEC.md` §3 (match, mismatch, duplicate, override-required, override-confirmed responses precisely — other code may depend on these exact shapes).
5. Build the standalone page at `hpos_extensions/hpos_extensions/www/dispatch-scan/` per `03_DESIGN_SYSTEM.md` Part B.4: full-viewport camera view with scan-target overlay, `BarcodeDetector` API with `html5-qrcode` fallback for broader device support, large high-contrast running counter, distinct color/haptic/audio feedback for match vs. mismatch vs. duplicate, 44×44px minimum tap targets.
6. Restrict page + API access to `HPOS Warehouse Scan` and admin roles only, per `07_RBAC.md` §3 — enforce server-side in every endpoint, not just by not linking to the page from other roles' menus.
7. Log every scan and every dispatch-override event with user + timestamp (+ reason, for overrides) per `02_TRD.md` §7 and `07_RBAC.md` §6 — this is a compliance-sensitive action (goods leaving without a reconciled count).

## Verification (do not mark this prompt done until these pass)
- [ ] Submitting a test Packing Slip auto-generates the correct number of `HPOS Carton Label` records with unique codes.
- [ ] Carton label print format renders a scannable QR code.
- [ ] Scanning a valid carton against the correct test Delivery Note increments the count with clear positive feedback (per DISP-02).
- [ ] Scanning the same carton twice produces a "duplicate" response, does not double-increment (per DISP-03).
- [ ] Scanning a carton belonging to a different Delivery Note produces a clear "mismatch" response (per DISP-04).
- [ ] Attempting `confirm_dispatch` with an unreconciled count and no override is blocked (per DISP-05); succeeding with an override + reason logs the event correctly (per DISP-06).
- [ ] Page and API endpoints return 403 for a test user without the `HPOS Warehouse Scan`/admin role, via direct API call.
- [ ] If feasible in your environment, test the camera scan on an actual or emulated mid-range Android device (per DISP-07) — if not feasible in this environment, flag it explicitly as unverified in `PROGRESS.md` rather than assuming it works.

## Update PROGRESS.md
Append to "11 — QR Dispatch Scan": status, confirm all four scan-response types (match/mismatch/duplicate/override) tested, confirm 403 enforcement, explicitly note whether real-device camera testing (DISP-07) was actually performed or remains an open item.
