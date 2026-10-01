# Master Prompt: Visual Hierarchy (Typography · Color · Weight)

**How to use this doc:** Paste it whole as a system/context prompt for an AI coding tool before a frontend build, keep it as your own reference when reviewing designs, or hand sections to a client as a plain-language rationale for design decisions. It's brand-agnostic on purpose — no specific palette or typeface is prescribed. Every rule below exists to answer one question: *when someone's eyes land on this screen, where do they go first, second, third — and is that the order that actually matters?*

---

## 0. The one idea everything else is downstream of

Visual hierarchy is not decoration. It's **sequencing attention**. A page without hierarchy doesn't look "plain" — it looks like noise, because the reader has to do the sorting work the designer should have done: figuring out what's most important by trial and error instead of being shown.

Three tools do almost all of this sequencing work:

- **Typography** (size, weight, spacing, font choice) — signals *importance* and *category*.
- **Color** — signals *attention* and *state*, and separately, *emotion/brand*.
- **Weight/boldness** — signals *emphasis*, independent of both size and color.

The mistake almost everyone makes is treating these as three separate style choices. They're not. They're one system, and if you set them independently you get contradictions — a big pale gray heading that's technically "large" but reads as *less* important than the bold black paragraph beneath it, because weight and color overrode size.

Everything below assumes: **decide the hierarchy first, in words, before touching a single style property.** Literally write it out — "brand name > headline > CTA > supporting copy > metadata" — before deciding what's 48px vs 16px, what's bold vs regular, what's black vs gray. Style is the encoding of a decision you should have already made, not the decision itself.

---

## 1. Typography

### 1.1 Scale: size is the bluntest, most reliable hierarchy signal

Readers process size differences almost involuntarily — it's the first thing that registers, before color, before weight, before position. This makes it powerful and also dangerous: if your scale is too flat, nothing stands out; if it's undisciplined, everything competes.

**Use a ratio-based scale, not arbitrary pixel jumps.** A modular scale (each step multiplied by a fixed ratio — 1.125, 1.25, 1.333, 1.5, etc.) guarantees that size differences are perceptible and consistent, rather than accidentally too close (14px vs 16px reads as a mistake, not a hierarchy) or wildly uneven (one jump of 2px, the next of 20px).

```css
/* Illustrative — a 1.25 ratio scale from a 16px base */
--text-xs:   0.64rem;   /* 10.24px */
--text-sm:   0.8rem;    /* 12.8px  */
--text-base: 1rem;      /* 16px    */
--text-lg:   1.25rem;   /* 20px    */
--text-xl:   1.563rem;  /* 25px    */
--text-2xl:  1.953rem;  /* 31px    */
--text-3xl:  2.441rem;  /* 39px    */
```

**Rationale for why this matters more than it seems:** a reader should be able to tell your H1 from your H2 from your body copy *without reading the words*, purely from the shape of the block on the page. If they can't, the hierarchy isn't visual — it's just labeled, and labels require reading, which defeats the purpose of a hierarchy in the first place.

**Ceiling, not just a floor.** Display/hero text has a practical maximum before it stops reading as "important" and starts reading as "shouting" or, worse, breaking layout. As a rule of thumb, cap fluid display headings around `clamp(2.5rem, 5vw + 1rem, 6rem)` — beyond ~96px you're not adding hierarchy, you're just adding scroll distance.

### 1.2 Weight as its own axis (see Section 3 for the deep dive)

Size and weight are not interchangeable — they answer different questions. Size answers "how big a deal is this." Weight answers "how much should this specific word or line pull the eye *right now*, regardless of size." A small bold label can out-compete a large thin headline for attention. Use this deliberately; don't let it happen by accident (see 3.3).

### 1.3 Line height and measure — hierarchy fails if the block is unreadable

A hierarchy only works if each tier is actually legible once the reader's eye lands there. Two rules do most of the work:

- **Line length (measure):** cap body text at **65–75 characters per line**. Shorter lines force the eye to jump back to the left margin too often (choppy, tiring); longer lines make it easy to lose your place mid-sentence and re-read the wrong line. Both failures read as "hard to read" even if the type itself is fine — and text your reader avoids reading has no hierarchy at all, because hierarchy only functions on text that gets processed.
- **Line height scales inversely with size.** Large display type needs *tighter* line-height (1.0–1.15) because long lines aren't a risk at that size — there are few words per line. Body text needs *looser* line-height (1.4–1.6) because there are many words per line and the eye needs more vertical room to track back to the correct next line.

### 1.4 Letter-spacing — a floor exists, and it's tighter than most defaults

At large display sizes, negative letter-spacing (tracking) is often used to make type feel tightly designed rather than default-loose. But there's a real floor: past roughly **-0.04em**, letterforms start touching and kerning artifacts appear — the type reads as *cramped*, not *designed*. If you're using -0.05em to -0.08em on a hero headline "for style," back off; -0.02 to -0.03em reads as intentional and tight without breaking the letterforms.

Body text should generally sit at normal or very slightly positive tracking — negative tracking at small sizes actively hurts legibility, which is the opposite of what a good hierarchy should do.

### 1.5 Pairing fonts: contrast, not similarity

If you use more than one typeface, the two must be *legibly different* from each other, or the pairing reads as a mistake rather than a choice. Two geometric sans-serifs (e.g. two look-alike grotesques) read as "I couldn't decide," not as "I'm using two fonts intentionally."

Pair across a genuine contrast axis:
- **Serif + sans** (classic, safest, reads as "editorial")
- **Geometric + humanist** (a rigid, structured sans against a warmer, hand-derived one)
- **One family across multiple weights** — if you're unsure, this is the safest option of all: use one well-built variable font and let weight alone carry the differentiation. It always works because it removes the risk of clashing letterforms entirely.

### 1.6 Wrapping — small detail, disproportionate payoff

Uneven line breaks in headlines (a lonely single word wrapping to its own line, ragged rag on a pull-quote) undercut hierarchy because they make the "important" text look like an afterthought — like nobody checked how it actually rendered. Use `text-wrap: balance` on headings (H1–H3) so lines break evenly, and `text-wrap: pretty` on longer body copy to reduce orphans (a single short word stranded at the end of a paragraph). This is a one-line CSS fix for a problem that otherwise looks like carelessness.

### 1.7 Vertical rhythm

Hierarchy isn't only about individual elements — it's about the *relationships between* elements. Tight spacing groups things as related; generous spacing separates them as distinct. If every gap on the page is the same size, everything reads as equally (un)related, and the eye has no rhythm to follow. Vary spacing deliberately: less space between a heading and the paragraph it introduces, more space before the *next* heading — this alone communicates grouping without any additional visual device.

---

## 2. Color

### 2.1 Color's job is attention-direction first, decoration second

Before "does this look good," color's actual job in a hierarchy is: **what should the eye be pulled to, and what should it be allowed to skip past?** A saturated, high-contrast color against a quiet background reads as "look here." A muted, low-contrast color reads as "this is secondary, available if you look for it, but not competing." If every element on the page is similarly saturated and similarly contrasted, color has stopped doing hierarchy work — it's just wallpaper.

### 2.2 Contrast is non-negotiable, and it's the single most common failure

This is the failure mode that undermines more designs than any other single mistake: **light gray body text on a near-white or tinted background.** It's chosen because it *feels* elegant and restrained — but "restrained" only reads as intentional if the text is still comfortably readable; past a certain point it just reads as low-effort or broken.

Concrete floors (WCAG-derived, worth holding as hard rules, not suggestions):
- **Body text:** ≥ 4.5:1 contrast ratio against its background.
- **Large text** (≥18px, or ≥14px if bold): ≥ 3:1.
- **Placeholder text inside inputs:** same 4.5:1 as body text — it's easy to forget placeholders are text people need to read, and they routinely ship under-contrast.

**Rationale:** hierarchy that depends on someone straining to read the "less important" tier isn't a hierarchy, it's an accessibility failure that happens to also look intentional to the designer who already knows what the text says. If in doubt, err toward the ink end of the ramp — nobody has ever complained a design was "too readable."

**Colored backgrounds are a special case.** Gray text loses almost all its contrast character against a saturated or tinted background — it just looks washed out and slightly wrong, rather than "muted on purpose." On a colored background, don't reach for generic gray; use a darker shade *of that background's own hue*, or apply the text color at reduced opacity/transparency over the background. Either approach keeps the muted tier feeling like a deliberate variant of the same color system, rather than an unrelated gray dropped on top.

### 2.3 Saturation and value as a hierarchy tool, not just hue choice

Hierarchy through color isn't only "which color" — it's also *how intense* that color is. A fully saturated accent color on a single CTA button says "this is the one action that matters here." The same color used at low saturation across five different UI elements says nothing, because nothing stands apart. Reserve your most saturated, highest-contrast color moment for the single most important action or element on a given screen. If everything is emphasized, nothing is.

### 2.4 Pick a color *strategy* before picking colors

Decide the commitment level up front — this determines how much of the interface's hierarchy is being carried by color at all versus by type and layout:

- **Restrained:** tinted neutrals + a single accent used sparingly (roughly ≤10% of surface area). Safest default; lets typography and layout carry most of the hierarchy.
- **Committed:** one saturated color carries a real portion of the surface (30–60%). Appropriate when the brand identity itself needs to be felt immediately, not discovered gradually.
- **Full palette:** 3–4 named color roles, each with a specific, consistent job (e.g., one for positive state, one for warning, one for brand accent, one for informational). This only works if each role is used *consistently* — the moment "warning orange" shows up somewhere unrelated to warnings, the whole system's legibility as a hierarchy tool breaks down.

Whichever you pick, the failure mode to avoid is landing in between by accident — a handful of colors used inconsistently, none of them saturated enough to mean "important," all of them competing at roughly equal visual weight.

### 2.5 Dark vs. light is a decision, not a default

Neither should be a reflex. Before choosing, be able to state — concretely — who's looking at this, in what context, under what ambient light, doing what task. "Developers in a dark room debugging at 1am" genuinely justifies dark-by-default. "A brochure site meant to feel open and airy" genuinely justifies light-by-default. "I picked dark because dashboards look techy" is not a reason grounded in how the hierarchy will actually be read; it's an aesthetic reflex, and aesthetic reflexes are exactly what produce work that looks interchangeable with every other AI-assisted or trend-following design.

### 2.6 Warm neutrals are not automatically "elegant"

A common trap: reaching for a warm, tinted off-white (cream, sand, bone, parchment) as a body background because it *sounds* premium or editorial. That tint has to be justified by the actual brief — a genuinely warm, traditional, or tactile brand — not applied as a default "safer than pure white" choice. If it's not earned by the brand's own logic, a true neutral (chroma at or near zero) or a background tinted toward the *brand's own* hue reads as more considered than a generic warm default.

---

## 3. Boldness / Text Weight

### 3.1 Weight is a hierarchy signal independent of size and color

This is the axis people underuse the most. It's tempting to treat "bold" as binary — on or off — but weight is a *spectrum* (thin, light, regular, medium, semibold, bold, extrabold, black), and each step is a legitimate hierarchy tool on its own, without touching size or color at all. A medium-weight label next to a regular-weight paragraph creates a subtle, quiet hierarchy — useful when you want structure without shouting.

```
100 Thin       — decorative only, rarely legible at body sizes
300 Light      — large display text, quiet/editorial mood
400 Regular    — default body text
500 Medium     — subtle emphasis, UI labels, subheadings
600 Semibold   — strong emphasis without full "bold" weight
700 Bold       — standard emphasis, headlines, CTAs
800–900 Black  — display-only, maximum impact, use sparingly
```

### 3.2 Bold competes with size — use it to *correct* hierarchy, not duplicate it

If your largest element is already bold *and* the biggest thing on the page, weight isn't adding new information — it's redundant with size, which is fine but not especially efficient. Weight becomes powerful specifically when it's used to punch something *up* despite modest size (a small bold price tag standing out against larger, lighter surrounding text) or to hold something *back* despite generous size (a large but thin/light display headline that reads as elegant rather than shouty, letting a smaller bold CTA still win the eye's attention).

### 3.3 The flattening failure: everything bold, nothing emphasized

The most common misuse of weight is applying bold broadly — every heading, every label, every button — because bold individually "looks confident." Collectively, uniform boldness has the exact opposite effect of what boldness is supposed to do: if every tier of the hierarchy is bold, weight stops differentiating anything, and the reader is back to a flat, undifferentiated page, just one that happens to be heavier. **Boldness only works as a signal if it's rare.** Reserve true bold/black weights for the one or two things per screen that genuinely need to win the eye first; let everything else sit at regular or medium.

### 3.4 Weight also carries tone, separate from hierarchy

Beyond pure emphasis, weight communicates mood. Heavier weights (bold, black) read as confident, urgent, or assertive. Lighter weights (thin, light) read as refined, quiet, or editorial. This means weight choices aren't purely functional — a technically "correct" hierarchy using heavy weights throughout will still read as aggressive or loud if that's not the intended tone. Match the weight palette to the emotional register you're going for, not just the informational one.

---

## 4. Combining the three: the hierarchy stack

None of these three tools work in isolation — a strong hierarchy is the *product* of size × weight × color × spacing working together, reinforcing the same decision rather than each pulling toward a different one.

**Diagnostic — the squint test:** blur your eyes (or genuinely squint) at the screen. What still reads as the most prominent shape? If it's not the thing that's supposed to matter most, the hierarchy is broken — no amount of correct individual rules (right contrast ratio, right font pairing, right weight scale) fixes a hierarchy that fails this holistic check.

**Diagnostic — the three-tier read:** a good hierarchy supports three different reading modes on the same content:
1. **Scan** (2 seconds) — the reader should walk away knowing the single most important thing on the screen, from size/weight/color alone, without reading any words.
2. **Skim** (10 seconds) — headings and emphasized fragments should form a coherent outline even if none of the body copy is read.
3. **Read** (full attention) — the full content should be comfortable to actually read once the reader commits, which is where the legibility rules (contrast, line length, line height) matter most.

If a design only works for one of these three modes, it's incomplete. A design optimized purely for "scan" (huge bold color everywhere) becomes exhausting to actually read. A design optimized purely for "read" (careful body typography, nothing else) gives a scanning reader nothing to grab onto.

**Stacking order of strength**, from most to least forceful, useful when deciding which lever to pull first for a given element:
1. Size (largest single lever, hardest to miss)
2. Color/saturation (fast, but only as strong as the contrast against its neighbors)
3. Weight (subtle but precise — good for fine-grained distinctions)
4. Spacing/position (slowest to register consciously, but shapes the reading order before any of the above are even processed)

A common, effective pattern: use *position and spacing* to establish the macro reading order, *size* to mark the one or two dominant elements, *weight* for mid-tier distinctions, and *color* as the sharpest, most sparing accent — reserved for the single action or fact that must not be missed.

---

## 5. Failure patterns worth naming directly

These are the specific, recurring ways hierarchy breaks — worth checking against explicitly, because each one looks "fine" in isolation and only reveals itself as a problem once someone actually tries to read the page:

- **Light gray body text "for elegance."** The single most common contrast failure. If it's borderline, it's failing.
- **Uniform bold.** Every label, heading, and button in the same heavy weight — nothing left to signal "this one especially."
- **A flat type scale.** Sizes too close together (14px vs 16px) read as inconsistency, not hierarchy — the reader can't tell if it was a deliberate choice or a bug.
- **Warm neutral background chosen by default**, not because the brand's own logic calls for warmth.
- **Similar-but-not-identical font pairings** (two geometric sans-serifs) that read as an accident rather than an intentional pairing.
- **Negative letter-spacing pushed too far** on display type, making letterforms touch.
- **Color spread evenly across many elements** instead of concentrated on the one that needs to win.
- **A hierarchy that only survives close reading** — fails the squint test even though every individual rule (contrast ratio, scale ratio, weight choice) was technically followed.

---

## 6. Quick-reference checklist

Run this before calling a layout done:

- [ ] Can I state the intended reading order in one sentence, and does the squint test confirm it?
- [ ] Body text ≥ 4.5:1 contrast; large/bold text ≥ 3:1; placeholders included.
- [ ] Type scale uses a real ratio, not arbitrary jumps — each tier is unmistakably different from its neighbor.
- [ ] Bold/black weight is reserved for 1–2 elements per screen, not applied broadly.
- [ ] Only one element (or a very small set) carries the most saturated color and heaviest contrast on a given screen.
- [ ] Line length is 65–75ch for body copy.
- [ ] Display type stays under ~96px and letter-spacing doesn't go tighter than -0.04em.
- [ ] Spacing between elements varies with their relationship — grouped things sit closer than separated things.
- [ ] The dark/light and warm/neutral choices are traceable to a specific reason, not a reflex.
