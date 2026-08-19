# GitHub App — Cosmic Intelligence (portfolio-hub backend)

Server-only authentication for GitHub API calls. **Visitors never OAuth.** There is no “sign in with GitHub to see private source.”

## Why

The site enriches curated project dossiers with **metadata** (last push, language, CI/checks) for public and private repos Luke installs the app on. Private file trees, READMEs, and diffs stay off the client except **`SHOWCASE.md`** at repo root (allowlisted server fetch).

## Fallback order

1. **GitHub App** — `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_APP_INSTALLATION_ID`
2. **`GITHUB_TOKEN`** — classic/fine-grained PAT (existing behavior)
3. **Curated-only** — no live GitHub enrichment

## Create the app (Luke — one-time)

1. GitHub → **Settings** → **Developer settings** → **GitHub Apps** → **New GitHub App**
2. **Name:** `Cosmic Intelligence` (or similar)
3. **Homepage URL:** `https://luke-the-duke.com` (or Railway URL when attached)
4. **Webhook:** inactive (not required for metadata reads)
5. **Permissions (repository):**
   - **Metadata:** Read
   - **Contents:** Read (for `SHOWCASE.md` allowlist only)
   - **Checks:** Read (CI summary on dossiers)
6. **Where can this app be installed?** Only on this account
7. Create the app → note **App ID**
8. Generate a **private key** (PEM) — store in Railway Variables, never commit

## Install on `duketopceo`

1. App settings → **Install App** → select **duketopceo**
2. **Repository access:** select portfolio repos (Khan, Pace-Server, kurultai, etc.)
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

## Security rules (code-enforced)

- Tokens and private keys never sent to the browser
- Private repo README / file trees not rendered client-side
- Only **`SHOWCASE.md`** at repository root may be fetched for private repos
- Dossier activity strip exposes metadata summaries only
