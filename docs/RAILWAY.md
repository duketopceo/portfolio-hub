# Railway — portfolio-hub

Production deploy target for **portfolio-hub** (luke-the-duke.com site). The Railway project and GitHub-connected service already exist — this doc describes how deploys work and how to expose the site publicly. Do **not** create a new Railway project from scratch.

## Current service (Aug 2026)

| Field | Value |
| --- | --- |
| Service name | `portfolio-hub` |
| Source | GitHub repo `duketopceo/portfolio-hub` (connected) |
| Status | Online |
| Region | US West (California) |
| Replicas | 1 |
| Private network | `luke-the-duke.railway.internal` (alias: `luke-the-duke`) |
| Public networking | **None** — no Railway-generated domain, no custom domain, no TCP proxy |
| Outbound IPv6 | Off |

Recent deploys from `duketopceo` succeed when changes land on the branch Railway watches (typically `main`).

## In-repo config

| File | Purpose |
| --- | --- |
| `railway.json` | Dockerfile builder, `/api/health` healthcheck, restart policy |
| `Dockerfile` | Multi-stage Next.js standalone image |
| `.env.example` | Variable names only — set values in Railway dashboard |

**Normal deploy path:** push/merge to the connected branch → Railway builds from `Dockerfile` → healthcheck on `/api/health`. No `railway up` required for day-to-day deploys.

## Environment variables

Set in Railway → **portfolio-hub** → **Variables** (never commit secrets):

| Variable | Required | Notes |
| --- | --- | --- |
| `GITHUB_TOKEN` | Optional fallback | PAT if GitHub App not configured |
| `GITHUB_USER` | Optional | Defaults to `duketopceo` |
| `GITHUB_APP_ID` | Optional (preferred) | See [GITHUB-APP.md](./GITHUB-APP.md) |
| `GITHUB_APP_INSTALLATION_ID` | With App | Installation on duketopceo |
| `GITHUB_APP_PRIVATE_KEY` | With App | PEM private key |

Optional: pass `GITHUB_TOKEN` as a **build** variable if you want GitHub data at build time; runtime variables cover ISR refreshes.

## Public access today vs Railway DNS

The service is **Online** on Railway private networking (`luke-the-duke.railway.internal`). **Public networking on Railway is not configured yet** — no generated domain, no custom domain.

Luke currently reaches the site via **localhost + tunnel** for development/preview. When ready to cut over **luke-the-duke.com** to Railway:

1. Railway → **portfolio-hub** → **Networking** → add custom domain.
2. Copy the DNS target Railway displays — do **not** invent Cloudflare records.
3. Add that record in Cloudflare (or your DNS provider), then confirm TLS in Railway.

As of Aug 2026 the service has **no public endpoint**. To serve `luke-the-duke.com` (or a Railway subdomain) from this service:

1. Railway dashboard → project → **portfolio-hub** → **Settings** → **Networking** (or **Public Networking**).
2. **Generate domain** — Railway assigns a `*.up.railway.app` hostname for smoke tests, **or**
3. **Custom domain** — enter `luke-the-duke.com` (and optionally `www`). Railway shows the DNS target(s) you must create (CNAME or A/ALIAS depending on Railway’s current instructions).
4. In your DNS provider (e.g. Cloudflare), add the record Railway displays. Do not guess CNAME values — copy them from the Railway UI after adding the domain.
5. Confirm TLS provisions in Railway; set Cloudflare SSL mode to **Full** or **Full (strict)** if proxied.

**Private-only access:** other Railway services can reach this app at `luke-the-duke.railway.internal` on the service port (3000) without public networking.

## CLI (optional)

Use the CLI only to inspect or troubleshoot an **existing** linked project — not to bootstrap production:

```bash
railway login
railway link    # select the existing portfolio-hub project
railway logs
railway variables
```

## Legacy: Docker Swarm / cluster

Self-hosted Swarm + Traefik notes remain in [CLUSTER.md](./CLUSTER.md). Pace and other products may still use Hetzner/Swarm paths; **this repo’s** primary deploy path is Railway GitHub integration.
