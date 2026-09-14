---
title: Star Chart Redesign — Finish and Ship - Plan
type: feat
date: 2026-09-12
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-plan-bootstrap
execution: code
---

# Star Chart Redesign — Finish and Ship

## Goal Capsule

**Objective:** the star-chart redesign on `feat/star-chart-redesign` is verified working in a real browser and lands as an open, merge-ready PR against `main` — a reviewer can confirm the scenes render, the fallbacks hold, and no merge debris ships.

**Means:** a finish-and-verify pass on the already-merged branch: prove the R3F scene layer renders pixels (or revert home surfaces to the committed baseline), hoist the FIG.01 plate into SSR HTML, fix merge-hybrid defects, purge orphaned code, then ship (KTD1–KTD4).

**Authority:** this plan > uncommitted scratch state. The settled decisions in Key Decisions are not re-opened; evidence against them surfaces as a blocker, not a silent rewrite.

**Stop conditions:** a scene still renders zero pixels after U1's bounded ladder → take that unit's revert path for the affected surface instead of shipping empty space; any hydration error → fix before PR; `supply-chain-security` PR checks flag the committed credential → U5 must land before push.

---

## Product Contract

### Summary

The branch carries the finished star-chart design and a just-completed merge of `origin/main`. What remains is proof and hygiene: the R3F scenes were committed on a "pre-verdict checkpoint" and have never been confirmed to paint pixels on this machine's Asahi WebGL stack, the merge left dead code and two real styling defects, and the branch has not shipped.

### Problem Frame

The orbital rebuild plan's central risk — R3F mounting but rendering zero pixels — was never resolved by observation; it was resolved by proceeding. The merge then layered main's parallel HUD redesign pieces on top, most now orphaned. Shipping without a verification pass risks a production deploy with blank canvas regions; shipping without a debris pass ships a half-reconciled merge.

### Requirements

**Scene verification and fallback contract**

- R1. Each mounted scene (FIG.01 orbit via `SolarSystemNav`, FIG.02 belt via `SecondaryOrbitRings`, site starfield via `SiteChrome`) is observed painting real pixels in a real browser against a production build on this machine. A scene that cannot be made to paint within U1's bounded ladder reverts its surface to the committed `c26c121` baseline — no blank canvas region ships.
- R2. The FIG.01 static plate (orbit rings, planet markers, all project anchors) renders in SSR HTML — outside the `ssr:false` dynamic boundary — so marker links exist in the document and paint before the scene chunk resolves; the live scene replaces the plate only after its first rendered frame.
- R3. Under `prefers-reduced-motion: reduce` no WebGL context is created; on FIG.01 the static plate renders under reduced motion and under WebGL context-creation failure. The belt and starfield surfaces render no decorative layer in these cases — their meaning-bearing markers are DOM already (unchanged contract, KTD1). Verified by browser emulation.
- R4. At ~390px viewport width, every focusable project marker on the FIG.01 and FIG.02 stages — including in the server-rendered/no-JS plate — has a bounding box intersecting the stage's visible area, or the surface renders the static plate. Invisible focusable markers are a defect.

**Merge integrity**

- R5. Merge-hybrid defects are fixed: the undefined `--color-text-primary` references in `globals.css`, the doubled page shell on `/openrouter`, and the `<dt>`/`<dd>` elements in `BdhDossier.tsx` missing their `<dl>` wrapper.
- R6. Orphaned code from the merge does not ship unused: each file in the debris inventory is either deleted or explicitly retained with a reason recorded in the PR description. Dead API routes and the now-unused `motion` dependency go with their consumers; `public/llms.txt` entries advertising removed endpoints are removed in the same change (it publicly advertises `/api/activity` and `/api/github/repo/[repoName]/summary`).
- R7. No diagnostic scaffolding ships — `src/app/scene-test/`, `data-scene-state` attributes, and equivalent probes stay absent (verified absent today; kept as an invariant).

**Ship**

- R8. `npm run lint` exits 0, `npm run test` is green, `npm run build` is green, `npx tsc --noEmit` is clean.
- R9. `.mcp.json` carries no committed credential — the `AUTH_TOKEN` env value is removed in favor of a local environment export, so the PR diff adds no flaggable credential. Whether the history-scanning Gitleaks check goes green is triaged per Risks/U6, not guaranteed by the tree fix.
- R10. The branch is pushed and open as a PR against `main` whose description accurately describes the redesign, the merge, and the verification performed.

### Key Decisions

- **KD1.** Canvases are decorative; DOM carries all meaning. *(session-settled: user-directed — chosen over canvas-native interaction: accessibility and semantic HTML are requirements, not options.)* Governs R2, R3, R4.
- **KD2.** The FIG.01 upgrade goes through real WebGL, not more CSS/SVG. *(session-settled: user-directed — chosen over CSS-only polish: user asked for a bleeding-edge rebuild and explicitly allowed three.js pieces.)* Governs R1.
- **KD3.** The committed ThreeUI layers are the fallback, not a defeated alternative. *(session-settled: user-approved — chosen over ship-broken-or-nothing: they already verify visually and keep the design intact.)* Governs R1. Note: the home-surface fallbacks (`StarChartField`, `OrbitalBody`) were deleted from the tree — a revert restores them from `c26c121`, not a rewire.

### Scope Boundaries

**Deferred to Follow-Up Work:** the route renames the star-chart plan sketched (`/projects→/systems`, `/now→/telemetry`, `/resume→/record`, `/hire→/contact`, `/collections/omarchy`) — product-shape change, not merge readiness; open-source/catalog flips and `STRATUM` data changes (deferred in the orbital plan); upgrading the remaining ThreeUI layers (`SectorTerrain`, `WarpFieldLayer`, `DossierArcField`, `UplinkLoader`) which stay live primary layers; the `bakeoff` route's `process.cwd()` data read that 500s under the standalone Dockerfile runner (pre-existing prod defect, noted in Risks).

**Outside this product's identity:** new design work, token rotation itself (user task — the plan removes the committed value; rotating the credential upstream is the owner's action).

### Assumptions

- Orphaned merge debris is deleted rather than retained. The user did not weigh the keep-vs-strip fork; deletion keeps the PR clean and the files remain in `main`'s history if the two design directions reconcile later.
- Merge-ready means an open, green PR — the merge into `main` (which reverses `DESIGN.md`'s stated override of this theme) stays the user's call at review time.
- Verification is a manual real-browser pass on this machine; the repo has no browser automation and no pipeline covers route smoke (only `supply-chain-security` and a main-push-only `deploy.yml` exist) — the U6 manual pass is the only route check.

---

## Planning Contract

### Key Technical Decisions

- KTD1. **Plate hoist:** the FIG.01 plate moves out of the `SceneFrame` `fallback` prop and into `SolarSystemNav`'s server-rendered JSX; the `dynamic({ ssr: false })` scene mounts over it and the plate swaps out on scene-ready. Chosen over passing `fallback` inside the dynamic boundary (the current shape), which leaves the markers absent from SSR HTML — R2. The belt's `SceneFrame` keeps no-fallback (its markers are independent DOM already). The swap contract, all four edges specified:
  - **Plate geometry is CSS-driven.** Marker offsets come from CSS custom properties with a `max-width: 640px` media query (or clamped values) — not the JS `useOrbitRadiiRem`/`useMediaQuery` path, whose server snapshot defaults to desktop radii and would ship off-stage focusable links at ~390px in the SSR/no-JS case R4 forbids.
  - **Frame-ready means markers exist.** "First rendered frame" is the first frame after the drei-`<Html>` overlay markers have mounted (`SceneFrame` renders children only once `.scene-overlay` exists) — an `onCreated`-alone signal would hide the plate into an empty stage.
  - **Hide removes the plate from tab order and the a11y tree** — `hidden` attribute or `visibility:hidden`, not `aria-hidden`/opacity-only (those leave duplicate focusable/announced project links alongside the live markers). The swap defers while the plate contains focus (`:focus-within`/`document.activeElement`); if focus is inside the plate at swap time it moves to the same project's live marker before hiding.
  - **Plate visibility is state-driven, not latched.** The plate stays mounted and hides only while `live && frameReady`; a later `webglcontextlost` or `SceneBoundary` error clears the ready flag and re-shows the plate (wire `ctxLost`/boundary failure to clear it, or keep passing the plate node as `SceneFrame`'s `fallback`). Transition: the scene fades in over the visible plate, then the plate hides — the plate-vs-projected marker position delta is accepted; "no layout shift" means the stage box, not pixel-identical marker positions.
- KTD2. **Debris policy:** delete orphans wholesale — `BlackHole`, `motion/*`, `SolarSystemScene` (references a `public/textures/jupiter.jpg` that does not exist), `SubtleStarfield`, `QuadrantGraph`, `RepoDetailModal` + `api/github/repo/[repoName]/summary`, `ActivityFeed` + `api/activity*`, `ProjectPreview`, `project-labels.ts`, `cn.ts`, the `motion` dep — and slim `space-theme.css` to whatever `globals.css` still consumes (the `body` rules read `--foreground`/`--background` directly, not only the `@theme inline` alias block), deleting it if nothing does. `public/llms.txt` is updated atomically with the API-route deletions. Chosen over retention-for-later per the Assumptions entry.
- KTD3. **Verification is empirical, not static.** The zero-pixel question cannot be answered by reading code — U1 serves a production build and probes each canvas for painted pixels in a real browser on this Asahi ARM machine before any other unit lands, because its verdict decides whether U2 proceeds or the revert path fires.
- KTD4. **Credential hygiene before push:** `.mcp.json` keeps the `${AUTH_TOKEN}` indirection but drops the literal `agp_…` value. Chosen over leaving it (Gitleaks blocks on PRs) and over rewriting the MCP config.

### Research That Shaped the Plan

- `docs/plans/2026-09-11-orbital-rebuild.md` — R1–R10 contract and settled KDs this plan finishes; its R5 (SSR plate) is the requirement the branch currently violates.
- `docs/plans/2026-09-11-star-chart-redesign.md` — design ledger; route renames deferred out of scope.
- Repo audit (2026-09-12): scene wiring confirmed live (`SolarSystemNav.tsx:17-23`, `SecondaryOrbitRings.tsx:10-15`, `SiteChrome.tsx:7-13`); `SceneFrame` gating confirmed (reduced-motion, context-failure listeners, IntersectionObserver frameloop, canvas-scoped `aria-hidden`, overlay portal); debris inventory and hybrid defects enumerated in the units below.
- `.github/workflows/supply-chain-security.yml` — runs on PRs; Gitleaks/npm-audit/Trivy blocking. `deploy.yml` runs on `main` push only — no PR code-quality gate, so R8 is a local gate.

---

## Implementation Units

### U1. Scene render verdict — pixels or revert

**Goal:** determine empirically whether each mounted R3F scene paints pixels on this machine; fix within a bounded ladder or revert the affected surface.

**Requirements:** R1, R3. Gated by KD2, KD3.

**Files:** `src/components/scene/SceneFrame.tsx`, `src/components/scene/OrbitalScene.tsx`, `src/components/scene/BeltScene.tsx`, `src/components/scene/StarfieldScene.tsx`, `src/components/SolarSystemNav.tsx`, `src/components/SecondaryOrbitRings.tsx`, `src/components/SiteChrome.tsx`, `next.config.ts`

**Approach:**

1. Serve the production build (`npm run build && npm run start`) — not Turbopack dev — and open `/`, `/projects`, a dossier route, and a non-home route in a real browser on this machine.
2. For each canvas: confirm non-blank pixels (screenshot or pixel probe), zero console errors, no hydration warnings. The FIG.01 orbit must show ellipse rings, particle sphere, and pointer parallax; the starfield must be visibly alive.
3. Zero pixels → bounded ladder, in order (each rung discriminates a cause class; keep each change small and revert what doesn't help):
   a. **Raw-WebGL probe first.** `canvas.getContext('webgl2')` plus a plain `THREE.WebGLRenderer` scene with no R3F, on a scratch page that is deleted before the PR (not a committed `/scene-test` — R7 stands). Blank here → GPU/driver cause, machine-bound on this Asahi stack. A machine-bound failure alone does not trigger revert — record it in the verdict and lean toward shipping baseline for affected surfaces, since R3F may work for real users.
   b. **Bundler comparison.** `next dev --webpack` and `next build --webpack` against the Turbopack results. Dev-vs-prod is not a bundler axis on Next 16 — both run Turbopack — so the webpack pair is what isolates the bundler; if webpack renders where Turbopack doesn't, an all-webpack ship is a legitimate third outcome, decided before reverting.
   c. **`three-stdlib` into `transpilePackages`** — install it if it doesn't resolve (it's transitive via drei, not a direct dep).
   d. **r3f#3595 check** — the silent-canvas signature is client navigation; the verdict test must include a `next/link` round-trip (navigate away and back), not just initial mount.
4. Still zero pixels after the ladder → revert that scene's surface to the `c26c121` committed baseline. First confirm the baseline files exist at that ref (`git show c26c121:src/components/StarChartField.tsx`); the restored files carry the `set-state-in-effect` pattern the orbital-rebuild plan documented — convert them to `useMediaQuery` (`src/lib/use-media-query.ts`, the pattern the current tree already uses) or R8's lint gate fails on the reverted code. The ThreeUI layers on /projects, 404, dossier heroes, and loading stay untouched. A partial verdict is legal: e.g., starfield reverts while FIG.01 stays live. A revert also feeds the now-dead `src/components/scene/*` files, the `@react-three/*`/`maath` dep set, and the `transpilePackages` entry into U4's purge (keep `three` only as threeui's peer).
5. Record the verdict — painted per scene, what fixed it or reverted, and whether any failure was machine-bound vs. code-bound — in the unit's completion notes for the PR description. A revert verdict without the machine-bound statement is incomplete.

**Execution note:** this is a smoke-first verification unit — pixel evidence and console output are the deliverable; the bounded ladder exists so a silent failure cannot consume the run.

**Test scenarios:**

- Production build on `/`: FIG.01 canvas paints non-blank pixels; planet markers remain real DOM anchors in the a11y tree; no console errors.
- `/`: FIG.02 belt paints via `SecondaryOrbitRings`; ring markers are DOM. (`/projects`'s own "Fig. 02" heading is the Sector map — a ThreeUI `ConstellationNav`/`SectorTerrain` layer, not the belt; don't misprobe it.)
- Any route: site starfield canvas paints behind content.
- Forced `webglcontextcreationerror` (or WebGL disabled in browser flags): static plate renders, route does not error.
- `prefers-reduced-motion` emulated: no WebGL context is created at all.
- If ladder step 1 lands: `three-stdlib` in `transpilePackages` turns a previously-blank canvas non-blank.
- If revert fires: the reverted surface matches `c26c121` visually and the dead R3F mount for that surface is removed.

**Verification:** named pixel evidence per scene (screenshot or probe output) plus clean console; the verdict is written down. Blocks U2 — do not hoist the plate for a scene that will not mount.

### U2. FIG.01 static plate into SSR HTML

**Goal:** the orbit plate — rings, markers, project anchors — is server-rendered so it exists in document HTML and paints before the scene chunk resolves.

**Requirements:** R2, R4. Depends on U1 returning a live-scenes verdict (on a revert verdict for FIG.01, the restored baseline already SSRs its markers and this unit reduces to confirming that).

**Dependencies:** U1

**Files:** `src/components/SolarSystemNav.tsx`, `src/components/scene/SceneFrame.tsx`, `src/components/scene/OrbitalScene.tsx`, `src/app/page.tsx`, `src/app/globals.css`

**Approach:**

1. Render the plate markup (orbit SVG, sun stack, `PlanetNode` anchors) as ordinary JSX in `SolarSystemNav` — server-rendered, outside the `dynamic({ ssr: false })` boundary. Marker positions move off the JS `useOrbitRadiiRem`/`useMediaQuery` path onto CSS custom properties with a `max-width: 640px` media query, so the SSR HTML is viewport-correct without hydration (KTD1).
2. Mount `SceneFrame`/`OrbitalScene` over the same stage and implement the KTD1 swap contract verbatim: frame-ready fires only after overlay markers mount; hide via `hidden`/`visibility:hidden`; defer while the plate holds focus and relocate focus to the same project's live marker if needed; plate visibility follows `live && frameReady` state so a post-swap `ctxLost`/boundary failure re-shows it; scene fades in over the plate before the plate hides.
3. While in `SolarSystemNav`: fix the `moveFocusTo` set-state-in-updater (`setFlipDir` inside the `setFocusIndex` updater — also the R8 hedge if the react-hooks ruleset flags it) and derive the "Five lead bodies" string from the featured list rather than hardcoding it.
4. Keep marker DOM semantics unchanged — `PlanetNode`'s sibling link structure is the hydration fix and must not regress.

**Patterns to follow:** `SceneFrame`'s existing overlay-portal pattern (`useSceneOverlay`) for where live content lands; `useMediaQuery`'s `useSyncExternalStore` shape for any client-gated state.

**Test scenarios:**

- `view-source:` or curl of the SSR'd home HTML contains the FIG.01 project anchors (`<a>` per featured project) — before any client JS runs.
- JS-disabled render at ~390px: every plate marker's bounding box is inside the stage — the R4 check applied pre-hydration, where the CSS-driven geometry is what makes it pass.
- Scene live: the scene fades in over the plate and the plate hides after markers mount — no empty-stage flash, no change to the stage box.
- Mid-session failure: force `webglcontextlost` or a render error after the swap → the plate re-shows; the stage is never blank.
- Reduced-motion: plate renders, no canvas mounts.
- Focus traversal reaches every project link with the keyboard only; focus is never inside `aria-hidden`; if focus sits on a plate marker when the swap fires, it lands on the same project's live marker.

**Verification:** SSR HTML carries the anchors; a real-browser pass shows plate → scene handoff with no console errors.

### U3. Merge-hybrid defect fixes

**Goal:** repair the three defects the merge introduced so hover/focus and page chrome actually work.

**Requirements:** R5

**Files:** `src/app/globals.css`, `src/app/openrouter/page.tsx`, `src/app/openrouter/components/OpenRouterDashboard.tsx`, `src/app/openrouter/components/BdhDossier.tsx`, `AGENTS.md`

**Approach:**

0. Baseline first: run `npm run lint` before editing and record exit code + warning count (merge-session observation was exit 0, 41 warnings — verify, don't trust).
1. `globals.css`: the two `var(--color-text-primary)` uses (`.activity-range__btn:hover`, `.planet-node:hover/:focus-visible` — currently silent no-ops) point at the defined token `var(--color-text)`; delete the dead `.orbit-universe` rule while in the file.
2. `/openrouter`: remove the doubled `cosmic-page cosmic-page--shell` nesting — the page-level wrapper wins; the dashboard drops its own shell classes.
3. `BdhDossier.tsx`: wrap the `.openrouter-card__meta` `<dt>`/`<dd>` group in `<dl>`, matching the correct `<dl className="openrouter-card__meta">` usage in `page.tsx` (there is no `<dl>` exemplar inside `BdhDossier` itself).
4. `AGENTS.md`: correct the stale "pre-existing lint error" caveat — lint currently exits 0; update or remove the `SolarSystemNav` claim.
5. `DESIGN.md`: the merged file still documents main's HUD standard that the shipped star-chart pages contradict. Add a dated divergence note stating the star-chart system is what this branch ships and the full reconciliation is a merge-time decision; the PR description names the HUD-vs-star-chart conflict explicitly as a merge-decision input.

**Test scenarios:**

- `.planet-node` hover/focus-visible produces a visible color change (was silently nothing).
- `/openrouter` shows single horizontal padding — no doubled shell inset at any width.
- The meta block parses as valid HTML (no `<dt>` outside `<dl>`).
- `npm run lint` still exits 0.

**Verification:** each fix observed in the browser; lint/build green.

### U4. Orphan and debris purge

**Goal:** delete code nothing imports so the merge ships only what the design uses.

**Requirements:** R6, R7. Implements KTD2.

**Dependencies:** U3 (the globals.css fixes land before its stylesheet is slimmed)

**Files:** `src/components/BlackHole.tsx`, `src/components/SolarSystemScene.tsx`, `src/components/SubtleStarfield.tsx`, `src/components/QuadrantGraph.tsx`, `src/components/RepoDetailModal.tsx`, `src/components/ActivityFeed.tsx`, `src/components/ProjectPreview.tsx`, `src/components/motion/` (whole directory), `src/lib/project-labels.ts`, `src/lib/cn.ts`, `src/app/space-theme.css`, `src/app/globals.css`, `src/app/api/github/repo/[repoName]/summary/`, `src/app/api/activity/`, `public/llms.txt`, `package.json`, `package-lock.json`, `INDEX.md` (regen if tooling expects it current)

**Approach:**

1. Delete every file with zero importers (list above — re-verify each at execution time; the audit was point-in-time), and remove the `/api/activity` and `/api/github/repo/[repoName]/summary` entries from `public/llms.txt` in the same commit — it publicly advertises both endpoints to external agent consumers, so the advertised contract is updated atomically with the deletions.
2. `space-theme.css` + `globals.css`: first repoint the `body` rules (`color: var(--foreground); background: var(--background)` — defined only in space-theme.css) onto the star-chart tokens (`--color-text`/`--color-bg`); then grep every custom property space-theme.css defines against all `var(--…)` consumers — not just the `@theme inline` alias block — and prune the alias block itself if its generated utilities are dead with their consumers. Delete the file and its `@import` only when nothing remains.
3. Remove `motion` from `package.json` once its last consumer is gone; regenerate the lockfile. A U1 revert verdict additionally feeds `src/components/scene/*`, the `@react-three/*`/`maath` dep set, and the `transpilePackages` entry into this purge (keep `three` only as threeui's peer).
4. Sweep for `scene-test` scaffolding and `data-scene-state` — confirmed absent today; keep it that way.
5. Re-run the zero-importers sweep on anything left — including `package.json` deps and `next.config.ts` entries, which importer-grep cannot see — and regenerate `INDEX.md` if the repo's index tooling expects it current after deletions.
6. If execution surfaces an importer the audit missed, that file is retained and named in the PR description instead of deleted — the unit's contract is "no unreferenced code ships," not a fixed delete list.

**Test expectation:** none — dead-code removal. Verification is the gates below plus a full-route browser smoke (a deleted-but-referenced file surfaces as a build or runtime error).

**Verification:** `npx tsc --noEmit` clean, `npm run build` green, every route loads without console errors.

### U5. Committed credential removal

**Goal:** `.mcp.json` ships no literal secret, so the PR's blocking Gitleaks check has nothing to flag.

**Requirements:** R9

**Files:** `.mcp.json`, `.env.example` (document the expected local export), `docs/` or `README.md` only if a secrets note already has a home

**Approach:**

1. Remove the literal `agp_…` value from `.mcp.json` — delete the `env` block's `AUTH_TOKEN` key entirely (an empty string would override an inherited shell export with empty); the `${AUTH_TOKEN}` reference in args resolves from the process environment.
2. While in the file, pin `mcp-remote` to an exact version (`mcp-remote@x.y.z`, currently `@latest`) — `npx -y` on a floating tag auto-executes the newest publish outside the lockfile supply-chain gates, with the token in the spawned process env.
3. Add a one-line note where the repo documents env vars (`.env.example` or the MCP section of docs) that `AUTH_TOKEN` is supplied by the local environment.
4. Record in the PR description that the credential existed in history since March and needs rotation — rotation is the owner's action, not this branch's.

**Test expectation:** none — config hygiene. Gitleaks output on the PR is the check.

**Verification:** `gitleaks`-equivalent scan of the diff shows no credential; MCP config still parses as valid JSON.

### U6. Full verification pass and PR

**Goal:** the branch is proven against every requirement and opened as a merge-ready PR.

**Requirements:** R8, R10, and the R3/R4 emulation checks not covered earlier.

**Dependencies:** U1–U5

**Files:** none new — consumes everything above

**Approach:**

1. Gate suite: `npm run lint` (0 errors), `npm run test`, `npm run build`, `npx tsc --noEmit`.
2. Browser pass on the production build: every route, no console errors; 375/768/1024/1440 widths on `/` and `/projects`; reduced-motion and WebGL-disabled runs per R3/R4.
3. Push and open the PR against `main` — description covers: what the star-chart redesign is, that `origin/main` was merged in (with the page-level conflict resolution kept to the branch's design), the debris purge, the scene verdict evidence from U1, and the credential note from U5.
4. Triage the `supply-chain-security` PR checks to green or documented-non-blocking.

**Verification:** all checks green; PR URL in hand.

---

## Verification Contract

| Gate | Command / method | Applies to |
|---|---|---|
| Lint | `npm run lint` exits 0 | all units |
| Unit tests | `npm run test` (Vitest, `src/**/*.test.ts`) | all units |
| Typecheck | `npx tsc --noEmit` clean | all units |
| Build | `npm run build` green, all routes prerender | all units |
| Pixel proof | production build + real browser; non-blank canvas per scene | U1, U2 |
| SSR proof | home HTML contains FIG.01 project anchors pre-JS | U2 |
| Fallback proof | reduced-motion and WebGL-disabled emulated runs render plates, no context created | U1, U2, U6 |
| Mobile proof | ~390px marker bounding boxes inside visible stage | U2, U6 |
| Route smoke | every route loads, zero console errors | U4, U6 |
| Secret scan | Gitleaks / PR check clean of `AUTH_TOKEN` | U5, U6 |
| CI | `supply-chain-security` checks on the PR green or triaged | U6 |

---

## Definition of Done

- R1–R10 hold, each verified by the contract row above — not assumed.
- The PR is open against `main` with an accurate description including the U1 verdict and the credential note.
- No abandoned-attempt code in the diff: every reverted surface is cleanly restored, and no diagnostic or scaffold code ships.
- Open questions for the owner (none block execution; recorded in the PR description): whether the advertised `/api/activity` + `/api/github/repo/[repoName]/summary` endpoints are intended public product — U4 deletes them and updates `llms.txt` atomically, so a "retain" answer flips that unit; whether gitleaks-action scans full history under `fetch-depth: 0` or only the PR range — decides if the check goes green or is documented non-blocking until rotation; whether `DESIGN.md` gets rewritten to the star-chart standard in this PR or reconciled at merge review; whether `${AUTH_TOKEN}` expands at `.mcp.json` parse time or inside `mcp-remote` (affects whether the resolved token appears in the spawned process cmdline); whether the `agp_…` credential is still active upstream; whether plate and live scene should share one geometry source long-term. Deferred items live in Scope Boundaries.

## Risks & Dependencies

- **Asahi WebGL** — this machine's nonstandard stack is why the pixel check is empirical; a local pass is strong evidence but the PR description should say where it ran.
- **Gitleaks on PRs** — the `agp_…` token has been in history since March; U5 removes it from the tree but rotation stays with the owner. If Gitleaks scans history rather than the diff, the check may still flag — triage at U6.
- **`bakeoff` route prod defect** — `src/app/openrouter/api/bakeoff/route.ts` reads `src/data/bakeoff.json` via `process.cwd()`; the standalone Dockerfile omits `src/`, so it likely 500s in the deployed image. Pre-existing, not branch-caused — deferred, listed here so the prod smoke pass is not surprised.
- **Two design directions now coexist in history** — `DESIGN.md` on `main` declares its HUD theme authoritative over this one; the merge decision is deliberately left to review.
