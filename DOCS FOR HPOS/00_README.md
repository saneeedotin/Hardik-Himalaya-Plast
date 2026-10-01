# HPOS Documentation Set
## Himalaya Plast Operating System — Built on ERPNext/Frappe

**Scope:** Phase 0 (Foundation) + Phase 1 (Core Native Modules) + Phase 2 subset (Order Timeline, Founder Dashboard, QR Dispatch Scan custom screens). Planning Board (Phase 3) and AI Email & Forecast (Phase 4) are explicitly deferred — the Data Model doc reserves space for them so nothing built now blocks them later.

**Source material:** `Himalaya Plast HPOS ERPNext Pitch.pdf` (prepared by Reuben, ERP Financial Consultant, UnifyXperts) and `ERPNext Initial Data & Information Request.docx`. No real Himalaya Plast operational data has been supplied yet — every doc below is written against the pitch deck's assumptions and flags its own open items where real data is required.

## Document Index

| # | Document | Purpose |
|---|---|---|
| 01 | `01_PRD.md` | What we're building and why — problem, personas, scope, success metrics, open questions |
| 02 | `02_TRD.md` | How it's built — Frappe/ERPNext architecture, custom app structure, dev environment setup |
| 03 | `03_DESIGN_SYSTEM.md` | ERPNext Desk theming + full design system for the 3 custom screens |
| 04 | `04_API_SPEC.md` | Whitelisted API endpoints for the custom `hpos_extensions` app |
| 05 | `05_DATA_MODEL.md` | Entity relationships — native DocTypes used, 2 new custom DocTypes, batch genealogy chain |
| 06 | `06_USER_STORIES.md` | Persona-driven stories + acceptance criteria, organized by epic |
| 07 | `07_RBAC.md` | Roles and permission matrix, native + custom screens |
| 08 | `08_TEST_PLAN.md` | Test scenarios per module, RBAC test pass, UAT checklist |
| 09 | `09_DEPLOYMENT.md` | Hosting recommendation (Frappe Cloud), environments, deploy flow, go-live sequencing |

## Recommended Reading Order for an AI Coding Agent
1. `01_PRD.md` — understand scope and constraints
2. `05_DATA_MODEL.md` — understand what already exists in ERPNext vs. what needs building
3. `02_TRD.md` — set up the dev environment, understand app architecture
4. `04_API_SPEC.md` + `03_DESIGN_SYSTEM.md` — build the 3 custom screens
5. `06_USER_STORIES.md` + `08_TEST_PLAN.md` — validate against acceptance criteria
6. `07_RBAC.md` — lock down permissions before anything goes near production
7. `09_DEPLOYMENT.md` — ship it

## Consolidated Open Items (blocking real-data-dependent work)
Every document above flags its own open items; the recurring blockers are:
- Company legal details (name, address, GSTIN(s), plant locations, financial year, logo, brand color) — not yet supplied
- Chart of Accounts / current accounting software (Tally?) / whether ERPNext replaces or runs alongside it
- Customer master, supplier master, item master, BOMs — not yet supplied
- Data migration scope (opening balances only vs. full masters vs. historical transactions, and how many years)
- Barcode/QR hardware for dispatch scanning (dedicated scanners vs. phone/tablet camera)
- Go-live timeline and blackout periods
- Domain name, business email/SMTP details

None of these block Phase 0 environment setup or `hpos_extensions` scaffolding — they block final configuration, UAT sign-off, and production go-live. Recommend running the "ERPNext Initial Data & Information Request" docx with the client in parallel with Phase 0 technical setup.
