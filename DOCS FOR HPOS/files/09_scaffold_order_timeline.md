# Prompt 09 — `hpos_extensions` App Build-Out + Order Timeline Screen

## Before You Start
- Read `PROGRESS.md`. Confirm Prompts 00–08 are `done`. Phase 1 (native modules) is now fully configured and permission-locked — this prompt starts Phase 2 (the actual custom coding).
- Reference docs: `02_TRD.md` §3 & §5.1 (Order Timeline spec), `04_API_SPEC.md` §1, `03_DESIGN_SYSTEM.md` Part B, `06_USER_STORIES.md` US-1.3.

## Context
This is the first prompt with real custom code. Build out the `hpos_extensions` app's Python API structure properly (the directories scaffolded empty in Prompt 00 now get real content) and implement the first custom screen: Order Timeline.

## Objective
1. Build out `hpos_extensions`'s Vue 3 (Frappe UI) frontend integration pattern.
2. Implement `get_order_timeline` per `04_API_SPEC.md` §1.
3. Build the Order Timeline stage-stepper UI per `03_DESIGN_SYSTEM.md` Part B.

## Instructions
1. Set up the Frappe UI (Vue 3) build pipeline in `hpos_extensions` (install `frappe-ui` as an npm dependency, configure the app's `public/js` build per Frappe's standard custom-page pattern for v15).
2. Implement `hpos_extensions/hpos_extensions/api/order_timeline.py` with the whitelisted `get_order_timeline(sales_order)` method exactly per the request/response contract in `04_API_SPEC.md` §1 — including the 404 (not found) and 403 (permission denied) error cases. Use `frappe.has_permission("Sales Order", doc=sales_order)` before returning any data.
3. Query the 9 downstream document types (Quotation, Sales Order, Production Plan, Work Order, Job Card, Quality Inspection, Packing Slip, Delivery Note, Sales Invoice) linked to the given Sales Order via `frappe.get_all` with appropriate link filters — handle the case where a stage has zero, one, or multiple linked documents (e.g., multiple Job Cards), per US-1.3 AC2.
4. Build the Vue 3 stepper component per `03_DESIGN_SYSTEM.md` Part B.4 (Stage Stepper spec: numbered circular badges, horizontal on desktop/vertical on narrow viewports, color-coded by completion state using the design tokens in Part B.2).
5. Add an entry point: a button/link on the Sales Order form (via a Client Script hook) that opens the Order Timeline for that order, plus a standalone "search by order number" page.
6. Apply permissions per `07_RBAC.md` §3: Order Timeline access matches whatever Sales Order read-permission the user already has — no separate gating needed beyond what step 2's `has_permission` check already does.

## Verification (do not mark this prompt done until these pass)
- [ ] Opening Order Timeline for the fully-completed test order from Prompts 01–07 shows all 9 stages marked "completed" with correct timestamps and correct links to each document (per ORD-01).
- [ ] Opening Order Timeline for a brand-new test Sales Order (only Quotation/Sales Order stages exist) shows the rest correctly marked "pending," not erroring out (per ORD-02).
- [ ] Calling `get_order_timeline` directly via API as a user without Sales Order read permission returns 403, not data.
- [ ] Visual output matches the Design System spec (numbered badges, correct color coding for completed/in-progress/pending).

## Update PROGRESS.md
Append to "09 — hpos_extensions Scaffold + Order Timeline": status, confirm frappe-ui build pipeline works, verification result, screenshot/description of the rendered stepper if possible.
