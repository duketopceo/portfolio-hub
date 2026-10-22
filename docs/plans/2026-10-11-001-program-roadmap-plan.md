---
title: portfolio-hub program roadmap
date: 2026-10-11
status: active
origin: repo-program wave 4 (written directly, not via ce-plan; repo is small and heavily planned already)
---

# Program roadmap

Evidence base: README/code audit 2026-10-11, `BRAND.md`, `docs/plans/`. Open PR #65
(Cursor catalog update) touches `projects*.ts`, `globals.css`, FilterBar, ProjectCard;
units below avoid those files until #65 merges.

## Now

### U1. Regenerate favicons and OG image from the reticle logo
- Status: proposed. Evidence: `public/brand/favicon-*.png` still carry the older mark; header already uses the reticle.
- Difficulty: easy. Pure asset regeneration with resvg from `assets/brand/logo.svg`.
- Feasibility: needs owner logo sign-off; no technical blocker.
- Simpler alternative: ship only `favicon.svg` (Next supports it via `icon`) and delete the 16/32/ico set except `.ico` fallback.
- Verification: visual check of tab icon; `npm run build`.

### U2. Remove dead `/podcast` code
- Status: proposed. Evidence: no `src/app/podcast`; guards remain in `Header.tsx:30`, `SiteChrome.tsx:17,23`, `WelcomeIntro.tsx:55`; `docs/PODCAST-DEPLOY.md` describes a retired path (show moved to Cloudflare Pages, `projects.ts` ~L372).
- Difficulty: easy. Four one-line guards plus one doc.
- Feasibility: confirm `/podcast/*` is redirected at the edge, not served by this app.
- Simpler alternative: this is itself the deletion.
- Verification: `npm run lint`, visual tests.

### U3. Validate the catalog
- Status: proposed. Evidence: README says "28 repos"; `projects.ts` has 29 slugs; counts drift by hand.
- Difficulty: medium. Add a vitest that checks unique slugs, required dossier fields, featured slugs exist.
- Feasibility: depends on PR #65 changing `types.ts`; do after it merges.
- Simpler alternative: derive the README count instead of documenting it; drop the number from README (done in this PR).
- Verification: `npm run test`.

## Next

### U4. Orphan APIs
- Status: proposed. Evidence: README notes `/api/activity` and repo summary have no in-app consumer; kept for `public/llms.txt`.
- Difficulty: easy. Feasibility: product decision, external agents may call them.
- Simpler alternative: keep routes, drop only `/api/github/repo/[repoName]/summary` and its `github-summary-status*` helpers if unused externally.
- Verification: check access logs; tests.

### U5. Split `globals.css`
- Status: proposed. Evidence: 7,291 lines vs `design-system/` 396 lines; BRAND names it "legacy orchestration".
- Difficulty: hard. Selector order and specificity are load-bearing; visual baselines are the only safety net.
- Feasibility: needs `tests/visual` green on hosted CI; conflicts with #65 (+35 lines in globals.css).
- Simpler alternative: no split; instead delete rules for removed components (QuadrantGraph etc.) using a coverage tool, then stop.
- Verification: `npm run test:visual`, `npm run check:design`.

### U7. Retire legacy Swarm deploy
- Status: proposed. Evidence: README says Railway is primary; `.github/workflows/deploy.yml` still builds to ghcr and deploys over SSH to Swarm; `docs/CLUSTER.md` is "reference only".
- Difficulty: easy. Feasibility: confirm no Swarm consumer still depends on the ghcr image.
- Simpler alternative: leave the build job, delete the SSH deploy step only.
- Verification: workflow run on a branch.

## Later

### U6. Writing / changelog feed
- Status: idea. Evidence: landscape doc shows writing-first peers.
- Difficulty: medium (MDX or markdown route + RSS). Feasibility: content effort, not code.
- Simpler alternative: link the existing `/now` transmissions and CHANGELOG.md; add RSS for `/now` only.
- Verification: build, RSS validates.
