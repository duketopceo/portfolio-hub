# AGENTS.md

Inherits from [luke-agents/AGENTS.md](https://github.com/duketopceo/luke-agents/blob/main/AGENTS.md). This file specializes; it does not replace.

**Shared agent brain:** see luke-agents `AGENTS.md` §0a — Kurultai is the only agent brain. Do not Swarm-deploy or dual-host the brain.

## Cursor Cloud specific instructions

### Overview

Portfolio Hub is a Next.js 16 (App Router) personal portfolio site. No database, no external services required for local dev. Project data is curated in `src/data/projects.ts` and optionally enriched via the GitHub API.

### Production hosting

- **Primary:** Railway GitHub-connected service **`portfolio-hub`** — deploys on push via `Dockerfile` + `railway.json` (see `docs/RAILWAY.md`, `README.md` Deployment).
- **Legacy:** Tailscale Swarm nodes **cluster1–cluster3** with `./scripts/cluster-deploy.sh` (see `docs/CLUSTER.md`).

| Action | Command |
|--------|---------|
| Install deps | `npm ci` |
| Dev server | `npm run dev` (port 3000) |
| Lint + design guard | `npm run lint` (ESLint 9 + `check:design`) |
| Test | `npm run test` (Vitest helpers and design primitives) |
| Visual acceptance | `npm run test:visual` (Playwright production-build route matrix) |
| Build | `npm run build` |
| Prod server | `npm run start` |
| Railway deploy | Push to GitHub-connected branch (service already exists) |
| Swarm deploy (legacy) | `./scripts/cluster-deploy.sh` |

### Environment

- Copy `.env.example` to `.env.local` before first run.
- `GITHUB_APP_*` or `GITHUB_TOKEN` optional — see `docs/GITHUB-APP.md`
- `GITHUB_USER` defaults to `duketopceo` if not set.

### Known caveats

- **Lint status:** `npm run lint` exits 0 with no errors and no warnings (verified 2026-09-13).
- **Podcast dashboards moved out:** `public/podcast/` deleted 2026-09-30 — canonical home is `show.luke-the-duke.com/podcast/` (repo `luke-the-duke-show`, Cloudflare Pages). `next.config.ts` permanently redirects all `/podcast/:path*` there, so old apex links keep working.
- **`react-hooks/set-state-in-effect` suppression:** `src/components/WelcomeIntro.tsx` disables that rule around its mount effect, with a comment explaining why. The pattern is genuine — the overlay renders nothing on the server and may only read `localStorage` on the client — but rewriting it to the `useSyncExternalStore` hydration idiom is outstanding follow-up work.
- **Tests:** Vitest covers helpers and shared design primitives under `src/**/*.{test.ts,test.tsx}`. `npm run lint` also runs the design-system and privacy source checks. App gates are `npm run lint`, `npm run test`, `npm run build`, and `npm run test:visual` for visual changes.
- **Visual setup:** run `npx playwright install chromium` once on a fresh checkout before `npm run test:visual`; the command builds and serves the production bundle on port 3100.
- **Analytics:** Umami event catalog, UTM convention, and verification recipe live in `docs/analytics.md` — instrument new surfaces via `data-umami-event` attributes per that grammar.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Code graph index (optional accelerator)

This repo may be indexed by `codebase-memory-mcp` (CBM) on an agent's local
machine — `.codebase-memory/` is gitignored. If your harness exposes CBM
tools (`search_graph`, `trace_path`, `get_architecture`, `detect_changes`),
prefer them for structural questions — symbol lookup, caller/callee traces,
impact analysis — instead of grep/read loops. Reindex after large refactors
(`index_repository`); treat `.codebase-memory/graph.db.zst` as a local cache
artifact, never commit it.
