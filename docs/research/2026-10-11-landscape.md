# Landscape: engineer portfolio sites (2026-10-11)

Scope: how comparable personal engineering portfolios present work, and what is
distinct about portfolio-hub. Pages were not re-fetched for this pass; claims
describe each site's publicly visible approach and should be re-verified before
being quoted externally.

| Project | URL | Does well | Does worse than portfolio-hub |
|---|---|---|---|
| Brittany Chiang v4 | https://brittanychiang.com | Single-column scroll, clear role/employer list, fast | Text-only project proof; no per-project evidence pages |
| Lee Robinson | https://leerob.com | Writing-first, very fast, simple | Projects are secondary; little system/architecture depth |
| Rauno Freiberg | https://rauno.me | Craft-level interaction detail, restraint | Few projects documented with decisions and outcomes |
| Paco Coursey | https://paco.me | Minimal, typographic, dense links | No catalog or filtering for a large body of work |
| Bruno Simon | https://bruno-simon.com | Memorable WebGL experience | Content is hard to scan; meaning lives in the canvas |
| GitHub profile README / pinned repos | https://github.com/duketopceo | Zero maintenance, always current | No narrative, private work invisible |

## What users (recruiters, collaborators) expect
Fast load, a clear hire path, a scannable list of work, and proof per project.
portfolio-hub already encodes this: `/hire`, `/resume` plus `/resume.json` and
`/resume.md`, `/projects` registry, per-project dossiers (`BRAND.md` evidence standard).

## What is unique here
1. Curated dossiers with a publish-safe evidence package for private repos
   (`scripts/check-privacy.mjs` guards it).
2. WebGL is progressive enhancement only; semantic HTML carries meaning (BRAND.md
   Motion section), avoiding the Bruno Simon failure mode.
3. Mechanical design guardrails (`scripts/check-design-system.mjs`) and visual
   baselines (`tests/visual/`), unusual for a personal site.
4. Machine-readable surface: `public/llms.txt`, `/resume.json`, `/api/repos`.

## Gaps vs the field
- No writing/changelog feed (leerob, brittanychiang link blog posts).
- Activity API routes have no in-app consumer (README notes this).
- Catalog is hand-edited (`src/data/projects.ts`, ~1k+ lines); no validation
  beyond tests.
