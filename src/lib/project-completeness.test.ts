import { describe, expect, it } from "vitest";
import {
  HOMEPAGE_FEATURED_SLUGS,
  getHomepageOrbitProjects,
  getHomepageSecondaryOrbitProjects,
} from "./project-completeness";
import { projectConfigs } from "@/data/projects";

describe("homepage orbit split", () => {
  const enriched = projectConfigs.map((p) => ({
    ...p,
    repo: p.repoName,
    stars: 0,
    language: null,
    lastUpdated: null,
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

  it("catalog has 28 projects with 5 featured flags", () => {
    expect(projectConfigs.length).toBe(28);
    expect(projectConfigs.filter((p) => p.featured).length).toBe(5);
  });
});
