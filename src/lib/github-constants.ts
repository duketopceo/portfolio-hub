export const GITHUB_API_BASE = "https://api.github.com";
export const GITHUB_ACCOUNT_LOGIN = process.env.GITHUB_USER || "duketopceo";

/** Owner for a catalog project: its explicit repoOwner, else the account. */
export function resolveRepoOwner(cfg: { repoOwner?: string | null }): string {
  return cfg.repoOwner ?? GITHUB_ACCOUNT_LOGIN;
}
