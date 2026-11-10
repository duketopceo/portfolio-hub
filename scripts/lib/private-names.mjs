// Single source of truth for "names that must never appear in public output".
// Shared by scripts/check-privacy-built.mjs and the video sanitizer
// (scripts/media/lib/sanitize.mjs). Dependency-free node:fs only.
//
// Hand-listed non-catalog names come from src/data/private-denylist.ts; private
// catalog entries are derived from src/data/catalog/*.json on every call, so a new
// private entry is covered automatically.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { catalogFileNames } from "./catalog-files.mjs";

const read = (p) => readFileSync(p, "utf8");
const quoted = (block) => [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1]);

/**
 * @param {string} repoRoot directory holding src/data/
 * @returns {{slugs: Set<string>, bareNames: Set<string>, bareChecked: string[], exempt: string[], workOrgs: string[], domains: string[]}}
 */
export function loadPrivateNames(repoRoot) {
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

  // Private catalog entries, one file per entry: `slug`, `curated.displayName`,
  // `curated.private`, `github.repoName/owner`.
  const slugs = new Set();
  const bareNames = new Set(); // private repoNames
  const publicNames = new Set(); // slugs + displayNames: public by design
  const catalogDir = join(repoRoot, "src/data/catalog");
  const catalogFiles = existsSync(catalogDir) ? catalogFileNames(catalogDir) : [];
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
  return { slugs, bareNames, bareChecked, exempt, workOrgs, domains };
}
