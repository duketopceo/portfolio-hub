import type { ProjectConfig } from "@/lib/types";

/**
 * Server-to-client boundary for catalog rows. Private entries lose the repo
 * identifiers (`repoName`, `repoOwner`) and any GitHub URL so they never ship
 * in RSC payloads or client JS (R8, R12). Public entries pass through as-is.
 */
export function toClientProject<T extends ProjectConfig>(project: T): T {
  if (!project.private) return project;
  const safe: T & { githubUrl?: string | null } = {
    ...project,
    repoName: "",
    repoOwner: undefined,
  };
  if ("githubUrl" in safe) safe.githubUrl = null;
  return safe;
}
