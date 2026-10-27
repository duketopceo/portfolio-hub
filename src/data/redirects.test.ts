import { describe, expect, it } from "vitest";
import { listedProjects } from "@/lib/catalog";
import { siteRedirects } from "./redirects";

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
});
