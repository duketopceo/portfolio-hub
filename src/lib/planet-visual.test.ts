import { describe, expect, it } from "vitest";
import { projectConfigs } from "@/data/projects";
import {
  isFeaturedSlug,
  resolvePlanetVisual,
  shortPlanetLabel,
} from "./planet-visual";

describe("resolvePlanetVisual", () => {
  const kurultai = projectConfigs.find((p) => p.slug === "kurultai")!;
  const homelab = projectConfigs.find((p) => p.slug === "homelab")!;

  it("uses explicit featured config for Kurultai", () => {
    const visual = resolvePlanetVisual(
      { ...kurultai, repo: null, stars: 0, lastUpdated: "", language: null, languages: [], forks: 0, openIssuesCount: 0, ciStatus: null, githubUrl: null },
      "primary"
    );
    expect(visual.size).toBe("xl");
    expect(visual.shape).toBe("hex");
    expect(visual.moons.length).toBeGreaterThanOrEqual(2);
  });

  it("defaults secondary worlds smaller than primary", () => {
    const primary = resolvePlanetVisual(
      { ...kurultai, repo: null, stars: 0, lastUpdated: "", language: null, languages: [], forks: 0, openIssuesCount: 0, ciStatus: null, githubUrl: null },
      "primary"
    );
    const secondary = resolvePlanetVisual(
      { ...homelab, repo: null, stars: 0, lastUpdated: "", language: null, languages: [], forks: 0, openIssuesCount: 0, ciStatus: null, githubUrl: null },
      "secondary"
    );
    expect(secondary.size).not.toBe("xl");
    expect(primary.size).toBe("xl");
  });

  it("isFeaturedSlug matches homepage featured list", () => {
    expect(isFeaturedSlug("khan")).toBe(true);
    expect(isFeaturedSlug("homelab")).toBe(false);
  });

  it("shortPlanetLabel truncates long names", () => {
    expect(shortPlanetLabel("Open Military Hardware DB", 14)).toContain("…");
  });
});
