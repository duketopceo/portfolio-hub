---
title: Next-phase P1 — four workstreams, first phase each
type: feat
date: 2026-09-28
artifact_contract: ce-unified-plan/v1
execution: code
status: ready
---

# Next-Phase P1

Four candidate tracks were offered; the user asked for a plan covering phase 1 of each. Units are independently shippable and ordered cheapest-first.

## U1. Verify/close edge-marker clipping (issue #46)

**Frame.** `FitScale` in `src/components/scene/OrbitalScene.tsx` reserves a fixed `marginPx = 48` per side, which underestimated real marker half-width (icon + label text + padding). Since then the label moved out of flow (#50), changing the wrap's box — the clip may be fixed, worse, or unchanged. Phase 1 is measure-first, then a bounded fix only if still clipping.

**Do:**
- Reproduce on production and dev at desktop and ~1280px viewports: cycle focus to CI-25 (leftmost) and CI-02 (rightmost), measure `.planet-node-wrap` right/left overflow via CDP.
- If still clipping: replace the fixed `marginPx` with a measured half-width — read the widest `.planet-node-wrap` `offsetWidth` via a `ResizeObserver` (or DOM measure on mount + resize) inside `SceneFrame`, pass half-width + breathing room into `FitScale` as a prop. Fallback stays 48px when no marker is mounted.
- Do NOT touch `zIndexRange`, camera, or marker internals.

**Files:** `src/components/scene/OrbitalScene.tsx`, `src/components/scene/SceneFrame.tsx`, `src/components/SolarSystemNav.tsx` (wiring only if needed).

**Tests:** extend `npm run test:visual` route matrix if a marker-overflow assertion exists; otherwise a Vitest on the margin computation + manual BrowserOS check at 1280px and 3456px viewports.

**Done:** CI-25 and CI-02 labels fully in-frame at 1280px and native viewport; no regression of marker alignment verified in #50 (anchor dy=0).

## U2. Ship the Dayflow demo (PR #45)

**Frame.** PR `feat/demo-dayflow` is already built on worktree `.worktrees/demo-dayflow` (`1cac74e`): `/demos/dayflow` replay page with real `preview.png` in MediaFrame, reconstructed 15-min blocks, capture metrics; Dayflow promoted to `replay` in `src/data/demos.ts`, catalog entry in `src/data/projects.ts`.

Phase 1 is verify-and-ship, not new code:
- Rebase/merge `main` into the branch (it's stale — #44 demo bay and later commits landed).
- Run gates: `npm run lint`, `npm run test`, `npm run build`, `npm run test:visual`.
- BrowserOS visual check of `/demos/dayflow`: MediaFrame image loads, timeline renders, `demo-embed-load`/`demo-launch` Umami attrs present.
- Resolve any review comments; convert from draft to ready; hand merge call to user.

**Files:** `.worktrees/demo-dayflow` branch state; `src/app/demos/dayflow/page.tsx`, `src/data/demos.ts`, `src/data/projects.ts`, `src/app/sitemap.ts` (already changed on the branch — conflict resolution only).

**Done:** PR #45 green, review-clean, ready for user's merge decision.

## U3. Portfolio Guide — corpus + service skeleton only

**Frame.** The full guarded-chatbot plan exists (`docs/plans/2026-09-14-0229-feat-portfolio-guide-plan.md`, status: ready). Phase 1 = its U1+U2 only — the Cloudflare Worker scaffold and the typed corpus manifest — deliberately stopping before Vectorize ingestion, sessions, model routing, and UI. Rationale: the corpus schema is the risk-bearing decision (curated-private approval metadata); landing it first lets everything else ride on a settled contract.

**Do:**
- Add `apps/guide-worker/` (or `guide/` — match repo's worker layout convention; check `wrangler` usage and existing worker dirs first) with wrangler config, generated binding types, Turnstile binding stubbed.
- Add `src/guide-corpus/` (or the plan's chosen path) with the typed manifest schema + Zod/valibot validation per the existing plan: source IDs, approval metadata, corpus class (`public` | `curated-private`), revocation field, content hash.
- Convert current public evidence (`src/data/projects.ts`, `src/data/resume.ts`, `public/llms.txt`) into manifest entries via a build-time script — no private-repo access.
- Reject: missing approval metadata, forbidden fields, duplicate source IDs, revoked packages.
- No chat endpoint, no Vectorize, no model calls in this phase.

**Deferred (not this phase):** the guide plan's U3–U7 (retrieval, sessions, routing, UI, eval). Umami `guide-*` events land with the UI phase.

**Files:** new `guide-worker/` or `apps/` directory, `src/guide-corpus/`, `package.json` script for corpus build.

**Tests:** Vitest on schema validation — valid public entry passes; missing approval, duplicate ID, revoked package, forbidden field each fail closed.

**Done:** `pnpm`/`npm` workspace builds the worker stub (`wrangler dev` or `deploy --dry-run` clean); corpus manifest validates against real project data; zero private-source reads in the ingestion path (verified by test scanning manifest entries for `private: true` sources without `approvedPackage`).

## U4. Hosted demos — kurultai demo instance skeleton (issue #43)

**Frame.** Issue #43 wants a public-safe kurultai corpus on spare infra behind Cloudflare Access at a demo subdomain. Depends on the embedded `/demos` slice (shipped in #44) and the `kurultai connect` device flow in the kurultai repo. Phase 1 is infrastructure-skeleton only — do NOT wire production data.

**Do:**
- In the **kurultai repo** (not portfolio-hub): define a `demo-store` profile — separate DB path, seeded corpus loader reading only `docs/` + a hand-curated fixture set (mirror the replay fixtures already in portfolio-hub's demo bay).
- Docker/compose or systemd unit for a `kurultai serve --demo` mode bound to localhost, intended to sit behind a Cloudflare Tunnel + Access policy.
- Cloudflare: create Access application + service token (store in omaseal as `cloudflare/demo-access`), tunnel route for `demo.kurultai.<tld>` or a portfolio subdomain — pick the hostname with the user before creating public DNS.
- portfolio-hub side: add `demoUrl` field pointing at the (initially gated) instance on the kurultai dossier, marked "access-gated" in the demo card UI rather than pretending it's public.

**Deferred:** real corpus seeding beyond fixtures, unauthenticated public tier, auto-provisioning.

**Files:** kurultai repo `demo/` or `cmd/serve` flag; `docker-compose.demo.yml` or systemd unit; portfolio-hub `src/data/projects.ts` (`demoUrl` + gated label).

**Tests:** kurultai demo mode boots with fixture corpus and serves `/healthz`; portfolio-hub renders the gated-demo affordance. Cloudflare Access policy creation is manual/operator-verified (no API token for the zone is currently stored — see 2026-09-26 audit).

## Sequencing

U1 → U2 (both small, independent). U3 and U4 are larger and touch different repos; they can run in parallel after U1/U2 land, but each is a separate PR/branch.

## Risks

- U1: DOM-measure timing before first paint — fallback margin must not regress SSR plate.
- U2: stale-branch conflicts in `projects.ts`/`sitemap.ts` after #44/#49 merges.
- U3: workspace layout (single-package repo today) — adding a worker dir may need a package boundary decision first.
- U4: no Cloudflare API token covers the zone (verified 2026-09-26) — Access/tunnel setup needs the dashboard or a new scoped token; also `kurultai connect` device flow is unfinished upstream.
