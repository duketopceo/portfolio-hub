import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { projectConfigs } from "@/data/projects";
import { listedProjects } from "@/lib/catalog";
import { retiredSlugRedirects, siteRedirects } from "./redirects";

const livePages = new Set(["/projects", "/about", "/hire", "/resume"]);

describe("siteRedirects", () => {
  it("covers every page folded into Work, About, and Hire", () => {
    const sources = siteRedirects.map((r) => r.source);
    for (const old of [
      "/demos",
      "/demos/argus",
      "/demos/dayflow",
      "/demos/kurultai",
      "/openrouter",
      "/now",
      "/contributions",
      "/contact",
    ]) {
      expect(sources).toContain(old);
    }
  });

  it("is permanent and lands on a page that exists", () => {
    const slugs = new Set(listedProjects().map((p) => p.slug));
    for (const r of siteRedirects) {
      expect(r.permanent).toBe(true);
      const path = r.destination.split("#")[0];
      const slug = path.startsWith("/projects/") ? path.slice("/projects/".length) : null;
      expect(slug ? slugs.has(slug) : livePages.has(path), r.destination).toBe(true);
    }
  });

  it("removed Bartlett Permits (2026-11-15): not listed, not ranked, and its route redirects to /projects", () => {
    expect(listedProjects().map((p) => p.slug)).not.toContain("bartlett-permits");
    expect(projectConfigs.map((p) => p.slug)).not.toContain("bartlett-permits");
    const snapshot = JSON.parse(readFileSync("src/data/ranking-snapshot.json", "utf8")) as {
      entries: Array<{ slug: string }>;
    };
    expect(snapshot.entries.map((e) => e.slug)).not.toContain("bartlett-permits");
    expect(retiredSlugRedirects()).toContainEqual({
      source: "/projects/bartlett-permits",
      destination: "/projects",
      permanent: true,
    });
  });
});
