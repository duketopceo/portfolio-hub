# feat: Portfolio Hub update — close the repo gap and set up what's missing

**Created:** 2026-10-12
**Target repo:** portfolio-hub
**Depth:** Deep

---

## Summary

The portfolio catalog carries 51 entries. The account has 138 repos, 98 of them public. The gap is 102 repos, of which roughly 60 are public and presentable. This plan closes that gap deliberately — with curation criteria rather than a bulk import — and defines what "fully set up" means for each entry that makes it.

It also resolves a duplicate: `tallyline` and `docketry` are the same repository under two names.

## Problem Frame

A portfolio's job is to make a reviewer's next click land somewhere good. Right now the catalog is both **under-inclusive** (open-computer, tallyline, agentflow, jev-compact, six `a0-plugin-*` repos, seven Omarchy plugins, WordInk, wisp and others are absent) and at risk of becoming **over-inclusive** if every repo is added blindly. 98 public repos at a median of 0 stars is not 98 signals — 91 have zero stars.

Two failure modes to avoid:

1. **The empty-click.** A reviewer clicks through and finds an empty repo, a bare README, or a scaffold. That discounts everything adjacent to it.
2. **The undifferentiated list.** 138 entries with no hierarchy reads as volume, not depth. Curation is the product.

## Requirements

- R1 — Every catalog entry resolves to a repo that has a README, a description, and at least one committed artifact worth seeing.
- R2 — No duplicate entries for one project (tallyline/docketry).
- R3 — Entries carry a tier so the catalog communicates hierarchy rather than presenting 100+ equals.
- R4 — Every newly added entry has a working link (live URL, demo, or repo) that a reviewer can reach without an account.
- R5 — No entry claims a metric that cannot be verified from the repo.
- R6 — The build stays green and the page count stays bounded (the catalog currently prerenders 51 project pages; adding ~40 more is a real build-time cost).

## Key Technical Decisions

**KTD1 — Curate to tiers rather than import wholesale.** Adding all 60 public repos flattens the signal. The catalog gets a `tier` field (`flagship` / `shipped` / `experiment`) and only flagship + shipped render in the featured orbit. *Rationale:* the existing HUD redesign already splits hero / featured / full catalog — this extends that split with an explicit ranking rather than inventing new UI.

**KTD2 — "Fully set up" is a checklist, not a vibe.** A repo qualifies for the catalog when it has: description, ≥1 topic, README with a what/why/run section, and a reachable link. Tracked per-repo so the work is mechanical and finishable.

**KTD3 — Dedupe by rename, not by deletion.** tallyline and docketry resolve to the same repo. Keep `tallyline` (the name Luke uses), remove the `docketry` entry, and confirm the old name redirects.

**KTD4 — Do not fabricate screenshots.** Entries without a live URL get a repo card, not a generated image. (Aligns with the repo rule: no fake claims, no fabricated stats.)

## Implementation Units

### U1. Repo↔catalog gap audit as a committed script

**Goal:** Make the gap reproducible instead of a one-off report, so it can be re-run after each build session.
**Requirements:** R1, R2
**Files:** `scripts/audit-catalog-gap.mjs` (create), `docs/CATALOG-AUDIT.md` (create)
**Approach:** Read catalog slugs from `src/data/projects.ts` + `src/data/projects-ext.ts`, read repos via `gh repo list`, normalize `_`↔`-`, and emit three buckets: covered, missing, and missing-but-empty. Empty detection = no README or ≤3 files.
**Patterns to follow:** `scripts/notion/seed-episodes.mjs` for script shape.
**Test scenarios:**
- Normalization: a repo `kurultai_people` matches slug `kurultai-people`.
- A repo with no README lands in missing-but-empty, not missing.
- Exit code is 0 with findings present (it is a report, not a gate).
**Verification:** Running it reproduces the 51/138/36 numbers.

### U2. Resolve the tallyline/docketry duplicate

**Goal:** One entry per project.
**Requirements:** R2
**Dependencies:** U1
**Files:** `src/data/projects-ext.ts` (modify)
**Approach:** Confirm both names resolve to one repo (identical `createdAt`), keep `tallyline`, drop `docketry`. If the entry was `docketry` in `projects.ts`, move the content rather than deleting it.
**Test scenarios:**
- Exactly one catalog entry matches the project.
- The retained slug builds a page at `/projects/tallyline`.
**Verification:** `grep -c` on both names returns 1 and 0 respectively.

### U3. Add the `tier` field and rank the existing 51

**Goal:** Hierarchy before addition — rank what exists before adding more.
**Requirements:** R3
**Dependencies:** U1
**Files:** `src/data/projects.ts`, `src/data/projects-ext.ts`, `src/data/projects-ext.ts` type, `src/app/projects/[slug]/page.tsx`, `src/app/projects/page.tsx`
**Approach:** Add an optional `tier` to the project type, default `experiment`. Assign `flagship` to the seven starred repos plus the strongest unstarred ones (Khan, Pace-Server, docketry/tallyline, orchestral, luke-agents). The featured orbit renders flagship + shipped only; the full catalog lists everything with a tier badge.
**Test scenarios:**
- An entry with no `tier` renders as `experiment` and does not appear in the featured set.
- The featured orbit count is stable and under its cap.
- `npm run build` prerenders the same number of pages as before (no accidental drops).
**Verification:** Catalog page shows tier badges; orbit shows only flagship+shipped.

### U4. Add the missing public repos that pass the checklist

**Goal:** Add the repos that clear KTD2's bar, in tier order.
**Requirements:** R1, R4
**Dependencies:** U3
**Files:** `src/data/projects-ext.ts` (modify), `public/projects/*` (add assets where a live URL exists)
**Approach:** Priority order: open-computer, tallyline, agentflow, jev-compact, open-military-hardware-db (4★ — highest traction), the six `a0-plugin-*`, the Omarchy plugin family, wisp/omarchy-wisp, WordInk, snapdex, keytypist, openrouter-demos, pace-gallery, compound-engineering-plugin, ai-usagebar, fivebyfive, harbor client, pinetree-solari-demo.
**Test scenarios:**
- Every added entry's `href` returns 200 (or is a repo URL that resolves).
- No added entry duplicates an existing project under a different slug.
**Verification:** The audit script's "missing" bucket shrinks by the number added.

### U5. Full-setup pass on the entries that made it

**Goal:** No empty clicks — every new entry has description, topics, and a real README.
**Requirements:** R1, R5
**Dependencies:** U4
**Files:** per-repo READMEs (outside this repo), plus a tracked checklist at `docs/CATALOG-SETUP-CHECKLIST.md`
**Approach:** For each added repo: set description, add ≥3 topics, ensure README has what/why/run. Where a live URL exists, verify it loads. Track completion in the checklist so it is resumable.
**Test scenarios:**
- Test expectation: none — this is metadata and prose in other repos, not behavioral change here.
**Verification:** Checklist fully ticked; the audit script reports zero missing-but-empty entries in the catalog.

### U6. Refresh the resume and deploy

**Goal:** Close the known defect where the live resume is stale.
**Requirements:** R5
**Dependencies:** none
**Files:** `public/resume.pdf`, `src/data/resume.ts`
**Approach:** Replay the corrected resume onto current `main` (the working copy is ~59 commits behind), run build + tests, deploy, then verify the live PDF hash changes.
**Test scenarios:**
- `npm run build` passes and the 43 existing tests stay green.
- The live `/resume.pdf` byte size matches the local file after deploy.
**Verification:** Fetching the live PDF and comparing hashes shows the new file.

## Scope Boundaries

**In scope:** catalog data, the tier field, the audit script, per-repo metadata for repos being added, the resume fix.

**Out of scope:** redesigning the HUD (already shipped), changing the orbit animation, adding a CMS, any repo's source code.

### Deferred to Follow-Up Work
- Screenshot/GIF generation for entries without live URLs.
- A scheduled re-run of the audit script in CI.

## Risks & Dependencies

| Risk | Mitigation |
|---|---|
| Adding ~40 entries inflates build time | U3 bounds what renders; measure build time after U4 |
| Tier assignment is subjective and stalls | Rank from the audit script's output; decide once, move on |
| Many added repos are thin (2 source files) | KTD2's checklist keeps them out until they clear it |
| Resume fix touches `main` | Replay onto a fresh branch, verify build, then merge |

## Sources & Research

Gap numbers produced by a committed audit script (U1), not by hand: 51 catalog entries, 138 repos, 36 covered, 102 missing, 98 public, 91 at zero stars. Duplicate confirmed by identical `createdAt`/`description`/`diskUsage`/`pushedAt` on both names.
