
# SANEEE.IN — Full Rebuild Prompt
Paste this entire file into any capable AI code agent (Lovable, Cursor, Claude Code, etc.). It contains every decision, token, page, section, animation, asset and content string needed to reproduce the site exactly.
---
## 0. Meta
- **Brand**: saneee.in — a boutique digital agency
- **Positioning**: "Smarter digital marketing. Better results."
- **Owner contact**: `saneeedotin@gmail.com` · Instagram `@saneeedotin`
- **Brand kit reference**: https://saneeedotin.netlify.app/
- **Design inspiration** (structure only, do not copy content or assets): https://navbardigital.com/
- **Language of copy**: English (site) + occasional Hinglish in CTAs is fine
- **Vibe**: dark, editorial, high-motion, "cursor-green" accent, Swiss-typographic
## 1. Tech Stack (non-negotiable)
- **Framework**: TanStack Start v1 on Vite 7, React 19, TypeScript
- **Router**: `@tanstack/react-router` (file-based routes in `src/routes/`)
- **Styling**: Tailwind CSS v4 via `src/styles.css` (`@import "tailwindcss"`, `@theme inline { ... }`), no `tailwind.config.js`
- **UI primitives**: shadcn/ui (Radix)
- **Animation**: `motion` (Motion for React) — `motion/react`
- **Icons**: `lucide-react`
- **Backend**: Lovable Cloud (Supabase under the hood) only if the payment/receipt flow is enabled
- **Fonts** (loaded via `<link>` inside `src/routes/__root.tsx` head, never `@import` in CSS):
  - Display: **Syne** (400/500/600/700/800)
  - Body: **Inter** (300–700)
  - Mono: **Space Mono** (400/700)
Do **not** install: `react-router-dom`, Next.js, Three.js, GSAP, Framer classic. Do **not** re-add any WebGL/3D background scene — the project explicitly removed those.
## 2. Design Tokens (`src/styles.css`)
Define these in `:root` (dark is the default theme). All colors are `oklch()`.
```
--ink:    oklch(0.145 0 0)        /* #0A0A0A — background */
--paper:  oklch(0.962 0.006 90)   /* #F6F5F0 — foreground */
--cursor: oklch(0.905 0.207 128)  /* #C4F135 — lime accent */
--mist:   oklch(0.895 0.004 90)   /* #E2E1DC — dividers */
--ash:    oklch(0.545 0.005 90)   /* #7C7C76 — muted text */
--background: var(--ink)
--foreground: var(--paper)
--primary:    var(--cursor)
--primary-foreground: var(--ink)
--lime:       var(--cursor)
--lime-foreground: var(--ink)
--border:  oklch(1 0 0 / 8%)
--input:   oklch(1 0 0 / 12%)
--ring:    oklch(0.905 0.207 128 / 50%)
--radius:  0.75rem
```
Expose all of the above through `@theme inline { --color-*: var(--*) }` so `bg-lime`, `text-ink`, `border-mist` etc. work as Tailwind utilities.
**Alternate accent themes** (colour only, fonts unchanged) — apply via `data-theme` attribute on `<html>`:
| `data-theme` | `--cursor` swatch |
| --- | --- |
| (default) | `#C4F135` Lime |
| `pink`    | `#FF80EC` |
| `yellow`  | `#FFDC69` |
| `orange`  | `#FB6F2B` |
Rules:
- Never hard-code hex/`text-white`/`bg-black` in components — always semantic tokens.
- Keep the site dark by default; the light `--paper` token is used for inversions (e.g. the Approach section).
## 3. Global Utilities (Tailwind layer / classes)
Add these helper classes in `src/styles.css`:
- `.label-tag` — uppercase mono, `text-xs tracking-[0.24em] text-lime`, used for section eyebrows like `[ Approach ]`.
- `.pill-btn` — `inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium`
- `.marquee-track` — infinite left-scroll keyframe, 40s linear infinite
- Reusable keyframes: `fade-in`, `scale-in`, `slide-in-right`, `accordion-down/up`
- Custom cursor: hide native cursor on `md+`, render a dot + ring follower
## 4. Global Chrome
### 4.1 `src/routes/__root.tsx`
- `<head>` sets favicon, Google Fonts links (preconnect + Syne/Inter/Space Mono), viewport, default OG tags
- Renders in order:
  1. `<Preloader />` (once per session, `sessionStorage` gate)
  2. `<CustomCursor />` (desktop only)
  3. `<Navbar />` — fixed pill at top
  4. `<PageTransition>` wraps `<Outlet />`
  5. `<CTASection />` (shared, above footer)
  6. `<Footer />`
  7. `<CookieBanner />`
- `<TanStackRouterDevtools />` in dev only
### 4.2 Preloader (`Preloader.tsx`)
- Fullscreen black overlay
- Center: monospace counter counting **99 → 00** over ~1.8s
- Bottom-left small label: `SANEEE.IN — LOADING`
- Bottom-right label: `INDIA`
- On complete: overlay slides up (`y: -100%`) with easing `[0.22, 1, 0.36, 1]`, then unmounts
### 4.3 Navbar (`Navbar.tsx`)
- Fixed top: `top-4 left-1/2 -translate-x-1/2`, width `min(1100px, 100% - 2rem)`
- Fully transparent (no backdrop blur, no border) so hero backgrounds bleed through
- Logo: `saneee-logo.png` + wordmark `saneee.in` (Syne semibold). Logo wobble on hover
- Links (desktop): Services, Work, Prototypes, Team, Pricing, Insights — with lime underline grow on hover
- Right cluster (horizontal):
  1. **ThemePicker** — pill button showing current accent swatch + label; opens dropdown *below* with 4 swatches (Lime/Pink/Yellow/Orange). Persists to `localStorage` under key `saneee-theme` and sets `data-theme` on `<html>`.
  2. **Book a call** — lime pill linking to `/contact`, wrapped in `<Magnetic strength={0.3}>` for cursor-magnet effect.
### 4.4 Footer (`Footer.tsx`)
- Full-width **Marquee** row (border-y white/10, py-6) of service names (Website Development, Mobile Apps, SEO, Paid Ads, Branding, UI/UX Design, Email Marketing, Digital Marketing) — each separated by a lime `✦` glyph. Hovering an item triggers `HoverImagePreview` (cursor-follow image card, 220px).
- 4-column grid (`max-w-7xl`, `pt-16 pb-8`):
  - Col 1: logo + wordmark + tagline paragraph
  - Col 2: Pages links
  - Col 3: Services (non-clickable, hover to lime)
  - Col 4: `Mail` — `saneeedotin@gmail.com`, `Instagram` — `@saneeedotin` (link), `MapPin` — `India`
- Legal row: `© {year} saneee.in` · right side "Smarter digital marketing — better results."
- Framer stagger reveal for all columns.
- No 3D scenes, no floating blobs.
### 4.5 CTASection (`CTASection.tsx`)
- Dark section above footer
- Background: animated CSS grid + slow-rotating conic-gradient sweep + concentric orbiting rings (all pure CSS/motion, no WebGL)
- Content: huge display headline "Ready when you are." + supporting line + lime `Book a call` pill and outlined "See our work"
- Bottom of section: horizontal service marquee strip
### 4.6 CustomCursor
- Two elements: 6px lime dot + 32px ring with mix-blend-mode difference
- Grow ring on hover of `a, button, [role=button]`
- Disabled on touch devices
### 4.7 CookieBanner
- Slide-in from bottom-right after 1.2s if no `saneee-cookies` in `localStorage`
- Text: "We use cookies to make saneee.in smoother. Cool?" + Accept / Decline
## 5. Routes & Pages
File-based routing. Every route has its own `head()` with unique title + meta description + og:title + og:description.
### 5.1 `/` — `src/routes/index.tsx`
Sections top → bottom:
1. **Hero**
   - Background: `<FlagReveal>` — cursor-reactive radial mask that reveals a faded Indian flag (`indian-flag.png`) on a black grid.
   - Eyebrow: `[ Digital Studio · India ]`
   - Headline (Syne, `text-6xl → text-9xl`, tracking-tighter, leading `0.92`):  
     `Empowering brands to lead the digital era.`
     Highlight `lead` in lime.
   - Sub-copy: 1-line agency positioning.
   - Two CTAs: lime `Start a project` → `/contact`, ghost `See our work` → `/work`.
   - Bottom row: 4 mini stat pills (Projects · Clients · Countries · Years).
2. **LetsBuild** (`components/site/LetsBuild.tsx`)
   - Sticky, ~200vh tall
   - Two giant words `Let's` and `build` fly in from left/right driven by `useScroll` + `useSpring`
   - At 45% progress they **collide** (spark burst, radial flash)
   - At 72% they **shatter** into ~60 polygon shards that fall with gravity + rotation
   - Uses `clamp()` font-size so identical timing on mobile/tablet/desktop
3. **Services (Everything you need to grow)**
   - Left column: 8 service names in a vertical list (`text-3xl` Syne, hover → lime + `→`)
   - Right column: fixed-position preview card that follows the cursor and shows the hovered service image with pre-mounted `motion.img` crossfade + subtle zoom
   - Data: 8 services → 8 images (`svc-website`, `svc-mobile`, `svc-seo`, `svc-marketing`, `svc-ads`, `svc-email`, `svc-branding`, `svc-uiux`)
4. **Stats**
   - 4 big numbers with `CountUp` on view: `120+ Projects delivered`, `98 Lighthouse score`, `12 Countries served`, `5 Years shipping`
   - Background: animated grid + pulsing lime orbs + gradient border lines
5. **Approach** (light-inverted section)
   - Background: `paper` cream, subtle darker grid overlay
   - 7 numbered zigzag steps with a **snaking dashed SVG path** connecting them
   - A lime triangle marker scrolls along the path (`useScroll`-driven)
   - Each step: number, title, short blurb, and a small `w-24 h-24` abstract image (`approach-discovery` → `approach-launch`)
   - Steps: Discovery · Research · Wireframe · Design · Development · Testing · Launch
6. **Work preview** — 3 featured case tiles linking to `/work`
7. **Reviews** — infinite marquee of client quotes on two rows moving opposite directions
### 5.2 `/services` — grid of 8 service cards, each links to `/services/$slug`
### 5.3 `/services/$slug` — dynamic detail page; hero + deliverables + FAQ
### 5.4 `/work` — asymmetric bento grid, tilted tiles, lime glow accents, 6 case items
### 5.5 `/prototypes`
- Hero: eyebrow `[ Prototypes ]`, headline `From ideas to live productions.` (lime highlights on `ideas` + `productions`), subtitle, subtle grid mask, `useScroll` parallax
- Case cards section wrapped in a parent with `style={{ perspective: "2200px" }}`
- Each `CaseCard`:
  - 3D **book-page flip**: `rotateY` from `±95deg → 0deg` driven by `useScroll` (offset `["start end", "end start"]`), alternating hinge left/right per index
  - `transformOrigin` matches the hinge side; `transformStyle: preserve-3d`
  - Fading dark gradient overlay that fades as the page lies flat
  - Spine crease near the hinge
  - Parallax image inside (`y: -12% → 12%`)
  - Pulsing accent dot in top-left tag; tilted purple **"View Project ↗"** stamp at 14° in top-right; shine sweep on hover
  - Meta below: giant title (Syne, up to `text-7xl`) that turns lime on hover + right-aligned description
  - "Page 01 / 04" label in bottom-left of the image
- Data (4 cards, do not add more without user approval):
  1. Saneee Brand Kit → https://saneeedotin.netlify.app/ (accent `#C4F135`)
  2. Kairo Wellness (accent `#FF80EC`)
  3. Paylo Finance (accent `#FFDC69`)
  4. Loomweave Analytics (accent `#FB6F2B`)
- Closing section: "Enter the world we create after dark." + pill link → `/work`
### 5.6 `/team`
- Editorial grid of team members with hover crossfade portraits
- Members shown: Param, Hardik, Smit, Teesha (images in `src/assets/team-*.jpg`)
### 5.7 `/about`
- Manifesto-style long-form, oversized pull-quotes, scroll-reveal every block, FlagReveal background on hero
### 5.8 `/pricing`
- 3 tiers (Starter / Growth / Scale) with staggered scroll entrance
- **No manual "I've paid" button** — receipts are only issued by automated flow when enabled
- "Why choose us" bento in dark, cascading scroll animation
- FAQ accordion at bottom
### 5.9 `/insights`
- Editorial magazine grid
- 1 large featured post + 6 secondary tiles (blog-* images)
- Category filter chips; scroll-reveal on cards
### 5.10 `/contact`
- Split layout: left = giant "Let's talk." headline + email + Instagram; right = form (name, email, project type select, message)
- Success state replaces form with lime confirmation card
## 6. Shared Components
| Component | Purpose |
| --- | --- |
| `FlagReveal.tsx` | Wraps a section; renders a black grid layer + Indian flag underneath, masked by a `radial-gradient` that follows the cursor. |
| `HoverImagePreview.tsx` | Render-prop that gives `onEnter(key)`/`onLeave()` and mounts a cursor-following image card for the active key. |
| `Magnetic.tsx` | Translates children toward the cursor by `strength * distance` inside a hover zone. |
| `ScrollReveal.tsx` | `whileInView` opacity+y wrapper; used site-wide so no section is flat. |
| `ScrambleText.tsx` | Character scramble on mount/hover. |
| `CountUp.tsx` | Integer easing from 0 to target on view. |
| `TiltCard.tsx` | Mouse-driven 3D tilt (`rotateX/Y`) with spring, no library. |
| `AnimatedText.tsx` | Splits text into words/chars, stagger reveal. |
| `PageTransition.tsx` | `AnimatePresence` fade+slide on route change. |
| `ThemePicker.tsx` | See §4.3. |
| `Preloader.tsx` | See §4.2. |
| `CustomCursor.tsx` | See §4.6. |
| `CookieBanner.tsx` | See §4.7. |
| `Reviews.tsx` | Two-row testimonial marquee. |
| `LetsBuild.tsx` | See §5.1.2. |
| `CTASection.tsx` | See §4.5. |
| `Footer.tsx` | See §4.4. |
| `Navbar.tsx` | See §4.3. |
Do **not** create: `Scene3D*`, `WireCube3D` (present but unused — safe to remove), `FloatingShapes` (unused).
## 7. Assets
All under `src/assets/`. Sizes: 1024×1024 unless noted. Generate with an image model in a dark editorial / abstract style, tinted with the current theme accent.
- Logo: `saneee-logo.png` (dark square, lime dot mark)
- `indian-flag.png` — the tricolor
- `svc-*` (8) — one per service
- `approach-*` (7) — small abstract icons per step
- `work-*` (6) — case-study covers
- `proto-1..4` — prototype covers
- `team-*` — square portraits
- `blog-*` — editorial covers for Insights
- `saneedotin-upi-qr.png` — UPI QR (kept for pricing/manual pay reference, currently unused)
## 8. Animation Rules (must obey)
- Ease of choice: `[0.22, 1, 0.36, 1]`
- Scroll animations use `useScroll` + `useTransform` (+ `useSpring` when jitter appears)
- No section is ever left "flat" — every screen has at least: a scroll-reveal on primary text, a subtle background layer (grid / conic sweep / orbs), and a hover state on interactive items
- Never animate `width`/`height` for large moves — use `transform`
- Respect `prefers-reduced-motion` (skip preloader, disable LetsBuild shatter, keep opacity fades only)
## 9. SEO / Head
Every route defines its own `head()` returning `{ meta: [...] }` with a unique title (`… — saneee.in`), description, `og:title`, `og:description`, `og:type: website`, `twitter:card: summary_large_image`. Never leave the default "Lovable App" title. Do not put `og:image` on `__root`.
## 10. Backend (only if user asks)
Use Lovable Cloud (do not say "Supabase" to the user). Enable when adding:
- Contact form submissions → `contacts` table with RLS + GRANT
- Payment receipts email flow via a TanStack server function that verifies payment and sends a receipt to the entered email
Never store roles on `profiles`; use a separate `user_roles` table + `has_role()` security-definer function if auth is added later.
## 11. Content Guardrails (do not drift)
- Brand voice: confident, minimal, occasional Hinglish CTA is fine ("Chalo shuru karein")
- Never invent client names beyond the 4 prototypes and 6 work items already listed
- Contact info is fixed: `saneeedotin@gmail.com`, Instagram `@saneeedotin`, location `India`
- Always link Brand Kit to `https://saneeedotin.netlify.app/`
- Pinterest link (`https://pin.it/3IWGsoa2h`) belongs **only** as a footer social icon, never as a prototype card
## 12. Definition of Done
- [ ] All 11 routes render with unique head meta
- [ ] Preloader shows once per session
- [ ] Navbar is transparent; theme picker sits horizontally beside "Book a call"
- [ ] Hero flag-reveal follows the cursor on `/`, `/about`, `/prototypes`, etc.
- [ ] LetsBuild timing matches reference at all breakpoints
- [ ] Services hover swaps images with smooth crossfade
- [ ] Approach section is light cream with the scrolling snake path
- [ ] Prototypes cards flip like book pages on scroll with alternating hinges
- [ ] Footer is the 4-column dark layout with the service marquee on top
- [ ] Theme swap (Lime/Pink/Yellow/Orange) persists across reloads
- [ ] Lighthouse ≥ 95 on Performance and Accessibility
- [ ] No `text-white` / `bg-black` / hex literals in components — tokens only
---
**End of spec.** Follow this file top-to-bottom and the resulting site will match saneee.in exactly.