import { describe, expect, it } from "vitest";
import { applyDeploymentOverlay, isProjectLive } from "./deployments";
import { deployments } from "@/data/deployments";
import type { ProjectConfig } from "./types";

const base = (slug: string, extra: Partial<ProjectConfig> = {}) =>
  ({
    slug,
    repoName: slug,
    displayName: slug,
    liveUrl: "https://stale.example",
    demoUrl: "https://stale.example",
    ...extra,
  }) as ProjectConfig;

describe("applyDeploymentOverlay", () => {
  it("strips live/demo URLs for an offline deployment", () => {
    const out = applyDeploymentOverlay(base("alphahedge"));
    expect(out.liveUrl).toBeUndefined();
    expect(out.demoUrl).toBeUndefined();
    expect(out.demoOffline).toBe(true);
    expect(isProjectLive(out)).toBe(false);
  });

  it("keeps URLs for an online deployment", () => {
    const out = applyDeploymentOverlay(base("khan"));
    expect(out.liveUrl).toBe("https://khanai.app");
    expect(isProjectLive(out)).toBe(true);
  });

  it("honours the corrected flags (omhdb down, portfolio-hub up)", () => {
    const omhdb = deployments.find((d) => d.slug === "military-hardware-db");
    const hub = deployments.find((d) => d.slug === "portfolio-hub");
    expect(omhdb?.online).toBe(false);
    expect(hub?.online).toBe(true);
    expect(isProjectLive(applyDeploymentOverlay(base("military-hardware-db")))).toBe(false);
  });

  it("no offline deployment keeps a clickable URL after overlay", () => {
    for (const d of deployments.filter((x) => !x.online)) {
      const out = applyDeploymentOverlay(base(d.slug));
      expect(out.liveUrl, d.slug).toBeUndefined();
    }
  });
});
