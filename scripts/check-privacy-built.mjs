// Scans built output for private identifiers (R8, R12). Run after `npm run build`.
// Dependency-free. Usage: node scripts/check-privacy-built.mjs [--root <dir>]
// <dir> defaults to the repo root and must contain `.next/` and `public/`.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const rootFlag = process.argv.indexOf("--root");
const scanRoot = rootFlag > -1 ? process.argv[rootFlag + 1] : repoRoot;

const read = (p) => readFileSync(p, "utf8");
const quoted = (block) => [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1]);

// Hand-listed non-catalog names come from the TS denylist file.
const denylistSrc = read(join(repoRoot, "src/data/private-denylist.ts"));
const listOf = (name) => {
  const m = denylistSrc.match(new RegExp(`export const ${name}\\s*=\\s*\\[([\\s\\S]*?)\\]`));
  return m ? quoted(m[1]) : [];
};
const defaultOwner = quoted(
  denylistSrc.match(/DEFAULT_REPO_OWNER\s*=\s*("[^"]+")/)?.[1] ?? '""',
)[0];
const workOrgs = listOf("workOrgNames");
const domains = listOf("employerDomains");

// Private catalog entries, read from src/data/catalog/*.json (one file per
// entry: `slug`, `curated.displayName`, `curated.private`, `github.repoName/owner`).
const slugs = new Set();
const bareNames = new Set(); // private repoNames, for the quoted-token scan
const publicNames = new Set(); // slugs + displayNames: public by design
const catalogDir = join(repoRoot, "src/data/catalog");
const catalogFiles = existsSync(catalogDir)
  ? readdirSync(catalogDir).filter((f) => f.endsWith(".json") && !f.startsWith("_"))
  : [];
for (const file of catalogFiles) {
  const entry = JSON.parse(read(join(catalogDir, file)));
  publicNames.add(String(entry.slug).toLowerCase());
  if (entry.curated?.displayName) publicNames.add(entry.curated.displayName.toLowerCase());
  const name = entry.github?.repoName;
  if (!name || entry.curated?.private !== true) continue;
  slugs.add(`${entry.github.owner ?? defaultOwner}/${name}`);
  bareNames.add(name);
}
// A bare repoName that equals a listed slug or displayName is public anyway.
const exempt = [...bareNames].filter((n) => publicNames.has(n.toLowerCase()));
const bareChecked = [...bareNames].filter((n) => !publicNames.has(n.toLowerCase()));

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Tolerate JSON-escaped slashes (`\/`) as found in RSC payloads.
const slash = String.raw`\\?/`;
const tail = String.raw`(?![A-Za-z0-9_-])`;
const patterns = [
  ...[...slugs].map((s) => ({
    label: `private repo ${s}`,
    re: new RegExp(esc(s).replace(/\//, slash) + tail, "i"),
  })),
  ...bareChecked.map((n) => ({
    label: `private repo name ${n}`,
    re: new RegExp(`(["'])${esc(n)}\\1`, "i"),
  })),
  ...workOrgs.map((o) => ({ label: `work org ${o}`, re: new RegExp(esc(o), "i") })),
  ...domains.map((d) => ({ label: `employer domain ${d}`, re: new RegExp(esc(d), "i") })),
];

const textExt = new Set([".js", ".html", ".body", ".rsc", ".meta", ".txt", ".xml", ".json", ".md", ""]);
const files = [];
const walk = (dir) => {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (textExt.has(extname(name))) files.push(p);
  }
};
walk(join(scanRoot, ".next/server/app"));
walk(join(scanRoot, ".next/static"));
for (const f of ["llms.txt", "robots.txt"]) {
  const p = join(scanRoot, "public", f);
  if (existsSync(p)) files.push(p);
}

// Guard against a silently empty derivation (catalog format drift).
if (slugs.size === 0) {
  console.error("check:privacy:built derived zero private catalog patterns; refusing to pass.");
  process.exit(1);
}

if (files.length === 0) {
  console.error(`check:privacy:built found no build output under ${scanRoot}. Run \`npm run build\` first.`);
  process.exit(1);
}

const hits = [];
for (const f of files) {
  const text = read(f);
  for (const { label, re } of patterns) {
    const m = text.match(re);
    if (m) hits.push(`${relative(scanRoot, f)}: ${label} (matched "${m[0]}")`);
  }
}

if (hits.length > 0) {
  console.error("check:privacy:built failed:\n" + hits.join("\n"));
  process.exit(1);
}
console.log(`check:privacy:built passed (${files.length} files, ${patterns.length} identifiers)`);
console.log(`bare repoName exemptions (listed slug/displayName): ${exempt.join(", ") || "none"}`);
