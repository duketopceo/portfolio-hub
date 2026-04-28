# Deploy podcast assets to production (Docker)

The Next app serves static files from `public/` at the same origin. After you merge to the branch your Swarm (or host) builds from:

## 1. Build the container image

From the repo root (same `Dockerfile` as the main site):

```bash
docker build \
  --build-arg GITHUB_TOKEN="${GITHUB_TOKEN}" \
  -t portfolio-hub:latest \
  .
```

`GITHUB_TOKEN` is only needed if your `npm run build` must call GitHub during the image build; runtime token is separate.

## 2. Push and restart

Tag and push the image your registry expects, then restart the stack service that runs this image, for example:

```bash
docker service update --force <stack>_web
```

or your compose `docker compose up -d --build` workflow.

## 3. Verify podcast routes

- `https://<your-domain>/podcast` — EP009 companion (scroll page)
- `https://<your-domain>/podcast/live` — Mission Control (pages + `current.json`)
- `https://<your-domain>/podcast/episodes/current.json` — episode data (must not 404)

## Descript recording

- Mission: append **`?descript=1`** or set `localStorage.mc_descript = "1"` then reload.
- EP009: **`/podcast/index.html?descript=1`** (same `mc_descript` flag).

This reserves right/bottom padding and softens overlays to reduce shimmer with screen + face capture.
