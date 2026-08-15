# Cluster hosting (Tailscale)

**Cosmic Intelligence / portfolio-hub is self-hosted** on the three-node Mac Mini Docker Swarm joined over **Tailscale**. It is not the primary production path on Vercel or Cloudflare Pages.

Canon infra inventory lives in [`duketopceo/homelab`](https://github.com/duketopceo/homelab). This doc is the portfolio-hub-facing summary so agents and operators do not invent a different topology.

## Nodes

| # | Hostname (LAN / Tailscale) | Role |
|---|----------------------------|------|
| 1 | `cluster-1-master` / `cluster1` | Swarm manager — deploy from here (`~/portfolio-hub`, `./scripts/cluster-deploy.sh`) |
| 2 | `cluster2` | Swarm worker |
| 3 | `cluster3` | Swarm worker |

Inter-node traffic uses the **Tailscale mesh**. Public browser traffic for `luke-the-duke.com` still enters via **Cloudflare Tunnel → Traefik → Swarm** on the `traefik-public` overlay (see [AUDIT-502.md](AUDIT-502.md)).

## Operator facts

- Stack name: `portfolio` · service: `portfolio_portfolio` · image: `ghcr.io/duketopceo/portfolio-hub:latest`
- Replicas: 2 (rolling update); workers must pull from GHCR — see `scripts/cluster-deploy.sh`
- Health: `/api/health` (Docker HEALTHCHECK + Traefik LB probe)
- Secrets: `.env` next to `docker-compose.yml` on the manager (`GITHUB_TOKEN`); never commit

## Do not

- Assume a 2-node-only Swarm (outdated). Production is **cluster 1 + 2 + 3**.
- Publish host port conflicts or bind the app only to localhost on a single node and call it “cluster deploy”.
- Put LAN IPs or Tailscale IPs into public UI copy (`src/data/projects.ts`) — hostname roles are fine; addresses stay in private ops docs.
