# Project catalog SOP

How to add a **29th** (or any new) repository to portfolio-hub without guessing orbit placement, privacy rules, or dossier fields.

## 1. Add the entry in `src/data/projects.ts`

Append one object to the `projectConfigs` array. Required fields:

| Field | Purpose |
|--------|---------|
| `slug` | URL path `/projects/<slug>` — kebab-case, unique |
| `repoName` | GitHub repo name under `duketopceo/` (omit only for `siteOnly` entries) |
| `displayName` | Human title on cards and dossiers |
| `tagline` | One line under the title (≤ ~120 chars) |
| `description` | Dossier “What it is” paragraph — factual stack and scope |
| `category` | `finance` \| `ai` \| `osint` \| `data` \| `infra` \| `apps` |
| `type` | `platform` \| `app` \| `experiment` \| `infra` |
| `featured` | `true` = **primary homepage orbit** (max 5 — see below); `false` = **secondary orbit** + catalog grid |
| `techStack` | string[] — shown in dossier backend section |
| `private` | `true` = scrubbed dossier, 🔒, no GitHub/PR deep links |

Optional but recommended:

- `liveUrl` / `demoUrl` / `embeddable` / `demoOffline` — production demo (see `src/lib/deployments.ts`)
- `highlights` — bullet cards on dossier
- `architecture` — one-line flow string
- `businessContext`, `scopeAndScale`, `engineeringDecisions`, `finishLine` — especially for **private** recruitment dossiers
- `siteOnly: true` — no GitHub repo; skip activity timeline fetch

### Featured vs orbit (do not confuse)

- **Primary orbit** (main planets): fixed list in `HOMEPAGE_FEATURED_SLUGS` inside `src/lib/project-completeness.ts` — currently Khan, Kurultai, Pace Server, OpenRouter Demos, Stratum Engine.
- **`featured: true`** in `projects.ts` should match that list (5 entries). Everything else is `featured: false` and appears on **secondary orbit(s)** via `getHomepageSecondaryOrbitProjects()`.
- To promote/demote a primary world: edit `HOMEPAGE_FEATURED_SLUGS` **and** flip `featured` flags — keep both in sync.
- Hero repo count uses `projectConfigs.length` — do not remove entries to “clean up.”

### Public vs private showcase

| | Public (`private: false`) | Private (`private: true`) |
|--|---------------------------|---------------------------|
| GitHub link on card/hero | Yes, if repo exists | Hidden |
| Activity timeline | Real titles + links when repo is public | Scrubbed labels, 🔒, no PR/issue URLs |
| README block | Fetched from GitHub | Hidden |
| Showcase markdown | N/A | Optional `showcase.md` in repo root (server fetch) |
| Private dossier sections | Standard | + Business context / scope / engineering decisions |

Every dossier uses the **same layout**: hero → condensed GitHub activity (chart + standout + grouped) → What it is → Backend → Production services → features → optional showcase/README.

Activity UI is shared (`ActivityCondensedPanel`); aggregation is in `src/lib/activity-aggregate.ts`.

## 2. Deployments (if live)

If the project has a public URL, add or verify an entry in `src/data/deployments.ts` (or env-driven config) so `isProjectLive()` and service tables stay accurate.

## 3. Verify locally

```bash
npm run test
npm run build
npm run dev
```

Check:

- `/projects/<slug>` — public **and** private render (private must not 404 or show raw GitHub links)
- Homepage — primary 5 in main orbit; new entry on secondary ring if `featured: false`
- `/projects` grid — card shows category, lock if private, live pill if deployed

## 4. Content guardrails (copy)

- Kurultai: Rust + axum + SQLite/FTS5/sqlite-vec + MCP — **not** TypeScript/PostgreSQL
- Do not claim Ollama/vLLM self-hosting or a GPU cluster on hire/home/resume surfaces
- Bartlett Roofing: ~200-person org — not “200+ projects”
- Pace remaining ~20%: tool execution + Python reasoning; platform (gateway, auth, Stripe) is live
- OpenRouter demos: `github.com/duketopceo/openrouter-demos` (Deflect, Motion, Bakeoff, Caesar)

## 5. No second sources of truth

- Catalog: **`src/data/projects.ts` only** — do not shrink the list for homepage aesthetics
- Orbit order (primary): **`HOMEPAGE_FEATURED_SLUGS`**
- Orbit order (secondary): completeness sort in `getHomepageSecondaryOrbitProjects()`
