# Star Chart Redesign — Plan & Repo Audit

> Date: 2026-09-11 · Branch: `feat/star-chart-redesign`
> Direction lock: **Star Chart** (neo-industrial orbital survey), teal retained as single signal accent.
> Reference: Brass Hands / Kyle Anthony Miller — monochrome, hairline grids, mono microcopy, catalog numbers, redacted type, squared corners.

---

## 1. Design decision ledger

| Decision | Choice | Source |
|---|---|---|
| Visual language | Declassified orbital survey / star chart | Brass Hands neo-industrial × existing orbit/quadrant/dossier IA |
| Palette | Near-black, off-white, gray scale; teal `#2DD4BF` for live/interactive only | Brand continuity, role tightened |
| Type | Archivo (variable; expanded weights for display) + JetBrains Mono for all meta/labels | Neo-industrial grotesk + technical mono; replaces Inter + Source Code Pro |
| Surfaces | 1px hairlines, 0–2px radius, no glass blur, no soft shadows | Anti-slop: kill rounded glass cards |
| Texture | Blueprint grid + coordinate ticks + sparse sharp stars + subtle dither/noise | Star chart, not nebula blobs |
| Signature details | Catalog numbers (`CI-01`…), corner registration marks, `FIELD OPERATION: ACTIVE` status line, redacted `████` blocks on private dossiers | Brass Hands microcopy + existing Classified Dossier concept |
| Rejected | Phosphor/scanline HUD (costume), calm editorial serif (wrong product), indigo/violet, emoji icons | Refero anti-slop guide |

## 2. Repo audit — 86 repos, scored

Rubric: **Story** (narrative value to recruiters/founders), **Proof** (code depth, completeness, demo), **Visibility** (public-ready). Verdicts: `LEAD` (homepage orbit), `COLLECTION` (product family), `CATALOG` (listed), `CASE` (private case study), `EXCLUDE` (noise), `FIX` (broken).

### Tier 1 — Lead systems

| Repo | Vis | Story | Proof | Verdict | Notes |
|---|---|---|---|---|---|
| kurultai | pub | A+ | A | **LEAD** | Rust knowledge brain, MCP, 3D graph. Current lead — confirmed. |
| Pace-Server | priv | A | A | **LEAD** | Private cloud for SMBs. Flagship commercial system — dossier stays classified. |
| Khan | priv | A | A- | **LEAD** | Agent harness: Temporal + LiteLLM + MCP + Rust CLI. |
| Argus | pub | A | B+ | **LEAD** | Vision-model E2E harness, "open TestDriver alternative". NEW — missing from catalog. |
| omarchy-browser | pub fork | A- | A | **LEAD** | Chromium fork, agentic browser. Fork flag undersells it — present as build. |
| orchestral | pub | B+ | B | **CATALOG→LEAD?** | Eval harness w/ real research question. NEW — missing. |
| crucible | pub | ? | ? | **AUDIT** | No description. NEW — inspect before cataloging. |

### Tier 2 — The Omarchy Collection (all public, all missing from catalog)

| Repo | Lang | Verdict |
|---|---|---|
| omarchy-plugins | QML | **COLLECTION** — umbrella catalog |
| omarchy-fan | Python | COLLECTION — thermals/fan presets |
| omarchy-ticker | QML | COLLECTION — market ticker |
| omarchy-standby | QML | COLLECTION — nightstand overlay |
| omarchy-nexus | QML | COLLECTION — hardware topology radar |
| omarchy-agents | QML | COLLECTION — agent usage/limits panel |
| omarchy-port-forward-plugin | QML | COLLECTION (fork) — SSH tunnel toggles |
| OmaSeal | Go | COLLECTION — keyring manager |
| blip | TS fork | COLLECTION — iMessage via Mac gateway |
| dayflow-linux | Go | COLLECTION — auto work journal, vision models |
| dayflow-screenshots | Python | COLLECTION — screenshot indexer |

**The single strongest untold story on the account:** a coherent, shipped, 11-repo product line for one platform. Individually B-tier; as a named collection it's A-tier proof of product range. Gets its own route.

### Tier 3 — Client / production work (showcase as case studies, never open-source)

| Repo | Verdict |
|---|---|
| bartlett-permits | CASE — permit ops platform, production |
| Bartlett-server-001 | CASE — infra + CF Access routing |
| bartlett-data-platform | CASE — agentic data platform |
| BartlettBot (SkyGuard) | CASE — production AI assistant |

### Tier 4 — Catalog (already curated, keep)

openrouter-demos, nanoclaw, open-military-hardware-db (3★ — most-starred repo), republic-atlas, ai-debate-arena, Dixi, ETL-Pipeline, FinanceFrenzy, QuizTheBest, Collaborative-essay, rork-chronicle-weaver, kurultai_people, openrouter_usage, a0-plugins, pinetree-solari-demo, keytypist, homelab (private, infra cred), luke-agents (private).

### Open-source candidates (private → public, requires scrub)

| Repo | Verdict | Gate |
|---|---|---|
| harbor-openrouter-ios-client | **OPEN** ✅ | BYOK app, low risk — final secrets pass |
| helm-qmk-macropad | **OPEN** ✅ | CAD + firmware + working build — hardware OSS lands well |
| pixel-tycoon | **OPEN** ✅ | Godot game, zero risk |
| Luke-the-Duke-Blogger | **OPEN** ✅ | Next.js/Firebase blog, check Firebase config |
| dotfiles | OPEN ⚠️ | Secrets/paths audit first — chezmoi helps |
| mac-setup | OPEN ⚠️ | Same — provisioning scripts |
| portfolio-hub | OPEN ⚠️ | Meta-flex (the site shows its own source) — audit deploy notes + luke-agents references first |
| luke-agents | JUDGEMENT ⚠️ | Agent constitution is shareable content, but check for personal workflow detail |

### Keep private / exclude

- **Never public:** all `bartlett-*` (client IP), `kurultai-private` (deploy config), `homelab` + `openclaw-macmini-hardened` (infra topology = attack-surface map), `obsidian-notes`, `gpu-hosting`, `minecraft-vanilla-plus`, `garageboys`, `imlukethedukeblog`, `void-sleep`, `Ambition_Incorporated`, `project-atlas`, `Zer_solutions`, `TradingBot`, `AlphaHedge-*`, `ibkr-portfolio-dashboard`, `series65-study-app`, `lukethedukeshow` (review later).
- **Forks w/o changes / list repos:** public-apis, awesome-design-md, solari-cookbook, C-Plus-Plus--hysics, resume-er — EXCLUDE from catalog (already excluded by absence; keep excluded).
- **Phantoms to fix:** `stratumhq` (catalog slug `stratum-hq`, **featured on homepage orbit**, repo does not exist — either create it, or it's `crucible` renamed), `nem-stock-pitch` (no repo — remove entry or add repo).

## 3. Full route map

```
/                     MISSION CONTROL — status strip + plotted star chart of lead
                      systems (CI-01…CI-05), live summary stats, telemetry teaser
/systems              THE CATALOG — full registry, indexed + numbered, sector map
                      (current /projects, incl. quadrant → sector chart)
/systems/[slug]       SURVEY FILE — Observatory view (public) or Classified
                      dossier (private, redacted blocks)
/collections/omarchy  THE OMARCHY COLLECTION — instrument panel for the 11-repo
                      product family (new; later: /collections/[slug])
/telemetry            TRANSMISSION LOG — live GitHub activity (current /now)
/openrouter           LIVE DEMOS — working demo surface (unchanged concept)
/record               SERVICE RECORD — resume (current /resume)
/contact              UPLINK — comms; absorbs /hire CTA
/about                OPERATOR FILE — bio
/podcast              standalone (existing carve-out, untouched)
/api/*, /resume.json, /resume.md, /sitemap.xml  unchanged
```

Renames ship with `permanent` redirects in `next.config.ts`: `/projects → /systems`, `/now → /telemetry`, `/resume → /record`, `/hire → /contact`.

## 4. Signature build items (the "11/10" list)

1. **Status bar** — persistent top strip: `FIELD OPERATION: ACTIVE · live UTC clock · coordinates` — Brass Hands signature adapted.
2. **Star chart hero** — homepage is the chart: lead systems plotted with catalog designations, constellation hairlines, crosshair reticle, margin coordinates.
3. **Registry numbering** — every project gets `CI-NN`; dossiers read `SURVEY FILE — CI-07`.
4. **Classified dossiers** — private repos render redacted `████` blocks (lands rebrand-plan §18B with real design language).
5. **Omarchy Collection page** — product family as an instrument panel.
6. **Dither/noise texture** — bitmap-feel grain via tiny SVG/data-uri, replacing blur/glass.
7. **Registry footer** — footer becomes the full printed index of the site.

## 5. Execution order

- **P0** Foundation: globals.css token rewrite, fonts (Archivo + JetBrains Mono), star-chart background (grid + sharp stars + noise)
- **P1** Chrome: status-bar header, registry footer
- **P2** Home: star-chart hero, lead systems, activity teaser
- **P3** /systems catalog + sector map; /systems/[slug] dossiers (observatory + classified)
- **P4** /collections/omarchy, /telemetry, /record, /about, /contact (+ redirects)
- **P5** Data audit fixes: catalog adds (Argus, orchestral, crucible, Omarchy suite, blip, keytypist…), phantom cleanup (stratumhq, nem-stock-pitch), open-source scrubs as separate tasks
- **P6** BRAND.md v2, sitemap, verify: lint/build/test + visual pass at 375/768/1440
