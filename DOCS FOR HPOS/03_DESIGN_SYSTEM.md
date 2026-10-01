# Design System
## Himalaya Plast Operating System (HPOS)

Two distinct design surfaces exist in this project, and they're intentionally treated differently:

1. **ERPNext Desk** (native forms, lists, reports) — themed/branded, not redesigned.
2. **Custom screens** (Order Timeline, Founder Dashboard, QR Dispatch Scan) — genuinely custom UI, needs a real design system.

---

## Part A — ERPNext Desk Theming

Native ERPNext forms (Sales Order, Quotation, Job Card, etc.) are **not** rebuilt. Effort here is limited to:

- **Logo:** Company logo uploaded in Company + Website settings; appears in Desk sidebar and printed documents.
- **Brand color:** Set Frappe's theme accent color to Himalaya Plast's brand color (default: a deep industrial blue `#1B4F72` unless the client specifies otherwise — **flag as an open item**, no brand color has been supplied yet).
- **Print formats:** Custom print format for Sales Invoice, Delivery Note, Purchase Order, and the Carton Label, all carrying the logo, GSTIN, and a consistent header/footer. Built using Frappe's Print Format Builder (Jinja-based), not custom HTML/CSS from scratch, to stay upgrade-safe.
- **Favicon:** Company logo, cropped square.

No further Desk customization (this preserves ERPNext's own accessibility, keyboard shortcuts, and upgrade compatibility — reskinning the Desk is explicitly out of scope).

---

## Part B — Custom Screens Design System

Applies to: Order Timeline, Founder Dashboard, QR Dispatch Scan (and reserved for Planning Board / AI screens if built in a later phase).

### B.1 Design Principles
- **Factory-floor legible, not consumer-app cute.** High contrast, large tap targets (QR scan is used on a phone in a warehouse), minimal decorative motion.
- **Founder Dashboard = premium, single-screen.** This is the one screen senior stakeholders judge the whole system by — it should feel considered, not like a generic admin panel grid.
- **Consistency with Frappe UI primitives** where the custom app embeds inside the Desk (Order Timeline, Founder Dashboard), so it doesn't feel like a foreign app bolted onto ERPNext.

### B.2 Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--hpos-primary` | `#1B4F72` (placeholder — confirm brand color) | Primary actions, active stage indicators |
| `--hpos-primary-light` | `#D6E4EC` | Backgrounds, hover states |
| `--hpos-accent` | `#C87941` (warm industrial orange, echoes the pitch deck's own accent) | Highlights, "at-risk" callouts, numbered step badges |
| `--hpos-success` | `#2E7D32` | On-time, QC Pass, reconciled dispatch |
| `--hpos-warning` | `#B8860B` | At-risk / due soon |
| `--hpos-danger` | `#B23A2E` | Overdue, QC Reject/Scrap, carton mismatch |
| `--hpos-bg` | `#F6F3EE` (warm off-white, matches pitch deck background) | Page background |
| `--hpos-surface` | `#FFFFFF` | Cards |
| `--hpos-border` | `#E2DED5` | Card borders, dividers |
| `--hpos-text-primary` | `#1A1A1A` | Headings, body |
| `--hpos-text-muted` | `#6B6B6B` | Secondary text, captions |

Dark mode: not required for Phase 1 custom screens (shop-floor/office daytime use case) — revisit only if requested.

### B.3 Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Headings | Inter or system serif (e.g. matching Frappe's own heading stack) | 600–700 | Keep consistent with Frappe Desk's default heading font unless client wants a distinct brand voice for the Founder Dashboard specifically |
| Body / data | Inter | 400–500 | Numeric data (order counts, amounts) uses tabular-nums for alignment |
| Monospace | JetBrains Mono or system mono | 400 | Order numbers, batch codes, carton codes — anywhere exact character matching matters |

### B.4 Layout & Components

**Cards** (used throughout Founder Dashboard): white surface, `--hpos-border` 1px border, 8–12px radius, subtle shadow on hover only — matches the flat, low-chrome style of the pitch deck itself (see the numbered-card layout on its "Current State" slide).

**Stage Stepper** (Order Timeline): horizontal on desktop / vertical on narrow viewports, numbered circular badges (matches pitch deck's own numbered-circle motif), connecting line colored by completion state (`--hpos-success` for completed, `--hpos-primary` for current, `--hpos-border` for pending).

**Status badges:** small pill components using the semantic color tokens above (success/warning/danger) — used for order risk status, QC decision, payment status.

**QR Scan screen specific:**
- Full-viewport camera view with a scan-target overlay frame.
- Large, high-contrast running counter ("14 / 20 cartons scanned") pinned to top or bottom, readable at arm's length in warehouse lighting.
- Immediate audible/haptic + color feedback on scan: green flash + short vibration for match, red flash + distinct tone for mismatch/duplicate.
- Minimum tap target size 44×44px for any manual controls (per mobile accessibility baseline).

### B.5 Iconography
Use a single consistent icon set across all custom screens — recommend **Lucide** (open-source, MIT-licensed, pairs well with `frappe-ui`/Vue). Avoid mixing icon sets between Order Timeline, Founder Dashboard, and QR Scan.

### B.6 Motion
Minimal. Stage-stepper transitions and card-load fades only (150–200ms ease-out). No decorative animation — this is an operational tool used repeatedly throughout a shift, not a marketing surface.

### B.7 Open Items
- [ ] Actual Himalaya Plast brand color/logo not yet supplied — all color tokens above are placeholders inferred from the pitch deck's own visual style and must be confirmed or replaced.
- [ ] Confirm whether Founder Dashboard needs to be usable on a tablet/phone by the founder, or desktop-only (affects whether it needs the same mobile rigor as QR Scan).
