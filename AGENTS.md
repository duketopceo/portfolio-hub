# AGENTS.md

Inherits from [luke-agents/AGENTS.md](https://github.com/duketopceo/luke-agents/blob/main/AGENTS.md). This file specializes; it does not replace.

**Shared agent brain:** see luke-agents `AGENTS.md` §0a (AppFlowy primary Session Log / Decisions / Projects / Rules). Do not Swarm-deploy or dual-host the brain.

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

- **Lint status:** `npm run lint` exits 0 with no errors and no warnings (verified 2026-09-13). `public/podcast/app.js` is a minified, page-unreferenced bundle excluded via `globalIgnores` in `eslint.config.mjs`; the other scripts in that directory are hand-authored and linted normally.
- **`react-hooks/set-state-in-effect` suppression:** `src/components/WelcomeIntro.tsx` disables that rule around its mount effect, with a comment explaining why. The pattern is genuine — the overlay renders nothing on the server and may only read `localStorage` on the client — but rewriting it to the `useSyncExternalStore` hydration idiom is outstanding follow-up work.
- **Tests:** Vitest covers helpers and shared design primitives under `src/**/*.{test.ts,test.tsx}`. App gates are `npm run lint`, `npm run test`, `npm run build`, and `npm run test:visual` for visual changes.
- **Visual setup:** run `npx playwright install chromium` once on a fresh checkout before `npm run test:visual`; the command builds and serves the production bundle on port 3100.
