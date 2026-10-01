# Prompt 06 — Packing & Dispatch Module

## Before You Start
- Read `PROGRESS.md`. Confirm Prompts 00–05 are `done`.
- Reference docs: `05_DATA_MODEL.md` §6 (Packing Slip / Delivery Note rows), `06_USER_STORIES.md` Epic 6.

## Context
Configure Packing Slip (native carton/case-wise packing) and Delivery Note (Transporter/Vehicle/LR fields). Per `05_DATA_MODEL.md`, verify these native fields exist in the installed ERPNext version before assuming custom fields are needed — don't add duplicate custom fields for something ERPNext already ships natively.

## Objective
Confirm/configure the QC-pass → Packing Slip → Delivery Note flow, and verify (not assume) whether Transporter/Vehicle/LR fields need to be added as custom fields.

## Instructions
1. Inspect the installed ERPNext version's Delivery Note DocType for existing Transporter, Vehicle No., and LR (Lorry Receipt) No. fields. Recent ERPNext versions include these natively (Transporter, Vehicle No.) — confirm which exist and which (if any) need a Custom Field added. Document exactly what was found in `PROGRESS.md` rather than assuming.
2. Walk the flow: a Quality-Inspection-Pass'd test batch (from Prompt 05) → Finished Goods warehouse stock → Packing Slip (carton/case-wise, against the test Sales Order/Delivery Note) → Delivery Note.
3. Confirm Packing Slip line item quantities correctly sum to and reconcile against the Delivery Note's item quantities.
4. Confirm the FG Batch is correctly printed/visible on the Delivery Note — this is the final link in the batch genealogy chain (`05_DATA_MODEL.md` §5): Purchase Receipt → Stock Entry → Work Order → FG Batch → **Delivery Note**.
5. If any Transporter/Vehicle/LR fields were missing natively, add them as Custom Fields on Delivery Note and export as fixtures, same pattern as Prompt 01.

## Verification (do not mark this prompt done until these pass)
- [ ] Packing Slip line items reconcile against Delivery Note quantities (per DISP-01).
- [ ] FG Batch number is visible/printed on the Delivery Note.
- [ ] Transporter/Vehicle/LR field status is documented (native vs. added) in `PROGRESS.md`.
- [ ] The full batch genealogy chain from `05_DATA_MODEL.md` §5 now resolves end-to-end for the test order: Purchase Receipt → Stock Entry → Work Order → FG Batch → Delivery Note (cross-check against Prompt 04's manufacturing-side verification).

## Update PROGRESS.md
Append to "06 — Packing & Dispatch": status, which Transporter/Vehicle/LR fields were native vs. added, confirmation of end-to-end batch genealogy across the whole order-to-cash chain, verification result.
