# Notion API helper (optional)

Push **Ep 9 / Ep 10** stub rows into your AI Brain database without using Cursor MCP.

## Prerequisites

1. Create a [Notion integration](https://www.notion.so/my-integrations) (internal), copy the **Internal Integration Secret**.
2. Create the database using **`public/podcast/tools/notion/database-spec.md`**, then **Share** the database page with your integration (Invite → select the bot).
3. Copy the database ID from the URL:  
   `https://www.notion.so/workspace/`**`a1b2c3d4e5f6478980abcdef12345678`**`?v=...`  
   (32 hex chars, with or without dashes).

## Environment

Set in your shell (or `.env.local` is **not** loaded by this script—export manually):

```bash
export NOTION_API_KEY="secret_..."
export NOTION_AI_BRAIN_DATABASE_ID="a1b2c3d4e5f6478980abcdef12345678"
```

## Run

From repo root:

```bash
node scripts/notion/seed-episodes.mjs
```

- **Idempotent:** if a row with the same **Episode** number already exists, that entry is skipped (existing cards stay untouched).
- Property names must match **`database-spec.md`** exactly (including **Science pillar** and **TEMP — Perplexity**).

## Cursor Notion MCP

Prefer MCP when authenticated: ask the agent to search or edit the same database using natural language. This script is for CI, headless, or when MCP is unavailable.
