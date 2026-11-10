# Security and performance audit, 2026-11-10

Scope: luke-the-duke.com (portfolio-hub, Next.js 16.4.1, Railway behind Cloudflare), base `origin/main` at 7c907c9.
Method: passive, read-only requests against the live site; every active probe (injection, traversal, SSRF, rate, odd methods and Host headers) against a local production build served on a private port. No secrets were read or printed. Local builds used `ACTIVITY_USE_FIXTURES=1` because GitHub rate-limited the audit machine.

## Findings

| # | Severity | Finding | Status |
| --- | --- | --- | --- |
| 1 | Medium | A single GitHub timeout fails the whole build or an ISR pass. `enrichProjectActivity` (src/lib/github.ts) had an uncaught `fetch`; reproduced as `Error occurred prerendering page "/projects/open-computer" ... TimeoutError`, exit 1. A GitHub blip therefore blocks a Railway deploy. | Fixed |
| 2 | Medium | `/openrouter` live test is blocked by CSP. The page posts the visitor's own session-only key from the browser to `https://openrouter.ai/api/v1/chat/completions`, but `connect-src` allowed only `'self'` and the analytics host. The feature cannot work in production. | Fixed: `connect-src` gains `https://openrouter.ai` (see risk note) |
| 3 | Low | Loopback links shipped as public hrefs: `http://127.0.0.1:8421/ui/` (/projects/kurultai) and `http://localhost:8080` (/projects/openrouter). Dead links to private or removed repos and a dead origin on README-sourced content. | Fixed (see Broken links) |
| 4 | Low | `/openrouter/api/bakeoff` read the filesystem on every request and returned `e.message` (can contain server paths) on failure. It makes no upstream or paid call: it only serves the committed `src/data/bakeoff.json`. | Fixed: bundled static JSON, no error detail |
| 5 | Low | `/api/activity/[slug]` and `/api/github/repo/[repoName]/summary` send no `Cache-Control` (dynamic-param routes ignore `revalidate`). `/api/activity/kurultai` is 164 KB and was uncached at the edge and browser. | Fixed: explicit `Cache-Control` (3600 s and 180 s with stale-while-revalidate) |
| 6 | Low | Malformed percent-encoding in any dynamic segment (`/api/activity/%E0%A4%A`, `/projects/%E0%A4%A`) returns a bare 500. The framework fails before route code runs. No leak (body is `Internal Server Error`), but it is Sentry noise. A defensive `safeDecode` was added to the summary route, but it is not reachable for this input. | Follow-up (upstream Next behaviour; consider middleware) |
| 7 | Low | No rate limiting on any API. Every public route is either static, cached, or restricted to a closed allowlist (`isCuratedRepoName`, `getAllSlugs`) with GitHub fetches cached 180 to 3600 s. Local test: 300 sequential summary calls in 0.8 s, all 200, no GitHub traffic beyond the cached fetch. An attacker cannot choose the upstream repo, so quota abuse is bounded to about 35 cached keys. | Accepted; Cloudflare rate rule is the right place if wanted |
| 8 | Low | `frame-src https://*.luke-the-duke.com` is a wildcard. `omhdb.luke-the-duke.com` returns Cloudflare 530 (dangling origin), which is subdomain-takeover-shaped. | Follow-up: remove the dead DNS record, or list frame hosts explicitly |
| 9 | Info | CSP has `script-src 'unsafe-inline'` (needed for static generation without nonces). | Follow-up: nonce/hash CSP needs dynamic rendering; PR #96 branch explores a nonce build |
| 10 | Info | `/api/activity` returns 538 KB: each repo carries the full 90-day `activity` history (114 to 176 KB each) plus `condensed`. Nothing in `src/` fetches it. | Follow-up: shape must stay compatible (owner request), so this PR leaves it unchanged; it is already cached with `s-maxage=3600` |
| 11 | Info | `/projects/[slug]` ships a 165 KB serialized `activity` prop (RSC flight data) to `DossierActivityTimeline`, which only reads `fetchedAt`, `headline` and the condensed view. Kurultai: 334 KB HTML, 260 KB of it flight data. | Follow-up (activity components are owned elsewhere): condense on the server like `toClientActivityPayload` |
| 12 | Info | React error #438 on every page that mounts an R3F `<Canvas>` (/, /about, /projects, dossiers). Stack: `its-fine` `useContextMap` calls `React.use()` on a context object it finds walking the fiber tree (its-fine 2.0.0 with React 19.2.3). Upgrading its-fine to 2.1.1 via `overrides` did not fix it. | Follow-up (canvas code is out of scope): try `@react-three/fiber` 9.8.2 (published 2026-10-14) and `drei`, or mount the canvas outside the app-router context tree |
| 13 | Info | Privacy: public APIs are clean. `/api/repos` has 0 private entries of 35; `/api/github/pulls` aggregates only non-private catalog repos; `/api/activity` marks private repos with scrubbed labels and no URLs. Every repo in the live pulls feed (20 of 20) answers 200 to an unauthenticated github.com request, so none is private. | Pass |
| 14 | Pass | No secrets in client bundles: grep of `.next/static` for env names, key shapes (ghp_, github_pat_, sk-or-, PEM, JWT, AKIA) found only an input placeholder string `sk-or-v1-… (session-only)`. `check:privacy:built` passes. No source maps served (`.js.map` 404). No cookies set. HSTS present (Cloudflare, max-age 15552000). Sentry tunnel `/monitoring` is not exposed (404). | Pass |
| 15 | Pass | Local active probes: path traversal and injection in `[slug]` and `[repoName]` return 404 (closed allowlist); `/_next/image` rejects non-allowlisted hosts and internal URLs (400); POST on GET routes returns 405; odd Host header gets 200 with no reflection. | Pass |
| 16 | Pass | Server-only modules (`github-app`, `github`, `github-repo-api`, `github-activity`, Node builtins) are not reachable from any `"use client"` file, and no client file reads a non-`NEXT_PUBLIC_` env var. | Pass, now enforced by `src/lib/client-boundary.test.ts` |

Risk note on #2: allowing `connect-src https://openrouter.ai` means an XSS on this origin could send data there. The page already has `'unsafe-inline'`, and the key never touches our server. Revert that one line if you would rather drop the live test.

## Broken links

See `docs/sitemap.md` for the regenerated table. Handling:

| Link | Status | Action |
| --- | --- | --- |
| github.com/duketopceo/omarchy-{hotkey-tally,lidguard,notch,wordink} | 404 (private or removed) | Unlinked (text kept) from the README pipeline |
| github.com/duketopceo/pace-gallery/blob/feat/component-card-gallery/vendor/threeui/README.md | 404 | Unlinked; the other links to that branch resolve and are untouched |
| http://127.0.0.1:8421/ui/, http://localhost:8080 | refused | Any loopback or private-network href is now dropped from READMEs; the hard-coded `OpenRouterEvidence` link became plain `<code>`. `check:privacy` now fails on such hrefs in source |
| https://omhdb.luke-the-duke.com | 530 | Unlinked; the deployments table already marks it offline |
| npmjs.com, claude.ai | 403 | Bot blocks; left alone, to be checked in a browser |
| `/cdn-cgi/l/email-protection` | 404 to a crawler | Cloudflare email obfuscation, expected |

The cause was upstream: those links live in READMEs fetched from GitHub at render time, not in `src/data`. The fix sits in `src/lib/outbound-links.ts` and `src/lib/readme-html.ts`; add a URL to `DEAD_OUTBOUND_URLS` when a new one dies. If the omarchy repos are made public again, remove them from that list.

## Performance

Measured on a local production build (fixtures, headless Chromium, software GL, so absolute scores are pessimistic and noisy; compare bytes, not scores).

| Metric | Before | After |
| --- | --- | --- |
| First-load JS per route (uncompressed, `route-bundle-stats.json`) | `/` 676,515 B; `/projects` 653,194 B; `/projects/[slug]` 676,627 B | unchanged |
| `/openrouter/api/bakeoff` | dynamic (`ƒ`), filesystem read per request, no cache header | static, `s-maxage=31536000` |
| `/api/activity/[slug]` (kurultai, live 164,214 B) | no Cache-Control | `public, s-maxage=3600, stale-while-revalidate=86400` |
| `/api/github/repo/*/summary` | no Cache-Control | `public, s-maxage=180, stale-while-revalidate=600` |
| Build under a GitHub timeout | exit 1 | exit 0 |
| Lighthouse `/` (perf / LCP / TBT) | 78 / 3.5 s / 500 ms | 83 / 3.5 s / 270 ms (same bytes; run-to-run noise) |
| Lighthouse `/projects` | 77 / 3.3 s / 230 ms, CLS 0.226 | 85 / 3.4 s / 220 ms, CLS 0 (noise; CLS shift was `.cosmic-footer`) |

Where the remaining cost is (follow-ups, none of it changed here because it is canvas or activity code owned elsewhere):

- The three.js starfield chunk is 233 KB transferred, 164 KB unused at load, and it loads immediately after hydration on every page. Deferring its mount to idle or first interaction is the largest remaining win.
- Sentry client is 58 KB transferred, 45 KB unused. Sentry is live in production (DSN baked into the client bundle). `bundleSizeOptimizations` (`excludeTracing`, replay excludes) was tried and changed nothing under Turbopack, so it was not kept.
- `/projects/kurultai` under software GL spends 174 s in the 8 KB `PredictiveArcCanvas` chunk (TBT 154 s, Lighthouse 54). This is a software-rendering artefact, but the shader loop has no cap for devices without a GPU.
- Dossier flight payload (finding 11) and `/api/activity` size (finding 10).
- Every page render calls `getEnrichedProjects()`, which fires about 22 `releases/latest` requests; the data cache dedupes them in production but a cold build hammers GitHub (this is what rate-limited the audit machine). Memoizing per build would help.

## Post-deploy checks

1. `curl -sI https://luke-the-duke.com/ | grep -i content-security-policy` shows `connect-src 'self' https://analytics.pacehq.io https://openrouter.ai`.
2. Headers still present: `x-content-type-options`, `x-frame-options: DENY`, `strict-transport-security`.
3. `/openrouter/api/bakeoff` returns 200 JSON (18 KB) with `cache-control: s-maxage=31536000`.
4. `/api/activity/kurultai` and `/api/github/repo/kurultai/summary` carry the new `cache-control`; `/api/activity`, `/api/repos`, `/api/github/pulls` shapes unchanged.
5. Load `/`, `/projects`, `/projects/kurultai`, `/projects/openrouter`, `/projects/omarchy-plugins`, `/projects/military-hardware-db` and confirm: they render, the console shows no CSP violations, the omarchy-lidguard and omhdb texts are no longer links, and no `localhost` or `127.0.0.1` href remains (`curl -s .../projects/kurultai | grep -c 127.0.0.1` prints only code samples).
6. On `/projects/openrouter`, paste a throwaway key into the live test and confirm the request to openrouter.ai is no longer blocked.
7. Regenerate the map: `node scripts/site-map.mjs --external` and review the failing table.
