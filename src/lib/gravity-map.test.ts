import { describe, expect, it } from "vitest";
import { CAPABILITY_IDS, capabilityMeta } from "@/data/capability-meta";
import { siteRedirects } from "@/data/redirects";
import { RANKING_PINS } from "@/data/ranking-pins";
import { listedProjects } from "@/lib/catalog";
import { rankProjects } from "@/lib/ranking";
import {
  buildGravityMap,
  memberJitter,
  centrePositions,
  leadPositions,
  memberPositions,
  TALL_FRAME,
  WIDE_FRAME,
} from "./gravity-map";

const ranked = rankProjects(listedProjects());
const map = buildGravityMap(ranked);

describe("buildGravityMap", () => {
  it("uses the five pinned leads, in pin order", () => {
    expect(map.heroes.map((h) => h.slug)).toEqual([...RANKING_PINS]);
  });

  it("takes each lead's line from its catalog outcome", () => {
    for (const h of map.heroes) {
      const p = ranked.find((r) => r.slug === h.slug);
      expect(h.why).toBe(p?.outcome ?? p?.tagline);
      expect(h.why.length).toBeGreaterThan(20);
    }
  });

  it("has one centre per capability group, in CAPABILITY_ORDER, with the shared colours", () => {
    expect(map.centres.map((c) => c.id)).toEqual([...CAPABILITY_IDS]);
    for (const c of map.centres) {
      expect(c.label).toBe(capabilityMeta[c.id].label);
      expect(c.color).toBe(capabilityMeta[c.id].color);
    }
  });

  it("places every capability-tagged project once: leads plus members equals the group", () => {
    for (const c of map.centres) {
      const leads = map.heroes.filter((h) => h.capability === c.id).length;
      expect(c.members.length + leads).toBe(c.count);
    }
    const tagged = ranked.filter((p) => (CAPABILITY_IDS as readonly string[]).includes(p.capability ?? ""));
    expect(map.total).toBe(tagged.length);
  });

  it("includes reactor-sim under Products and snapdex as ordinary catalog entries", () => {
    const products = map.centres.find((c) => c.id === "products");
    const all = map.centres.flatMap((c) => c.members.map((m) => m.slug));
    expect(products?.members.some((m) => m.slug === "reactor-sim")).toBe(true);
    expect(all).toContain("snapdex");
  });

  it("never lists a lead among the members", () => {
    const members = new Set(map.centres.flatMap((c) => c.members.map((m) => m.slug)));
    for (const h of map.heroes) expect(members.has(h.slug)).toBe(false);
  });

  it("skips a pin that is not listed", () => {
    const m = buildGravityMap(ranked, ["no-such-slug", "argus"]);
    expect(m.heroes.map((h) => h.slug)).toEqual(["argus"]);
  });
});

describe("layout", () => {
  for (const [name, frame] of [["wide", WIDE_FRAME], ["tall", TALL_FRAME]] as const) {
    it(`keeps every body inside the ${name} frame at any phase`, () => {
      const centres = centrePositions(5, frame);
      for (const t of [0, 1.3, 3.9]) {
        const all = [
          ...leadPositions(5, frame, t),
          ...centres.flatMap((c) => memberPositions(12, c, t, memberJitter(12, 3))),
        ];
        for (const p of all) {
          expect(p.x).toBeGreaterThan(0);
          expect(p.x).toBeLessThan(frame.w);
          expect(p.y).toBeGreaterThan(0);
          expect(p.y).toBeLessThan(frame.h);
        }
      }
    });
  }

  it("keeps the same jitter for the same seed", () => {
    expect(memberJitter(6, 4)).toEqual(memberJitter(6, 4));
    expect(memberJitter(6, 4)).not.toEqual(memberJitter(6, 5));
  });

  it("is deterministic", () => {
    expect(memberPositions(7, { x: 10, y: 10 }, 0.5)).toEqual(memberPositions(7, { x: 10, y: 10 }, 0.5));
  });
});

describe("retired /gravity page", () => {
  it("redirects to /projects", () => {
    expect(siteRedirects).toContainEqual({ source: "/gravity", destination: "/projects", permanent: true });
  });
});
