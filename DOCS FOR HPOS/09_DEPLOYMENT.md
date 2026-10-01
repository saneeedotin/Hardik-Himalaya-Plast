# Deployment & Infrastructure
## Himalaya Plast Operating System (HPOS)

## 1. Hosting Decision: Frappe Cloud (Recommended)

**Recommendation: Frappe Cloud managed hosting**, over self-hosted.

**Why:**
- Param is the sole developer/implementer — no dedicated IT/infra team to own Docker, OS patching, backups, or Frappe/ERPNext version upgrades.
- Frappe Cloud includes automated backups, SSL, monitoring, and one-click version upgrades — removing an entire category of operational risk for a solo implementer supporting a live factory.
- The pitch deck itself lists Frappe Cloud as the client-facing "managed hosting" option — this keeps infra conversations simple for the client too.
- Self-hosting becomes worth reconsidering later if: (a) Himalaya Plast wants full data residency control beyond what Frappe Cloud offers, (b) usage/cost at scale favors a dedicated VPS, or (c) a proper IT function exists in-house by then. Nothing in this build locks that door shut — a Frappe site can be migrated from Frappe Cloud to self-hosted later via standard `bench` site backup/restore.

**If self-hosting is later chosen instead:** Use `frappe_docker` (official Docker Compose setup) on a VPS (min. recommended: 4 vCPU / 8GB RAM for this data volume), with automated daily backups to off-site storage (S3-compatible) and a reverse proxy (Traefik/Nginx) for SSL via Let's Encrypt.

## 2. Environments

| Environment | Where | Purpose |
|---|---|---|
| Local dev | Developer machine (Docker or native bench) | Active development of `hpos_extensions` |
| Staging | Frappe Cloud (separate site/bench) or a second local instance | Client UAT before each phase go-live; seeded with representative (not real) data until real client data is confirmed |
| Production | Frappe Cloud | Live Himalaya Plast operations |

## 3. Deploy Flow

1. `hpos_extensions` app developed and version-controlled in a private Git repository (GitHub recommended, matches existing bench-connect tooling).
2. Frappe Cloud's "Bench" / "App" deploy flow pulls from the Git repo — pushing to the tracked branch (e.g. `main` or `production`) triggers a deploy to staging; a manual promote step pushes to production after UAT sign-off.
3. Custom fields, workflows, roles, and print formats are exported as **fixtures** in `hpos_extensions/hooks.py` (`fixtures = [...]`) so every environment (local/staging/production) can be reproduced identically via `bench --site <site> migrate`, rather than manually reconfigured in each environment's UI.
4. No direct production hotfixes outside this flow — even urgent fixes go through the same Git → staging → production path, given this is now a live factory operations system.

## 4. Backups & Disaster Recovery
- Frappe Cloud: automated daily backups included; confirm retention window on the chosen plan.
- Additionally, schedule a weekly manual/offsite backup export (`bench backup --with-files`) downloaded and stored outside Frappe Cloud, as a second layer of protection — cheap insurance for a live manufacturing operation's financial/production data.
- **Restore drill:** perform at least one test restore into a scratch site before go-live, to confirm the backup/restore process actually works, not just that backups are being created.

## 5. Domain, SSL, Email
- Custom domain (e.g. `erp.himalayaplast.com` or similar — **confirm actual domain with client**) pointed at the Frappe Cloud site; SSL handled automatically by Frappe Cloud.
- Outbound email (for Frappe notifications — order confirmations, low-stock alerts, etc.) configured via Frappe Cloud's included email or client's own SMTP if they have a business email provider — **confirm with client**, currently unspecified (PRD notes "email integration" as out of scope for *external* integrations, but native Frappe transactional email/notifications should still be configured).

## 6. Monitoring & Support
- Frappe Cloud provides basic uptime monitoring and error logs out of the box.
- For `hpos_extensions` custom code specifically, ensure Python exceptions in whitelisted methods are logged via Frappe's error log (`frappe.log_error`) so custom-screen failures (Order Timeline, Founder Dashboard, QR Scan) are visible, not silent.
- Define a basic support/response expectation with the client (e.g., "critical issue = same-day, minor issue = next business day") — **not yet defined, flag as open item** since Param is a solo implementer and needs to set expectations clearly.

## 7. Go-Live Sequencing (Phase 0–1 + Phase 2 subset)

| Step | Milestone |
|---|---|
| 1 | Frappe Cloud site provisioned, ERPNext + India Compliance app installed (Phase 0) |
| 2 | Company/masters configuration complete on staging, client-reviewed |
| 3 | Native module UAT complete (Selling → Accounts chain walked end-to-end with representative data) |
| 4 | `hpos_extensions` (Order Timeline, Founder Dashboard, QR Dispatch Scan) deployed to staging, demoed to Founder + Warehouse staff |
| 5 | Data migration executed per confirmed scope (PRD §7) |
| 6 | Production go-live — timing to avoid any client-specified blackout periods (financial year-end, peak production season — **not yet confirmed**) |
| 7 | Hypercare period (recommend minimum 2 weeks close support post go-live before considering Phase 1 "done") |

## 8. Open Items
- [ ] Actual domain name for the ERPNext instance — not yet confirmed.
- [ ] Business email/SMTP details — not yet confirmed.
- [ ] Client-specified go-live blackout periods (financial year-end, peak season) — not yet confirmed (PRD §7 / pitch deck scoping question).
- [ ] Support/response-time expectations with client — not yet defined.
