# Podcast Mission Control — tool slots

Drop reusable **JSON fragments** and **notes** here. The **paginated** Mission dashboard reads **`/podcast/episodes/current.json`** at **`/podcast/live.html`** (aliases **`/podcast/mission`**, **`/podcast/live`**). The EP009 scroll companion stays at **`/podcast`** → `index.html`.

| File | Use |
|------|-----|
| `chart-bars-template.json` | Shape for `panels[].bars` (OHLC + `time` as `YYYY-MM-DD`). Paste into `current.json`. |
| `panel-presets.json` | Example `tiles`, `headlines`, `content`, `stratum` blocks. Merge into `pages[].panels`. |
| `notion/` | **AI Brain** — Notion DB spec, Ep 9 & Ep 10 **TEMP** Perplexity prompts, `seed-pages.json`, optional `npm run notion:seed`. |

## Swap workflow

1. Edit **`../episodes/current.json`** (episode meta, pages, panels).
2. For a new chart series: copy bars from `chart-bars-template.json`, replace values, set `symbol` + `interval` on the chart panel.
3. To try an alternate layout: duplicate a `pages[]` entry and change `layout` (`page--chart-sidebar`, `page--focus`, etc. — see `style.css`).
4. Optional: keep archived episodes as `episodes/ep8.json` and symlink or swap filename to `current.json` before show.

## Panel `type` values

`chart` · `tiles` · `headlines` · `content` · `stratum` · `feed` (needs `channelId` for YouTube RSS)
