# Prompt 07 — Accounts & GST Module

## Before You Start
- Read `PROGRESS.md`. Confirm Prompts 00–06 are `done`.
- Reference docs: `05_DATA_MODEL.md` §6 (Accounts rows), `06_USER_STORIES.md` Epic 7, `02_TRD.md` §6 (India Compliance integration).

## Context
Configure Sales Invoice → e-Invoice/IRN → E-Way Bill (both via the India Compliance app installed in Prompt 00) → Payment Entry → Outstanding. **Real GSTIN and e-Invoicing/e-Way Bill threshold details are not yet confirmed with the client** (PRD §7 open item) — this prompt configures the mechanism and proves it works in India Compliance's test/sandbox mode, not with live GST credentials.

## Objective
Configure a skeleton Chart of Accounts, Payment Terms, and India Compliance app settings (in sandbox/test mode), and verify the Sales Invoice → e-Invoice/E-Way Bill → Payment Entry flow works mechanically.

## Instructions
1. Set up a skeleton Chart of Accounts using ERPNext's standard India Chart of Accounts template as a starting point (do NOT attempt to replicate a real client Chart of Accounts — none has been supplied; flag this explicitly as blocked-on-real-data in `PROGRESS.md`).
2. Configure a `TEST-` GSTIN and enable India Compliance app's sandbox/test mode (do not use live GST API credentials at this stage — this is a development/config exercise, not a production compliance setup).
3. Create a Payment Terms Template reflecting a plausible B2B manufacturing payment structure (e.g., 30% advance / 70% on delivery, or 30-day net — flag as a placeholder pending real client terms).
4. Walk the flow: complete the test Delivery Note from Prompt 06 → Sales Invoice → confirm India Compliance generates a sandbox IRN + QR code and E-Way Bill from the same document → record a partial Payment Entry against the invoice using the test Payment Terms Template.
5. Confirm the resulting invoice print format shows the IRN QR code and GSTIN correctly (per `03_DESIGN_SYSTEM.md` Part A print format guidance).

## Verification (do not mark this prompt done until these pass)
- [ ] Sales Invoice submission (sandbox mode) generates an IRN + QR code and E-Way Bill without error (per ACC-01).
- [ ] Submitting with intentionally invalid/incomplete GSTIN config produces a clear error, not a silent failure (per ACC-02).
- [ ] Partial Payment Entry against the test invoice correctly reduces outstanding amount and reflects overdue status if the due date has passed (per ACC-03).
- [ ] Print format correctly displays IRN/QR/GSTIN.

## Update PROGRESS.md
Append to "07 — Accounts & GST": status, confirm sandbox mode was used (explicitly note that live GST credentials/thresholds are still pending client confirmation before production go-live), Chart of Accounts and Payment Terms flagged as placeholders, verification result.
