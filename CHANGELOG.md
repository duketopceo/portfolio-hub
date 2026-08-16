# Changelog

All notable releases are tagged as `vMAJOR.MINOR.PATCH` and published to `ghcr.io/duketopceo/portfolio-hub`.

## [Unreleased]

### Changed

- Recruiter hire path: `/about`, `/contact`, `/hire` with a public mailto
- Catalog cards open the dossier; public GitHub is a separate CTA
- GitHub summary API no longer 502s expected misses (unknown, private, unauthorized)
- Stratum is kept in the catalog but is not advertised as live

### Docs

- Document production hosting on Tailscale nodes **cluster1**, **cluster2**, and **cluster3** (`docs/CLUSTER.md`, AGENTS.md, `.cursorrules`, README)

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
