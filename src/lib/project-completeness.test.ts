import { describe, expect, it } from "vitest";
import {
  HOMEPAGE_FEATURED_SLUGS,
  getHomepageOrbitProjects,
  getHomepageSecondaryOrbitProjects,
  resolveOrbitTier,
} from "./project-completeness";
import { projectConfigs } from "@/data/projects";
import { isListedProject } from "./catalog-filter";

describe("homepage orbit split", () => {
  const enriched = projectConfigs.map((p) => ({
    ...p,
    repo: null,
    stars: 0,
    language: null,
    languages: [] as string[],
    forks: 0,
    openIssuesCount: 0,
    ciStatus: null,
    lastUpdated: "",
    githubUrl: p.private ? null : `https://github.com/duketopceo/${p.repoName}`,
  }));

  it("primary orbit has exactly the featured five", () => {
    const primary = getHomepageOrbitProjects(enriched);
    expect(primary.map((p) => p.slug)).toEqual([...HOMEPAGE_FEATURED_SLUGS]);
  });

  it("secondary orbit contains all non-featured catalog entries", () => {
    const primary = getHomepageOrbitProjects(enriched);
    const secondary = getHomepageSecondaryOrbitProjects(enriched);
    const featured = new Set<string>(HOMEPAGE_FEATURED_SLUGS);
    expect(secondary.every((p) => !featured.has(p.slug))).toBe(true);
    const listedCount = projectConfigs.filter(isListedProject).length;
    expect(primary.length + secondary.length).toBe(listedCount);
  });

  it("resolveOrbitTier defaults non-featured to secondary", () => {
    expect(resolveOrbitTier({ slug: "homelab", featured: false })).toBe(
      "secondary"
    );
    expect(resolveOrbitTier({ slug: "tallyline", featured: true })).toBe(
      "featured"
    );
  });

  it("catalog-only entries are excluded from secondary orbit", () => {
    const withCatalogOnly = enriched.map((p) =>
      p.slug === "homelab" ? { ...p, orbitTier: "catalog-only" as const } : p
    );
    const secondary = getHomepageSecondaryOrbitProjects(withCatalogOnly);
    expect(secondary.some((p) => p.slug === "homelab")).toBe(false);
    const listedCount = projectConfigs.filter(isListedProject).length;
    expect(secondary.length).toBe(
      listedCount - HOMEPAGE_FEATURED_SLUGS.length - 1
    );
  });

  it("no component or earlier-work entry is listed in either orbit", () => {
    const hidden = new Set(
      projectConfigs.filter((p) => !isListedProject(p)).map((p) => p.slug)
    );
    const shown = [
      ...getHomepageOrbitProjects(enriched),
      ...getHomepageSecondaryOrbitProjects(enriched),
    ];
    expect(shown.some((p) => hidden.has(p.slug))).toBe(false);
  });

  it("orbit functions drop components and earlier work if passed in", () => {
    const extra = [
      { ...enriched[0], slug: "fixture-part", parentSlug: enriched[0].slug },
      { ...enriched[0], slug: "fixture-old", era: "earlier" as const },
    ];
    const secondary = getHomepageSecondaryOrbitProjects([...enriched, ...extra]);
    expect(secondary.some((p) => p.slug.startsWith("fixture-"))).toBe(false);
  });

  it("every parentSlug resolves and exactly five entries are featured", () => {
    const slugs = new Set(projectConfigs.map((p) => p.slug));
    for (const p of projectConfigs) {
      if (p.parentSlug) expect(slugs.has(p.parentSlug)).toBe(true);
    }
    expect(projectConfigs.filter((p) => p.featured).length).toBe(5);
  });

  it("catalog is at least as large as the secondary belt needs", () => {
    expect(projectConfigs.filter(isListedProject).length).toBeGreaterThan(30);
  });
});
