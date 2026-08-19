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
| Lint | `npm run lint` (ESLint 9) |
| Test | `npm run test` (Vitest; `src/**/*.test.ts` helpers) |
| Build | `npm run build` |
| Prod server | `npm run start` |
| Railway deploy | Push to GitHub-connected branch (service already exists) |
| Swarm deploy (legacy) | `./scripts/cluster-deploy.sh` |

### Environment

- Copy `.env.example` to `.env.local` before first run.
- `GITHUB_TOKEN` is optional. Without it the site still builds and runs; GitHub metadata enrichment (stars, language, last-push dates) will be degraded and `/now` may show empty commit dates.
- `GITHUB_USER` defaults to `duketopceo` if not set.

### Known caveats

- **Pre-existing lint error:** `SolarSystemNav.tsx` has a `react-hooks/set-state-in-effect` violation (`npm run lint` exits 1). This is a known issue in the codebase, not introduced by environment setup.
- **metadataBase warning:** During `npm run build`, Next.js warns about missing `metadataBase` for social OG images. This is cosmetic and does not affect the build.
- **Tests:** Vitest covers pure helpers under `src/**/*.test.ts`. App gates remain lint, `npm run build`, and manual browser testing.
