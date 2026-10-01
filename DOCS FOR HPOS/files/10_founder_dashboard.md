# Prompt 10 — Founder Dashboard Screen

## Before You Start
- Read `PROGRESS.md`. Confirm Prompt 09 is `done` (reuse its Vue/Frappe UI setup — don't re-scaffold).
- Reference docs: `02_TRD.md` §5.2, `04_API_SPEC.md` §2, `03_DESIGN_SYSTEM.md` Part B, `06_USER_STORIES.md` Epic 8, `05_DATA_MODEL.md` §7 (`HPOS Settings` DocType).

## Context
This is the highest-visibility screen in the system — the one senior stakeholders will judge the whole build by. It also handles the most sensitive data (financials), so permission enforcement here needs to be airtight, not just visually gated.

## Objective
1. Create the `HPOS Settings` singleton DocType.
2. Implement `get_business_health` and `get_settings`/`update_settings` per `04_API_SPEC.md` §2.
3. Build the single-screen dashboard UI per `03_DESIGN_SYSTEM.md` Part B, restricted to Founder/Admin roles.

## Instructions
1. Create the `HPOS Settings` singleton DocType with fields: `on_time_weight`, `payment_weight`, `qc_reject_weight`, `at_risk_days_threshold` (per `05_DATA_MODEL.md` §7). Restrict write access to System Manager role only (per `04_API_SPEC.md` §2, `update_settings` is System-Manager-restricted).
2. Implement `hpos_extensions/hpos_extensions/api/founder_dashboard.py` with `get_business_health(date_range)`, aggregating:
   - At-risk orders: Sales Orders past expected delivery, not yet delivered, using the configurable `at_risk_days_threshold`.
   - Payments overdue: unpaid/partially-paid Sales Invoices past due date.
   - Production status: open Work Orders by status + machine utilization from Job Card time logs.
   - Today's dispatch: Delivery Notes created/submitted in the given range.
   - A v1 Business Health Score formula using the configurable weights — clearly label it "beta" in the API response and in the UI, per `02_TRD.md` §5.2 (the formula isn't validated against real data volume yet).
3. Enforce access control at the API level: `founder_dashboard.get_business_health` must check the calling user has the `HPOS Founder` or `System Manager` role and return 403 otherwise — do this as an explicit check inside the method, not just by hiding the page/menu item (per `07_RBAC.md` §3 rationale and `08_TEST_PLAN.md` DASH-01).
4. Build the card-based dashboard UI per `03_DESIGN_SYSTEM.md` Part B (card style, color tokens for at-risk/overdue/on-time states, "beta" indicator on the health score).
5. Build a settings form (visible only to System Manager) for editing the `HPOS Settings` weights/threshold.

## Verification (do not mark this prompt done until these pass)
- [ ] A test Founder/Admin user sees the dashboard populate correctly against the test data built up through Prompts 01–09.
- [ ] A test user without Founder/Admin role gets a 403 calling `get_business_health` directly via API — not just a hidden menu item (per DASH-01).
- [ ] Changing `at_risk_days_threshold` in `HPOS Settings` changes which test orders are flagged at-risk on next dashboard load (per DASH-03).
- [ ] Dashboard load completes in a reasonable time against current (small) test data volume — note in `PROGRESS.md` that the <2s performance target from `02_TRD.md` §8 needs re-validation once realistic data volume exists; this test-data check is a smoke test, not the final performance validation.
- [ ] "Beta" labeling on the health score is visible in the UI, not just documented.

## Update PROGRESS.md
Append to "10 — Founder Dashboard": status, confirm 403 enforcement tested via direct API call (not just UI), confirm settings-driven threshold works, note performance re-validation is still pending real data volume.
