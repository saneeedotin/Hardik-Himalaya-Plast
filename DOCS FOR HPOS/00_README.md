# HPOS Documentation Set
## Himalaya Plast Operating System — Built on Next.js & Prisma

**Scope:** Phase 0 (Foundation) + Phase 1 (Core Modules) + Phase 2 (Custom Extensions: Order Timeline, Founder Dashboard, QR Dispatch Scan). Planning Board (Phase 3) and AI Email & Forecast (Phase 4) are explicitly deferred.

**Source material:** `Himalaya Plast HPOS ERPNext Pitch.pdf` and `ERPNext Initial Data & Information Request.docx`. Note: We have pivoted from a Frappe/ERPNext implementation to a fully custom **Next.js + Prisma** application, building ERPNext-inspired features specifically tailored to Himalaya Plast.

## Document Index

| # | Document | Purpose |
|---|---|---|
| 01 | `01_PRD.md` | What we're building and why — problem, personas, scope, success metrics, open questions |
| 02 | `02_TRD.md` | How it's built — Next.js architecture, Prisma database, dev environment setup |
| 03 | `03_DESIGN_SYSTEM.md` | Tailwind CSS theming, ERPNext-like 'Desk' layout, and design system for custom screens |
| 04 | `04_API_SPEC.md` | Next.js Server Actions and API endpoints |
| 05 | `05_DATA_MODEL.md` | Entity relationships — Prisma schema, models, batch genealogy chain |
| 06 | `06_USER_STORIES.md` | Persona-driven stories + acceptance criteria, organized by epic |
| 07 | `07_RBAC.md` | Roles and permission matrix based on custom Prisma RBAC |
| 08 | `08_TEST_PLAN.md` | Test scenarios per module, RBAC test pass, UAT checklist (Vitest) |
| 09 | `09_DEPLOYMENT.md` | Hosting recommendation, environments, deploy flow, go-live sequencing |

## Recommended Reading Order for an AI Coding Agent
1. `01_PRD.md` — understand scope and constraints
2. `05_DATA_MODEL.md` — understand the Prisma schema and data relationships
3. `02_TRD.md` — set up the dev environment, understand Next.js App Router architecture
4. `04_API_SPEC.md` + `03_DESIGN_SYSTEM.md` — build the screens and logic
5. `06_USER_STORIES.md` + `08_TEST_PLAN.md` — validate against acceptance criteria
6. `07_RBAC.md` — lock down permissions before anything goes near production
7. `09_DEPLOYMENT.md` — ship it

## Consolidated Open Items (blocking real-data-dependent work)
Every document above flags its own open items; the recurring blockers are:
- Company legal details (name, address, GSTIN(s), plant locations, financial year, logo, brand color) — not yet supplied
- Chart of Accounts / current accounting software (Tally?) / whether HPOS replaces or runs alongside it
- Customer master, supplier master, item master, BOMs — not yet supplied
- Data migration scope (opening balances only vs. full masters vs. historical transactions, and how many years)
- Barcode/QR hardware for dispatch scanning (dedicated scanners vs. phone/tablet camera)
- Go-live timeline and blackout periods
- Domain name, business email/SMTP details
