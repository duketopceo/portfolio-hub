import { describe, expect, it } from "vitest";
import { CAPABILITY_IDS } from "@/data/capability-meta";
import { projectConfigs } from "@/data/projects";
import { isListedProject } from "@/lib/catalog-filter";
import { rankProjects } from "@/lib/ranking";
import { layoutSphere, projectPoint, wirePaths, latitudeLine, type SphereInput } from "./sphere-layout";

const ranked = rankProjects(projectConfigs);
const inputs: SphereInput[] = ranked.map((p, i) => ({
  slug: p.slug,
  name: p.displayName,
  capability: p.capability as string,
  rank: i,
  lead: i < 5,
}));
const dots = layoutSphere(inputs, CAPABILITY_IDS);
const wedge = (2 * Math.PI) / CAPABILITY_IDS.length;

describe("layoutSphere", () => {
  it("places every listed project exactly once", () => {
    expect(dots.map((d) => d.slug).sort()).toEqual(
      projectConfigs.filter(isListedProject).map((p) => p.slug).sort()
    );
  });

  it("keeps each dot inside its group's wedge", () => {
    CAPABILITY_IDS.forEach((id, gi) => {
      for (const d of dots.filter((x) => x.capability === id)) {
        const lon = ((d.lon % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        expect(lon).toBeGreaterThan(gi * wedge);
        expect(lon).toBeLessThan((gi + 1) * wedge);
      }
    });
  });

  it("is deterministic", () => {
    expect(layoutSphere(inputs, CAPABILITY_IDS)).toEqual(dots);
  });

  it("puts stronger projects nearer the wedge centre than weaker ones", () => {
    for (const id of CAPABILITY_IDS) {
      const members = dots.filter((d) => d.capability === id).sort((a, b) => a.rank - b.rank);
      const centre = CAPABILITY_IDS.indexOf(id) * wedge + wedge / 2;
      const dist = (d: (typeof members)[number]) => Math.hypot(d.lon - centre, d.lat);
      expect(dist(members[0])).toBeLessThan(dist(members[members.length - 1]) + 1e-9);
    }
  });

  it("keeps every pair of dots at least 4 degrees apart", () => {
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i];
        const b = dots[j];
        const dot = Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z);
        expect((Math.acos(dot) * 180) / Math.PI, `${a.slug}/${b.slug}`).toBeGreaterThan(4);
      }
    }
  });
});

describe("projection", () => {
  it("rotation and tilt keep points on the unit sphere", () => {
    for (const d of dots) {
      for (const phi of [0, 1.3, -2.7, 5]) {
        const q = projectPoint(d, phi);
        expect(Math.hypot(q.x, q.y, q.z)).toBeCloseTo(1, 9);
      }
    }
  });

  it("splits a wire into front and back parts that together cover it", () => {
    const { front, back } = wirePaths(latitudeLine(0), 0, 100, 150, 150);
    expect(front.length).toBeGreaterThan(0);
    expect(back.length).toBeGreaterThan(0);
    expect(front.split("M").length + back.split("M").length - 2).toBe(72);
  });
});
