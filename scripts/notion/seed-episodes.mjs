#!/usr/bin/env node
/**
 * Idempotent seed: creates Notion DB rows for episodes in
 * public/podcast/tools/notion/seed-pages.json when no row with that Episode# exists.
 *
 * Requires: NOTION_API_KEY, NOTION_AI_BRAIN_DATABASE_ID
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const SEED_PATH = join(
  REPO_ROOT,
  "public",
  "podcast",
  "tools",
  "notion",
  "seed-pages.json"
);

const NOTION_VERSION = "2022-06-28";
const API = "https://api.notion.com/v1";

function richText(content) {
  if (!content) return [];
  const parts = [];
  const s = String(content);
  for (let i = 0; i < s.length; i += 1900) {
    parts.push({
      type: "text",
      text: { content: s.slice(i, i + 1900) },
    });
  }
  return parts;
}

function notionHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

async function queryEpisode(token, databaseId, episodeNum) {
  const res = await fetch(`${API}/databases/${databaseId}/query`, {
    method: "POST",
    headers: notionHeaders(token),
    body: JSON.stringify({
      filter: {
        property: "Episode",
        number: { equals: episodeNum },
      },
      page_size: 1,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`query failed ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.results || [];
}

async function createPage(token, databaseId, row) {
  const properties = {
    Name: { title: richText(row.name) },
    Episode: { number: row.episode },
    Status: { select: { name: row.status } },
    "Science pillar": { select: { name: row.sciencePillar } },
    "Science notes": { rich_text: richText(row.scienceNotes) },
    "Tech beat": { rich_text: richText(row.techBeat) },
    "Tech notes": { rich_text: richText(row.techNotes) },
    "History beat": { rich_text: richText(row.historyBeat) },
    "History notes": { rich_text: richText(row.historyNotes) },
    "Founder beat": { rich_text: richText(row.founderBeat) },
    "Founder notes": { rich_text: richText(row.founderNotes) },
    "TEMP — Perplexity": {
      rich_text: richText(row.tempPerplexityPointer),
    },
  };

  const res = await fetch(`${API}/pages`, {
    method: "POST",
    headers: notionHeaders(token),
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`create failed ${res.status}: ${body}`);
  }
  return res.json();
}

async function main() {
  const token = process.env.NOTION_API_KEY;
  const rawId = process.env.NOTION_AI_BRAIN_DATABASE_ID || "";
  const hex = rawId.replace(/-/g, "");
  const databaseId =
    /^[a-f0-9]{32}$/i.test(hex)
      ? `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
      : rawId;

  if (!token || !databaseId) {
    console.error(
      "Missing NOTION_API_KEY or NOTION_AI_BRAIN_DATABASE_ID. See scripts/notion/README.md"
    );
    process.exit(1);
  }

  const raw = readFileSync(SEED_PATH, "utf8");
  const rows = JSON.parse(raw);
  if (!Array.isArray(rows)) {
    console.error("seed-pages.json must be an array");
    process.exit(1);
  }

  for (const row of rows) {
    const existing = await queryEpisode(token, databaseId, row.episode);
    if (existing.length > 0) {
      console.log(`Skip episode ${row.episode} — row already exists`);
      continue;
    }
    const page = await createPage(token, databaseId, row);
    console.log(`Created episode ${row.episode} → ${page.id}`);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
