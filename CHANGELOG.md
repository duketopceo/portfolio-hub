# Changelog

All notable releases are tagged as `vMAJOR.MINOR.PATCH` and published to `ghcr.io/duketopceo/portfolio-hub`.

## [Unreleased]

### Portfolio

- **Modular project catalog** — project definitions now live one per file under `src/data/projects/catalog/`, use `defineProject()` defaults, and are aggregated by `src/data/projects/index.ts`
- **Curated repository set** — reduced the catalog to 18 intentional active/core/showcase systems and removed stale or archived clutter
- **Kurultai lead** — Kurultai is first in the catalog, carries `tier: "lead"`, and remains pinned by `PORTFOLIO_LEAD_SLUG`
- **Repository corrections** — Kurultai uses Rust/SQLite/MCP/Axum/FTS5; Pace is Go plus TypeScript/Vite; NanoClaw is a Go tenant-execution harness; Bartlett Server-001 is Compose/nginx infrastructure
- **Deployment cleanup** — retained only catalog-backed external live and Swarm-offline entries

### Experience

- **Behind the Build** — project detail pages now lead with architecture pipelines and engineering decisions for public and private projects
- **Narrative order** — capabilities and context precede demos/previews; public README documentation is last
- **Public repository link** — public project sidebars link to the configured GitHub owner and repository

### Docs

- **`docs/CATALOG.md`** — one-file-plus-one-import project maintenance workflow and curation rules
- **`docs/STALE-AUDIT-2026-08-15.md`** — verified repository findings, curated slugs, deployment state, and infrastructure follow-ups
- **`docs/PASSWORD-RECOVERY.md`** — pointer-only recovery guidance with personal emails and credentials excluded
- **`deployments.ts` header** — Cloudflare public edge plus Tailscale Swarm origin context

## [3.0.0] — 2026-03-21

### Tooling (post-release)

- **`scripts/cluster-deploy.sh`** — standardized Swarm deploy: `git reset` to `origin/main`, `docker compose build`, `docker stack deploy`, `docker service update`
- **`scripts/diagnose-502.sh`** / **`scripts/audit-cloudflare.sh`** — Swarm/Traefik/VIP checks + optional Cloudflare API audit; **`docs/AUDIT-502.md`** — overlay attachability, Traefik must join `traefik-public` via stack deploy
- **Project dossier UI** — `components/dossier/*` + `.dossier-page` styles: same hero, section surfaces, two-column grid, and prev/next footer on every slug; classified banner copy cleaned up
- **`/now`** — optional Spotify track embed (“ON REPEAT”)

### Highlights

- **Cosmic Intelligence** rebrand across projects, activity, and detail pages
- **Content rail** — fluid `--cosmic-page-*` width/padding; header/footer aligned; wider desktop, clamped mobile/ultra-wide
- **Project cards v2** — spacious layout, gradient surface, pill meta row, full-width live demo strip, larger grid gutters
- **Spacing/layout fixes** — CSS cascade order for mobile overrides; `ProjectCard` flex (`flex-1`) for footer alignment
- **Readability** — measured prose (`65ch`), `.cosmic-readable`, dossier body; section labels on display font

### Docker

- Image tags: `latest` + `sha` on every `main` push; **semver tag** (e.g. `3.0.0`) on matching git tag `v3.0.0`

---

## Earlier

Pre-3.0.0 history lived on `main` without semver tags; treat **v3.0.0** as the first labeled baseline for **v4+**.
