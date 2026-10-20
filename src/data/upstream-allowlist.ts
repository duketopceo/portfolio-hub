/**
 * Repo-level allowlist for the /contributions page (KTD6, layer 2).
 * Only public repositories owned by other people or orgs belong here.
 * Work-org repositories (Cofounder-Customer-Projects, Herzog-LLC) are never
 * allowlisted. Compared case-insensitively against `owner/name`.
 */
export const UPSTREAM_ALLOWLIST: readonly string[] = [
  "agent0ai/a0-plugins",
  "akitaonrails/ai-usagebar",
  "omacom/omarchy-mac",
  "omacom/omarchy-port-forward-plugin",
  "NousResearch/hermes-agent",
  "rowboatlabs/rowboat",
  "cline/marketplace",
  "solari-sdk/solari-cookbook",
  "ssupt/omarchy-audio-control",
  "EveryInc/compound-engineering-plugin",
  "ParthJain18/groq_flow",
];

export function isAllowlistedRepo(fullName: string): boolean {
  const key = fullName.toLowerCase();
  return UPSTREAM_ALLOWLIST.some((r) => r.toLowerCase() === key);
}
