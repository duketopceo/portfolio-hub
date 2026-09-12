import { describe, expect, it } from "vitest";
import {
  HOMEPAGE_FEATURED_SLUGS,
  getHomepageOrbitProjects,
  getHomepageSecondaryOrbitProjects,
  resolveOrbitTier,
} from "./project-completeness";
import { projectConfigs } from "@/data/projects";

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
    expect(primary.length + secondary.length).toBe(projectConfigs.length);
  });

  it("resolveOrbitTier defaults non-featured to secondary", () => {
    expect(resolveOrbitTier({ slug: "homelab", featured: false })).toBe(
      "secondary"
    );
    expect(resolveOrbitTier({ slug: "khan", featured: true })).toBe(
      "featured"
    );
  });

  it("catalog-only entries are excluded from secondary orbit", () => {
    const withCatalogOnly = enriched.map((p) =>
      p.slug === "homelab" ? { ...p, orbitTier: "catalog-only" as const } : p
    );
    const secondary = getHomepageSecondaryOrbitProjects(withCatalogOnly);
    expect(secondary.some((p) => p.slug === "homelab")).toBe(false);
    expect(secondary.length).toBe(projectConfigs.length - 6);
  });

  it("catalog has 51 projects with 5 featured flags", () => {
    expect(projectConfigs.length).toBe(51);
    expect(projectConfigs.filter((p) => p.featured).length).toBe(5);
  });
});
