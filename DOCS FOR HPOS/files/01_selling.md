# Prompt 01 — Selling Module

## Before You Start
- Read `PROGRESS.md`. Confirm Prompt 00 is marked `done`. If not, stop and complete it first.
- Reference docs: `05_DATA_MODEL.md` §2 & §6 (Selling rows), `06_USER_STORIES.md` Epic 1, `03_DESIGN_SYSTEM.md` Part A (print format expectations).

## Context
This prompt configures ERPNext's native Selling module (Lead → Opportunity → Quotation → Sales Order) and adds the one required customization: an `approval_method` custom field on Sales Order.

**No real Himalaya Plast customer/item data exists yet** — per project decision, do not seed dummy customers/items here beyond the minimum needed to prove the flow works (e.g., one test Customer, one test Item) if you need something to test against. Do not treat test records as real data or leave them in a state that could be mistaken for production data later — clearly prefix any test records with `TEST-`.

## Objective
Configure Selling module settings and add the `approval_method` custom field with its validation rule.

## Instructions
1. In ERPNext, review default Selling Settings (Selling > Settings) — confirm defaults are sane for a manufacturing B2B business (e.g., default Customer Group, Territory) but do not hardcode Himalaya Plast-specific values since real customer data isn't available (leave as ERPNext defaults, flag as an open item in `PROGRESS.md`).
2. Add a **Custom Field** on Sales Order:
   - Fieldname: `approval_method`
   - Label: "Approval Method"
   - Field type: Select
   - Options: `Email\nWhatsApp\nPhone\nVerbal`
   - Insert after: an appropriate existing field (e.g., after `status` or near customer approval-related fields)
3. Add validation: when Sales Order `status` is changed to `Approved` (via workflow or standard status transition), `approval_method` must not be empty. Implement this via a **Client Script** (for immediate UI feedback) AND a **Server Script** or `validate()` hook in `hpos_extensions` (for server-side enforcement — never trust client-side validation alone, per `02_TRD.md` §7).
4. Add `approval_method` to the default Sales Order print format so it's visible on printed/PDF documents (per `03_DESIGN_SYSTEM.md` Part A guidance — use the Print Format Builder, not custom HTML).
5. Export this custom field, client script, and server script as fixtures in `hpos_extensions/hooks.py` (`fixtures = [...]`) so this configuration is reproducible across environments per `09_DEPLOYMENT.md` §3.

## Verification (do not mark this prompt done until these pass)
- [ ] Creating a test Quotation and converting it to a test Sales Order works end-to-end.
- [ ] Attempting to set Sales Order status to Approved without `approval_method` set is blocked with a clear validation error (test this both via the UI and via a direct API call to confirm server-side enforcement, per US-1.2 AC1 in `06_USER_STORIES.md`).
- [ ] Setting `approval_method` and then approving succeeds.
- [ ] `approval_method` appears correctly on the printed Sales Order.
- [ ] Fixtures are exported and `bench --site hpos.local migrate` re-applies this configuration cleanly on a fresh site (spot-check if feasible).

## Update PROGRESS.md
Append to "01 — Selling": status `done`/`blocked`, what was built, verification result, and any open item about Selling Settings defaults needing real client input later.
