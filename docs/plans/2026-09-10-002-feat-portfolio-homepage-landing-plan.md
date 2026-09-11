---
title: Portfolio homepage landing-page redesign
type: feat
date: 2026-09-10
origin: /tmp/claude_code_output.md
---

# Portfolio homepage landing-page redesign

## Summary

Turn the homepage from a 40-row ranked catalog into a person-first landing page that showcases the best 6 systems, then move the full catalog to `/projects`. Tighten the HUD/space design language, replace internal scores with human-readable status labels, and strengthen the call to action.

## Problem frame

The current `/` page dumps the entire ranked repository list on the visitor. Research into portfolio best practices and a self-review found that the page:

- Leads with a brand name instead of the person
- Asks visitors to scan ~40 rows before understanding the value
- Shows raw completeness scores that have no meaning to a reader
- Has no strong visual anchor in the hero
- Buries the contact CTA at the bottom of a long page

The goal is to make the first 10 seconds convert a recruiter or collaborator; the full catalog should still exist, but as a secondary destination.

## Requirements

- R1. The homepage hero must immediately identify **Luke Kimball** and his engineering role.
- R2. The homepage must surface exactly **6 featured systems** with short, proof-oriented descriptions.
- R3. The full ranked catalog must render on `/projects` and remain linked from the homepage.
- R4. Project rows must not display the raw `scoreProjectCompleteness` number.
- R5. Project rows must show human-readable status labels (`Live`, `OSS`, `SaaS`, `Recently shipped`) derived from existing data.
- R6. The design must respect `DESIGN.md` tokens: 0px border radius, Exo display type, JetBrains Mono labels, single accent.
- R7. `npm run build` and `npm run lint` must pass before completion.
- R8. The homepage and `/projects` page must be visually verified at 375px, 768px, 1024px, and 1440px viewports.

## Key technical decisions

- KTD-1. **Move the catalog to `/projects`.** The existing `/projects` route is the natural archive. Keeping the full list on the homepage contradicts landing-page best practices.
- KTD-2. **Feature the top 6 by `scoreProjectCompleteness`.** Use the existing ranking but only the first 6; no manual curation table needed yet.
- KTD-3. **Keep the black hole as the visual anchor.** It was the one praised element from earlier iterations; placing it in the hero right side gives the page a single dominant visual.
- KTD-4. **Replace the score with status tags.** `isProjectLive`, `private`, `lastUpdated`, and `type` already supply the signals; map them to short labels instead of numbers.
- KTD-5. **Repeat the primary CTA.** "Work together" appears above the fold and at the bottom of the page.

## Implementation units

### U1. Move the full catalog to `/projects`

**Goal:** Make `src/app/projects/page.tsx` the canonical full-systems list.

**Requirements:** R3, R4, R5

**Files:**
- `src/app/projects/page.tsx` (create or rewrite)
- `src/app/page.tsx` (remove catalog, keep link)
- `src/lib/project-completeness.ts` (no change expected)

**Approach:**
- Reuse the existing ranking and filter logic from the current `src/app/page.tsx`.
- Render the same row treatment as today but without the raw score column.
- Add status badges from existing data: `Live` when `isProjectLive`, `OSS` when `!private`, `SaaS`/`Tool`/`Platform` from `type`, `Recent` when `lastUpdated` is within 90 days.
- Link each row to `/projects/{slug}`.

**Patterns to follow:** The current `page.tsx` list markup, `DESIGN.md` spacing and typography rules.

**Test scenarios:**
- `/projects` renders at least one row for every non-catalog project with a tagline
- No raw score appears in the HTML
- Each row links to the correct `/projects/{slug}` route
- Live status renders only when `isProjectLive` returns true

**Verification:** `npm run build` generates the `/projects` route; visual spot-check on desktop and mobile.

---

### U2. Rebuild the homepage as a landing page

**Goal:** Turn `/` into a short, conversion-oriented landing page.

**Requirements:** R1, R2, R6, R8

**Files:**
- `src/app/page.tsx`
- `src/components/BlackHole.tsx` (reuse or tune)
- `src/app/space-theme.css` (possible token additions)
- `src/components/Header.tsx` (possible CTA link)

**Approach:**
- Hero: name, role, one-line promise, primary CTA, and the black hole visual.
- Featured work: 6 systems in a 1-column or 2-column list with rank, name, category, status badges, and tagline.
- About/philosophy: one short paragraph on what Luke builds.
- Final CTA: contact/hire panel repeated at the bottom.
- All sections use `max-w-7xl`, `px-4 sm:px-6 lg:px-8`, and the existing spacing scale.

**Patterns to follow:** `ce-frontend-design` Module A (Hero → Support → Detail → Final CTA), `ui-ux-pro-max` `portfolio-grid` pattern.

**Test scenarios:**
- The homepage renders exactly 6 featured systems
- "Work together" CTA appears above the fold and at the bottom
- "All systems" link routes to `/projects`
- Hero contains "Luke Kimball" and a one-line value proposition
- Black hole (or chosen visual anchor) is visible and does not overlap the headline on mobile

**Verification:** Build and lint pass; manual responsive check at 375px, 768px, 1024px, 1440px.

---

### U3. Add human-readable status labels

**Goal:** Replace the raw score with short labels that communicate real state.

**Requirements:** R4, R5

**Files:**
- `src/lib/project-labels.ts` (new helper)
- `src/app/page.tsx`
- `src/app/projects/page.tsx`

**Approach:**
- Create a small helper that returns an array of labels for a project based on existing fields.
- Labels: `Live` (from `isProjectLive`), `OSS` (from `!private`), `SaaS`/`Platform`/`Tool` (from `type`), `Recent` (from `lastUpdated`).
- Render labels in both the homepage featured list and the `/projects` catalog.

**Patterns to follow:** Keep labels in JetBrains Mono, uppercase, 0px radius, single accent.

**Test scenarios:**
- A live public project shows `Live` and `OSS`
- A private non-live project shows only its `type` label
- A project updated in the last 90 days shows `Recent`
- No raw score is rendered anywhere

**Verification:** Snapshot a few representative rows and compare against `isProjectLive`, `private`, `type`, and `lastUpdated` values.

---

### U4. Update `DESIGN.md` and theme tokens

**Goal:** Keep the design standard accurate as the UI evolves.

**Requirements:** R6

**Files:**
- `DESIGN.md`
- `src/app/space-theme.css` (if new tokens are needed)

**Approach:**
- Add a "Landing page map" section that matches the new `/` structure.
- Document the status-label convention.
- Clarify that `0px` radius applies to components, while circular visual anchors (black hole, live dot) are intentional exceptions.
- Add responsive breakpoint expectations and focus-state rules.

**Patterns to follow:** Keep the existing token table and prose economy from the current `DESIGN.md`.

**Test scenarios:**
- `DESIGN.md` accurately describes the new homepage and `/projects` split
- No contradictions between `DESIGN.md` tokens and `space-theme.css`

**Verification:** Read `DESIGN.md` end-to-end and confirm it matches the implemented pages.

---

### U5. Build, lint, and visual verification

**Goal:** Ship the redesign with passing gates and manual QA.

**Requirements:** R7, R8

**Files:**
- All files above

**Approach:**
- Run `npm run build` and `npm run lint`.
- Manually verify the homepage and `/projects` on the dev server at the four target viewports.
- Check that the header, hero, featured list, about panel, CTA, and footer all align and are readable.

**Test scenarios:**
- `npm run build` exits 0 and generates all routes
- `npm run lint` shows no new errors (pre-existing warnings are acceptable)
- No horizontal scroll on 375px
- Hero headline is readable at all breakpoints
- `/projects` is reachable from the homepage

**Verification:** Commands pass; screenshot or browser notes captured in the PR description.

## Scope boundaries

### In scope

- `src/app/page.tsx` homepage rewrite
- `src/app/projects/page.tsx` full catalog page
- `src/lib/project-labels.ts` status-label helper
- `DESIGN.md` updates
- `src/app/space-theme.css` token adjustments if required
- Header/Footer link updates to support the new homepage CTA

### Deferred to follow-up work

- Project detail page redesign (`/projects/[slug]`)
- Performance optimization beyond build/lint
- PWA, dark/light toggle, or theme switching
- Testimonials, publications, or external proof
- Analytics or conversion tracking

### Outside this product's identity

- Changing the backend or GitHub enrichment logic
- Adding a CMS or database

## Risks and dependencies

- **Risk:** The existing `/projects` page may already have content or a different layout. It must be replaced carefully so no routes are dropped.
- **Risk:** The black hole is CSS-based and may not render consistently on all mobile browsers; a reduced-motion fallback must remain.
- **Dependency:** This work assumes the existing `getEnrichedProjects`, `sortProjectsByCompleteness`, and `isProjectLive` helpers continue to work without changes.

## Acceptance examples

- **AE-1. First visit.** A visitor lands on `/`. The first viewport shows "Luke Kimball", a one-line role, a primary "Work together" CTA, and the black hole visual. They scroll to see 6 featured systems, a short about paragraph, and a repeated CTA.
- **AE-2. Browse all systems.** A visitor clicks "All systems" on the homepage and reaches `/projects`. They see the full ranked list with status labels and no raw scores.
- **AE-3. Mobile visit.** A visitor on a 375px-wide device sees the hero headline wrap cleanly, the featured list in one column, and no horizontal overflow.

## Sources and research

- `ce-frontend-design` landing-page module: Hero → Support → Detail → Final CTA
- `ui-ux-pro-max` `portfolio-grid` pattern and `dark brutalist portfolio` style guidance
- Web research: leading 2026 engineering portfolios (itzkashan.dev, GayanKavinda, Divyant.dev) and common portfolio mistakes (Wix, Curious.page, DockPage)
- Prior research write-up in `origin` notes and the existing `DESIGN.md`
