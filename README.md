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
│   │   ├── now/page.tsx        # /now — Recently active projects
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
- Health check on `/api/repos` (image includes `wget` so Swarm healthchecks work on Alpine)
- Connection to `traefik-public` overlay network

**Local Docker with a host port:** `docker compose -f docker-compose.yml -f docker-compose.local.yml up --build` → http://localhost:3000

### Cloudflare shows **502 Bad Gateway**

Usually origin (Traefik → app) isn’t healthy or the **Host** header doesn’t match Traefik’s rule.

1. **Traefik `Host()` rule** must match what users type (e.g. apex vs `www`). Update labels and redeploy: `docker stack deploy -c docker-compose.yml portfolio`.
2. **Service health:** `docker service ps portfolio_portfolio --no-trunc` — failed tasks often mean the container healthcheck failed (fixed in Dockerfile by installing `wget`).
3. **Logs:** `docker service logs portfolio_portfolio --tail 100`
4. **Cloudflare SSL/TLS:** origin must use a valid cert Traefik presents — mode **Full (strict)** if Let’s Encrypt on the server is working.
5. **DNS** should point to the Swarm/Traefik IP (orange cloud proxied or grey “DNS only” for debugging).

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
