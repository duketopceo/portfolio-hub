# Notion · Mission Control AI Brain

Use Notion as the **durable episode archive** (each episode = one row/card that stays forever). Add new rows for new episodes; never delete old ones—archive or use a **Status** select instead.

## Cursor Notion MCP

1. **Settings → MCP → Notion** (workspace plugin) and complete sign-in.
2. When the server shows as needing auth, run the **`mcp_auth`** tool once for `plugin-notion-workspace-notion` (empty `{}`).
3. After auth, ask the agent in natural language to *append or edit rows* in your AI Brain database (search, create page, etc. use the live tool list from Cursor).

This repo also ships **copy-paste specs** and **TEMP Perplexity prompts** under this folder so you can work without MCP.

## Create the database (once)

1. In Notion, new **database** (full page or inline).
2. Add properties exactly as in **`database-spec.md`** (names matter for the optional seed script).
3. Set a **Gallery** or **Board** view; group by **Episode** or **Status** so each episode reads as a card.

## Files here

| File | Purpose |
|------|---------|
| `database-spec.md` | Property names + types for the AI Brain DB |
| `SESSION-FRAMEWORK.md` | How each episode uses Science / Tech / History / Founder |
| `TEMP-perplexity-ep9.md` | **TEMP** — copy into Perplexity before filming Ep 9; delete from Notion after research |
| `TEMP-perplexity-ep10.md` | **TEMP** — same for Ep 10 (staged framework) |
| `seed-pages.json` | Machine-readable stubs for `scripts/notion/seed-episodes.mjs` |

## Optional: API seed from this repo

If you prefer pushing rows without MCP, see **`../../../scripts/notion/README.md`** (`NOTION_API_KEY`, `NOTION_AI_BRAIN_DATABASE_ID`).
