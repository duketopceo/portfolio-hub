# Residual Review Findings

Source: `ce-code-review` run `/tmp/compound-engineering-502/ce-code-review/20260816-030520-3308992a`
Branch: `feat/recruiter-facing-polish`
Plan: `docs/plans/2026-08-16-001-feat-recruiter-facing-polish-plan.md`

## Applied in this PR

- P1 Catalog-public GitHub-private CTA 404s — suppress `githubUrl` when `repo?.private === true`
- P1 Offline Stratum preview still opens 525 — `ProjectPreview` gates Open href on `isProjectLive`
- P2 AGENTS.md stale after Vitest added
- P2 `isCatalogPrivateRepo` gate has no tests
- P2 `curatedSummaryFallback` private sentinel unverified

## Filed

- P1 `src/lib/github-repo-api.ts:211` fetchRepoSummaryPayload error contract untested — https://github.com/duketopceo/portfolio-hub/issues/20
- P2 `src/components/RepoDetailModal.tsx:83` RepoDetailModal is now orphaned dead code — https://github.com/duketopceo/portfolio-hub/issues/19
- P2 `src/app/api/github/repo/[repoName]/summary/route.ts:19` githubOutcomeFromFetch branch mapping untested — https://github.com/duketopceo/portfolio-hub/issues/21

## no_sink (not applied; contradicts plan / session-settled KTDs)

- P2 `src/app/contact/page.tsx:11` Hire email duplicated across hire pages — extract `HIRE_EMAIL` is optional; KTD6 keeps three routes and does not merge pages
- P2 `src/app/projects/[slug]/page.tsx:326` Dossier renders duplicate GitHub CTAs — plan asked for an aside CTA when the dossier lacked one; keep both
- P2 `src/lib/github-summary-status.ts:52` Summary 200 lacks response shape discriminator — plan specified the existing fallback shape
- P2 `src/lib/github-summary-status.ts:88` Fallback zeros mimic real zero GitHub metrics — plan specified the existing fallback shape
- P2 `src/lib/github-summary-status.ts:43` GitHub 429 silently maps to 200 fallback — advisory; expected-miss degrade, not 502
- P3 `src/app/about/page.tsx:11` Recruiter pages copy identical shell markup — advisory; KTD6 keeps three routes

## failed

None.

## settled_conflict

None. Adversarial GitHub-private CTA suppression is additive to KTD3 (catalog-private still never emits a URL).
