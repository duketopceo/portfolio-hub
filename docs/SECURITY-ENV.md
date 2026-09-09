# Environment & GitHub token

## `GITHUB_TOKEN`

- **Used only on the server** (`src/lib/github.ts` via `process.env.GITHUB_TOKEN`). It is **not** prefixed with `NEXT_PUBLIC_`, so it is **never** bundled for the browser.
- **Local dev:** `npm run dev` loads `.env`, `.env.local`, etc. from the repo root (see [Next.js env loading](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)).
- **Docker build (local):** `GITHUB_TOKEN` may be passed as a **build-arg** from `docker-compose.yml` — it is **not** copied from disk into the image context because **`.env*` is listed in `.dockerignore`**. That avoids baking secrets into layer metadata from accidental `COPY`.
- **CI build:** No token is passed at build time; the image builds without a GitHub token and falls back to curated/public data.
- **Docker runtime:** Set `GITHUB_TOKEN` in the environment of the running container (e.g. `environment:` in Compose, Swarm secrets, or your host `~/portfolio-hub/.env` read by Compose when you deploy).

## Other names (values never in git)

| Name | Where it is used |
|------|------------------|
| `GITHUB_USER` | Server GitHub login fallback (`src/lib/github.ts`) |
| `SWARM_HOST` | Deploy workflow |
| `SWARM_USER` | Deploy workflow |
| `SWARM_SSH_KEY` | Deploy workflow |

These names are listed so operators know what to set. Do not paste values into this file or into client JavaScript.

## Do not commit secrets

- `.gitignore` ignores `.env*` except `.env.example` (template only).
- Verify with: `git ls-files | grep -E '\.env$|\.env\.local'` — should print **nothing**.
- If a token was ever committed, **revoke it** in GitHub → Settings → Developer settings → Tokens and create a new one.

## `CLOUDFLARE_API_TOKEN` (optional)

- **Not used by the Next.js app.** Only for **`scripts/audit-cloudflare.sh`** (DNS + SSL audit from your laptop or a manager node).
- Use a **restricted** API token: Zone Read, DNS Read, Zone Settings Read. Do not commit the real value.

## Files

| File           | Commit to git? | Purpose                                      |
|----------------|----------------|----------------------------------------------|
| `.env.example` | Yes            | Template; no real token                      |
| `.env`         | **No**         | Your real token (local or server only)      |
| `.env.local`   | **No**         | Local overrides (often gitignored by `.env*`) |
