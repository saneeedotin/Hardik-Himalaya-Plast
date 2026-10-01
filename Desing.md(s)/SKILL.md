---
name: design-system-lenis-smooth-scroll
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# Lenis – Smooth Scroll

## Mission
Deliver implementation-ready design-system guidance for Lenis – Smooth Scroll that can be applied consistently across documentation site interfaces.

## Brand
- Product/brand: Lenis – Smooth Scroll
- URL: https://www.lenis.dev/
- Audience: developers and technical teams
- Product surface: documentation site

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=Anton`, `font.family.stack=Anton, sans-serif`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=normal`
- Typography scale: `font.size.xs=13.26px`, `font.size.sm=15.47px`, `font.size.md=16px`, `font.size.lg=19.89px`, `font.size.xl=26.52px`, `font.size.2xl=30.94px`, `font.size.3xl=57.46px`, `font.size.4xl=70.72px`
- Color palette: `color.surface.base=#000000`, `color.text.secondary=#efefef`, `color.text.tertiary=#ff98a2`, `color.text.inverse=#b0b0b0`, `color.surface.raised=#0e0e0e`
- Spacing scale: `space.1=13.26px`, `space.2=26.52px`, `space.3=35.36px`, `space.4=44.2px`, `space.5=153.96px`, `space.6=282.87px`, `space.7=299.07px`, `space.8=353.58px`
- Radius/shadow/motion tokens: `motion.duration.instant=1200ms`, `motion.duration.fast=1850ms`, `motion.duration.normal=2050ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
