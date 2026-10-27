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
    expect(visual.shape).toBe("sphere");
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
    expect(isFeaturedSlug("tallyline")).toBe(true);
    expect(isFeaturedSlug("khan")).toBe(false);
    expect(isFeaturedSlug("homelab")).toBe(false);
  });

  it("shortPlanetLabel truncates long names", () => {
    expect(shortPlanetLabel("Open Military Hardware DB", 14)).toContain("…");
  });
});

import {
  FOCAL_SLUGS,
  isFocalSlug,
  limbPoints,
  meridianCount,
  planetBodyRadius,
} from "./planet-visual";

describe("survey-plate body helpers", () => {
  it("marks at most two focal planets, both featured", () => {
    expect(FOCAL_SLUGS.length).toBeLessThanOrEqual(2);
    for (const slug of FOCAL_SLUGS) expect(isFeaturedSlug(slug)).toBe(true);
    expect(isFocalSlug("pace-server")).toBe(true);
    expect(isFocalSlug("kurultai")).toBe(true);
    expect(isFocalSlug("argus")).toBe(false);
  });

  it("scales body radius with planet size", () => {
    expect(planetBodyRadius("xl")).toBeGreaterThan(planetBodyRadius("md"));
    expect(planetBodyRadius("md")).toBeGreaterThan(planetBodyRadius("xs"));
  });

  it("draws closed limb polygons per shape", () => {
    const hex = limbPoints("hex", 1);
    expect(hex).toHaveLength(7);
    expect(hex[0]).toEqual(hex[6]);
    expect(limbPoints("diamond", 1)).toHaveLength(5);
    expect(limbPoints("cube", 1)).toHaveLength(5);
    const sphere = limbPoints("sphere", 2);
    expect(sphere.length).toBeGreaterThan(32);
    for (const [x, y] of sphere) expect(Math.hypot(x, y)).toBeCloseTo(2, 6);
  });

  it("draws line-art meridians only when no 3D bodies are drawn", () => {
    expect(meridianCount(false, false)).toBe(2);
    expect(meridianCount(true, false)).toBe(4);
    expect(meridianCount(false, true)).toBe(0);
    expect(meridianCount(true, true)).toBe(0);
  });
});
