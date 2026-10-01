# Prompt 00 — Environment & Foundation

## Before You Start
- Read `PROGRESS.md`. This is the first prompt — if it shows any entry other than "not started," stop and ask the user what state the repo is actually in before proceeding.
- Reference docs (read fully before acting): `02_TRD.md` §1–3, `01_PRD.md` §4.1 (Phase 0 scope).

## Context
You are setting up the foundation for HPOS (Himalaya Plast Operating System) — a Frappe/ERPNext instance plus a custom app called `hpos_extensions`. This prompt does NOT configure business modules yet — it only stands up the environment.

## Objective
Provision a working local Frappe bench with ERPNext and the India Compliance app installed, and scaffold the `hpos_extensions` custom app skeleton (no business logic yet).

## Instructions
1. Confirm prerequisites are available: Python 3.11+, Node 18+, Redis, MariaDB 10.6+ (or PostgreSQL 14+), wkhtmltopdf, `bench` CLI (`pip install frappe-bench` if not present).
2. Initialize the bench:
   ```bash
   bench init hpos-bench --frappe-branch version-15
   cd hpos-bench
   ```
3. Create the site and install ERPNext + India Compliance:
   ```bash
   bench new-site hpos.local --admin-password <choose-and-record-securely, do not hardcode in any committed file>
   bench get-app erpnext --branch version-15
   bench get-app india_compliance https://github.com/resilient-tech/india-compliance --branch version-15
   bench --site hpos.local install-app erpnext
   bench --site hpos.local install-app india_compliance
   ```
4. Scaffold the custom app:
   ```bash
   bench new-app hpos_extensions
   bench --site hpos.local install-app hpos_extensions
   ```
5. Create the directory structure inside `hpos_extensions` described in `02_TRD.md` §3 (`api/`, `www/`, `public/js/`, `fixtures/`) — empty placeholder files are fine at this stage, no logic yet.
6. Initialize a Git repository for `hpos_extensions` specifically (this is the app that gets version-controlled and deployed per `09_DEPLOYMENT.md` §3 — ERPNext/Frappe core itself is not something you commit).
7. Do NOT configure any company, module, or business data yet — that starts in Prompt 01.

## Verification (do not mark this prompt done until these pass)
- [ ] `bench start` runs without error and the Desk login page loads at `http://hpos.local:8000` (or configured port).
- [ ] Logging in as Administrator shows both ERPNext and India Compliance listed under Installed Apps.
- [ ] `hpos_extensions` appears under Installed Apps.
- [ ] `bench --site hpos.local list-apps` shows all three apps.
- [ ] Git repo for `hpos_extensions` has an initial commit.

## Update PROGRESS.md
Append to the "00 — Environment & Foundation" entry: status `done`, fill in Environment section (site name, exact ERPNext/India Compliance versions installed, bench path), and note the verification result. If anything failed, mark `blocked` and describe exactly what failed — do not proceed to Prompt 01 if blocked.
