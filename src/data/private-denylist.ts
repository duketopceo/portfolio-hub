/**
 * Identifiers that must never appear in rendered output (R8, R12).
 *
 * Private catalog entries are NOT hand-listed here: `scripts/check-privacy-built.mjs`
 * derives their `owner/repo` slugs and GitHub URLs from `src/data/catalog/*.json`
 * on every run, so new private entries are covered automatically.
 * `derivePrivateRepoSlugs` is the typed twin of that derivation; a unit test
 * keeps the two in agreement.
 *
 * Display names of private entries (for example "Khan") are NOT denylisted.
 */

/** Owner used when a catalog entry has no `repoOwner`. */
export const DEFAULT_REPO_OWNER = "duketopceo";

/** Work organisations and internal repositories that are not in the catalog. */
export const workOrgNames = [
  "Herzog-LLC",
  "Cofounder-Customer-Projects",
  "Bartlett-server-001",
] as const;

/** Employer email domains (the full mailbox is also caught by check-privacy). */
export const employerDomains = ["bartlettroofs.com"] as const;

interface RepoConfig {
  repoName: string;
  repoOwner?: string;
  private?: boolean;
}

/** `owner/repo` for every private catalog entry. */
export function derivePrivateRepoSlugs(configs: readonly RepoConfig[]): string[] {
  return configs
    .filter((c) => c.private === true)
    .map((c) => `${c.repoOwner ?? DEFAULT_REPO_OWNER}/${c.repoName}`);
}
