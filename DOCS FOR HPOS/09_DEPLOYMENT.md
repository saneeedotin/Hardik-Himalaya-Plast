# Deployment & Infrastructure
## Himalaya Plast Operating System (HPOS)

## 1. Hosting Decision: Vercel + Managed PostgreSQL

**Recommendation: Vercel for Next.js hosting, combined with a managed PostgreSQL provider (e.g., Supabase, Neon, or AWS RDS).**

**Why:**
- Vercel provides seamless CI/CD for Next.js applications, zero-config deployments, edge caching, and automated SSL.
- A managed PostgreSQL database handles backups, scaling, and high availability without requiring a dedicated DBA.
- This modern stack separates the frontend/compute (Vercel) from the state (Database), making it highly resilient and easy to scale.

## 2. Environments

| Environment | Where | Purpose |
|---|---|---|
| Local dev | Developer machine | Active development (`npm run dev`) |
| Staging | Vercel (Preview Branch) + Staging DB | Client UAT before each phase go-live; seeded with representative data |
| Production | Vercel (Main Branch) + Prod DB | Live Himalaya Plast operations |

## 3. Deploy Flow

1. **Version Control:** All code lives in a private Git repository (GitHub).
2. **Preview Deployments:** Any PR or push to a non-main branch triggers a Vercel Preview Deployment, allowing stakeholders to test changes immediately.
3. **Database Migrations:** Schema changes in `prisma/schema.prisma` are applied to the staging database via `npx prisma migrate deploy` in the CI/CD pipeline.
4. **Production Release:** Merging to the `main` branch triggers a production build on Vercel. Migrations run automatically before the new build goes live.

## 4. Backups & Disaster Recovery
- **Database:** The managed PostgreSQL provider will be configured for automated daily backups and Point-In-Time-Recovery (PITR).
- **Code:** Git acts as the source of truth for all application logic and UI.
- **Restore drill:** Perform at least one test restore of the database into the staging environment before go-live.

## 5. Domain, SSL, Email
- **Domain:** Custom domain (e.g. `erp.himalayaplast.com`) pointed to Vercel. SSL is handled automatically by Vercel.
- **Email:** Transactional emails (order confirmations, password resets) will be sent via an API provider like Resend, SendGrid, or AWS SES.

## 6. Monitoring & Support
- Vercel provides analytics, speed insights, and runtime logs.
- Application errors should be caught and logged (optionally using a service like Sentry) so custom-screen failures are visible to the development team.

## 7. Go-Live Sequencing (Phase 0–1 + Phase 2)

| Step | Milestone |
|---|---|
| 1 | Vercel project and Prod/Staging databases provisioned (Phase 0) |
| 2 | Company/masters configuration seeded on staging, client-reviewed |
| 3 | Core Modules UAT complete (Selling → Accounts chain walked end-to-end) |
| 4 | Custom Screens (Order Timeline, Founder Dashboard, QR Dispatch Scan) demoed to Founder + Warehouse staff |
| 5 | Data migration executed (Masters uploaded to Prod DB) |
| 6 | Production go-live |
| 7 | Hypercare period (recommend minimum 2 weeks close support post go-live) |

## 8. Open Items
- [ ] Actual domain name for the application — not yet confirmed.
- [ ] Selection of Managed PostgreSQL provider and Email API provider.
- [ ] Client-specified go-live blackout periods.
- [ ] Support/response-time expectations with client post go-live.
