// Catalog sync (KTD6): proposes, never decides. Reads PUBLIC repos only,
// rewrites only `github` fields of existing non-private entries, and writes
// src/data/catalog/_proposals.json. Logic lives in src/lib/sync.ts.
//
// Usage:
//   GH_TOKEN=... node scripts/sync-catalog.mjs --dry-run --out <path outside the repo>
//   GH_TOKEN=... node scripts/sync-catalog.mjs --write        (npm run catalog:sync -- --write)
// Token: GITHUB_TOKEN or GH_TOKEN. It is never printed.
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import * as nodeModule from "node:module";
const { register, registerHooks } = nodeModule;
import { dirname, join, resolve, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

// Node strips TypeScript types natively; this hook only resolves the
// extensionless relative imports the app's bundler-style sources use.
const withTs = (specifier, context, next) => {
  try {
    return next(specifier, context);
  } catch (e) {
    if (!specifier.startsWith(".")) throw e;
    for (const suffix of [".ts", "/index.ts"]) {
      try {
        return next(specifier + suffix, context);
      } catch {}
    }
    throw e;
  }
};
if (registerHooks) registerHooks({ resolve: withTs });
else {
  register(
    "data:text/javascript," +
      encodeURIComponent(`export async function resolve(s, c, next) {
  try { return await next(s, c); } catch (e) {
    if (!s.startsWith(".")) throw e;
    for (const x of [".ts", "/index.ts"]) { try { return await next(s + x, c); } catch {} }
    throw e;
  }
}`),
    import.meta.url,
  );
}

const root = fileURLToPath(new URL("..", import.meta.url));
const catalogDir = join(root, "src/data/catalog");
const proposalsPath = join(catalogDir, "_proposals.json");

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const value = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : undefined;
};

function fail(msg) {
  console.error(`catalog sync: ${msg}`);
  process.exit(1);
}

const dryRun = flag("--dry-run");
const write = flag("--write");
if (dryRun === write) fail("pass exactly one of --dry-run (with --out <path>) or --write");

const out = value("--out");
if (dryRun) {
  if (!out) fail("--dry-run needs --out <path outside the repo>");
  const rel = relative(root, resolve(out));
  if (!rel.startsWith("..") && !isAbsolute(rel)) fail("--out must be outside the repository");
}

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) fail("set GITHUB_TOKEN or GH_TOKEN");

const sync = await import("../src/lib/sync.ts");
const { catalogEntrySchema } = await import("../src/data/catalog/schema.ts");

const files = readdirSync(catalogDir)
  .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
  .sort();
const raw = new Map(files.map((f) => [f, readFileSync(join(catalogDir, f), "utf8")]));

let entries;
try {
  entries = files.map((f) => catalogEntrySchema.parse(JSON.parse(raw.get(f))));
} catch {
  fail("a catalog file failed schema validation");
}

const owner = value("--owner") || "duketopceo";

let result;
try {
  const nodes = await sync.fetchRepoNodes({ token, owner });
  result = sync.computeSync({ nodes, entries, now: new Date(), owner });
} catch (e) {
  // Messages from sync.ts never contain repo names or the token.
  fail(e instanceof Error ? e.message : "unexpected failure");
}

const { updates, proposals } = result;
const fileOf = new Map(entries.map((e) => [e.slug, `${e.slug}.json`]));
const rendered = new Map();
try {
  for (const [slug, github] of Object.entries(updates)) {
    rendered.set(fileOf.get(slug), sync.renderEntryWithGithub(raw.get(fileOf.get(slug)), github));
  }
} catch {
  fail("a rewritten entry failed schema validation; nothing was written");
}

const counts = Object.fromEntries(Object.entries(proposals).map(([k, v]) => [k, Array.isArray(v) ? v.length : v]));
const summary = { entries: entries.length, githubUpdates: rendered.size, proposals: counts };

if (dryRun) {
  mkdirSync(dirname(resolve(out)), { recursive: true });
  const detail = { summary, changedEntries: Object.keys(updates).sort(), proposals };
  writeFileSync(resolve(out), sync.serialize(detail));
  console.log(JSON.stringify(summary, null, 2));
  console.log(`dry run: nothing changed under src/; detail written to ${resolve(out)}`);
} else {
  for (const [f, text] of rendered) writeFileSync(join(catalogDir, f), text);
  const next = sync.serialize(proposals);
  let prev = "";
  try {
    prev = readFileSync(proposalsPath, "utf8");
  } catch {}
  if (next !== prev) writeFileSync(proposalsPath, next);
  console.log(JSON.stringify({ ...summary, proposalsFileChanged: next !== prev }, null, 2));
}
