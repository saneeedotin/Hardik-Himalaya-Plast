# Technical Requirements Document (TRD)
## Himalaya Plast Operating System (HPOS)

This document is written to be executable by an AI coding agent. It specifies the platform, environment, architecture, and integration points for the HPOS Next.js application.

---

## 1. Platform Decision

**Core platform:** Next.js (App Router) + Prisma ORM + PostgreSQL + Tailwind CSS.

**Rationale for Pivot:** We pivoted from Frappe/ERPNext to a custom Next.js stack to achieve maximum flexibility, modern UX, and strict typing via TypeScript. While we lose the out-of-the-box modules of ERPNext, we gain the ability to build exactly what Himalaya Plast needs without the bloat, and we will adopt ERPNext's proven UI patterns (Desk layout, standard list/form views) to maintain a structured operational feel.

**Architecture:**
- **Frontend:** Next.js App Router (`src/app`). UI built with Tailwind CSS, `clsx`, `tailwind-merge`, and Lucide icons.
- **Backend:** Next.js Server Actions and Route Handlers (`src/app/api`).
- **Database:** PostgreSQL managed by Prisma (`prisma/schema.prisma`).
- **State/Data Fetching:** React Server Components (RSC) heavily utilized for read operations, Server Actions for mutations.
- **Layout:** An ERPNext-like 'Desk' navigation structure: a persistent sidebar with module workspaces (Buying, Selling, Manufacturing), and standardized list/form pages for data entry, combined with highly customized analytical screens (Founder Dashboard).

## 2. Environments

| Environment | Purpose | Notes |
|---|---|---|
| **Local dev** | Development | `npm run dev`, `npx prisma studio` |
| **Staging** | Client review, UAT before each phase go-live | Deployed on Vercel or similar; seeded with sample data |
| **Production** | Live Himalaya Plast operations | Vercel or VPS with managed PostgreSQL |

## 3. Local Development Setup (for the coding agent)

```bash
# Prerequisites: Node.js 18+, PostgreSQL

# Install dependencies
npm install

# Setup environment variables (copy .env.example to .env and configure DB URL)
cp .env.example .env

# Generate Prisma Client and apply migrations
npx prisma generate
npx prisma migrate dev

# Seed the database
npm run seed

# Start development server
npm run dev
```

**Project Structure:**
```
hpos-app/
├── prisma/
│   ├── schema.prisma       # Database schema (Single Source of Truth)
│   └── seed.ts             # Initial data seed
├── src/
│   ├── app/                # Next.js App Router pages and API routes
│   │   ├── (auth)/         # Login pages
│   │   ├── (desk)/         # The ERPNext-like Desk layout and modules
│   │   │   ├── buying/
│   │   │   ├── manufacturing/
│   │   │   ├── stock/
│   │   │   └── accounts/
│   │   ├── api/            # API endpoints
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Base components (buttons, inputs)
│   │   └── desk/           # Desk-specific layout components (sidebar, list views)
│   ├── lib/                # Utilities, Prisma client instance
│   └── types/              # TypeScript definitions
```

## 4. Module Implementation Strategy

We will build the following modules using the Desk layout pattern:

| Module | Core Prisma Models to Build/Update | Implementation Notes |
|---|---|---|
| **Selling** | Customer, SalesOrder, SalesOrderItem | Standard List/Form views. |
| **Buying** | Supplier, PurchaseOrder, PurchaseReceipt | Supplier master and PO creation flow. |
| **Stock** | Item, Batch, Warehouse, StockLedgerEntry | Real-time stock calculation via ledger entries. |
| **Manufacturing**| BOM, WorkOrder, JobCard, Workstation | Complex forms for Job Card time tracking and scrap entry. |
| **Quality** | QualityInspection | Four-state workflow (Pass/Reject/Scrap/Rework). |
| **Accounts** | Invoice, Payment, LedgerEntry | Tally export compatibility. |
| **Dispatch** | DeliveryNote, CartonLabel | Includes the custom QR Dispatch Scan mobile view. |

## 5. Non-Functional Requirements
- **Performance:** App Router RSCs should provide <1s initial load times.
- **Mobile:** QR Dispatch Scan must work on mid-range Android devices with a rear camera. The main Desk UI should be responsive but is optimized for tablet/desktop.
- **Security:** Argon2 for password hashing, session-based auth (or JWT), strict Prisma-level and UI-level RBAC checks.
