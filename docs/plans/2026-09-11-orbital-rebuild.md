---
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-plan-bootstrap
execution: code
date: 2026-09-11
plan_type: feat
reviewed: 2026-09-11
---

# feat: Orbital rebuild — real WebGL scenes over the Star Chart system

## Goal Capsule

**Objective:** the site ships either authored WebGL scenes that demonstrably
improve on the committed baseline — DOM-anchored orbit markers with focus
tracking and live parallax — or the committed baseline itself, verified
unchanged. The verdict of whether R3F can render here is itself a deliverable.

**Means:** react-three-fiber scenes mounted through a shared `SceneFrame`
gate — only if U1's render check passes; otherwise revert to the committed
ThreeUI layers (KTD3).

**Authority:** this plan > uncommitted scratch state. Settled decisions are
labeled below; conflicts surface as blocked, not silent rewrites.

**Stop conditions:** R3F still produces zero pixels after U1's bounded
ladder (~4h wall-clock) → take the U1 revert path, do not keep diagnosing; any
hydration error reappears → fix before shipping, never ship nested anchors.

---

## Product Contract

### Summary

The Star Chart redesign (commit `c26c121`, branch `feat/star-chart-redesign`)
already ships the neo-industrial survey system with animated ThreeUI canvas
layers — real WebGL already runs on the site. This phase's honest delta is
*authored* scenes: drei `<Html>`-anchored project markers on a 3D ellipse,
focus beacon, sighting line, and pointer parallax — capabilities ThreeUI's
self-contained iframes cannot provide. The accessibility and reduced-motion
contract the shipped system guarantees is held throughout.

### Problem Frame

The uncommitted R3F work (scene components, `transpilePackages`, rewired
`SolarSystemNav`/`SiteChrome`, restructured `PlanetNode`) is blocked on a
silent failure: `<Canvas>` mounts but renders zero pixels — no console errors,
even for a trivial box on the scratch `/scene-test` route under Turbopack dev.
(An earlier session cited `canvas.__r3f` never attaching; that property does
not exist on canvas elements in fiber v9 — pixels are the only reliable
signal.) The visual system must not regress while this is resolved; the
committed ThreeUI layers are the fallback baseline. Cause class is unknown:
candidates include Turbopack module identity (`three-stdlib` is absent from
`transpilePackages` while drei pulls it), an upstream Next16+React19.2+R3F
reconciler bug (pmndrs/react-three-fiber#3595 documents silent canvas on
client navigation), and this machine's nonstandard WebGL stack (Apple M1 Pro,
Asahi Linux ARM).

### Requirements

- **R1.** The site keeps the Star Chart neo-industrial identity — survey
  plates, CI-NN registry, hairlines, mono marginalia, teal signal.
- **R2.** Home FIG. 01 renders its orbital composition as a live scene:
  ellipse orbit rings, particle survey sphere at origin, sighting line and
  focus beacon tracking the focused project, and pointer-parallax camera that
  measurably responds to pointer position — when R3F renders. When it does
  not, the committed `OrbitalBody` + static-orbit composition is restored and
  verified pixel-equivalent to `c26c121`.
- **R3.** Every project marker is a real DOM `<a>` (and moon links real
  `<a>`s) that appears in the accessibility tree — via drei `<Html>` portaled
  **outside** any `aria-hidden` subtree in the scene path, or plain DOM in the
  fallback path. No canvas-only meaning; no focusable element inside
  `aria-hidden`.
- **R4.** Under `prefers-reduced-motion`, no WebGL context is created; the
  static plate renders instead. Under WebGL context-creation failure at
  runtime, the same plate renders — the route never errors and never shows
  empty space.
- **R5.** Scenes lazy-mount through `next/dynamic { ssr: false }` and pause
  their frameloop when off-screen. The static plate (with all marker links)
  is server-rendered outside the dynamic boundary so it appears in SSR HTML
  and paints before the scene chunk resolves; the scene replaces it only
  after the first rendered frame.
- **R6.** No hydration errors. The `PlanetNode` restructure (outer
  `span.planet-node-wrap`, project link and moon links as siblings) is kept —
  nested `<a>` inside `<a>` was the confirmed hydration failure.
- **R7.** The site background is a living star field — `StarfieldScene` if R3F
  verifies, the committed `StarChartField` (ThreeUI `ConstellationField`)
  otherwise.
- **R8.** `src/app/scene-test/` and any diagnostic scaffolding (including
  `data-scene-state` attributes) are removed before the PR; no dead code
  ships.
- **R9.** `npm run lint` exits 0, `npm run test` green, `npm run build` green;
  every route passes a no-console-error smoke pass, and representative routes
  render identically or better than the committed baseline at desktop and
  mobile widths.
- **R10.** At ~390px every focusable marker's bounding box intersects the
  stage's visible area, or the stage renders the static plate — invisible
  focusable markers are a defect.

### Key Decisions

- **KD1.** Canvases are decorative; DOM carries all meaning. *(session-settled:
  user-directed — chosen over canvas-native interaction: accessibility and
  semantic HTML are requirements, not options.)* Governs R3, R4, R6.
- **KD2.** The FIG. 01 upgrade goes through real WebGL, not more CSS/SVG.
  *(session-settled: user-directed — chosen over CSS-only polish: user asked
  for a bleeding-edge rebuild and explicitly allowed three.js pieces.)*
  Governs R2, R5.
- **KD3.** The committed ThreeUI layers are the fallback, not a defeated
  alternative. *(session-settled: user-approved — chosen over
  ship-broken-or-nothing: they already verify visually and keep the design
  intact.)* Governs R2, R7, R9.

### Scope Boundaries

**Deferred to Follow-Up Work:** open-source project/catalog flips (user
deferred these explicitly until design work lands); `STRATUM`/catalog data
changes; any CMS or data-layer work; upgrading the remaining ThreeUI layers
(`WarpFieldLayer` on 404, `SectorTerrain` on /projects, `DossierArcField` on
dossier heroes, `UplinkLoader` on loading) — they stay on
`@designcodeio/threeui` on BOTH branches, so `threeui` is never removed and
`three` remains in the lockfile as its peer dep on the revert branch.

**Outside this product's identity:** replacing the curated `src/data/projects.ts`
model; non-space theming; canvas-only navigation.

---

## Planning Contract

### Key Technical Decisions

- **KTD1.** One mount contract — `SceneFrame` — owns reduced-motion gating,
  IntersectionObserver frameloop pausing, `pointer-events: none`, and
  `aria-hidden` **scoped to the `<canvas>` element only** (set via
  `onCreated`/`gl.domElement`, not on the host div). drei `<Html>` content
  must portal to a sibling overlay container outside that hidden subtree
  (`portal` prop → a plain div inside the stage). Chosen over per-scene
  gating so the accessibility contract cannot drift per surface; corrected
  after review showed the host-level `aria-hidden` swallowed the very DOM
  markers R3 exists to protect. Governs R3, R4, R5.
- **KTD2.** Static layers live in `SceneFrame`'s `fallback` prop — exactly one
  of {scene, its dedicated stand-in plate} is live. Permanent ambient chrome
  (`.cosmic-bg__grid`, `cosmic-bg__stars`, `cosmic-bg__noise`,
  `cosmic-bg__vignette`) stays mounted in both states; the rule scopes to a
  scene's own stand-in, not shared background layers.
- **KTD3.** Hard revert path: if U1's ladder produces no rendered pixel within
  its timebox, the branch keeps the committed ThreeUI layers
  (`StarChartField`, `OrbitalBody`), removes `transpilePackages` and the
  `@react-three/*` deps (`three` stays in the lockfile as threeui's peer),
  deletes `src/components/scene/` and `src/app/scene-test/`, and keeps the
  `PlanetNode` restructure + its `.planet-node-wrap` CSS (R6 stands
  regardless). Record the failure signature + minimal repro in the commit
  message so retry is cheap when upstream churn settles. The shipped design
  does not depend on the experiment succeeding.
- **KTD4.** `maath` is imported by `OrbitalScene` but only present
  transitively via drei — if the R3F path ships, U5 promotes it to a direct
  dependency; if the fallback ships, the import leaves with the scene.
- **KTD5.** Pointer parallax uses `eventSource` on `<Canvas>` pointed at the
  stage element — the canvas container keeps `pointer-events: none` (DOM owns
  hit-testing) while R3F observes pointer over the whole stage. Chosen over
  removing `pointer-events: none` (would break DOM hit-testing) and over a
  window listener (eventSource is the library mechanism).
- **KTD6.** Runtime WebGL failure renders the plate, never a dead canvas:
  `<Canvas fallback={plate}>` covers context-creation failure; a small error
  boundary around `Canvas` covers render throws; `gl.onContextLost` is
  acceptable as plate-equivalent. The plan is debugging exactly this failure
  class — production must degrade gracefully under it.

### High-Level Technical Design

The only branching gate in this plan is U1's diagnosis ladder — everything
downstream keys off its outcome:

```
rung 0: raw probes on /scene-test
        getContext('webgl2') + plain THREE.WebGLRenderer scene
          │ blank ──► GPU/context cause (verdict is machine-bound)
          │ renders ──► reconciler-layer cause → rungs below
        │
rung 1: next dev --webpack            rung 2: next build + next start
rung 3: dep matrix (three-stdlib in transpilePackages, single-copy checks)
        + upstream issue search (r3f#3595 class)
        │
   ┌────┴─────────────────────────────────────────────┐
   renders (dev AND prod)                  still blank (~4h cap)
   │                                      │
   keep R3F stack ──► U2 + U3 parallel    KTD3 revert ──► U5 cleanup only
   └─► U4 after U2 (conditional)
   (webpack-dev-only render → try `next build --webpack` before reverting)
```

Scene topology (when R3F verifies): one `<Canvas>` per surface behind
`next/dynamic ssr:false`; the plate is SSR'd **outside** the boundary and
swaps out on the scene's first rendered frame; drei `<Html portal={overlayRef}>`
anchors each `PlanetNode` to its orbit point in a non-hidden overlay so DOM
links keep real position, focus, hit-testing, and a11y-tree presence; camera
drifts toward `pointer` (via `eventSource`, KTD5) through `maath/easing`;
`FocusBeacon` damps to the focused marker's orbit position; `SightingLine`
updates its geometry imperatively in `useFrame` (a render-time `points` prop
never re-reads — known defect in the current scratch code).

### Assumptions

- The silent no-render is reconciler/bundler-layer, not scene-graph — the
  bare `/scene-test` box produced zero pixels; rung 0's raw-three probe is
  what actually discriminates this.
- `output: "standalone"` in `next.config.ts` is unrelated to the failure but
  is part of the prod verification surface.
- This machine (Asahi ARM) may not represent Railway's x86 target — the U1
  verdict notes which environment produced it.

### Sequencing

U1 gates everything. U2/U3 run in parallel on the renders-branch; U4 follows
U2. The revert branch runs U5 alone (plus verification).

---

## Implementation Units

### U1. Resolve the R3F silent no-render (gate)

**Goal:** Determine whether R3F can render in this app under dev AND prod;
either land the fix or execute the KTD3 revert. Timebox: ~4 hours wall-clock.

**Requirements:** R2, R7, R9 — everything downstream depends on this verdict.

**Files:** `src/app/scene-test/page.tsx` (diagnostic, deleted at U5),
`next.config.ts`, `package.json`, `package-lock.json`.

**Approach:**

1. **Rung 0 — discriminate cause class on `/scene-test`:** probe
   `canvas.getContext('webgl2')` and render a plain `THREE.WebGLRenderer`
   scene (no R3F). Blank → GPU/driver cause; the verdict is machine-bound and
   R3F may still work for real users — note it and lean toward ship-baseline.
   Renders → reconciler-layer cause; continue the ladder.
2. Run the bare-Canvas box under `next dev --webpack`. Renders → Turbopack
   resolution is implicated; confirm prod `next build` + `next start` also
   renders before keeping R3F (dev-only workaround that prod breaks is not
   acceptable). If Turbopack-prod stays blank while webpack-dev renders, try
   `next build --webpack` — an all-webpack ship is a legitimate third
   outcome, decided before reverting.
3. Still blank → dep matrix: add `three-stdlib` to `transpilePackages` (drei
   pulls it; it's absent today — a concrete mixed-transpile suspect); confirm
   the app's `three` specifier resolves to a single copy (the three128/
   three165 aliases under threeui are legitimate, not duplicates); try
   removing `transpilePackages` entirely; search upstream for the
   Next16+React19.2+R3F silent-canvas signature (r3f#3595 class — note it
   manifests on client navigation, so the verdict test must include a Link
   round-trip, not just initial mount).
4. Still blank after the ladder/timebox → execute KTD3 revert: restore
   `StarChartField` in `SiteChrome`, `OrbitalBody` + static orbit markup in
   `SolarSystemNav`, remove `transpilePackages`, `src/components/scene/`,
   `scene-test/`, and the `@react-three/*` deps; keep `PlanetNode` and its
   CSS. Verify the revert by DOM/screenshot diff against `c26c121`, not just
   `git status` — the current tree already drifted (`OrbitalBody` is orphaned
   and the wired `fallback` omits it).

**Execution note:** runtime/diagnosis work — verify by rendered pixels, not
unit tests. `canvas.__r3f` does not exist in fiber v9; use pixel checks
(`gl.readPixels`/`toDataURL`) or fiber's `_roots` map.

**Test scenarios:**

- `/scene-test` shows a visible tomato box AND survives a Link navigation
  away-and-back still rendered → renders-branch verdict.
- Ladder exhausted/timebox hit with no pixels → revert leaves the tree
  visually identical to `c26c121` (screenshot diff) plus the `PlanetNode`
  restructure.
- After either verdict, `document.querySelectorAll('a a').length === 0` on
  `/`, and no `aria-hidden` subtree contains a focusable element.

**Verification:** the final report states the verdict, which environment
produced it, and the exact change that produced the first rendered pixel —
or confirms the revert with a baseline screenshot diff.

### U2. OrbitalScene live on FIG. 01

**Goal:** The home orbital figure renders orbit rings, survey sphere, beacon,
sighting line, and DOM-anchored project markers through `SceneFrame` +
`OrbitalScene`, with the SSR'd static plate shown until the scene's first
frame.

**Requirements:** R2, R3, R4, R5, R6, R10.

**Dependencies:** U1 renders-branch only.

**Files:** `src/components/scene/OrbitalScene.tsx`,
`src/components/scene/SceneFrame.tsx`, `src/components/SolarSystemNav.tsx`,
`src/components/planet/PlanetNode.tsx`, `src/app/globals.css`.

**Approach:**

1. Restructure per KTD1/KTD5/KTD6: `aria-hidden` on the canvas element only;
   `<Html portal={overlayRef}>` markers in a sibling overlay div inside
   `.solar-system__stage`; `eventSource` on `<Canvas>` pointed at the stage;
   `fallback` + error boundary → plate on GL failure.
2. Plate placement per R5: render the plate in `SolarSystemNav` outside the
   `ssr:false` boundary (`{sceneLive ? <SceneFrame>…</SceneFrame> : plate}` or
   SceneFrame-internal equivalent) so marker links exist in SSR HTML; keep it
   painted until the scene's first frame to avoid a position jump — the rem
   ellipse and the 3D-projected ellipse do not share coordinates.
3. Markers anchor at ellipse positions derived from `useOrbitRadiiRem`
   (note: hook returns `ry` for the vertical radius; the scene maps it to
   `rz` — that is the depth axis under perspective, so calibrate camera
   distance/fov until projected positions match the plate's ellipse on
   screen).
4. Fix `SightingLine`: mutate the rendered line's geometry imperatively in
   `useFrame` (ref to the Line2 object, `geometry.setPositions`), not a
   render-time `points` snapshot.
5. Focus: `FocusBeacon` + `SightingLine` damp to `positions[focusIndex]`;
   focus moves on `PlanetNode` hover/focus via existing `moveFocusTo`.
6. Mobile (R10): below ~640px either add a viewport gate to `SceneFrame`
   (renders the plate) or scale camera/scene so all markers land inside the
   stage — decide by which verifies; fixed camera at rx≈13.5 units puts most
   markers outside the overflow-hidden stage, which is the defect to avoid.

**Test scenarios:**

- Orbit markers are `<a href="/projects/<slug>">` elements visible in the
  accessibility tree; no focusable element sits inside any `aria-hidden`
  subtree (axe `aria-hidden-focus` clean).
- SSR HTML of `/` contains the project links; JS-disabled render shows the
  plate.
- Camera position responds to pointer over an empty stage region (parallax
  actually works).
- Sighting line visibly animates to the focused marker; beacon damps there.
- `prefers-reduced-motion`: static plate, zero `canvas` elements.
- WebGL disabled/blocked: plate renders, route does not error.
- 390px: every focusable marker's box intersects the stage, or plate shows.
- No hydration errors on load or client navigation to `/`.

**Verification:** desktop + mobile screenshot of FIG. 01 shows rings, sphere,
markers aligned on the ellipse; reduced-motion and no-WebGL show the plate.

### U3. Site background via StarfieldScene

**Goal:** The site-wide background constellation is the R3F `StarfieldScene`
(points + nearest-neighbor line segments, slow drift) mounted in `SiteChrome`
through `SceneFrame` — replacing the ThreeUI `ConstellationField` wrapper.

**Requirements:** R7, R4, R5.

**Dependencies:** U1 renders-branch only (parallel to U2).

**Files:** `src/components/scene/StarfieldScene.tsx`,
`src/components/SiteChrome.tsx`, `src/components/StarChartField.tsx` (deleted
when replaced), `src/app/globals.css`.

**Approach:** current wiring already swaps `StarChartField` →
`SceneFrame`+`StarfieldScene` inside `.cosmic-bg`; keep the ambient CSS layers
(`cosmic-bg__grid`/`stars`/`noise`/`vignette`) mounted in both states (KTD2
scopes exclusivity to a scene's own stand-in). Match the restraint of the
dialed-back ThreeUI layer (≈opacity 0.4) — the field must not compete with
dense text.

**Test scenarios:**

- Star points + faint links visible behind the survey grid on `/` and
  `/projects`; text legibility unchanged vs baseline.
- No `canvas` element under `prefers-reduced-motion`; CSS star layer still
  shows.
- Background does not mount on `/podcast` (existing pathname guard holds).

**Verification:** screenshots show a subtle live constellation; route smoke
pass clean.

### U4. BeltScene for FIG. 02 (conditional polish)

**Goal:** The secondary-orbit belt gains an instanced asteroid point-field —
discretionary polish; the current DOM/SVG belt already satisfies every
requirement.

**Requirements:** R1, R4, R5. (R2 governs FIG. 01 only — not a driver here.)

**Dependencies:** U1 renders-branch; U2 verified (proves `SceneFrame`
mounting on a real surface — `<Html>` anchoring is not used here).

**Files:** `src/components/scene/BeltScene.tsx` (new),
`src/components/SecondaryOrbitRings.tsx`, `src/app/globals.css`.

**Approach:** instanced `THREE.Points` ring sized to the **outer** ring's
radius (the belt renders inner + outer rings with different radii — pick
outer); DOM ring markers and labels stay untouched; same `SceneFrame` gate.

**Test scenarios:**

- Belt shows a distributed particle ring behind the labeled nodes.
- Reduced motion renders the current static belt unchanged.

**Verification:** FIG. 02 screenshot shows particle belt + readable labels.
If U4 cannot land cleanly without risk to R9, it moves to Deferred to
Follow-Up Work rather than shipping half-verified.

### U5. Cleanup and hardening

**Goal:** Remove scaffolding, reconcile deps/CSS/lint, and leave the branch
reviewable.

**Requirements:** R8, R9.

**Dependencies:** U1 verdict; U2–U4 on the renders-branch.

**Files:** `src/app/scene-test/` (delete), `src/components/scene/` (delete on
revert branch), `next.config.ts`, `package.json`, `package-lock.json`,
`src/app/globals.css`, `src/components/StarChartField.tsx`,
`src/components/OrbitalBody.tsx` (delete only if replaced and unused),
`src/components/scene/SceneFrame.tsx`, `src/components/SolarSystemNav.tsx`,
`src/components/StarChartField.tsx`, `src/components/OrbitalBody.tsx`,
`src/components/SecondaryOrbitRings.tsx`.

**Approach:**

1. Delete `scene-test/` and `data-scene-state` debug attributes.
2. Renders-branch: `maath` → direct dep (KTD4, owned solely here); audit
   installed `three`/fiber/drei versions; remove `StarChartField`/`OrbitalBody`
   if fully replaced. Revert-branch: remove `transpilePackages`, scene dir,
   `@react-three/*` deps (`three` remains as threeui's peer — expected).
3. Lint unblocking: the `matchMedia` + synchronous `apply()` pattern violates
   `react-hooks/set-state-in-effect` in `SolarSystemNav` (useOrbitRadiiRem),
   `SecondaryOrbitRings` (useIsMobile), `SceneFrame`, `StarChartField`,
   `OrbitalBody` — the committed baseline does NOT currently lint clean
   (AGENTS.md documents it; prior session cleared then saw the class return
   via the new scene code). Convert these to `useSyncExternalStore` (the
   pattern already proven in `RepoDetailModal`) on whichever branch ships.
4. Sweep `globals.css` for stale rules — including ~80 lines of dead
   `.secondary-orbit__*` rules orphaned since `SecondaryOrbitRings` moved to
   `PlanetNode`, and on the revert branch keep `.planet-node-wrap` /
   `.planet-node__moons` (the restructure needs them).
5. Full gate: lint 0 errors, vitest green, `next build` green.

**Test scenarios:**

- `git status` shows no orphaned files; `grep -r scene-test src/` empty;
  `grep -rn "data-scene-state" src/` empty.
- `npm run lint && npm run test && npm run build` all pass.

**Verification:** clean working tree relative to the intended change set; PR
diff contains no diagnostic leftovers.

---

## Verification Contract

- `npm run lint` — must exit 0. Baseline is NOT clean today
  (`react-hooks/set-state-in-effect` in `SolarSystemNav` + the same pattern in
  new scene files); U5 owns fixing every instance.
- `npm run test` — Vitest suite (`src/**/*.test.ts`) green.
- `npm run build` — green; GitHub-API 429 warnings are expected
  unauthenticated noise.
- `npx tsc --noEmit` — clean.
- Route smoke pass under `next start`: load every route (`/`, `/projects`,
  `/projects/<slug>`, `/about`, `/now`, `/resume`, `/hire`, `/contact`,
  `/openrouter`, a nonexistent route) and assert zero console errors /
  hydration warnings — the background canvas is global, so every route is in
  blast radius.
- Visual: screenshots at ~1440px and ~390px for `/`, `/projects`, one
  dossier, and the 404 route; compare against `c26c121` baseline.
- Reduced-motion emulation: no `canvas` mounts; static plates render.
- WebGL-disabled run: plates render; no route errors.

## Definition of Done

- U1 verdict recorded (environment + producing change or revert evidence).
- R1–R10 hold on the final diff; `/` has zero hydration errors, zero nested
  `<a>`s, zero focusable elements inside `aria-hidden`.
- On the renders branch, FIG. 01 demonstrates at least one capability the
  baseline lacks (working parallax + focus-tracked beacon + DOM-anchored 3D
  markers) — "all Rs pass" must not be achievable by the status quo alone.
- All verification-contract gates pass on this machine; the ladder notes
  which environment produced the verdict.
- Abandoned-attempt code is removed (scene files on revert, orphaned ThreeUI
  wrappers on renders, `scene-test/` and `data-scene-state` on both).
- This plan reflects what actually shipped.
- Branch committed with focused messages; PR opened against `main` only after
  the gates above are green.
