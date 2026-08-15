# Portfolio-hub stale audit — 2026-08-15

Focused content/data drift check. No UI redesign in the companion PR.

## Timeline on `main`

| When | What |
|------|------|
| **2026-08-08** | Last meaningful `main` commit — Khan project entry (`8eefb62`) |
| **2026-07-26** | Cosmic refresh — Kurultai-led portfolio refresh, live config, orbit nav (`bdf1cd2`) |

## CI / deploy blockers

- **Issue #16** — `GH_PAT` used by Swarm SSH deploy is likely **expired**; automated cluster deploys from GitHub Actions are broken until the secret is rotated.
- Without a working PAT + SSH path to the manager, image/stack updates do not land on the Tailscale Swarm.

## Cluster reality

- Production origin is a **Tailscale** Docker Swarm: **cluster1 / cluster2 / cluster3**.
- **cluster1** has historically been the **Swarm manager**; cluster2/cluster3 are workers.
- Operator report: only **some** nodes are online. If the manager is down, Swarm scheduling and the Cloudflare tunnel path degrade (public subdomains 502 / offline even when DNS still resolves at the edge).

## Cloudflare edge

- Public hostnames under `*.luke-the-duke.com` are **proxied to Cloudflare anycast** (DNS at CF).
- Origin is reached via **Cloudflare Tunnel** into the Tailscale Swarm.
- Tunnel token / stack config lives in the private **homelab** repo under `stacks/cloudflare` — never commit tokens here.
- Audit helper in this repo: `scripts/audit-cloudflare.sh` (plus `scripts/diagnose-502.sh` / `docs/AUDIT-502.md`).

## Content drift fixed in this PR

| Item | Before | After |
|------|--------|-------|
| Kurultai `techStack` | TypeScript / Embeddings / PostgreSQL-led | **Rust, SQLite, MCP, Axum, FTS5** (+ local-first description) |
| Pace Server `techStack` | TypeScript / Next.js | **Go** primary + **TypeScript/Vite** UI |
| Archived showcases | Looked “live” or current | Brief **archived / demo offline** honesty in highlights |
| OMHDB | `online: true` / `demoOffline: false` | **`online: false`** / **`demoOffline: true`** (archived; no proof up) |
| `deployments.ts` | No edge/origin note | Header documents CF edge + Tailscale Swarm roles |

External hosts (republicatlas, nanoclaw, stratumhq, chronicleweaver, finance-frenzy) left as-is. **No new live URLs invented.** No LAN IPs, passwords, or GitHub usernames in public project copy.

## Open follow-ups

1. **Rotate `GH_PAT`** (and related deploy secrets) so issue #16 / Swarm SSH deploy works again.
2. **Bring cluster1 online** (manager) — restore Swarm quorum and tunnel stability; verify workers.
3. **Auth Cloudflare MCP** (or use dashboard + `audit-cloudflare.sh`) to confirm DNS/tunnel health without guessing.
4. **Merge docs PR #17** (`cursor/tailscale-cluster-hosting-e607`) or cherry-pick `docs/CLUSTER.md` onto main — cluster topology docs without mixing into this content-only refresh unless desired.
5. **UI roadmap** (`docs/AUDIT-UI-ROADMAP.md`) remains open — out of scope for this PR.

## Related

- Password / access pointers (no secrets): [`PASSWORD-RECOVERY.md`](./PASSWORD-RECOVERY.md)
- Draft content PR branch: `cursor/portfolio-refresh-e607`
