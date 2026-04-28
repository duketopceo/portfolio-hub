# AI Brain database — property spec

Create these properties on a Notion database (name the database e.g. **Mission Control · AI Brain**). Exact **property names** match the optional seed script.

| Property name | Type | Notes |
|---------------|------|--------|
| **Name** | Title | e.g. `Episode 009 — working title` (Notion default title) |
| **Episode** | Number | `9`, `10`, … — unique per row; use for filters |
| **Status** | Select | Options: `Staged` · `Research` · `Recorded` · `Shipped` |
| **Science pillar** | Select | `Nuclear` · `Chemistry` · `Rockets` — pick **one** per episode |
| **Science notes** | Text | Facts, links, angles for the science beat |
| **Tech beat** | Text | One headline / company / product line |
| **Tech notes** | Text | Supporting research |
| **History beat** | Text | One historical parallel or era |
| **History notes** | Text | Supporting research |
| **Founder beat** | Text | One person or org to profile |
| **Founder notes** | Text | Supporting research |
| **TEMP — Perplexity** | Text | **Delete after research** — paste prompts or Perplexity output here |
| **Dashboard** | URL | Optional: link to `current.json` PR, show notes, or YouTube |

### Card discipline

- **Do not delete** episode rows when the show ships; set **Status** → `Shipped` and refresh **Name** with the final title.
- **Ep 10** starts as **Status** = `Staged` with empty beats filled only with placeholders until research closes.
