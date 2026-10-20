import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { projectConfigs } from "@/data/projects";
import { retiredSlugs, retiredSlugRedirects } from "@/data/redirects";
import {
  componentsOf,
  earlierWork,
  listedProjects,
  validateCatalog,
} from "./catalog";
import { HOMEPAGE_FEATURED_SLUGS } from "./project-completeness";
import { archivedRepoNames, preOverhaulSlugs } from "./catalog.fixture";

vi.mock("@/lib/github", () => ({
  getEnrichedProjects: async () => [],
}));
vi.mock("@/components/FilterBar", () => ({ default: () => null }));
vi.mock("@/components/ConstellationNav", () => ({ default: () => null }));

const FIVE = ["orchestral", "argus", "kurultai", "pace-server", "khan"];

describe("U3 catalog restructure", () => {
  it("featured five are orchestral, argus, kurultai, pace-server, khan", () => {
    expect([...HOMEPAGE_FEATURED_SLUGS]).toEqual(FIVE);
    const flagged = projectConfigs.filter((p) => p.featured).map((p) => p.slug);
    expect(flagged.sort()).toEqual([...FIVE].sort());
  });

  it("argus has no explicit orbitTier; orchestral and argus have a primary planetVisual", () => {
    const by = (s: string) => projectConfigs.find((p) => p.slug === s)!;
    expect(by("argus").orbitTier).toBeUndefined();
    expect(by("orchestral").planetVisual?.size).toBeDefined();
    expect(by("argus").planetVisual?.size).toBeDefined();
  });

  it("every pre-overhaul slug is listed or redirected", () => {
    expect(preOverhaulSlugs).toHaveLength(74);
    const listed = new Set(listedProjects().map((p) => p.slug));
    const retired = new Set(retiredSlugs.map((r) => r.from));
    const missing = preOverhaulSlugs.filter(
      (s) => !listed.has(s) && !retired.has(s)
    );
    expect(missing).toEqual([]);
  });

  it("validateCatalog passes and the listed catalog stays above the belt minimum", () => {
    expect(validateCatalog(projectConfigs)).toEqual([]);
    expect(listedProjects().length).toBeGreaterThan(30);
  });

  it("no listed entry points at an archived repo", () => {
    const archived = new Set(archivedRepoNames);
    expect(
      listedProjects().filter((p) => archived.has(p.repoName)).map((p) => p.slug)
    ).toEqual([]);
  });

  it("stratum-hq is gone from the catalog", () => {
    expect(projectConfigs.some((p) => p.slug === "stratum-hq")).toBe(false);
  });

  it("components resolve under their parents", () => {
    expect(componentsOf("omarchy-plugins").length).toBe(10);
    expect(componentsOf("agent-zero-plugins").length).toBe(7);
    expect(componentsOf("wisp").map((p) => p.slug)).toEqual(["omarchy-wisp"]);
    expect(componentsOf("kate").map((p) => p.slug)).toEqual(["kate-ios"]);
    expect(componentsOf("kurultai").map((p) => p.slug)).toEqual([
      "kurultai-people",
    ]);
    expect(componentsOf("openrouter-usage").map((p) => p.slug)).toEqual([
      "a0-openrouter-spend",
    ]);
  });

  it("new entries exist; private additions carry a showcase and no repo link", () => {
    for (const s of [
      "cairn",
      "rts-skyrim",
      "portfolio-hub",
      "jev-compact",
      "pinetree-solari-demo",
      "scooter-ios",
    ]) {
      expect(projectConfigs.some((p) => p.slug === s), s).toBe(true);
    }
    for (const p of projectConfigs.filter((x) =>
      ["cairn", "rts-skyrim", "scooter-ios"].includes(x.slug)
    )) {
      expect(p.private).toBe(true);
      expect(p.showcase).toBeDefined();
    }
  });

  it("openrouter duplicate collapses into openrouter-demos with its film and live demo", () => {
    expect(projectConfigs.some((p) => p.slug === "openrouter")).toBe(false);
    const d = projectConfigs.filter((p) => p.slug === "openrouter-demos");
    expect(d).toHaveLength(1);
    expect(d[0].film?.url).toMatch(/openrouter-demos-walkthrough\.mp4$/);
    expect(d[0].liveUrl).toBeTruthy();
    expect(retiredSlugRedirects()).toContainEqual({
      source: "/projects/openrouter",
      destination: "/projects/openrouter-demos",
      permanent: true,
    });
    expect(projectConfigs.some((p) => p.slug === "open-military-hardware-db")).toBe(
      false
    );
  });

  it("every demoVideoUrl is migrated to film", () => {
    expect(
      projectConfigs.filter((p) => "demoVideoUrl" in p).map((p) => p.slug)
    ).toEqual([]);
    expect(projectConfigs.filter((p) => p.film).length).toBeGreaterThanOrEqual(7);
  });

  it("redirect targets: components to parent, earlier to #earlier-work, removed to /projects", () => {
    const row = (from: string) => retiredSlugs.find((r) => r.from === from);
    expect(row("omarchy-fan")?.to).toBe("/projects/omarchy-plugins");
    expect(row("a0-plugin-notion")?.to).toBe("/projects/agent-zero-plugins");
    expect(row("trading-bot")?.to).toBe("/projects#earlier-work");
    expect(row("stratum-hq")?.to).toBe("/projects");
    expect(row("server-cluster")?.to).toBe("/projects");
  });

  it("earlier-work table renders under #earlier-work with no private entry", async () => {
    const { default: ProjectsPage } = await import("@/app/projects/page");
    const html = renderToStaticMarkup(await ProjectsPage());
    expect(html).toContain('id="earlier-work"');
    const pub = earlierWork().filter((p) => !p.private);
    const priv = earlierWork().filter((p) => p.private);
    expect(pub.length).toBeGreaterThan(0);
    expect(priv.length).toBeGreaterThan(0);
    for (const p of pub) expect(html).toContain(p.displayName);
    for (const p of priv) {
      expect(html).not.toContain(p.displayName);
      expect(html).not.toContain(p.repoName);
    }
    expect(html).toContain("https://github.com/duketopceo/");
  });
});
