# Portfolio Hub

Meta-portfolio site that aggregates GitHub repos into a curated, categorized project showcase. Built with Next.js 16, TypeScript, and Tailwind CSS.

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
│   │   ├── Header.tsx          # Sticky nav + dark mode toggle
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
- Traefik routing labels for `portfolio.yourdomain.com`
- Health check on `/api/repos`
- Connection to `traefik-public` overlay network

**Edit the Traefik Host rule** in `docker-compose.yml` to match your actual domain.

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
