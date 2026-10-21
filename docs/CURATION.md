# Curation bar

Source of truth for what may be listed on the portfolio. The numbers live in `CURATION_BAR` in `src/lib/curation.ts`; this page describes them. If they ever disagree, the code wins and this page is the bug.

## The bar (R1)

A repo is `listable` when all of these hold:

- It is an original (not a fork) and not archived.
- Its README is at least 400 characters.
- It has at least 4 commits on the default branch.
- At least one of: a commit in the last 90 days, a live URL (the repo homepage), or a release.

`scoreRepo(github, catalog, now)` is a pure function over the catalog `github` fields. It returns a verdict (`listable`, `component-candidate` or `below-bar`) and the reasons, listing every failing criterion. It keeps no state between runs, and `now` is passed in. Commit recency is judged from `lastCommitMonth`: a month counts if its last day falls in the 90-day window.

## Target size (R2)

The headline catalog targets 30 to 40 listed projects. `summarizeCatalog` counts the listable results and returns a warning when the count is outside that range. The warning goes into the sync proposal. It never cuts or adds anything, and the thresholds are never changed to hit a count.

## Mirrors and components

A repo that mirrors a listed entry is `component-candidate`, never a listing. It is a mirror when either:

- the catalog names it as a component (`parentSlug` pointing at an entry that exists), or
- its name matches a configured mirror pattern: `/^omarchy-(?!plugins$)/` or `/^a0-plugin-/`.

The listed parent (for example `omarchy-plugins`) stays `listable`. Patterns are in `CURATION_BAR.mirrorPatterns`.

## Approval (R3)

Every change needs Luke's approval: a repo joining, leaving, or changing tier or parent. The sync only proposes (new candidates above the bar, demotions with reasons, range warnings). Nothing is listed or removed until Luke approves it in the pull request and edits the entry's `curated` fields.

Adding an entry by hand follows `docs/PROJECT-CATALOG-SOP.md`.
