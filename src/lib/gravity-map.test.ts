import { describe, expect, it } from "vitest";
import {
  buildGravityMap,
  FINISHED_PRODUCTS,
  GRAVITY_CENTRES,
  MIN_CENTRE_SIZE,
  REPO_CENTRE,
  taxonomyGaps,
  type MapRepo,
} from "./gravity-map";
import type { EnrichedProject } from "@/lib/types";

function project(slug: string, over: Partial<EnrichedProject> = {}): EnrichedProject {
  return {
    slug,
    displayName: over.displayName ?? slug,
    tagline: "t",
    description: "d",
    category: "apps",
    type: "app",
    featured: false,
    private: false,
    techStack: ["TypeScript"],
    highlights: [],
    media: { release: "to-record", demo: "n/a" },
    repoName: slug,
    repo: null,
    lastUpdated: "2026-01-01T00:00:00Z",
    language: null,
    languages: [],
    stars: 0,
    forks: 0,
    openIssuesCount: 0,
    ciStatus: null,
    githubUrl: null,
    ...over,
  } as EnrichedProject;
}

/** One project per mapped slug, so the taxonomy can be checked in isolation. */
function fullCatalog(): EnrichedProject[] {
  return Object.keys(REPO_CENTRE).map((slug) => project(slug));
}

describe("buildGravityMap", () => {
  it("separates finished products from the categories", () => {
    const map = buildGravityMap(fullCatalog());
    expect(map.heroes).toHaveLength(Object.keys(FINISHED_PRODUCTS).length);
    expect(map.heroes.every((h) => h.isHero)).toBe(true);
  });

  it("does not count a hero inside its category", () => {
    const map = buildGravityMap(fullCatalog());
    const inFields = Object.values(map.fields)
      .flat()
      .filter((r) => FINISHED_PRODUCTS[r.slug]);
    expect(inFields).toHaveLength(0);
  });

  it("counts every repo exactly once", () => {
    const map = buildGravityMap(fullCatalog());
    const counted =
      map.heroes.length +
      Object.values(map.fields).reduce((n, list) => n + list.length, 0);
    expect(counted).toBe(fullCatalog().length);
  });

  it("never exposes a link for a private entry", () => {
    const catalog = [
      project("kate", { private: true }),
      project("argus"),
    ];
    const map = buildGravityMap(catalog);
    const all: MapRepo[] = [
      ...map.heroes,
      ...Object.values(map.fields).flat(),
    ];
    const priv = all.filter((r) => r.private);
    expect(priv.length).toBeGreaterThan(0);
    expect(priv.every((r) => r.href === null)).toBe(true);
    expect(all.filter((r) => !r.private).every((r) => r.href !== null)).toBe(true);
  });

  it("orders heroes public-first", () => {
    const catalog = Object.keys(FINISHED_PRODUCTS).map((slug) =>
      project(slug, { private: slug === "pace-server" }),
    );
    const map = buildGravityMap(catalog);
    const firstPrivate = map.heroes.findIndex((h) => h.private);
    const lastPublic = map.heroes.map((h) => !h.private).lastIndexOf(true);
    expect(firstPrivate).toBeGreaterThan(lastPublic);
  });

  it("takes the release video and poster when recorded", () => {
    const catalog = [
      project("argus", {
        media: {
          release: {
            url: "https://media.example/a.mp4",
            poster: "https://media.example/a.jpg",
            transcript: "x",
          },
          demo: "n/a",
        },
      }),
    ];
    const repo = buildGravityMap(catalog).fields.models[0];
    expect(repo.video).toBe("https://media.example/a.mp4");
    expect(repo.poster).toBe("https://media.example/a.jpg");
  });

  it("leaves video unset when the release is unrecorded", () => {
    const repo = buildGravityMap([project("argus")]).fields.models[0];
    expect(repo.video).toBeUndefined();
  });

  it("backfills a poster for a video that has none in the catalog", () => {
    const catalog = [
      project("kurultai", {
        media: {
          release: { url: "https://media.example/k.mp4", transcript: "x" },
          demo: "n/a",
        },
      }),
    ];
    const hero = buildGravityMap(catalog).heroes.find((h) => h.slug === "kurultai");
    expect(hero?.video).toBe("https://media.example/k.mp4");
    expect(hero?.poster).toBe("/media/gravity/kurultai-launch.jpg");
  });

  it("keeps the catalog poster when one is recorded", () => {
    const catalog = [
      project("argus", {
        media: {
          release: {
            url: "https://media.example/a.mp4",
            poster: "https://media.example/real.jpg",
            transcript: "x",
          },
          demo: "n/a",
        },
      }),
    ];
    expect(buildGravityMap(catalog).fields.models[0].poster).toBe(
      "https://media.example/real.jpg",
    );
  });

  it("gives a still to a repo with no video", () => {
    const hero = buildGravityMap([project("reactor-sim")]).heroes[0];
    expect(hero.video).toBeUndefined();
    expect(hero.still).toBe("/media/gravity/reactor-sim.jpg");
  });

  it("never gives a repo both a video and a still", () => {
    const catalog = [
      project("kurultai", {
        media: {
          release: { url: "https://media.example/k.mp4", transcript: "x" },
          demo: "n/a",
        },
      }),
    ];
    const hero = buildGravityMap(catalog).heroes[0];
    expect(hero.video).toBeDefined();
    expect(hero.still).toBeUndefined();
  });

  it("sorts featured before the rest within a field", () => {
    // Both non-heroes in Ship & Quality: a hero would be pulled out of the
    // field entirely (covered separately), which is not what this measures.
    const catalog = [
      project("argus", { featured: false }),
      project("orchestral", { featured: true }),
    ];
    const field = buildGravityMap(catalog).fields.models;
    expect(field.map((r) => r.slug)).toEqual(["orchestral", "argus"]);
  });
});

describe("taxonomyGaps", () => {
  it("reports nothing when every slug is mapped", () => {
    // Every mapped slug present, so nothing should be reported.
    const catalog = fullCatalog();
    const missing = catalog.filter(
      (p) => !REPO_CENTRE[p.slug] && !FINISHED_PRODUCTS[p.slug],
    );
    expect(missing).toHaveLength(0);
    expect(taxonomyGaps(catalog)).toHaveLength(0);
  });

  it("flags an unmapped slug", () => {
    const gaps = taxonomyGaps([project("brand-new-repo")]);
    expect(gaps.join(" ")).toContain("brand-new-repo");
  });

  it("flags a hero whose slug is not in the catalog", () => {
    const gaps = taxonomyGaps([project("argus")]);
    expect(gaps.join(" ")).toContain("hero");
  });

  it("flags a named centre below the floor", () => {
    const gaps = taxonomyGaps([project("argus")]);
    expect(gaps.join(" ")).toMatch(/\(< 4\)/);
  });

  it("keeps every named centre at or above the floor", () => {
    const map = buildGravityMap(fullCatalog());
    for (const centre of map.centres) {
      expect(centre.count).toBeGreaterThanOrEqual(MIN_CENTRE_SIZE);
    }
  });

  it("gives every centre a distinct key", () => {
    const keys = GRAVITY_CENTRES.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  /*
   * The map is a hard black-and-white contract: hue must never carry meaning.
   * These guard the two ways that could regress — a colour sneaking back into
   * a centre definition, or a tone outside the 0..1 luminance range.
   */
  it("carries no hue, only luminance", () => {
    for (const centre of GRAVITY_CENTRES) {
      expect(centre).not.toHaveProperty("colour");
      expect(typeof centre.tone).toBe("number");
      expect(centre.tone).toBeGreaterThan(0);
      expect(centre.tone).toBeLessThanOrEqual(1);
    }
  });

  it("gives every centre a distinct tone", () => {
    const tones = GRAVITY_CENTRES.map((c) => c.tone);
    expect(new Set(tones).size).toBe(tones.length);
  });

  it("keeps tone out of the rendered field data", () => {
    const map = buildGravityMap(fullCatalog());
    for (const centre of map.centres) {
      expect(centre).not.toHaveProperty("colour");
      expect(typeof centre.tone).toBe("number");
    }
  });
});
