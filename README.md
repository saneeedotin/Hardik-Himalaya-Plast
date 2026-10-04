# Himalaya Plast • HPOS Factory OS

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB.svg?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748.svg?style=flat&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4.svg?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-6E9F18.svg?style=flat&logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**HPOS (Himalaya Plast Operating System)** is a modern, high-precision **Factory Operating System & Manufacturing Execution System (MES)** purpose-built for **Himalaya Plast** — an industrial manufacturer of precision uPVC window glazing gaskets, soft-lip beadings, and dynamic TPE extrusion profiles based in Gujarat, India.

HPOS bridges shop-floor operations (continuous extrusion, 5-sample dimensional QC, carton serialization, and dock gate barcode scanning) with statutory commercial accounting (**Book Keeper** and **TallyPrime**).

---

## 🌟 Executive Highlights

- **Unified Order Cockpit (`/orders/[id]`)**: Full lifecycle management across 8 operational stages (Proforma Quote &rarr; Material Gate &rarr; Confirmation &rarr; Extrusion &rarr; QC &rarr; Carton Packing &rarr; Gate Scan &rarr; Accounting Sync).
- **Strict BOM Material Reservation Gate (Zero Override Rule)**: Prevents launching extrusion jobs without 100% physical raw material compound availability. Generates shortage Purchase Orders with 1 click.
- **3-Tier Stock Ledger (`/stock`)**: Real-time visibility into **Physical Warehouse Stock**, **Active Order Reservations**, and **Net Available Balance** across Raw Materials (PVC K-67, DOP, Ca-Zn), Finished Profiles, and Purge Scrap.
- **Extrusion Shop Floor Telemetry (`/production`)**: Line speed monitoring (18.5 m/min), operator counter logging (`+100m`, `+500m`), scrap purge tracking, and machine downtime logging.
- **5-Sample Quality Assurance Station (`/qc`)**: 4-point dimensional calibration (Pin size, Width, Leg thickness, Linear weight in g/m) plus sash groove fit test with PASS / REWORK / REJECT / SCRAP disposition.
- **Carton Packing & QR Serialization (`/packing`, `/dispatch`)**: Individual coil packing, unique box QR code serialization, and camera/laser dock gate release with audio feedback (Web Audio API).
- **Accounting Integration (`/bookkeeper`, `/tally`)**: Automated 1-click CSV voucher export for **Book Keeper** and XML export for **TallyPrime** (Sales Invoices & Material Consumption).
- **Full 360° Masters**: Dedicated detail views, specs, and histories for Customers, Items, Suppliers, BOM Recipes, and Extrusion Workstations.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16.3.8 (App Router)** | Server Components, Server Actions (`"use server"`), Turbopack |
| **Frontend UI** | **React 19 + Tailwind CSS v4** | Clean industrial palette (`#0d382c` forest green, dark/light mode) |
| **Icons & Charts** | **Lucide React + Recharts** | High-density operational data visualizations |
| **Database & ORM** | **Prisma 6.4 + SQLite / Postgres** | Relational schema with batch traceability & audit logging |
| **Security & Auth** | **Argon2 + Custom RBAC** | Role-based authorization (`Director`, `Admin`, `Operator`, `QC`, `Dispatch`) |
| **Sensory Feedback** | **Web Audio API + Canvas Confetti** | Synthesized D5/A5 scan chimes, error buzzers, and celebrations |
| **Testing** | **Vitest 4.1** | 20 unit & integration test suites covering all core workflows |

---

## 📋 Operational Modules & Workflows

### 1. Unified Order Cockpit (`/orders/[id]`)
Central nervous system for sales contracts:
1. **Commercial Terms**: Customer profile, GSTIN, delivery schedule, and WhatsApp quotation generator.
2. **Strict BOM Material Gate**: Computes compound shortages using formula:
   $$\text{Required} = \frac{\text{Order Qty}}{\text{Output Qty}} \times \frac{\text{RM Ratio}}{1 - \text{Scrap Factor (2.5\%)}}$$
3. **Atomic Stock Locking**: Confirms order and locks raw materials, preventing duplicate allocation.
4. **Extrusion Output**: Modal to log produced meters and scrap purge, auto-updating job card progress.
5. **5-Sample QC**: Submits physical inspection reports directly onto the batch.
6. **Carton Serialization**: Packs coils into serialized cartons and generates QR barcode labels.
7. **Customer Dispatch Gate**: Records Transporter Name, Vehicle Number, and LR / Bilty Number.
8. **Book Keeper Export**: Direct CSV voucher download for accounting entry.

### 2. 3-Tier Inventory Ledger (`/stock`)
- **Raw Materials (Resins & Additives)**: PVC Resin K-67, DOP Plasticizer, Calcium-Zinc Stabilizer, Carbon Black.
- **Finished Profiles**: Glazing gaskets, Soft-lip beadings, Co-extruded profiles.
- **Purge & Scrap**: Regrind/purge stock tracking with reclaim ratios.
- **Item 360 View (`/items/[id]`)**: Full item master sheet showing active BOMs and Where-Used matrix.

### 3. Extrusion Floor & Job Cards (`/production`)
- Dual-line extruder monitoring (Line 01, Line 02, Line 03).
- Instant operator logging (`+100 Meters`, `+500 Meters Reel Finish`, `Log 5 Kg Purge Scrap`).
- Downtime incident reporting (Die change, power outage, temperature calibration).

### 4. Quality Control Station (`/qc`)
- 5-piece sample dimensional testing against nominal tooling tolerances.
- Physical sash groove fit testing (PASS / TIGHT / LOOSE).
- Instant batch disposition marking (PASS &rarr; ready for packing; REWORK/SCRAP &rarr; purged).

### 5. Dispatch Gate Scanner (`/dispatch`)
- High-speed QR barcode camera scanner with auto-focus.
- Consignment verification against Delivery Note manifest.
- Web Audio API audible chimes: Success harmonic chime (D5 &rarr; A5) and double-buzz error tone.
- Supervisor override with security audit logs.

### 6. Book Keeper & Tally Sync (`/bookkeeper`, `/tally`)
- **Sales Voucher CSV**: Formatted for direct Book Keeper import with ledger accounts, GST breakdown, and item rates.
- **Material Issue CSV**: Automated consumption voucher creation deducting compounding raw materials.
- **TallyPrime XML**: 1-click XML export compatible with TallyPrime import specifications.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v20 or higher (v20, v22, or v24 LTS recommended)
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/saneeedotin/Himalaya-Plast.git
cd Himalaya-Plast

# 2. Install dependencies
npm install

# 3. Initialize & Seed Database
npx prisma db push
npm run seed

# 4. Start Development Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Test Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Director / Admin** | `param@himalayaplast.com` | `Password123!` |
| **Operator** | `operator@himalayaplast.com` | `Password123!` |

---

## 🧪 Testing & Validation

HPOS includes a comprehensive Vitest test suite validating all core operational rules:

```bash
# Run all tests
npm test

# Run vitest in watch mode
npx vitest
```

### Test Coverage Highlights
- ✅ **`tests/orders/bom-reservation.test.ts`**: Strict BOM material calculations, 2.5% scrap allowance, deficit detection, and atomic reservation locking.
- ✅ **`tests/dispatch/dispatch.test.ts`**: Carton manifest verification, duplicate scan detection, gate release locking.
- ✅ **`tests/qc/qc.test.ts`**: 4-point dimensional calibration tolerances and disposition marking.
- ✅ **`tests/bookkeeper/bookkeeper.test.ts`**: CSV voucher formatting, column headers, and amount calculations.
- ✅ **`tests/auth/auth.test.ts`**: Argon2 password hashing, RBAC permission checks, and session token verification.

---

## 📦 Production Build & Deployment

### Production Build Verification

```bash
npm run build
npm start
```
*All 64 routes compile cleanly into optimized standalone server bundles with zero TypeScript errors.*

### Deploy to Firebase App Hosting
The repository includes pre-configured [`apphosting.yaml`](file:///z:/Projects/himalaya%20plast/apphosting.yaml):
1. In the [Firebase App Hosting Console](https://console.firebase.google.com/), click **Create Backend**.
2. Select repository `saneeedotin/Himalaya-Plast`.
3. Firebase automatically detects the Next.js App Router and provisions a Cloud Run container.

### Deploy to Vercel (Zero-Config)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Import `saneeedotin/Himalaya-Plast`.
3. Click **Deploy** (deploys in 60 seconds with server actions and APIs enabled).

### Containerized Deployment (Docker)
Build and run the production container:

```bash
docker build -t hpos-app .
docker run -p 3000:3000 hpos-app
```

---

## 📁 Repository Structure

```
├── prisma/
│   ├── schema.prisma       # Full relational database schema (20+ models)
│   └── seed.ts             # Comprehensive factory seed data
├── src/
│   ├── app/
│   │   ├── (auth)/login/   # Secure authentication screen
│   │   ├── (desk)/
│   │   │   ├── orders/     # Order Cockpit, New Order, Edit Order
│   │   │   ├── buying/     # Purchase Orders & Material Receiving
│   │   │   ├── stock/      # 3-Tier Inventory Ledger, Batches, Cartons
│   │   │   ├── production/ # Extrusion Shop Floor & Downtime Logging
│   │   │   ├── qc/         # Quality Assurance Station
│   │   │   ├── packing/    # Carton Packaging & QR Serialization
│   │   │   ├── dispatch/   # Gate Barcode Scanner
│   │   │   ├── bookkeeper/ # Book Keeper CSV Accounting Export
│   │   │   ├── customers/  # Customer 360 & CRM Follow-ups
│   │   │   ├── items/      # Item Master, Specs & Where-Used Matrix
│   │   │   ├── suppliers/  # Supplier 360 & Procurement Ledger
│   │   │   ├── boms/       # Bill of Materials Formulation Recipes
│   │   │   └── search/     # Omni-Search across orders, items, and batches
│   │   └── api/            # REST API endpoints for shop floor & integrations
│   ├── components/         # Modular UI component library
│   └── lib/                # Database client, auth core, RBAC, and utilities
├── tests/                  # Automated Vitest test suites
├── apphosting.yaml         # Firebase App Hosting specification
├── Dockerfile              # Multi-stage production container build
└── package.json
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

© 2026 **Himalaya Plast**. Engineered for precision manufacturing.
