import { describe, expect, it } from "vitest";
import { HOMEPAGE_FEATURED_SLUGS } from "./project-completeness";
import { projectConfigs } from "@/data/projects";
import { isListedProject } from "./catalog-filter";

describe("catalog invariants", () => {
  it("the fixed featured list names five listed projects", () => {
    expect(HOMEPAGE_FEATURED_SLUGS).toHaveLength(5);
    const listed = new Set(projectConfigs.filter(isListedProject).map((p) => p.slug));
    for (const slug of HOMEPAGE_FEATURED_SLUGS) expect(listed.has(slug)).toBe(true);
  });

  it("every parentSlug resolves and exactly five entries are featured", () => {
    const slugs = new Set(projectConfigs.map((p) => p.slug));
    for (const p of projectConfigs) {
      if (p.parentSlug) expect(slugs.has(p.parentSlug)).toBe(true);
    }
    expect(projectConfigs.filter((p) => p.featured).length).toBe(5);
  });

  it("the catalog lists more than 30 projects", () => {
    expect(projectConfigs.filter(isListedProject).length).toBeGreaterThan(30);
  });
});
