# Himalaya Plast • HPOS Factory OS

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB.svg)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, mobile-first **Manufacturing Execution System (MES)** and **Dispatch Gateway** purpose-built for **Himalaya Plast** — an industrial manufacturer of precision uPVC gaskets and TPE extrusion profiles based in Gujarat, India.

Day-to-day accounting and statutory GST remain inside **TallyPrime**, connected via automated 1-click XML export.

> **This is the standalone Next.js frontend app (Option B)**. For the ERPNext-based backend system (Option A), see the [`hpos_extensions`](../hpos_extensions/README.md) README.

---

## Table of Contents

1. [Architecture & Tech Stack](#architecture--tech-stack)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Database Schema Overview](#database-schema-overview)
5. [The 6 Core Views & Features](#the-6-core-views--features)
6. [API Routes](#api-routes)
7. [Project Structure](#project-structure)
8. [Seeded Demo Data](#seeded-demo-data)
9. [Developing](#developing)
10. [Deployment](#deployment)
11. [Related: ERPNext Backend (hpos_extensions)](#related-erpnext-backend-hpos_extensions)

---

## Architecture & Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | **Next.js 16 (App Router)** | TypeScript, React 19, Turbopack |
| **Styling & Theming** | **Tailwind CSS v4** | Custom design tokens, dual Dark/Light mode |
| **Icons & Charts** | **Lucide React + Recharts** | Extrusion telemetry bar charts |
| **Sensory Feedback** | **Web Audio API + Canvas Confetti** | Synthesized D5/A5 scan chimes, error buzzers |
| **Database & ORM** | **PostgreSQL 16 + Prisma 6** | Full relational schema with batch genealogy |
| **Accounting Integration** | **Tally XML Engine** | 1-click TallyPrime Sales Voucher XML export |

---

## Prerequisites

- **Node.js 20+** (LTS recommended)
- **PostgreSQL 16+** running and accessible
- **npm** or **pnpm** package manager

> **Windows + WSL2 users:** PostgreSQL can run inside WSL Ubuntu. Ensure port 5432 is accessible from the Windows host.

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/hpos-app.git
cd hpos-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```env
# PostgreSQL Database
DATABASE_URL="postgresql://hpos:hpos123@localhost:5432/hpos_db?schema=public"

# App Branding
NEXT_PUBLIC_APP_NAME="HPOS Factory OS"
NEXT_PUBLIC_COMPANY_NAME="Himalaya Plast"
```

### 4. Set Up the Database

```bash
# Create the PostgreSQL database (if it doesn't exist)
# On WSL/Linux:
sudo -u postgres createdb hpos_db
sudo -u postgres psql -c "CREATE USER hpos WITH PASSWORD 'hpos123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE hpos_db TO hpos;"
sudo -u postgres psql -c "ALTER DATABASE hpos_db OWNER TO hpos;"

# Push the Prisma schema to PostgreSQL
npx prisma db push

# Generate the Prisma Client
npx prisma generate

# Seed the database with realistic demo data
npx tsx prisma/seed.ts
```

### 5. Start the Development Server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Database Schema Overview

The app uses a comprehensive relational schema modelling the full extrusion manufacturing lifecycle:

```
┌──────────────────────────────────────────────────────────────┐
│  USER (Role: FOUNDER | ADMIN | SALES | OPERATOR | ...)      │
│  → Assigned to machines, scans cartons, performs QC          │
├──────────────────────────────────────────────────────────────┤
│  ITEM (Category: RAW_MATERIAL | FINISHED_GOODS | ...)       │
│  → PVC Resin, DOP Plasticizer, Gasket A101, Weatherseal B202│
├──────────────────────────────────────────────────────────────┤
│  BOM (Bill of Materials)                                     │
│  → FG Item + Raw Materials + 2.5% Scrap Factor              │
├──────────────────────────────────────────────────────────────┤
│  SALES ORDER → WORK ORDER → JOB CARD → QC INSPECTION       │
│  → Full order-to-cash lifecycle tracking                    │
├──────────────────────────────────────────────────────────────┤
│  BATCH (RM + FG) → CARTON LABEL → DELIVERY NOTE             │
│  → Forward & backward batch traceability                    │
├──────────────────────────────────────────────────────────────┤
│  TALLY SYNC LOG                                              │
│  → Audit trail of TallyPrime XML exports                    │
└──────────────────────────────────────────────────────────────┘
```

Key models: `User`, `Item`, `Workstation`, `Batch`, `BOM`, `SalesOrder`, `WorkOrder`, `JobCard`, `QualityInspection`, `CartonLabel`, `DeliveryNote`, `TallySyncLog`.

See [`prisma/schema.prisma`](prisma/schema.prisma) for the full schema definition.

---

## The 6 Core Views & Features

### 1. Executive Dashboard (`/`)

- **4 Live KPI Cards**: Total Extrusion Output, Completed Orders, Running Orders, Pending Dispatches — all computed from real database state.
- **Extrusion Analytics Bar Chart**: Weekly output meters vs target threshold (Recharts).
- **Factory Progress Donut**: Circular SVG gauge showing shift fulfillment percentage.
- **Live Time Tracker Widget**: Real-time machine timer with Start/Pause controls.
- **Team Roster**: Active shift personnel with status badges.

### 2. Order Timeline (`/orders`)

- **Master-Detail Split View**: Left pane lists all sales orders; right pane shows the selected order's fulfillment pipeline.
- **9-Stage Visual Stepper**: Order Created → Price Approved → Advance Payment → Material Allocated → Extrusion Running → QC 4-Point Passed → Packed & Barcoded → Dispatch Scanned → Tally Invoiced.
- **Quick Actions**: Direct links to Dispatch Scanner and Tally XML generation.

### 3. Extrusion Floor (`/production`)

- **Line Switcher**: Toggle between Extrusion Line 01 (uPVC) and Line 02 (TPE Co-extrusion).
- **Live Production Metrics**: Good Meters, Purge Scrap, and computed Scrap Rate — all persisted to database via API.
- **Barrel Temperature Telemetry**: Zone 1/2/3 and Die Head temperature monitors.
- **Operator Touch Controls**: `+100m Counter`, `+500m Reel Finish`, `Log 5kg Purge Scrap`, `Send to QC`, `Emergency Line Pause` — all API-backed with optimistic UI.

### 4. Quality Assurance Station (`/qc`)

- **4-Point Dimensional Verification Form**: Pin Size (mm), Width (mm), Leg Thickness (mm), Linear Weight (g/m), plus Sash Corner Fit & Elastic Recovery test.
- **4-State Workflow Decisions**: PASS (→ FG Stock), REWORK (→ WIP), REJECT, SCRAP — all persisted to database.
- **Inspection History Log**: Previous QC reports with dimensional measurements and disposition status.
- **First-Pass Yield Indicator**: Live pass rate computed from inspection history.

### 5. Dispatch Gate Scanner (`/dispatch`)

- **Minimalist QR Viewport**: Reticle overlay designed for arm's-length visibility on loading docks.
- **High-Contrast Counter**: Monospace `X / Y Cartons Verified` with progress bar.
- **Multi-Sensory Feedback**: Web Audio API chimes (match), buzzers (mismatch/duplicate), and confetti burst on 100% completion.
- **Manual Code Input**: Hardware barcode gun / keyboard fallback for damaged labels.
- **Supervisor Override Modal**: Audit-logged override with mandatory reason for incomplete dispatches.
- **Delivery Note Selector**: Switch between multiple active delivery notes.

### 6. Tally Integration Hub (`/tally`)

- **1-Click XML Export**: Generates standard TallyPrime Sales Voucher XML from any sales order.
- **XML Preview**: Syntax-highlighted code viewer with copy-to-clipboard and download buttons.
- **Export Audit Trail**: Timestamped table of all previously exported vouchers with status.

---

## API Routes

All API routes use Next.js Route Handlers (App Router) and Prisma for database operations:

| Route | Method | Description |
|---|---|---|
| `/api/qc/submit` | `POST` | Record a quality inspection with 4-state decision |
| `/api/dispatch/scan` | `POST` | Verify/scan a carton QR code against a delivery note |
| `/api/production/log` | `POST` | Log meter output or scrap to a job card |
| `/api/tally/export` | `POST` | Generate TallyPrime Sales Voucher XML from an order |

---

## Project Structure

```
hpos-app/
├── prisma/
│   ├── schema.prisma          # Full relational database schema
│   └── seed.ts                # Realistic demo data seeder
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (sidebar, header, mobile nav)
│   │   ├── page.tsx           # Dashboard → ExecutiveDashboard
│   │   ├── globals.css        # Design tokens & theme variables
│   │   ├── orders/page.tsx    # Orders → OrderTimelineView
│   │   ├── production/page.tsx# Shop Floor → ShopFloorView
│   │   ├── qc/page.tsx        # Quality → QualityStationView
│   │   ├── dispatch/page.tsx  # Dispatch → DispatchScannerView
│   │   ├── tally/page.tsx     # Tally → TallySyncView
│   │   └── api/
│   │       ├── qc/submit/route.ts       # QC inspection API
│   │       ├── dispatch/scan/route.ts   # Carton scan API
│   │       ├── production/log/route.ts  # Production logging API
│   │       └── tally/export/route.ts    # Tally XML export API
│   ├── components/
│   │   ├── dashboard/ExecutiveDashboard.tsx
│   │   ├── orders/OrderTimelineView.tsx
│   │   ├── production/ShopFloorView.tsx
│   │   ├── qc/QualityStationView.tsx
│   │   ├── dispatch/DispatchScannerView.tsx
│   │   ├── tally/TallySyncView.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx    # Collapsible pill sidebar
│   │   │   ├── Header.tsx     # Top bar with search & notifications
│   │   │   └── MobileNav.tsx  # Bottom dock for mobile
│   │   └── theme-provider.tsx # Dark/Light mode context
│   ├── lib/
│   │   ├── data.ts            # Server-side Prisma data fetchers
│   │   ├── prisma.ts          # Singleton Prisma Client
│   │   └── utils.ts           # formatCurrency, formatDate, cn()
│   └── types/
│       └── index.ts           # Shared TypeScript types
├── .env.example               # Environment variable template
├── .gitignore
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## Seeded Demo Data

The `prisma/seed.ts` script creates a realistic factory environment:

| Entity | Count | Details |
|---|---|---|
| **Users** | 5 | Founder, Plant Head, Operator, Scanner, Sales |
| **Workstations** | 2 | Line 01 (uPVC 65mm), Line 02 (TPE Co-extrusion) |
| **Raw Materials** | 4 | PVC Resin K-67, DOP Plasticizer, CaZn Stabilizer, Carbon Black MB |
| **Finished Goods** | 3 | Gasket A101, Weatherseal B202, Glazing Bead C303 |
| **BOMs** | 1 | Gasket A101 (4 raw materials, 2.5% scrap) |
| **Sales Orders** | 3 | Ready to Dispatch, In Production, Approved |
| **Work Orders** | 2 | 1 Completed, 1 In Progress |
| **Job Cards** | 2 | 1 Completed, 1 Active |
| **QC Inspections** | 2 | 1 PASS, 1 REWORK |
| **Delivery Notes** | 1 | DN-26-00001 with 5 cartons (3 scanned, 2 pending) |
| **Tally Sync Logs** | 1 | Previous export audit entry |

Re-seed at any time:

```bash
npx tsx prisma/seed.ts
```

---

## Developing

### Available Commands

```bash
# Start development server (Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Push schema changes to PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Re-seed database with demo data
npm run seed
# or: npx tsx prisma/seed.ts

# Open Prisma Studio (visual DB editor)
npx prisma studio

# Run ESLint
npm run lint
```

### Design System

The app uses a custom pine/emerald palette:

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--primary` | `#0d382c` | `#154d3e` | Buttons, active states, hero cards |
| `--accent` | `#eaf3ef` | `#162a24` | Active nav bg, badges |
| `--background` | `#f4f6f8` | `#090d12` | Page background |
| `--card` | `#ffffff` | `#121820` | Card surfaces |

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import into Vercel
3. Set `DATABASE_URL` environment variable to your PostgreSQL connection string
4. Deploy

### Docker / Self-Hosted

```bash
npm run build
npm start
```

Ensure `DATABASE_URL` is set in the production environment.

---

## Related: ERPNext Backend (hpos_extensions)

The **ERPNext-based backend** (Option A) provides:

- Full double-entry accounting & inventory valuation
- India GST e-Invoicing (IRN, E-Way Bills)
- Frappe Framework authentication & role-based access
- 3 custom screens embedded in Frappe Desk (Order Timeline, Founder Dashboard, QR Dispatch Scan)

See the [`hpos_extensions` README](../hpos_extensions/README.md) for setup instructions.

### Port Matrix (Local Development)

| System | Technology | URL |
|---|---|---|
| **HPOS Factory OS (This App)** | Next.js + Prisma + PostgreSQL | `http://localhost:3000` |
| **ERPNext Enterprise** | Frappe Framework + ERPNext | `http://localhost:8000` |
| **PostgreSQL Database** | PostgreSQL Server | `localhost:5432` |

---

## License

This project is licensed under the **MIT License**.
