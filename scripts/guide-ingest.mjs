#!/usr/bin/env node
/**
 * Portfolio Guide corpus ingestion (phase 2).
 *
 * Builds the manifest (src/lib/guide), validates it, chunks every
 * retrievable entry, embeds with Workers AI, and upserts into the
 * Vectorize index `portfolio-guide-corpus`. Revoked/expired sourceIds are
 * swept from the index before re-upsert.
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=… node scripts/guide-ingest.mjs [--dry-run]
 *
 * Token needs Workers AI + Vectorize on the account. Pure REST — no
 * wrangler deploy required.
 */
import { createJiti } from "jiti";

const ACCOUNT_ID = "1661907b2d7e4a20800306e6a57844c5";
const INDEX = "portfolio-guide-corpus";
const MODEL = "@cf/baai/bge-base-en-v1.5"; // 768-dim
const EMBED_BATCH = 50;
const UPSERT_BATCH = 100;

const dryRun = process.argv.includes("--dry-run");
const token = process.env.CLOUDFLARE_API_TOKEN;

const jiti = createJiti(import.meta.url, {
  alias: { "@/": new URL("../src/", import.meta.url).pathname },
});
const { buildCorpusManifest } = await jiti.import(
  "../src/lib/guide/corpus-entries.ts",
);
const { validateManifest, retrievable, chunkEntry, EMBED_VERSION } =
  await jiti.import("../src/lib/guide/corpus-manifest.ts");

const manifest = buildCorpusManifest();
const errors = validateManifest(manifest);
if (errors.length) {
  console.error("manifest invalid:");
  for (const e of errors) console.error("  -", e);
  process.exit(1);
}
const live = retrievable(manifest);
const dead = manifest.filter((e) => !live.includes(e));
console.log(
  `manifest: ${manifest.length} entries, ${live.length} retrievable, ${dead.length} revoked/expired`,
);

const chunks = [];
for (const entry of live) chunks.push(...(await chunkEntry(entry)));
console.log(`chunks: ${chunks.length} (embedVersion ${EMBED_VERSION})`);

if (dryRun) {
  console.log("--dry-run: would embed + upsert", chunks.length, "vectors;");
  console.log("           would sweep", dead.map((e) => e.sourceId));
  process.exit(0);
}
if (!token) {
  console.error("CLOUDFLARE_API_TOKEN required (unless --dry-run)");
  process.exit(1);
}

const api = async (path, body) => {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  const data = await res.json();
  if (!data.success) {
    throw new Error(`${path}: ${JSON.stringify(data.errors)}`);
  }
  return data.result;
};

// Embed in batches.
const bySource = Object.fromEntries(live.map((e) => [e.sourceId, e]));
const records = [];
for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
  const batch = chunks.slice(i, i + EMBED_BATCH);
  const out = await api(`/ai/run/${MODEL}`, {
    text: batch.map((c) => c.text),
  });
  if (!out?.data || out.data.length !== batch.length)
    throw new Error(`embed batch ${i}: bad response ${JSON.stringify(out)}`);
  for (const [j, c] of batch.entries()) {
    const src = bySource[c.sourceId];
    records.push({
      id: c.chunkId,
      values: out.data[j],
      metadata: {
        sourceId: c.sourceId,
        scope: src.scope,
        class: src.corpusClass,
        title: src.title,
        url: src.url,
        embedVersion: c.embedVersion,
        text: c.text.slice(0, 2048), // citation snippet
      },
    });
  }
  console.log(`embedded ${Math.min(i + EMBED_BATCH, chunks.length)}/${chunks.length}`);
}

// Upsert in batches (NDJSON endpoint).
for (let i = 0; i < records.length; i += UPSERT_BATCH) {
  const batch = records.slice(i, i + UPSERT_BATCH);
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/vectorize/v2/indexes/${INDEX}/upsert`,
    {
      method: "POST",
      body: batch.map((r) => JSON.stringify(r)).join("\n"),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-ndjson",
      },
    },
  );
  const data = await res.json();
  if (!data.success)
    throw new Error(`upsert ${i}: ${JSON.stringify(data.errors)}`);
  console.log(`upserted ${Math.min(i + UPSERT_BATCH, records.length)}/${records.length}`);
}

// Sweep revoked/expired sources — chunkIds are deterministic
// (`<sourceId>#<n>`), so chunk the dead entries and delete those ids.
const deadIds = [];
for (const e of dead) {
  for (const c of await chunkEntry(e)) deadIds.push(c.chunkId);
}
if (deadIds.length) {
  await api(`/vectorize/v2/indexes/${INDEX}/delete_by_ids`, { ids: deadIds });
  console.log(`swept ${deadIds.length} stale vectors`);
}
console.log("done.");
