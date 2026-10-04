# Design System
## Himalaya Plast Operating System (HPOS)

Since we are building a custom Next.js application, we have full control over the UX. We are adopting a hybrid design strategy:

1. **The 'Desk' Layout:** For transactional data (Sales Orders, Invoices, Item Masters), we will implement an ERPNext-inspired 'Desk' interface. This provides a familiar, highly productive environment for data entry and listing.
2. **Custom Analytical Screens:** For the Founder Dashboard, Order Timeline, and QR Scan, we will use tailored, highly visual designs.

---

## 1. Design Principles
- **Factory-floor legible, not consumer-app cute.** High contrast, large tap targets (QR scan is used on a phone in a warehouse), minimal decorative motion.
- **Productivity First.** Desk lists should be dense and scannable. Forms should support fast keyboard navigation.
- **Unified styling.** Built entirely with Tailwind CSS.

## 2. The 'Desk' Layout Architecture
- **Sidebar:** Persistent left sidebar grouped by Modules (Selling, Buying, Stock, Manufacturing, Accounts, Quality).
- **Workspace:** Clicking a module opens its workspace, showing shortcuts to standard DocTypes (Models) and Reports.
- **List View:** Standardized data grids with search, filtering, and pagination.
- **Form View:** Standardized detail pages with a header (Title, Status Badge, Actions) and grouped field sections.

## 3. Color Tokens (Tailwind Configuration)

The `tailwind.config.ts` (or `globals.css`) should implement these variables:

| CSS Variable | Value | Usage |
|---|---|---|
| `--primary` | `#1B4F72` (confirm brand color) | Primary actions, active sidebar links |
| `--primary-foreground`| `#FFFFFF` | Text on primary buttons |
| `--accent` | `#C87941` | Highlights, "at-risk" callouts |
| `--success` | `#2E7D32` | On-time, QC Pass, reconciled dispatch |
| `--warning` | `#B8860B` | At-risk / due soon |
| `--destructive` | `#B23A2E` | Overdue, QC Reject, carton mismatch |
| `--background` | `#F8FAFC` | Page background (slate-50) |
| `--card` | `#FFFFFF` | Form backgrounds, dashboard cards |
| `--border` | `#E2E8F0` | Dividers, table borders |

## 4. Typography
- **Headings / Body:** Inter (via `next/font/google`).
- **Monospace:** JetBrains Mono for order numbers, batch codes, and QR values.

## 5. Components (Custom UI)

**Status Badges:** Pill components using the semantic color tokens (success/warning/destructive) — used heavily in List Views.

**Stage Stepper (Order Timeline):** Horizontal on desktop, vertical on narrow viewports. Connecting line colored by completion state.

**QR Scan screen specific:**
- Full-viewport camera view with a scan-target overlay frame.
- Large, high-contrast running counter ("14 / 20 cartons scanned").
- Immediate audible/haptic + color feedback on scan.

## 6. Iconography
We use **Lucide React** icons exclusively across the application for the sidebar, buttons, and status indicators.
