---
title: Landing Page Rebuild with Upgraded Planet Map - Plan
type: feat
date: 2026-10-26
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-plan-bootstrap
execution: code
---

# Landing Page Rebuild with Upgraded Planet Map - Plan

## Goal Capsule

- **Objective:** A visitor landing on luke-the-duke.com understands who Luke is and what he builds within one screen, and reaches any lead project's dossier through a planet map that feels alive and crafted rather than decorative.
- **Means:** One poster-family composition whose centerpiece is the existing orbital map, upgraded in place rather than replaced (KTD1).
- **Authority:** Luke's settled decisions (Key Decisions below) over `BRAND.md` over this plan over implementer taste. `BRAND.md` wins any conflict on tokens and geometry except where Luke's "keep and update the planets" instruction requires bodies to read as planets (KTD2).
- **Stop conditions:** Stop and report if the base branch has no SolarSystemNav on `/` (planet restore never landed), if restoring a planet-map file would require editing `feat/simplify-site`, or if any change would need a paid model call.
- **Execution profile:** Single stacked PR on `feat/simplify-site` (PR #88). The implementer merges nothing; Railway deploys only after Luke merges.

## Product Contract

### Summary

Rebuild `/` as a poster: a left-aligned identity block and one primary action beside a large, upgraded solar map of the five lead systems, then a compact activity strip and a single closing action row. Planets get richer surfaces, clearer state, and better interaction. One orchestrated entrance plays once; everything else is feedback to the visitor's own action.

### Problem Frame

PR #88 simplified the site to five pages but its interim home replaced the map with cards, which lost the site's signature. The map that exists today is correct in structure (static SSR plate swapping to a React Three Fiber scene) but only two bodies get a shaded contour surface, the other three are bare wireframe limbs, nothing communicates live status on the map, the page above it is a boxed, centered title plate that competes with it, and the header and footer still carry decorative status text and a repeated project list.

### Key Decisions

All are user-directed (Luke) unless noted.

- **Planets stay and are the centerpiece, upgraded.** Rejected: cards-only lead systems, dropping planets. Governs R1, R5-R9.
- **Nav is Work, Resume, About, Hire plus a GitHub icon.** Rejected: the old nine-link bar. Governs R10.
- **Cut the header status strip and the footer project list.** Rejected: keeping either. Governs R10, R11.
- **WelcomeIntro overlay and CardTorch stay removed.** Rejected: reviving either. Governs R12.
- **Planets link to `/projects/<slug>`.** Governs R5.
- **Motion is transform and opacity only, one orchestrated entrance, reduced motion respected.** Rejected: scattered fade-up per section. Governs R13-R15.

### Actors

- Visitor (recruiter or engineer, desktop or phone, mouse, touch, or keyboard).
- Luke (reviews screenshots and merges; no agent merges).

### Requirements

- R1. `/` shows, above the fold on a 1440x900 desktop viewport, Luke's name, a one-sentence value statement, one primary action (to `/projects`), a secondary action (to `/resume`), and the map.
- R2. Below the map stage (which includes the focus card and tour control), `/` shows one compact activity strip (existing `HomeActivityShowcase`) and one closing action row (Hire, About; Resume is already the hero's second action). Nothing else. No metrics row, no repeated project cards, no catalog belt.
- R3. The five lead projects (`getHomepageOrbitProjects`) are the bodies; order and registry numbers (`CI-NN`) are unchanged.
- R4. The server-rendered static plate remains the first paint and the no-WebGL and reduced-motion fallback, and carries identical links and semantics to the live scene.
- R5. Every body is a real link to `/projects/<slug>`; clicking or pressing Enter on a body or on the focus card navigates there.
- R6. When hardware GL is available, all five bodies share one visual language: a shaded survey-contour surface lit from the map's central source (software-GL and reduced-motion paths keep the limb, meridians, and the static plate), per-body line density and phase derived from the slug, and the project's category color for contour lines. No outer glow or bloom: no additive blending, no radial alpha falloff outside the limb, rim at most 1px.
- R7. Tokens: LIVE mark and pulse use `--color-live`; reticle and focus arc use `--color-accent`; the lock stays `--color-signal`. Unknown deployment status shows no mark. A body shows live state: projects with a live deployment show a small LIVE mark in the label and a ring that pulses on transform and opacity; private projects keep the lock and the sr-only "Private" text.
- R8. The focused body is unmistakable: a rotating reticle ring, a brightened orbit arc, the existing sighting line, and the focus card showing category, registry number, name, tagline, and a primary link.
- R9. Interaction: hover or focus on a body focuses it; arrow keys and the previous/next buttons cycle; horizontal swipe on touch cycles; an optional orbit tour auto-advances focus every few seconds, starts only when the map is in view and motion is allowed. Tour states: running, paused-by-user, stopped-by-interaction. A pointer, key, or touch gesture on the map (not the Pause button, and not focus the tour itself moves) moves it to stopped-by-interaction; Play is the only way back to running. The Pause/Play button is hidden by CSS when motion is reduced.
- R10. The header has no status strip (no "FIELD OPERATION", location, sector, or clock). Brand, four nav links, GitHub icon, and the mobile menu remain.
- R11. The footer has no project list. Brand, site nav, and bottom line remain.
- R12. Nothing reintroduces WelcomeIntro or CardTorch.
- R13. One entrance sequence plays once per page load: orbit lines fade in, bodies scale and fade in from the center in a short stagger, then the focus card and copy settle. Total under 1.4 seconds. No other autonomous motion except the slow contour drift, reticle rotation, and live ring pulse.
- R14. All animation uses transform and opacity (plus WebGL uniforms), and every keyframe, including those in `survey-plate.module.css`, sits inside `prefers-reduced-motion: no-preference`. Under `prefers-reduced-motion: reduce`: no canvas, no entrance, no tour, no pulse; the static plate shows everything with full information.
- R15. The map and page keep 60 fps on a typical laptop: one draw call for lines remains, the intro and tour stop when off-screen, and software-rasterized GL still throttles (existing `SceneFrame` behavior).
- R16. Accessibility: the map group has a role and name; the focus card is `aria-live="polite"` only for user-initiated changes, never during the tour; tour focus changes never move DOM focus; prev/next and Pause sit in tab order after the map stop; keyboard order is skip, header, hero actions, one roving-tabindex stop on the map with arrows, focus card link, activity, closing row; focus is visible; text contrast keeps `scripts/check-contrast.mjs` passing; the tour has a visible pause control; no meaning lives only in canvas.
- R17. Mobile (390 px): on coarse pointers a tap on a body navigates (the card previews via swipe and prev/next), a swipe past 40 px suppresses the click that follows, and each body has a hit area of at least 44 px; hero copy, then the map at a reduced radius with all five bodies reachable by tap, swipe, and the prev/next buttons, then the focus card; no horizontal scroll.

### Success Criteria

- - At 1440x900 the h1, both hero actions, and the map's top edge are inside the first 900 px (Playwright bounding-box assertion).
- A reviewer looking only at the desktop and mobile screenshots can name the five projects, tell which are live, and find the primary action without scrolling.
- The Objective is reached when the map, not a card grid, is what a visitor uses to pick a project.

### Scope Boundaries

- Not changing dossier pages, `/projects`, `/resume`, `/about`, `/hire`, redirects, or data in `src/data/catalog`.
- Not adding dependencies or changing `package.json` pins.
- Not changing the site-wide starfield `SiteBackground`.
- Deferred: the sector terrain on `/projects`, any second map.

### Assumptions (product forks resolved without asking)

- A1. Hero copy is short and plain: name, "Applied AI engineer. I build agent runtimes and the platforms they run on.", Luke's existing tagline "Systems that compound." kept as the page's small subhead. Derived from the current intro and `/resume` positioning; Luke can edit copy in review.
- A2. Keep the compact activity strip (Luke settled "cut clutter" but not the strip; PR #88 kept it).
- A3. The tour is on by default after the entrance when motion is allowed and the map is in view, because it shows the planets move; any input stops it. Revisit if Luke finds it busy.
- A4. Planets keep their category-driven color from `catColors`; the per-slug accent set in `planet-visual` is unchanged.
- A5. Refero MCP was unavailable this session, so no live Refero style research was done. Direction is grounded in `BRAND.md`, the repo's tokens, and the bundled refero-design craft references (motion, anti-slop), plus frontend-design guidance. Stated limitation.

## Planning Contract

### Context and Research

- Base: `feat/simplify-site` after the planet-restore commit. Expected present: `src/components/SolarSystemNav.tsx`, `src/components/planet/PlanetNode.tsx`, `src/components/planet/survey-plate.module.css`, `src/components/scene/{OrbitalScene,SceneFrame,contour-shader,orbit-layout}.ts(x)`, `src/lib/planet-visual.ts`, and `src/app/page.tsx` rendering `SolarSystemNav` with `HomeLeadSystems` gone. Verify with U0 before any edit.
- Existing mechanics worth keeping: SSR plate to R3F scene swap with focus relocation in `SolarSystemNav.handleReadyChange`; one-draw-call `SegmentBatch` lines; reduced-motion and software-GL handling in `SceneFrame`; `orbitLayout` collision avoidance; roving `tabIndex` and arrow keys.
- Guardrails: `scripts/check-design-system.mjs` rejects `backdrop-filter`, retired tokens, raw CSS variable fallbacks, and `border-radius` above 4px except circular values. BRAND.md: squared plates, teal for live and interactive only, orange only for classification, no glow.
- Existing signals to reuse, not rebuild: `isProjectLive` in `src/lib/deployments.ts`, `catColors`, `categoryMeta`, `useMediaQuery`, `render-capability`.

### Key Technical Decisions

- **KTD1. Upgrade in place.** Edit the restored files rather than writing a new map. Rationale: the swap, focus, and fallback logic is the hard part and is correct. Cited by Means.
- **KTD2. Planet look is a lit survey surface, not a glowing orb.** Contour lines (existing shader) plus a hard-edged terminator from a fixed light direction toward the map center, a 1px limb, and a thin atmosphere-free rim. This honors "no glow" while reading as a planet. Rationale: satisfies Luke's "update the planets" and BRAND's anti-glow rule together.
- **KTD3. Shader for every body, with the non-shader path kept.** `shouldUseShader` still gates the contour fill; bodies on software GL keep the wireframe limb plus meridians. `isFocalSlug` stops gating the fill and keeps only its extra-meridian and `data-focal` emphasis; body size stays with `resolvePlanetVisual`, so plate and scene cannot disagree. Update the `isFocalSlug` assertions in `src/lib/planet-visual.test.ts` accordingly. Rationale: one visual language (R6) with no cost to weak GPUs.
- **KTD4. The entrance is CSS-only and plays on the SSR plate.** Rings fade in, bodies scale up from the center in an 80 ms stagger, then the copy and readout settle, all inside `prefers-reduced-motion: no-preference`. The live overlay and canvas do not replay it: the canvas fades in under the plate at the existing swap, and hero copy is never gated by the canvas. Rationale: a canvas-driven `intro` would start after the plate is already visible and read as a glitch.
- **KTD5. Tour state lives in `SolarSystemNav`.** A small `useOrbitTour` hook (pure timer logic in a testable module) advances `focus` on an interval, observes visibility with `IntersectionObserver`, and permanently stops on any pointer, key, or touch interaction on the section. Rationale: the component already owns `focus`.
- **KTD6. Hero is a CSS grid, copy left, stage right on 1024 px and wider; stacked below.** The status text and boxed `sheet__plate` title go; the h1 is the visitor's name, set in Archivo heavy with tight tracking per BRAND. Rationale: poster family, one rail.
- **KTD7. Page-level motion is CSS only** (`@keyframes` on transform/opacity, gated by `@media (prefers-reduced-motion: no-preference)` so the default is the static state). Rationale: no JS animation library, no layout thrash.

### High-Level Technical Design

*Directional, not a build spec.*

```text
Desktop (>=1024px)                         Mobile
+-------------------------------------+   +--------------------+
| header: brand | Work Resume About Hire GH | | header           |
+-------------------------------------+   | name + line + CTA  |
| name              |    .  planet       |  | map (compact)      |
| value line        |  .      planet     |  | < focus card >     |
| [See the work] Resume  sun      planet |  | tour pause         |
|                   |  focus card here   |  | activity strip     |
+-------------------------------------+   | closing row        |
| activity strip (compact)               |  +--------------------+
| closing row: Hire / Resume             |
+-------------------------------------+
```

Entrance (once): rings fade in (opacity, scale 0.9 to 1), bodies scale 0.55 to 1 with an 80 ms stagger from 350 ms, the copy settles at 100 ms and the readout at 800 ms (translateY 10px to 0, opacity). The SSR plate plays it on first paint; under reduced motion the media query removes it, and the canvas fades in under the plate at the existing swap.

### Sequencing

U0 verify base, then U1 chrome cuts, U2 hero and page composition, U3 planet surfaces and state, U4 interaction (tour, swipe), U5 entrance and motion polish, U6 responsive pass, U7 tests and visual baselines. U2 to U6 all touch `SolarSystemNav.tsx` and `globals.css` and run strictly in this order.

### Risks and Dependencies

- Base moving: another agent is restoring planets on `feat/simplify-site`. Mitigation: U0 asserts the files exist and fails loudly; rebase onto the base before opening the PR.
- GitHub is unreachable from this host at planning time; push and CI watching may be deferred and reported.
- Plate vs scene geometry: the plate uses fixed `--orbit-rx/ry` (23rem) and `useOrbitRadiiRem` breaks only at 640px, while `FitScale` shrinks the scene. In the hero grid at 1024 to 1279 px, make the radii container-relative (CSS var from the stage width mirrored in the hook) or let the map span full width below the copy at those widths; U6 adds a 1024 and 1280 plate-vs-scene alignment check.
- Tour vs hover: pause the tour while the pointer is inside the stage and on focus-within. The section's existing `tabIndex=0` is removed so the map is one roving tab stop, as R16 states.
- Visual snapshot churn: the `home` baselines and the status-strip mask in `tests/visual/portfolio.spec.ts` change together.
- Shader cost on every body: keep `FBM` at 3 octaves and render at the existing DPR cap `[1, 1.5]`; measure with the software-GL throttle on.

## Implementation Units

### U0. Verify the base

- **Goal:** Confirm the stacked base has the restored map before changing anything.
- **Requirements:** R3, R4.
- **Files:** none edited. Check `src/app/page.tsx`, `src/components/SolarSystemNav.tsx`, `src/components/planet/PlanetNode.tsx`, `src/components/scene/OrbitalScene.tsx`, `src/lib/planet-visual.ts`.
- **Approach:** `grep -q '<SolarSystemNav' src/app/page.tsx` succeeds and `HomeLeadSystems` is absent. If not, stop per the Goal Capsule.
- **Test scenarios:** none (precondition).
- **Verification:** Branch builds and `/` renders the map before edits.

### U1. Cut chrome clutter

- **Goal:** Remove the status strip and the footer project list.
- **Requirements:** R10, R11, R12.
- **Files:** `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/app/globals.css` (`.site-header__status*`, `.cosmic-footer__index*`, `.cosmic-footer__btn*`), `tests/visual/portfolio.spec.ts` (drop the `utcStatusSelector` mask and the separate 'UTC status remains live' test).
- **Approach:** Delete the status block and the `useUtcClock` hook. In the footer drop `featuredProjects`, the `listedProjects`/`HOMEPAGE_FEATURED_SLUGS`/`ExternalIcon` imports, and the index list; keep brand, nav, bottom line. Remove the dead CSS. Keep the sticky header height rules consistent after the strip is gone. Grep to confirm no `WelcomeIntro` or `CardTorch` references exist.
- **Test scenarios:** Header renders four links and a GitHub icon and no "FIELD OPERATION" text. Footer renders the site nav and no project names. The footer no longer imports the catalog (client bundle unaffected).
- **Verification:** `npm run lint` (includes design check), `npm test`.

### U2. Hero and page composition

- **Goal:** Replace the boxed title plate with the poster hero and trim the page to hero + map + activity + closing row.
- **Requirements:** R1, R2, R16, R17.
- **Files:** `src/app/page.tsx`, `src/components/SolarSystemNav.tsx` (accept `copy` slot or render inside the new grid), `src/app/globals.css` (`.poster*`, remove `.sheet__plate--intro` home usage if unused elsewhere), `src/components/design/ActionRow.tsx` (reuse for the closing row).
- **Approach:** `page.tsx` renders `<section class="poster">` with an `h1`, value line, tagline, and two actions in a copy column, and `SolarSystemNav` as the stage column (stacked under 1024 px). Heading structure: one `h1`, map section `h2` visually hidden or small, activity `h2`, closing row without a heading. Closing row: Hire (primary), Resume (secondary) with `data-umami-event`. Copy per A1. Keep `revalidate = 3600`. Keep the intro fetch of activity.
- **Test scenarios:** `/` has one `h1`; the primary action href is `/projects`; no element with the retired `sheet__plate--intro`; activity strip renders when data is empty (existing empty state).
- **Verification:** Playwright home spec, desktop and mobile screenshots, no horizontal overflow.

### U3. Planet surfaces and state

- **Goal:** One shared, lit contour surface on all five bodies and clear live and focus state.
- **Requirements:** R6, R7, R8.
- **Files:** `src/components/scene/contour-shader.ts` (add `uLightDir`, `uTerminator`, `uDensity`; keep no-glow), `src/components/scene/OrbitalScene.tsx` (render `ContourBody` for all bodies when `shader`, per-slug seed and density, reticle ring on focus), `src/lib/planet-visual.ts` (+ `planetSurfaceParams(slug)` pure function returning seed, density, tilt; `isFocalSlug` semantics narrowed to size emphasis), `src/lib/planet-visual.test.ts`, `src/components/planet/PlanetNode.tsx` (LIVE mark, live ring element), `src/components/planet/survey-plate.module.css` and `src/app/globals.css` (`.planet-node__live`, ring pulse, reticle, label chip), `src/lib/deployments.ts` (read only: `isProjectLive`), `BRAND.md` (amend the Geometry and Motion notes: planets are shaded survey bodies, still no glow).
- **Approach:** Terminator is a hard `smoothstep` on `dot(normal, light)` mixed to the fill color, not a glow. Density varies per slug (4 to 6 bands) so bodies differ. Software-GL path keeps limbs plus meridians via `meridianCount`. The DOM `PlanetNode` gets `data-live` and renders the LIVE text for sr and sighted users; the pulsing ring is an absolutely positioned span animated on `transform: scale` and `opacity` only. The focused reticle is a rotating dashed ring (CSS `transform: rotate` for the DOM plate; mesh rotation in the scene).
- **Test scenarios:** `planetSurfaceParams` is deterministic per slug and differs across the five featured slugs; bands within 4 to 6; `isProjectLive` true gives `data-live`, false does not; private body still renders lock and "Private".
- **Verification:** `npm test`; screenshot shows five shaded bodies, LIVE marks on the live ones, one reticle.

### U4. Interaction: tour, swipe, hover focus

- **Goal:** Make the map feel responsive and demonstrably interactive.
- **Requirements:** R5, R9, R16.
- **Files:** `src/components/SolarSystemNav.tsx`, `src/components/scene/orbit-tour.ts` (pure interval and stop logic) and `orbit-tour.test.ts`, `src/app/globals.css`.
- **Approach:** `useOrbitTour` advances focus every 4.5 s while in view and motion is allowed; any `pointerdown`, `keydown`, `touchstart`, or `focusin` on the section stops it for the session; a visible Pause/Play button (aria-pressed) toggles it. Touch swipe: pointer events with a 40 px horizontal threshold call `go(±1)`; vertical scroll is not blocked (`touch-action: pan-y` on the stage). Hover and focus on a body already focus it; keep that. Do not change roving tabindex.
- **Test scenarios:** Tour logic advances on tick, stops on interaction, never starts when `reducedMotion` is true, resumes only from the Play button. Swipe of 60 px right calls previous; 20 px does nothing.
- **Verification:** `npm test`; Playwright: press ArrowRight changes the focus card name; the tour stops after a click.

### U5. Entrance and motion polish

- **Goal:** One orchestrated entrance and tasteful feedback.
- **Requirements:** R13, R14, R15.
- **Files:** `src/app/globals.css` (`@keyframes` for hero copy settle, focus-card crossfade, hover and active feedback), `src/components/scene/SceneFrame.tsx` (read only).
- **Approach:** Per KTD4 and KTD7. Hover and press feedback on actions and bodies: 120 ms transform and opacity. Replace the focus-card rotator's 3D flip with a short crossfade plus 6 px translate if the flip reads as jank in review. All new motion rules sit inside `@media (prefers-reduced-motion: no-preference)`.
- **Test scenarios:** With `reducedMotion: "reduce"`, the page has no canvas, the plate is visible, and no animation runs inside `.poster`.
- **Verification:** Playwright emulating `reducedMotion: reduce`; manual frame-time check noted in the PR.

### U6. Responsive pass

- **Goal:** Mobile and mid-width composition holds up.
- **Requirements:** R17, R16.
- **Files:** `src/app/globals.css`, `src/components/SolarSystemNav.tsx` (`useOrbitRadiiRem` breakpoints).
- **Approach:** Check 390, 768, 1024, 1440, and 1920 widths. Mobile uses the existing 8.5/4.5 rem radii with the labels truncated by `shortPlanetLabel`; focus card sits below the map; touch targets at least 44 px (invisible hit-area on bodies if needed). No horizontal scroll at any width.
- **Test scenarios:** `expectNoHorizontalOverflow` at both existing viewports plus 768.
- **Verification:** Screenshots for each width saved to `~/Downloads/claude/portfolio-hub/landing/`.

### U7. Tests and visual baselines

- **Goal:** Lock behavior and refresh baselines in the CI environment.
- **Requirements:** R1 to R17.
- **Files:** `tests/visual/portfolio.spec.ts`, `tests/visual/portfolio.spec.ts-snapshots/home-*-linux.png`, `src/lib/planet-visual.test.ts`, `src/components/scene/orbit-tour.test.ts`.
- **Approach:** Update the home assertions (map present, hero actions, no status strip, no footer project list, reduced-motion fallback). Regenerate `home-desktop` and `home-mobile` baselines inside `mcr.microsoft.com/playwright:v1.64.1-noble` (arm64 host; install matching Playwright with `--no-save`, do not change pins) so they match CI's Linux renderer; note that CI may still differ and report.
- **Verification:** `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`, Playwright home and header/footer assertions pass.

## Verification Contract

- `npx tsc --noEmit`
- `npm run lint` (eslint, design-system check, privacy check)
- `npm test` (vitest)
- `npm run build`
- Playwright (container `mcr.microsoft.com/playwright:v1.64.1-noble`): home spec desktop and mobile, reduced-motion emulation, keyboard arrow navigation.
- `node scripts/check-contrast.mjs` after CSS changes.
- Visual QA: desktop 1440x900 and mobile 390x844 screenshots compared against this plan's concept, saved to `~/Downloads/claude/portfolio-hub/landing/`.

## Definition of Done

- All Requirements R1 to R17 hold, evidenced by the Verification Contract.
- No status strip, no footer project list, no WelcomeIntro, no CardTorch.
- Planets link to dossiers; five bodies share the surface language; live and focus states are visible.
- Reduced-motion users get a complete static plate.
- Every Verification Contract command passes, or an environmental failure is stated with its cause.
- Abandoned experiments (unused keyframes, dead CSS for removed header and footer parts, unused imports) are removed from the diff.
- PR opened against `feat/simplify-site` stating it is stacked on PR #88, with CI state and residual review findings recorded; not merged.

## Sources / Research

- `BRAND.md` (Star Chart system, motion and canvas rules, anti-glow), `DESIGN.md` pointer, `scripts/check-design-system.mjs`.
- `src/components/scene/OrbitalScene.tsx`, `SceneFrame.tsx`, `contour-shader.ts`, `src/lib/planet-visual.ts`, `src/components/SolarSystemNav.tsx` (as restored from `origin/main`).
- `tests/visual/portfolio.spec.ts` for existing home assertions and the status-strip mask.
- `~/Downloads/claude/portfolio-hub/site-map.md` for the crowding diagnosis that led to PR #88.
