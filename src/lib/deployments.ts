import type { ProjectConfig } from "@/lib/types";
import {
  getPrimaryDeployment,
  getDeploymentsBySlug,
  type DeploymentConfig,
} from "@/data/deployments";

export { getDeploymentsBySlug, type DeploymentConfig };

/**
 * Overlay deployments.ts onto a curated project config.
 * Primary online deployment wins for liveUrl / subdomain / demoOffline.
 */
export function applyDeploymentOverlay(
  config: ProjectConfig
): ProjectConfig {
  const dep = getPrimaryDeployment(config.slug);
  if (!dep) return config;

  const isRelative = dep.url.startsWith("/");

  return {
    ...config,
    liveUrl: isRelative ? dep.url : dep.url,
    demoUrl: config.demoUrl ?? (isRelative ? dep.url : dep.url),
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

/** Resolve href for live/demo CTAs (supports on-site paths). */
export function projectLiveHref(p: {
  liveUrl?: string;
  demoUrl?: string;
}): string | undefined {
  return p.liveUrl || p.demoUrl;
}

export function formatDeploymentUrl(url: string): string {
  if (url.startsWith("/")) return url;
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function deploymentHostLabel(host: DeploymentConfig["host"]): string {
  switch (host) {
    case "railway":
      return "Railway";
    case "cloudflare":
      return "Cloudflare";
    case "hetzner":
      return "Hetzner";
    case "swarm":
      return "Swarm (legacy)";
    case "vercel":
      return "Vercel";
    case "firebase":
      return "Firebase";
    case "other":
      return "Other";
    default: {
      const _exhaustive: never = host;
      return _exhaustive;
    }
  }
}
