# Prompt 08 — Roles & Permissions (RBAC)

## Before You Start
- Read `PROGRESS.md`. Confirm Prompts 00–07 are `done`. This prompt locks down access to everything configured so far — do it after the modules exist, not before, so you have real DocTypes/records to test permissions against.
- Reference docs: `07_RBAC.md` (the full spec for this prompt), `08_TEST_PLAN.md` §3 (RBAC test pass).

## Context
Implement the full role/permission matrix from `07_RBAC.md`. This includes native ERPNext roles (used as-is), two custom roles (`HPOS Founder`, `HPOS Operator`, `HPOS Warehouse Scan`), and row-level User Permission scoping for Machine Operators.

## Objective
Create all custom roles, apply the permission matrix from `07_RBAC.md` §2–3 to every DocType and custom screen, and implement User Permission scoping for operators.

## Instructions
1. Create custom Roles: `HPOS Founder`, `HPOS Operator`, `HPOS Warehouse Scan` (per `07_RBAC.md` §1).
2. Apply the DocType permission matrix from `07_RBAC.md` §2 using Frappe's Role Permission Manager for every role/DocType combination listed (native roles like Sales User/Manager, Manufacturing User/Manager, Quality Manager, Stock User/Manager, Accounts User/Manager are pre-existing ERPNext roles — just apply/verify their permission levels match the matrix; only the three custom roles need to be built from scratch).
3. Implement User Permission scoping: restrict `HPOS Operator` role users to only see/edit Job Cards where the assigned Employee matches their own linked Employee record (per `07_RBAC.md` §4). Test with two distinct test Employee/User records to confirm isolation.
4. Create at least one test User per role (prefixed `TEST-` in full name, e.g., "TEST Operator One") and assign roles, to support verification below.
5. Do NOT yet apply permissions to the custom screens (Order Timeline, Founder Dashboard, QR Dispatch Scan) from `07_RBAC.md` §3 — those DocTypes/pages don't exist until Prompts 09–11. Note in `PROGRESS.md` that §3 of the RBAC matrix is a forward dependency for those prompts, which must implement `frappe.has_permission()` checks matching that table when they build their respective API endpoints.

## Verification (do not mark this prompt done until these pass)
- [ ] For each role in `07_RBAC.md` §2, spot-check both a permitted action (succeeds) and a forbidden action (blocked) — not just via hidden UI elements, but via a direct API call as that test user, per `08_TEST_PLAN.md` §3.
- [ ] `HPOS Operator` test user A cannot view/edit test user B's assigned Job Cards.
- [ ] `HPOS Warehouse Scan` role, once created, has no Desk module permissions beyond what will be needed for the QR scan page (confirm this now even though the page itself is built in Prompt 11 — the role should already be minimal).

## Update PROGRESS.md
Append to "08 — Roles & Permissions": status, roles created, User Permission scoping confirmed working, explicit note that custom-screen permissions (RBAC §3) are a forward dependency for Prompts 09–11, verification result.
