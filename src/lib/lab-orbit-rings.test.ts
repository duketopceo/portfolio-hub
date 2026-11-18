import { describe, expect, it } from "vitest";
import { listedProjects } from "@/lib/catalog";
import {
  assignLabOrbitRing,
  buildLabOrbitPlanets,
  isOuterBeltProject,
} from "./lab-orbit-rings";
import { HOMEPAGE_FEATURED_SLUGS } from "./project-completeness";
import type { EnrichedProject } from "@/lib/types";

function enrichAll(): EnrichedProject[] {
  return listedProjects().map((p) => ({
    ...p,
    stars: 0,
    forks: 0,
    language: null,
    languages: [],
    topics: [],
    lastUpdated: "",
    repo: null,
    githubUrl: null,
    openIssuesCount: 0,
    ciStatus: null,
  }));
}

describe("lab-orbit-rings", () => {
  it("places featured slugs on the inner ring", () => {
    const projects = enrichAll();
    const planets = buildLabOrbitPlanets(projects);
    const innerSlugs = planets.filter((p) => p.ring === "inner").map((p) => p.project.slug);
    expect(innerSlugs).toEqual([...HOMEPAGE_FEATURED_SLUGS]);
  });

  it("never includes earlier-work or component entries", () => {
    const projects = enrichAll();
    const planets = buildLabOrbitPlanets(projects);
    const slugs = new Set(planets.map((p) => p.project.slug));
    for (const p of listedProjects()) {
      expect(slugs.has(p.slug)).toBe(true);
    }
  });

  it("classifies libraries and plugins as outer belt", () => {
    expect(isOuterBeltProject({ type: "library", slug: "foo" })).toBe(true);
    expect(isOuterBeltProject({ type: "platform", slug: "a0-plugin-x" })).toBe(true);
    const middle = enrichAll().find(
      (p) => assignLabOrbitRing(p) === "middle" && !isOuterBeltProject(p)
    );
    expect(middle).toBeDefined();
  });
});
