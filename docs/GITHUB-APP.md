# GitHub App — Cosmic Intelligence (portfolio-hub backend)

Server-only authentication for GitHub API calls. **Visitors never OAuth.** There is no “sign in with GitHub to see private source.”

## Why

The site enriches curated project dossiers and a **live/daily activity showcase** with metadata for public and private repos Luke installs the app on:

- **Homepage:** compact last-7-days digest (5–10 lines) across featured projects — PRs opened/merged, reviews, releases, issues started/finished; day counts when multiple repos active
- **Dossiers:** per-repo timelines (opened, reviewed, merged, released, started, finished) with day counts — public repos link to GitHub; private repos show scrubbed summaries only

Private file trees, READMEs, diffs, and commit bodies stay off the client except **`SHOWCASE.md`** at repo root (allowlisted server fetch).

## Fallback order

1. **GitHub App** — `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_APP_INSTALLATION_ID`
2. **`GITHUB_TOKEN`** — classic/fine-grained PAT (existing behavior)
3. **Curated-only** — pages still render; activity sections show empty/fixture in tests

Activity responses are cached via Next.js ISR (`revalidate: 3600` — hourly).

## Create the app (Luke — one-time)

1. GitHub → **Settings** → **Developer settings** → **GitHub Apps** → **New GitHub App**
2. **Name:** `Cosmic Intelligence` (or similar)
3. **Homepage URL:** `https://luke-the-duke.com` (or Railway URL when attached)
4. **Webhook:** inactive (not required for metadata reads)
5. **Permissions (repository):**
   - **Metadata:** Read
   - **Contents:** Read (public README + private `SHOWCASE.md` allowlist only)
   - **Pull requests:** Read (activity timelines)
   - **Issues:** Read (started/finished events on timelines)
   - **Checks:** Read (CI summary on dossiers)
6. **Where can this app be installed?** Only on this account
7. Create the app → note **App ID**
8. Generate a **private key** (PEM) — store in Railway Variables, never commit

## Install on `duketopceo`

1. App settings → **Install App** → select **duketopceo**
2. **Repository access:** select portfolio repos (Khan, Pace-Server, kurultai, openrouter-demos, etc.)
3. Note **Installation ID** from the URL:  
   `https://github.com/settings/installations/<INSTALLATION_ID>`

## Environment variables

Set in Railway → **portfolio-hub** → **Variables** (see `.env.example`):

| Variable | Description |
| --- | --- |
| `GITHUB_APP_ID` | Numeric App ID |
| `GITHUB_APP_INSTALLATION_ID` | Installation ID for duketopceo |
| `GITHUB_APP_PRIVATE_KEY` | PEM private key (use `\n` escapes or multiline secret) |

Optional legacy fallback: `GITHUB_TOKEN`, `GITHUB_USER` (defaults to `duketopceo`).

Test-only: `ACTIVITY_USE_FIXTURES=1` forces fixture activity data (used in Vitest).

## Security rules (code-enforced)

- Tokens and private keys never sent to the browser
- Private repo README / file trees / commit message dumps not rendered client-side
- Activity titles run through `src/lib/activity-scrubber.ts` (emails, tokens, Bartlett identifiers, secret paths)
- Private repos: no GitHub PR deep-links — dossier links only
- Only **`SHOWCASE.md`** at repository root may be fetched for private repos

## PR #18 note

Open PR [#18](https://github.com/duketopceo/portfolio-hub/pull/18) modularizes the catalog into `src/data/projects/catalog/*`. **This branch keeps the monolithic `projects.ts`** and supersedes #18 for dossier + activity work until Luke merges one path deliberately. Do not auto-merge #18 from cloud agents.
