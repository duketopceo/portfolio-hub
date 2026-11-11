// Ranking snapshot (KTD1). Computes the extended score for every listed
// project and writes src/data/ranking-snapshot.json. Pages, tests and visual
// baselines read the snapshot, never live stars or the clock.
//
// Needs Node 22.18+ (native type stripping); CI checks staleness in vitest instead.
// Usage:
//   node scripts/rank-projects.mjs --refresh   fetch activity with the gh CLI, rewrite the snapshot
//   node scripts/rank-projects.mjs --rebuild   recompute scores from the stored inputs (no network) and rewrite
//   node scripts/rank-projects.mjs --check     recompute from the stored inputs; exit 1 on drift
//   node scripts/rank-projects.mjs --top 15    print the ranked slugs (no network)
//
// Only slugs and numbers are written or printed. Repo names, including
// private ones, never leave this script except inside the gh GraphQL call.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { catalogFileNames } from "./lib/catalog-files.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const catalogDir = join(root, "src/data/catalog");
const snapshotPath = join(root, "src/data/ranking-snapshot.json");

// Both files are import-free TypeScript, so native type stripping loads them.
const { extendedScore } = await import("../src/lib/ranking-score.ts");
const { getPrimaryDeployment } = await import("../src/data/deployments.ts");
const { isListedProject } = await import("../src/lib/catalog-filter.ts");
const { buildSnapshot } = await import("../src/lib/ranking-snapshot-build.ts");

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);

function fail(msg) {
  console.error(`rank-projects: ${msg}`);
  process.exit(1);
}

function listedEntries() {
  return catalogFileNames(catalogDir)
    .map((f) => JSON.parse(readFileSync(join(catalogDir, f), "utf8")))
    .filter((e) => isListedProject(e.curated));
}

function fetchActivity(entries) {
  const owner = "duketopceo";
  const wanted = entries.filter((e) => !e.curated.siteOnly);
  const body = wanted
    .map((e, i) => {
      const o = e.github.owner || owner;
      return `r${i}: repository(owner: ${JSON.stringify(o)}, name: ${JSON.stringify(e.github.repoName)}) { stargazerCount pushedAt latestRelease { tagName } defaultBranchRef { target { ... on Commit { history { totalCount } } } } }`;
    })
    .join("\n");
  let out;
  try {
    out = execFileSync("gh", ["api", "graphql", "-f", `query=query { ${body} }`], {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e) {
    // gh stderr can name repositories; report only that the call failed.
    fail(`gh graphql call failed (exit ${e.status ?? "?"})`);
  }
  const data = JSON.parse(out).data ?? {};
  const result = {};
  const missing = [];
  wanted.forEach((e, i) => {
    const r = data[`r${i}`];
    if (!r) {
      missing.push(e.slug);
      return;
    }
    result[e.slug] = {
      stars: r.stargazerCount ?? 0,
      commits: r.defaultBranchRef?.target?.history?.totalCount ?? 0,
      lastPush: r.pushedAt ?? null,
      hasRelease: !!r.latestRelease,
    };
  });
  if (missing.length) console.warn(`rank-projects: no data for ${missing.length} slug(s): ${missing.join(", ")}`);
  return result;
}

const build = (entries, inputs, asOf) => buildSnapshot({ extendedScore, getPrimaryDeployment }, entries, inputs, asOf);

function readSnapshot() {
  try {
    return JSON.parse(readFileSync(snapshotPath, "utf8"));
  } catch {
    return null;
  }
}

const entries = listedEntries();

if (flag("--refresh")) {
  const asOf = new Date().toISOString().slice(0, 10);
  const snap = build(entries, fetchActivity(entries), asOf);
  writeFileSync(snapshotPath, JSON.stringify(snap, null, 2) + "\n");
  console.log(`rank-projects: wrote ${snap.entries.length} entries (asOf ${asOf})`);
} else if (flag("--rebuild")) {
  const prev = readSnapshot();
  if (!prev) fail("no snapshot; run --refresh");
  const inputs = Object.fromEntries(prev.entries.map((e) => [e.slug, e.inputs]));
  const snap = build(entries, inputs, prev.asOf);
  writeFileSync(snapshotPath, JSON.stringify(snap, null, 2) + "\n");
  console.log(`rank-projects: rebuilt ${snap.entries.length} entries from stored inputs (asOf ${prev.asOf})`);
} else if (flag("--check")) {
  const prev = readSnapshot();
  if (!prev) fail("no snapshot; run --refresh");
  const inputs = Object.fromEntries(prev.entries.map((e) => [e.slug, e.inputs]));
  const next = build(entries, inputs, prev.asOf);
  if (JSON.stringify(next) !== JSON.stringify(prev)) {
    fail("snapshot is stale against the catalog; run --refresh");
  }
  console.log("rank-projects: snapshot is current");
} else if (flag("--top")) {
  const prev = readSnapshot();
  if (!prev) fail("no snapshot; run --refresh");
  const n = Number(args[args.indexOf("--top") + 1]) || 15;
  const names = Object.fromEntries(entries.map((e) => [e.slug, e.curated.displayName]));
  prev.entries.slice(0, n).forEach((e, i) => console.log(`${i + 1}. ${e.slug} (${names[e.slug]}) ${e.score}`));
} else {
  fail("pass --refresh, --rebuild, --check or --top <n>");
}
