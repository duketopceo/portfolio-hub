import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { catalogFileNames } from "../../../scripts/lib/catalog-files.mjs";
import { projectConfigs } from "@/data/projects";
import { listedProjects } from "@/lib/catalog";
import { isListedProject } from "@/lib/catalog-filter";
import { HOMEPAGE_FEATURED_SLUGS } from "@/lib/project-completeness";
import { PLANET_SURFACES } from "@/lib/planet-spec";
import { resolvePlanetVisual } from "@/lib/planet-visual";
import { catalogEntries } from "./index";
import { catalogEntrySchema } from "./schema";

const dir = join(process.cwd(), "src/data/catalog");
const jsonFiles: string[] = catalogFileNames(dir);
const load = (f: string) => JSON.parse(readFileSync(join(dir, f), "utf8"));

describe("catalog JSON", () => {
  it("has one entry per file and every file validates against the schema", () => {
    expect(catalogEntries).toHaveLength(jsonFiles.length);
    for (const f of jsonFiles) {
      const res = catalogEntrySchema.safeParse(load(f));
      expect(res.success, `${f}: ${res.success ? "" : res.error.message}`).toBe(true);
    }
  });

  it("names every file after its slug", () => {
    for (const f of jsonFiles) expect(load(f).slug).toBe(f.replace(/\.json$/, ""));
  });

  it("rejects an unknown field and a missing curated.displayName", () => {
    const base = load("kurultai.json");
    expect(catalogEntrySchema.safeParse({ ...base, extra: 1 }).success).toBe(false);
    expect(
      catalogEntrySchema.safeParse({ ...base, curated: { ...base.curated, bogus: 1 } }).success,
    ).toBe(false);
    const curated = { ...base.curated };
    delete curated.displayName;
    expect(catalogEntrySchema.safeParse({ ...base, curated }).success).toBe(false);
  });

  it("has unique slugs and unique, stable order", () => {
    const entries = jsonFiles.map(load);
    expect(new Set(entries.map((e) => e.slug)).size).toBe(entries.length);
    expect(new Set(entries.map((e) => e.order)).size).toBe(entries.length);
    const sorted = [...entries].sort((a, b) => a.order - b.order).map((e) => e.slug);
    expect(projectConfigs.map((c) => c.slug)).toEqual(sorted);
  });

  it("lists the same number of projects as the entries say", () => {
    const expected = jsonFiles.map(load).filter((e) => isListedProject(e.curated)).length;
    expect(listedProjects()).toHaveLength(expected);
  });

  it("private entries carry no public GitHub URL in curated", () => {
    for (const f of jsonFiles) {
      const e = load(f);
      if (!e.curated.private) continue;
      const url = `github.com/${e.github.owner}/${e.github.repoName}`.toLowerCase();
      expect(JSON.stringify(e.curated).toLowerCase(), f).not.toContain(url);
    }
  });

  it("the generated index imports every JSON file in the directory", () => {
    const src = readFileSync(join(dir, "index.ts"), "utf8");
    const imported = [...src.matchAll(/from "\.\/([^"]+\.json)"/g)].map((m) => m[1]).sort();
    expect(imported).toEqual(jsonFiles);
    expect(catalogEntries).toHaveLength(jsonFiles.length);
  });
});

describe("planet specs (curated.planetVisual)", () => {
  const base = () => load("kurultai.json");
  const withPlanet = (planetVisual: unknown) => {
    const b = base();
    return { ...b, curated: { ...b.curated, planetVisual } };
  };

  it("accepts a full spec and an empty one (everything is optional)", () => {
    expect(catalogEntrySchema.safeParse(withPlanet({})).success).toBe(true);
    expect(
      catalogEntrySchema.safeParse(
        withPlanet({
          surface: "terrain",
          palette: ["#101010", "#808080", "#f0f0f0"],
          seed: 4,
          tilt: -12,
          rotationSpeed: 0.1,
          atmosphere: { strength: 0.2, color: "#aabbcc" },
          rings: [{ opacity: 0.4, tilt: 10, inner: 1.5, outer: 2.2, bands: 3 }],
        }),
      ).success,
    ).toBe(true);
  });

  it("rejects bad surfaces, colours, ranges and unknown keys", () => {
    for (const bad of [
      { surface: "lava" },
      { palette: ["#fff", "#000", "#123456"] },
      { color: "violet" },
      { tilt: 120 },
      { rotationSpeed: 5 },
      { seed: -1 },
      { atmosphere: { strength: 2 } },
      { rings: [{ inner: 0.2 }] },
      { rings: [{ bands: 12 }] },
      { glow: true },
    ]) {
      expect(catalogEntrySchema.safeParse(withPlanet(bad)).success, JSON.stringify(bad)).toBe(false);
    }
  });

  it("gives every lead planet a complete, distinct, valid spec", () => {
    const surfaces: string[] = [];
    for (const slug of HOMEPAGE_FEATURED_SLUGS) {
      const entry = load(`${slug}.json`);
      const authored = entry.curated.planetVisual;
      expect(authored, slug).toBeDefined();
      expect(authored.surface, slug).toBeDefined();
      const config = projectConfigs.find((p) => p.slug === slug)!;
      const visual = resolvePlanetVisual(
        { ...config, repo: null, stars: 0, lastUpdated: "", language: null, languages: [], forks: 0, openIssuesCount: 0, ciStatus: null, githubUrl: null },
        "primary",
      );
      expect(PLANET_SURFACES).toContain(visual.surface);
      expect(visual.shape, `${slug}: 3D bodies are spheres`).toBe("sphere");
      surfaces.push(visual.surface);
    }
    expect(new Set(surfaces).size).toBe(HOMEPAGE_FEATURED_SLUGS.length);
  });

  it("tallyline is complete enough to lead the orbit", () => {
    const c = load("tallyline.json").curated;
    expect(c.liveUrl).toBe("https://tallyline.app");
    expect(c.featured).toBe(true);
    expect(c.highlights.length).toBeGreaterThanOrEqual(3);
    expect(c.techStack.length).toBeGreaterThanOrEqual(4);
    expect(c.description.length).toBeGreaterThan(200);
    expect(c.architecture).toBeTruthy();
  });
});

