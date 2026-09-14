---
title: Reconcile Lint, Docs, and Repo Hygiene - Plan
type: refactor
date: 2026-09-13
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-plan-bootstrap
execution: code
---

# Reconcile Lint, Docs, and Repo Hygiene - Plan

## Goal Capsule

- **Objective:** A contributor — human or agent — can trust this repo's own quality signals and contributor-facing documentation. `npm run lint` reports nothing to triage, and the docs that guide work describe the tree as it actually is.
- **Authority:** The repository is the source of truth. Where a doc and the tree disagree, the tree wins and the doc is corrected. Existing product decisions and open owner decisions are not re-opened.
- **Stop conditions:** Any change that would require deciding the fate of the orphaned API routes, reversing a shipped design decision, or rewriting git history. Those are owner decisions and stay deferred.
- **Execution profile:** Standard depth. Configuration and documentation changes with one small code-cleanup unit. No new dependencies, no behavioral change to any page.
- **Finisher:** `ce-work` implements, verifies, and ships the units in dependency order.

## Product Contract

### Summary

Bring the repo's quality signals back in line with the code. Narrow lint scope to project source so a vendored bundle stops generating warnings, clear the remaining real warnings by removing dead symbols, and reconcile the contributor-facing documents that have drifted: the UI audit roadmap, the `AGENTS.md` caveats, the README's API inventory, and a source comment pointing at a script that does not exist.

### Problem Frame

The repo's signals have drifted from its contents, which costs every future reader time.

`npm run lint` exits 0 but reports 41 warnings as of planning. Twenty-eight come from `public/podcast/app.js`, a minified bundle that no page references — no one should be reading or fixing that file as project source. The other thirteen are real and small: six in the two hand-authored podcast scripts that live pages actually load, unused type imports, an unused parameter and a vestigial binding, and one `eslint-disable` directive whose rule no longer fires. `AGENTS.md` tells contributors lint "exits 0 with warnings only (41 as of 2026-09-12)", so the count is currently an accepted baseline rather than a defect — the baseline itself is the problem.

The distinction that matters is between an unreadable minified artifact and an authored script that happens to live under `public/`. Two of the three podcast scripts are loaded by real pages and are written to be read; ignoring the whole directory would silence their warnings along with the bundle's.

The documents that guide contributors are worse than noisy; several actively mislead. `docs/AUDIT-UI-ROADMAP.md` presents a 206-line worklist of error pages, lint fixes, SEO files, and shared-module extractions — nearly all of which are already implemented — and one item names `QuadrantGraph.tsx`, a component deleted during the merge cleanup. `AGENTS.md` warns about a `metadataBase` build warning that no longer occurs because `src/app/layout.tsx` now sets it. A comment in `src/data/resume.ts` tells readers that `scripts/gen-resume-static.mjs` writes the static résumé files; that script does not exist in the repo, and the routes actually read `src/data/resume.ts` directly. The README documents three of the seven API routes.

None of this is caught by a gate, because there is no gate for "does the documentation still describe the code". This plan adds no such gate; it corrects the current drift and narrows the lint scope so the one gate that does exist reports something meaningful.

### Requirements

**Quality gate**

- R1. `npm run lint` reports zero warnings and zero errors.
- R2. The minified, page-unreferenced bundle under `public/` is not linted as project source; authored scripts that live pages load remain in lint scope.
- R3. Unused-symbol warnings in authored source are resolved by removing or genuinely using the symbol, not by widening the rule — except a `_`-prefixed intentionally-unused parameter, which the configuration permits by convention.

**Documentation accuracy**

- R4. Every item in `docs/AUDIT-UI-ROADMAP.md` states whether it is done or still open against the current tree, and no item references a file that does not exist.
- R5. The `AGENTS.md` "Known caveats" section describes only conditions that still hold.
- R6. Source comments reference only files and scripts that exist in the repository.
- R7. The README's API inventory matches the routes that exist.

**No regression**

- R8. Lint, typecheck, the test suite, and the production build stay green, and the pages and endpoints this work touches still serve.

### Key Decisions

- **Public contact surfaces publish only the alias and no phone number.** *(session-settled: user-directed — chosen over restoring the personal mailbox and mobile number: a phone number cannot be rotated once it reaches a scraped corpus, and this repo's `robots.txt` invites AI crawlers.)* Governs R5, R6, R7 — the documentation units must not reintroduce either value.
- **The Star Chart design is the shipped direction.** *(session-settled: user-approved — chosen over reverting to the pre-redesign layout: the redesign is this branch's purpose and its scenes are browser-verified.)* Governs R4, R8 — the audit roadmap is reconciled against the current design, not treated as a reason to revisit it.

### Scope Boundaries

**In scope:** the ESLint configuration, the six real source warnings, `docs/AUDIT-UI-ROADMAP.md`, `AGENTS.md`, `README.md`, and the stale comment in `src/data/resume.ts`.

**Deferred to Follow-Up Work:**

- Deleting `/api/activity`, `/api/activity/[slug]`, and `/api/github/repo/[repoName]/summary` and removing their `public/llms.txt` and README adverts. They lost their UI consumers in the merge cleanup, but removing publicly advertised endpoints is a product call. R7 documents them as they are; it does not decide their fate.
- The arrow-key focus-management question on the FIG.01 orbit (cycling updates the focus index without moving DOM focus). A design call, already recorded as an open review finding.
- Rotating the credential removed from `.mcp.json` and optionally scrubbing it from git history. An owner action; the tree is already clean.
- The remaining Next.js / PostCSS / Sharp advisories, which need a forced bump past the declared dependency range.

**Outside this product's identity:** rewriting historical planning documents under `docs/plans/` and `COSMIC-REBRAND-PLAN.md`. They are dated records of decisions, not living documentation, and are left as written.

### Assumptions

- "Readable" covers both code readability and contributor-facing documentation. Both are treated as in scope; no other reading of the request is planned against.
- Warnings that exist only inside vendored assets are a scope-configuration gap, not a project defect to fix in place.
- The audit roadmap still has value as a document: it is reconciled rather than deleted.

## Planning Contract

### Key Technical Decisions

- KTD1. **The ignore names the minified bundle, not the directory.** Only `public/podcast/app.js` joins the existing `globalIgnores` list in `eslint.config.mjs`, and the unused-symbol rule is configured to honor the `^_` prefix convention. *(chosen over ignoring `public/**`: two other scripts in that directory are hand-authored and loaded by live pages, so a directory-wide ignore would silence six real warnings along with the bundle's twenty-eight.)*
- KTD2. **The audit roadmap is reconciled in place, per item.** Each numbered item gains a current status, and stale references are corrected against the tree. *(chosen over deleting the document or rewriting it: it still carries open items, deleting a user document is destructive, and a rewrite would discard the original analysis.)*
- KTD3. **The README documents the API route inventory as it exists.** Every route under `src/app/api` plus the bakeoff endpoint is listed, including the two that currently have no in-app consumer. The two résumé-format routes are out of that inventory's scope. *(chosen over removing the orphaned routes from the README: that would half-decide the deferred product call without the owner, and a README that omits live endpoints is inaccurate in the other direction.)*
- KTD4. **The dead symbols are removed, not suppressed.** Where a symbol is genuinely unused, it is deleted; the `_` convention is reserved for parameters that are structurally required. *(chosen over blanket-disabling the rule or prefixing every unused symbol with `_`: the point is to make the lint signal meaningful, and a renamed-but-dead symbol still lies about intent.)*

### High-Level Technical Design

No section. The work is a configuration edit, four small symbol removals, and three documentation reconciliations. There is no component topology, protocol sequence, state machine, or branching gate for a diagram to carry.

## Implementation Units

### U1. Narrow the lint scope to the minified bundle

- **Goal:** The unreferenced minified bundle stops being linted, the unused-symbol rule honors the `_` convention, and every authored script stays in scope.
- **Requirements:** R1, R2, R3
- **Dependencies:** none
- **Files:** `eslint.config.mjs`
- **Approach:**
  - Add `public/podcast/app.js` — that one file, not the directory — to the `globalIgnores` list that already exists in the flat config.
  - Add a rules block configuring `@typescript-eslint/no-unused-vars` with an args pattern and a vars pattern that permit a leading underscore. The rule stays enabled; only the ignore patterns are set.
  - Confirm the override extends rather than replaces the rule set `eslint-config-next/typescript` already supplies for the same rule. Compare the effective configuration for one source file and one podcast script before and after the change.
- **Patterns to follow:** the existing `defineConfig` + `globalIgnores` shape already in `eslint.config.mjs`.
- **Test expectation:** none — pure configuration. The change is proven by the warning count and by no new warning appearing in authored source.
- **Verification:** the reported warning count drops by the bundle's contribution; `public/podcast/mission-app.js` and `public/podcast/shell/pod.js` still report their own warnings, proving the ignore did not swallow the directory.

### U2. Remove the dead symbols the narrowed rule still reports

- **Goal:** The remaining warnings in authored source are resolved by removing or genuinely using each flagged symbol.
- **Requirements:** R3
- **Dependencies:** U1 (the narrowed scope is what leaves exactly these)
- **Files:** `src/lib/planet-visual.ts`, `src/lib/github-activity.ts`, `src/data/deployments.ts`, `src/components/WelcomeIntro.tsx`, `public/podcast/mission-app.js`, `public/podcast/shell/pod.js`
- **Approach:**
  1. `src/lib/planet-visual.ts` — remove the two unused type imports.
  2. `src/lib/github-activity.ts` — drop the unused `slug` parameter from `publicUrl` and remove the now-extra third argument at every call site, not just the signature.
  3. `src/lib/github-activity.ts` — in the closed-PR branch, keep the `bumpDay(dayMap, dk)` call and drop only the unused binding. The call's side effect creates the day's entry in the series; no `prsClosed` counter exists on the day bucket, so nothing is being under-counted and no counter should be invented.
  4. `src/data/deployments.ts` — remove the unused type import.
  5. `src/components/WelcomeIntro.tsx` — delete the `eslint-disable` directive. Lint already reports it as an unused directive, and U1 does not alter the react-hooks rules.
  6. `public/podcast/mission-app.js` and `public/podcast/shell/pod.js` — resolve the six unused-symbol warnings in these authored, page-loaded scripts, using the `_` convention where a parameter is structurally required.
  7. `src/app/openrouter/api/bakeoff/route.ts` — leave the `_req` parameter; U1's `^_` pattern covers it.
- **Execution note:** Remove one symbol at a time and let the typechecker confirm each removal is safe, rather than batching edits and reading a combined error list.
- **Patterns to follow:** the repo's existing import style; the route handler signature convention already used by the other API routes.
- **Test scenarios:**
  - Happy path: after the removals, `npm run lint` reports zero warnings across the repository.
  - Edge case: `src/lib/github-activity.test.ts` passes unchanged, proving the `publicUrl` signature change and the closed-PR branch edit did not alter the emitted activity payload or the day series.
  - Error path: `npx tsc --noEmit` is clean, catching any call site the signature change missed.
- **Verification:** lint reports zero warnings; typecheck clean; the activity test suite passes with no assertion changes.

### U3. Reconcile the UI audit roadmap against the current tree

- **Goal:** A reader of `docs/AUDIT-UI-ROADMAP.md` can tell, per item, what is already done and what remains open.
- **Requirements:** R4
- **Dependencies:** none
- **Files:** `docs/AUDIT-UI-ROADMAP.md`
- **Approach:**
  - Apply this rubric to each item, so two readers reach the same status: an item is **done** when the artifact it names exists and the behavior it describes is observable in the tree; it is **open** when either is missing. An item satisfied by a different mechanism than the one proposed counts as done, with the actual mechanism named.
  - Walk each numbered item, apply the rubric, and record the resulting status on the item.
  - Correct the `QuadrantGraph.tsx` reference in the shared-module item — that component was deleted in the merge cleanup, and the shared color map now lives in `src/lib/utils.ts`.
  - Name the actual mechanism where it differs from the proposal — the sitemap is served from `src/app/sitemap.ts` rather than a static `public/sitemap.xml`, and the error and loading pages exist as route-level files.
  - Keep the original analysis and any item the rubric marks open; this is a status reconciliation, not a rewrite.
- **Test expectation:** none — documentation only. Verified by applying the rubric to each item.
- **Verification:** every item carries a status; no item names a path that does not exist; every item the rubric marks done has an existing artifact and observable behavior behind it; no open item was dropped.

### U4. Correct the stale contributor-facing claims

- **Goal:** `AGENTS.md`, the README, and the source comment describe the repository as it is.
- **Requirements:** R5, R6, R7
- **Dependencies:** none
- **Files:** `AGENTS.md`, `README.md`, `src/data/resume.ts`
- **Approach:**
  - `AGENTS.md` — remove or update the `metadataBase` build-warning caveat, since `src/app/layout.tsx` sets `metadataBase` and the warning no longer occurs. Re-check the lint caveat's stated count and wording against the post-U1 state so it does not become stale again on landing.
  - `src/data/resume.ts` — rewrite the header comment so every path it names exists. It currently points at two scripts that are not in the repository: `scripts/gen-resume-static.mjs` and `build_resume.js`. The real consumers are the `/resume.json` and `/resume.md` route handlers, which read this module directly; `public/resume.pdf` is a separately produced static artifact with no generator in the repo.
  - `README.md` — extend the API list to the full route inventory, describing the two endpoints that currently have no in-app consumer without removing them (KTD3). Keep the existing entries' style.
  - Do not reintroduce the personal mailbox or phone number anywhere (see Key Decisions).
- **Test expectation:** none — documentation and comments. Verified by grepping each claimed path and checking that it exists.
- **Verification:** no comment or doc line references a missing file — check `src/data/resume.ts` specifically for both phantom script names; the README API list matches the routes present under `src/app/api` plus the bakeoff endpoint; the contact surfaces still show only the alias.

### U5. Verify the gates and the touched surfaces

- **Goal:** The quality gates are green at the new baseline and nothing this work touched regressed.
- **Requirements:** R8
- **Dependencies:** U1, U2, U3, U4
- **Files:** none — verification only
- **Approach:** Run the repository's gates, then confirm the pages and endpoints whose docs or data were touched still behave. Treat the lint warning count as the primary signal for U1 and U2.
- **Test scenarios:**
  - `npm run lint` → zero errors, zero warnings.
  - `npx tsc --noEmit` → clean.
  - `npm run test` → the full suite passes with no assertion changes.
  - `npm run build` → green, with the project pages still prerendering.
  - `/resume` → returns 200 with no horizontal overflow at 390, 768, 1024, and 1440px.
  - `/contact` and `/hire` → each still serves only the alias and no phone number, checked as a content assertion rather than a viewport sweep, since no unit changes those pages.
  - `/openrouter/api/bakeoff` → returns 200 from the standalone production server. This route reads `src/data/bakeoff.json` through `process.cwd()`, which was previously flagged as a possible production failure; the file is traced into the standalone output and the endpoint is confirmed serving, so the concern is closed rather than carried.
- **Verification:** all gates green and every listed surface returns 200.

## Verification Contract

| Gate | Command | Applies to | Done signal |
|---|---|---|---|
| Lint | `npm run lint` | U1, U2, U5 | exits 0 with zero errors and zero warnings |
| Typecheck | `npx tsc --noEmit` | U2, U5 | clean |
| Tests | `npm run test` | U2, U5 | full suite passes, no assertion edits |
| Build | `npm run build` | U5 | green, pages still prerender |
| Browser smoke | route × viewport check on `/resume`; content assertion on `/contact` and `/hire` | U5 | 200 at 390/768/1024/1440 with no horizontal scroll on `/resume`; alias-only contact surfaces |
| Endpoint smoke | `GET /openrouter/api/bakeoff` on the standalone server | U5 | 200 with the snapshot body |

## Definition of Done

- `npm run lint` reports zero warnings and zero errors, and no warning originates from `public/`.
- Typecheck, tests, and build are green.
- Every item in `docs/AUDIT-UI-ROADMAP.md` carries a status that matches the tree, and no item references a deleted file.
- `AGENTS.md` caveats, the README API list, and the `src/data/resume.ts` comment each describe something that exists.
- No page or endpoint touched by this work regressed, and the contact surfaces still publish only the alias.
- No abandoned-attempt or dead-end code is left in the diff; the only deletions are the dead symbols this plan names.
