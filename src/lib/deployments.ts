import type { ProjectConfig } from "@/lib/types";
import { getDeploymentBySlug } from "@/data/deployments";

/**
 * Overlay deployments.ts onto a curated project config.
 * Deployments win for liveUrl / subdomain / online status when present.
 */
export function applyDeploymentOverlay(
  config: ProjectConfig
): ProjectConfig {
  const dep = getDeploymentBySlug(config.slug);
  if (!dep) return config;

  return {
    ...config,
    liveUrl: dep.url,
    demoUrl: config.demoUrl ?? dep.url,
    subdomain: dep.subdomain ?? config.subdomain,
    demoOffline: !dep.online,
  };
}

/** True when a project has a reachable live URL (not marked offline). */
export function isProjectLive(p: {
  liveUrl?: string;
  demoUrl?: string;
  demoOffline?: boolean;
}): boolean {
  return !!(p.liveUrl || p.demoUrl) && !p.demoOffline;
}
