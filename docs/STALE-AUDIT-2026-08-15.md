# Portfolio-hub stale audit — 2026-08-15

Repository, catalog, and deployment audit for the Cosmic Intelligence portfolio. The Cosmic UI chrome remains unchanged; this refresh focuses on accurate project data and the technical dossier flow.

## Timeline on `main`

| When | What |
|------|------|
| **2026-08-08** | Last meaningful `main` commit — Khan project entry (`8eefb62`) |
| **2026-07-26** | Cosmic refresh — Kurultai-led portfolio refresh, live config, orbit nav (`bdf1cd2`) |

## Repository verification

Current GitHub metadata and selected READMEs were checked before rebuilding the catalog. Material corrections include:

- **Kurultai** is the active public Rust / SQLite / MCP lead system.
- **Pace Server** is Go-primary with a TypeScript/Vite product UI.
- **NanoClaw** is a private Go tenant-execution harness with context, tool, schema, and autonomy gates — not a public TypeScript messaging container.
- **Bartlett Server-001** is a single-server Docker Compose/nginx/Cloudflare Access operations repository — separate from the Tailscale Docker Swarm in `homelab`.
- **Republic Atlas** has an archived private repository and a retained external live deployment.
- **Finance Frenzy** now includes an Unreal Engine 5 rebuild while preserving the award-winning Python prototype.

## Curated catalog

The catalog now contains only 18 intentional entries:

`kurultai`, `khan`, `pace-server`, `luke-agents`, `portfolio-hub`, `homelab`, `bartlett-permits`, `bartlett-data-platform`, `luke-the-duke-show`, `server-cluster`, `openclaw`, `finance-frenzy`, `nem-stock-pitch`, `republic-atlas`, `nanoclaw`, `stratum-hq`, `personal-blog`, `gpu-hosting`.

The following stale or archived clutter was removed entirely:

`trading-bot`, `alphahedge`, `ikbr-dashboard`, `skyguard-ai`, `quiz-the-best`, `optimezer`, `military-hardware-db`, `etl-pipeline`, `series65-study-app`, `dixi`, `chronicle-weaver`, `collaborative-essay`, `curious-storycard`, `ai-debate-arena`.

Project definitions now live one per file under `src/data/projects/catalog/`; see [`CATALOG.md`](./CATALOG.md) for the add/import workflow. Kurultai is first in the array and remains force-pinned by `PORTFOLIO_LEAD_SLUG`.

## Deployments

Verified catalog deployments retained in `src/data/deployments.ts`:

- External live: Republic Atlas, NanoClaw, Stratum, Finance Frenzy.
- Swarm offline: Technical Blog and NEM Stock Pitch.

Every deployment for a dropped slug was removed. No new URL was inferred from repository metadata.

## Cluster reality

- Portfolio-origin workloads use a **Tailscale** Docker Swarm across **cluster1 / cluster2 / cluster3**.
- **cluster1** has historically been the Swarm manager; cluster2 and cluster3 are workers.
- If the manager is unavailable, scheduling and the Cloudflare tunnel path can degrade even while edge DNS resolves.

## Cloudflare edge

- Public portfolio hostnames are proxied through Cloudflare.
- Origin is reached through Cloudflare Tunnel into the Tailscale Swarm.
- Runtime credentials remain outside git.
- Audit helper: `scripts/audit-cloudflare.sh` (plus `scripts/diagnose-502.sh` and `docs/AUDIT-502.md`).

## CI / deploy blockers

- **Issue #16** reports that the credential used by Swarm SSH deploy may be expired; automated cluster deploys require verification and rotation if confirmed.
- Without a working GitHub Actions-to-manager path, image and stack updates do not land on the Swarm.

## Open follow-ups

1. Verify and, if needed, rotate the Swarm deployment credential associated with issue #16.
2. Restore and verify Swarm manager and worker health.
3. Audit Cloudflare DNS and tunnel health through an authenticated operator path.
4. Reconcile the separate cluster documentation from PR #17.

## Related

- Catalog maintenance: [`CATALOG.md`](./CATALOG.md)
- Password and access pointers (no secrets): [`PASSWORD-RECOVERY.md`](./PASSWORD-RECOVERY.md)
- Draft refresh branch: `cursor/portfolio-refresh-e607`
