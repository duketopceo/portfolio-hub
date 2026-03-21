# Portfolio Hub

Meta-portfolio site that aggregates GitHub repos into a curated, categorized project showcase. Built with Next.js 16, TypeScript, and Tailwind CSS.

**Current release:** `v3.0.0` (see [CHANGELOG.md](CHANGELOG.md)). Docker: `ghcr.io/duketopceo/portfolio-hub:latest` and `:3.0.0` when the `v3.0.0` tag is pushed.

**Browser tab titles** lead with **Cosmic Intelligence** (see `layout.tsx` `title` / `title.template`). The same name is the in-app product brand (header, footer, hero).

## Architecture

```
portfolio-hub/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # / — Landing: hero, featured, categories
│   │   ├── projects/
│   │   │   ├── page.tsx        # /projects — All projects with filters
│   │   │   └── [slug]/page.tsx # /projects/:slug — Project detail + README
│   │   ├── now/page.tsx        # /now — Recent activity + optional Spotify embed
│   │   └── api/repos/route.ts  # /api/repos — JSON API
│   ├── components/             # React components
│   │   ├── dossier/            # Shared /projects/[slug] layout (hero, sections, footer nav)
│   │   ├── Header.tsx          # Sticky nav (Cosmic Intelligence — dark theme only)
│   │   ├── Footer.tsx
│   │   ├── ProjectCard.tsx     # Reusable project card
│   │   └── FilterBar.tsx       # Category/sort filter controls
│   ├── data/
│   │   ├── projects.ts         # Master project config (curated list)
│   │   └── deployments.ts      # Subdomain + live URL mapping
│   └── lib/
│       ├── github.ts           # GitHub API integration + ISR caching
│       ├── types.ts            # TypeScript interfaces
│       └── utils.ts            # Date formatting, colors, helpers
├── Dockerfile                  # Multi-stage Docker build
├── docker-compose.yml          # Swarm + Traefik deployment
├── scripts/                    # cluster-deploy.sh, diagnose-502.sh, audit-cloudflare.sh
└── .github/workflows/deploy.yml # CI/CD pipeline
```

## Layout (content rail)

Header, footer, and main pages share the **`.cosmic-page`** rail from `src/app/globals.css`:

| CSS variable | Purpose |
| --- | --- |
| `--cosmic-page-max` | `min(90rem, 100%)` — wider than legacy 64rem, capped on ultra-wide |
| `--cosmic-page-pad-x` | `clamp(1rem, 4vw, 3rem)` — fluid horizontal inset |
| `--cosmic-page-pad-y` | `clamp(2.5rem, 5vw, 5rem)` — optional vertical rhythm |

Long copy uses **`.cosmic-readable`** or measured **`.prose-readme`** (`max-width: min(65ch, 100%)`).

## How Repo Discovery Works

1. **Curated, not automatic.** Only repos listed in `src/data/projects.ts` appear on the site. This keeps the portfolio clean — no empty repos or experiments.

2. **GitHub API enrichment.** At build time (and via ISR every hour), the site fetches real-time metadata for each configured repo:
   - Language, stars, forks, last push date
   - README content (for public repos)
   - Private repos show curated metadata only (no source code exposed)

3. **Categories.** Each project is manually assigned a category: `finance`, `ai`, `osint`, `data`, `infra`, or `apps`. This drives the filter UI and category pages.

4. **To add a project:** Add an entry to `src/data/projects.ts` with the repo name, display name, tagline, category, and tech stack.

## Setup

```bash
# Clone
git clone https://github.com/duketopceo/portfolio-hub.git
cd portfolio-hub

# Install
npm install

# Configure
cp .env.example .env.local
# Edit .env.local and add your GITHUB_TOKEN

# Dev
npm run dev
# → http://localhost:3000
```

**Secrets:** `GITHUB_TOKEN` is server-only (never `NEXT_PUBLIC_*`). Do not commit `.env` / `.env.local` — they stay gitignored. See **[docs/SECURITY-ENV.md](docs/SECURITY-ENV.md)** for Docker and token handling.

## Deployment

### Option A: Docker Swarm (Recommended)

Designed to run on your Mac mini cluster behind Traefik + Cloudflare.

```bash
# Build and push to GHCR
docker build \
  --build-arg GITHUB_TOKEN=$GITHUB_TOKEN \
  -t ghcr.io/duketopceo/portfolio-hub:latest .
docker push ghcr.io/duketopceo/portfolio-hub:latest

# Deploy to Swarm
docker stack deploy -c docker-compose.yml portfolio
```

The `docker-compose.yml` includes:
- 2 replicas with rolling updates
- **No published host ports** — Traefik talks to the container on `traefik-public` (port 3000 internal only). Avoids Swarm errors like `port '3000' is already in use`.
- Traefik routing for **`luke-the-duke.com`** and **`www.luke-the-duke.com`** (edit `docker-compose.yml` if you use another hostname)
- Docker **`HEALTHCHECK`** and Traefik LB probe on **`/api/health`** (lightweight; image includes `wget`)
- Connection to `traefik-public` overlay network

**Traefik itself** must run as a **Swarm stack service** on **`traefik-public`** (same external overlay). A Traefik container that only sits on a compose **bridge** cannot reach Swarm backends → **502**. You cannot fix that with `docker network connect` if the overlay is non-attachable. See **[docs/AUDIT-502.md](docs/AUDIT-502.md) §2.A** for an example `docker stack deploy` fragment.

**Local Docker with a host port:** `docker compose -f docker-compose.yml -f docker-compose.local.yml up --build` → http://localhost:3000

### Cloudflare shows **502 Bad Gateway**

Usually Traefik can’t reach the app container (wrong Docker network, unhealthy LB, or **Host** mismatch). **Confirm:** `docker inspect <traefik_container>` lists network **`traefik-public`** — not only a project bridge (e.g. `something_something`).

**Cloudflare audit (API + optional tunnel):** with a read-only API token, run **`./scripts/audit-cloudflare.sh`** (see [docs/AUDIT-502.md §4](docs/AUDIT-502.md)) — DNS, SSL mode, paused zone, `cloudflared tunnel list` if installed.

**Full Swarm + Traefik + origin probe:** on the manager, **`./scripts/diagnose-502.sh`** (save output: `tee /tmp/502-diagnostic.log`) — see [docs/AUDIT-502.md](docs/AUDIT-502.md) “Full stack terminal bundle”.

1. **`traefik.docker.network=traefik-public`** — required in `docker-compose.yml` when the service joins `traefik-public`. Without it, Traefik often routes to the wrong interface → **502**. Redeploy after pulling latest: `./scripts/cluster-deploy.sh`.
2. **Traefik `Host()` rule** must match the browser hostname (`luke-the-duke.com` / `www`).
3. **Tasks running:** `docker service ps portfolio_portfolio --no-trunc` — want **Running**, not **Rejected**.
4. **Reachability:** Swarm overlays are often **not attachable**, so `docker run --network traefik-public` may fail. Prefer **`docker exec` into a portfolio task:**  
   `docker exec "$(docker ps -q -f name=portfolio_portfolio | head -1)" wget -qO- http://127.0.0.1:3000/api/health`  
   Optional: from Traefik’s network namespace, curl the service **VIP** (not the hostname — Traefik often can’t resolve Swarm DNS):  
   `VIP=$(docker service inspect portfolio_portfolio --format '{{(index .Endpoint.VirtualIPs 0).Addr}}' | cut -d/ -f1); docker run --rm --network container:$(docker ps -q -f name=traefik | head -1) curlimages/curl:latest -sS -o /dev/null -w "%{http_code}" "http://${VIP}:3000/api/health"`  
   Expect **200**. See **[docs/AUDIT-502.md](docs/AUDIT-502.md)**.
5. **Logs:** `docker service logs portfolio_portfolio --tail 80` and Traefik logs.
6. **Cloudflare SSL/TLS:** **Full** or **Full (strict)** toward origin; try **DNS only** (grey cloud) briefly to see if the issue is Cloudflare-specific.
7. If Traefik marks backends unhealthy, temporarily remove the **`traefik.http.services.portfolio.loadbalancer.healthcheck.*`** labels and redeploy to see if 502 clears (then re-add with a longer timeout).

**Git on the server:** use `git pull --rebase origin main` or `git config pull.rebase true` once so pulls don’t ask how to reconcile branches.

**Cluster / Docker:** put a `.env` next to `docker-compose.yml` (e.g. `~/portfolio-hub/.env`) with at least:

```bash
GITHUB_TOKEN=ghp_...   # fine-grained or classic PAT; enables private repos + stable /now Activity
```

`docker compose` passes it into the build and runtime (see `docker-compose.yml`). Without it, the site still builds, but **`/now` may show no commit dates** and enrichment falls back to public API limits. Rebuild after changing `.env`:

```bash
docker compose build portfolio && docker push ghcr.io/duketopceo/portfolio-hub:latest && docker service update --force --with-registry-auth --image ghcr.io/duketopceo/portfolio-hub:latest portfolio_portfolio
```

### One-command deploy on the Swarm manager

From the repo on the server (e.g. `~/portfolio-hub`), with `.env` beside `docker-compose.yml`:

```bash
chmod +x scripts/cluster-deploy.sh   # once
./scripts/cluster-deploy.sh
```

This **fetch + `reset --hard origin/main`**, **`docker compose build`**, **`docker push`** to **`ghcr.io/.../latest`** (so worker nodes can pull the image), **`docker stack deploy`**, then **`docker service update --force --with-registry-auth`** on **`portfolio_portfolio`** (retries if Swarm reports “update out of sequence”). Override **`STACK_NAME`** / **`SERVICE_NAME`** if your stack differs.

**Multi-node Swarm — tasks fail with `No such image: ghcr.io/.../latest` on a worker:** the image only existed on the manager after `docker compose build`. Workers must pull from the registry — **`docker push`** on the manager (after **`docker login ghcr.io`** with a PAT that has `write:packages`). The script pushes by default. **`--with-registry-auth`** on `service update` forwards your registry login so workers can pull private images. To skip push (single-node / image already everywhere): `SKIP_PUSH=1 ./scripts/cluster-deploy.sh`.

**Swarm message `image ... could not be accessed on a registry to record its digest`:** common during `docker stack deploy` even when **`docker push`** just succeeded. The manager sometimes doesn’t pin the digest in the spec; each node still resolves **`latest`** when starting tasks. Safe to ignore if push completed and **`docker service ps`** shows tasks **Running**.

**If `docker stack deploy` fails with “port 3000 already in use”:** an old service (often named `portfolio`) is still publishing that port. List: `docker service ls`. Remove the stale one after confirming it’s safe: `docker service rm portfolio`, then run `./scripts/cluster-deploy.sh` again. With the current `docker-compose.yml` (no host `ports`), new deploys won’t grab `:3000` on the host.

**502 Bad Gateway (full audit):** **[docs/AUDIT-502.md](docs/AUDIT-502.md)** — Traefik network, healthchecks, Cloudflare TLS, DNS vs tunnel.

### Option B: Vercel

```bash
npm i -g vercel
vercel --prod
```

Set `GITHUB_TOKEN` in Vercel's environment variables (Project Settings → Environment Variables).

### Option C: Cloudflare Pages

```bash
# Build
npm run build

# Deploy via wrangler or Cloudflare dashboard
# Point to the .next output
```

## Configuring Subdomains

The `src/data/deployments.ts` file maps projects to their live URLs and subdomains.

### DNS Setup (Cloudflare)

For each deployed app, create an A or CNAME record in Cloudflare:

| Type  | Name      | Content       | Proxy |
|-------|-----------|---------------|-------|
| A     | portfolio | `<swarm-ip>`  | Yes   |
| A     | atlas     | `<swarm-ip>`  | Yes   |
| A     | osint     | `<swarm-ip>`  | Yes   |
| A     | skyguard  | `<swarm-ip>`  | Yes   |

### Traefik Routing (Docker Swarm)

Each service in your Swarm gets routing labels:

```yaml
deploy:
  labels:
    - "traefik.http.routers.myapp.rule=Host(`myapp.yourdomain.com`)"
    - "traefik.http.routers.myapp.entrypoints=websecure"
    - "traefik.http.routers.myapp.tls.certresolver=cloudflare"
```

### Vercel/Cloudflare Pages Subdomains

Add custom domains in the platform dashboard, then point DNS CNAME records to the platform's hostname.

## CI/CD

The GitHub Actions workflow (`.github/workflows/deploy.yml`):

1. **On push to `main`:** Builds Docker image → pushes to GHCR → SSH deploys to Swarm
2. **Daily cron (6am UTC):** Rebuilds to refresh GitHub API data
3. **Manual trigger:** Available via `workflow_dispatch`

### Required GitHub Secrets

| Secret         | Description                                |
|---------------|--------------------------------------------|
| `GH_PAT`      | GitHub PAT with `repo` scope (for private repos) |
| `SWARM_HOST`   | Swarm manager IP/hostname                   |
| `SWARM_USER`   | SSH user on Swarm manager                   |
| `SWARM_SSH_KEY` | SSH private key for Swarm manager          |

## API

`GET /api/repos` returns JSON:

```json
{
  "count": 15,
  "updated": "2026-03-10T20:00:00.000Z",
  "projects": [
    {
      "slug": "trading-bot",
      "name": "TradingBot",
      "tagline": "AI-powered algorithmic trading system",
      "category": "finance",
      "type": "app",
      "language": "Python",
      "techStack": ["Python", "ML", "REST APIs"],
      "stars": 0,
      "forks": 0,
      "lastUpdated": "2026-02-19T03:27:04Z",
      "liveUrl": null,
      "subdomain": null,
      "private": true
    }
  ]
}
```
