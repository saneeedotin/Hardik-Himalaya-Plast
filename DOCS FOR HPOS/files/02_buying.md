# Prompt 02 — Buying Module

## Before You Start
- Read `PROGRESS.md`. Confirm Prompt 01 is `done`.
- Reference docs: `05_DATA_MODEL.md` §3 & §6 (Buying rows), `06_USER_STORIES.md` Epic 2.

## Context
Configure Supplier → Purchase Order → Purchase Receipt (native GRN, batch assigned at receipt) → Purchase Invoice. No customization is required for this module per the Data Model doc — this prompt is pure configuration and verification, not custom code.

## Objective
Confirm native Buying flow works correctly with batch assignment at receipt, and that incoming QC gating (from the Quality module, configured in Prompt 05) has the right hook point ready even though QC itself isn't configured yet.

## Instructions
1. Review Buying Settings (Buying > Settings) for sane defaults (default Supplier Group, buying price list) — same caveat as Prompt 01: don't hardcode Himalaya Plast-specific values without real data, flag as open item.
2. Create one `TEST-` prefixed Supplier and one `TEST-` prefixed batch-tracked Item (reuse the test Item from Prompt 01 if suitable, or create a new one — enable `has_batch_no` on it).
3. Walk the flow: Purchase Order → Purchase Receipt → confirm a Batch record is auto-created and linked to the received stock (per `05_DATA_MODEL.md` §5, this is the first link in the batch genealogy chain) → Purchase Invoice.
4. Do NOT build the "block consumption until QC passes" logic yet — that depends on Quality Inspection Templates configured in Prompt 05. Just confirm the Purchase Receipt correctly triggers whatever QC-required flag ERPNext exposes natively (`Item > Quality Inspection Required` checkbox), so Prompt 05 has something to hook into. Note this dependency explicitly in `PROGRESS.md`.

## Verification (do not mark this prompt done until these pass)
- [ ] Purchase Order → Purchase Receipt → Purchase Invoice flow completes without error for the test Supplier/Item.
- [ ] A Batch record is created and correctly linked on Purchase Receipt submission (per BUY-01 in `08_TEST_PLAN.md`).
- [ ] The test Item's `Quality Inspection Required` flag is set and visible on the Purchase Receipt as "pending QC" (even though the actual QC document isn't created yet — that logic lands in Prompt 05).
- [ ] Purchase Invoice amounts reconcile correctly against the Purchase Receipt (per BUY-03).

## Update PROGRESS.md
Append to "02 — Buying": status, notes (explicitly flag the QC-gating dependency for Prompt 05), verification result.
