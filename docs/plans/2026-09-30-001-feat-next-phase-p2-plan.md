# Next phase — Phase 2 plan

**Date:** 2026-09-30 · **Status:** executing · **Prior:** `docs/plans/2026-09-28-001-feat-next-phase-p1-plan.md` (all 4 units shipped as PRs)

## Context

Phase 1 closed with seven green, mergeable portfolio-hub PRs (#45, #51–#53, #55–#57) plus kurultai #379. Phase 2 turns the phase-1 skeletons into working infrastructure: the guide corpus becomes queryable, the demo tunnel gets wired, and the visual suite stops crying wolf.

## U1. Merge sweep (portfolio-hub)

**Do:** Merge the green queue in dependency order — #52 (NanoClaw removal; #53's base) → #53 (demos) → #51 (margin fix) → #55 (Kurultai-is-brain doc) → #45 (Dayflow) → #56 (guide scaffold) → #57 (gated affordance). Re-run gates on main after. Admin-merge where review gate blocks (same as #48 precedent).
**Tests:** post-merge `npm run lint && npm run test && npm run build` on main; home + /demos render check.

## U2. Portfolio Guide phase 2 — queryable corpus (portfolio-hub)

**Frame.** Phase 1 shipped the manifest contract + Worker scaffold. This unit makes the corpus actually retrievable without touching chat/UI: deterministic retrieval only, no model calls on the request path.

**Do:**
- `scripts/guide-ingest.mjs` (repo script): builds manifest via `buildCorpusManifest()`, validates, chunks, embeds with Workers AI (`@cf/baai/bge-base-en-v1.5`, free), upserts to Vectorize `portfolio-guide-corpus` with metadata `{sourceId, scope, class, url, title, embedVersion}`. Deletes stale vectors for revoked/expired sourceIds (delete-by-sourceId sweep before re-upsert).
- Worker: `POST /search` — embed query → `CORPUS.query(topK, filter embedVersion)` → return chunks with `{title, url, scope, score}` citations. Plus keyword fallback path (substrate for the deterministic fallback required by the plan) — FTS over a small KV-cached manifest or direct Vectorize metadata-only filter is acceptable for phase 2.
- `wrangler vectorize create portfolio-guide-corpus --dimensions=768 --metric=cosine` (needs token — now unblocked via `Cloudflare_duketopceo/Personal`).
- Health route unchanged; still no chat endpoint, no DO session logic, no Turnstile (later phases).

**Deferred:** chat session DO, model answers, GuardEval, UI, Turnstile, OpenRouter escalation.

**Tests:** vitest for chunk/filter edge cases already exist; add ingest dry-run test (manifest → vector records, no network). `wrangler dev` + curl `/search` against real index if token scope permits local embed (remote dev).

## U3. Visual-suite environmental fixes (portfolio-hub)

**Frame.** `npm run test:visual` fails on noise, not regressions: Umami CORS from `127.0.0.1:3100` and GitHub API rate-limit drift.

**Do:**
- Stub analytics in test env: Playwright `page.route("**/api/send", fulfill 204)` or build-time `NEXT_PUBLIC_UMAMI_*` unset during test builds — pick whichever keeps production untouched.
- GitHub enrichment: cache/fixture responses in visual tests so screenshots don't drift on rate-limit (`/api/repos` → fixture when `VISUAL_TEST=1` or route interception).
- Re-run suite; goal is honest green, not skipped tests.

**Tests:** the visual suite itself.

## U4. Demo instance go-live (operator-dependent)

**Remaining, blocked on host pick:** run `kurultai daemon --demo` (or `docker-compose.demo.yml`) on chosen host → add tunnel ingress `kurultai-demo.luke-the-duke.com` → `localhost:8429` → set `KURULTAI_CF_ACCESS_TEAM=duketopceo.cloudflareaccess.com` + `KURULTAI_CF_ACCESS_AUDS=60a4ad4b…` → verify Access gate + JWT verify → card flips live automatically (demoUrl already set in #57).

Access app, policies, and service token are already provisioned (`cloudflare/demo-access` in omaseal).

## Sequencing

U1 first (unblocks the tree), then U2 and U3 in parallel-ish (different surfaces). U4 waits on host decision.

## Risks

- U1: stacked #53 needs a rebase-or-merge-order check after #52 lands.
- U2: `cfat_` account token — Vectorize create may be account-API-token-compatible; if not, needs a user token or dashboard click. Workers AI free tier embeds fine.
- U3: intercepting analytics must not leak into production builds — gate strictly on test env.
