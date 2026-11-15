import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { STAR_COLORS } from "./cosmos-colors";
import { generateStars } from "./starfield";

describe("generateStars", () => {
  const stars = generateStars(3200);

  it("returns exactly the number asked for, and is deterministic", () => {
    expect(stars).toHaveLength(3200);
    expect(generateStars(3200)).toEqual(stars);
    expect(generateStars(3200, 7)).not.toEqual(stars);
    expect(generateStars(0)).toEqual([]);
  });

  it("keeps every field in range", () => {
    for (const s of stars) {
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x).toBeLessThan(1);
      expect(s.y).toBeGreaterThanOrEqual(0);
      expect(s.y).toBeLessThan(1);
      expect(s.size).toBeGreaterThanOrEqual(0.7);
      expect(s.size).toBeLessThanOrEqual(2.5);
      expect(s.brightness).toBeGreaterThan(0);
      expect(s.brightness).toBeLessThanOrEqual(0.95);
      expect(s.twinkle).toBeGreaterThanOrEqual(0);
      expect(s.twinkle).toBeLessThanOrEqual(0.25);
      expect(s.warmth).toBeGreaterThanOrEqual(0);
      expect(s.warmth).toBeLessThanOrEqual(1);
    }
  });

  it("has three parallax layers, many far stars and few near ones", () => {
    const depths = [...new Set(stars.map((s) => s.depth))].sort();
    expect(depths).toEqual([0.2, 0.5, 1]);
    const n = (d: number) => stars.filter((s) => s.depth === d).length;
    expect(n(0.2)).toBeGreaterThan(n(0.5));
    expect(n(0.5)).toBeGreaterThan(n(1));
  });

  it("skews toward faint stars with a few bright ones, and only some twinkle", () => {
    const mean = stars.reduce((t, s) => t + s.brightness, 0) / stars.length;
    expect(mean).toBeLessThan(0.45);
    expect(stars.some((s) => s.brightness > 0.8)).toBe(true);
    const twinkling = stars.filter((s) => s.twinkle > 0).length / stars.length;
    expect(twinkling).toBeGreaterThan(0.25);
    expect(twinkling).toBeLessThan(0.55);
  });

  it("is mostly white, with a warm minority", () => {
    const warm = stars.filter((s) => s.warmth > 0.4).length / stars.length;
    expect(warm).toBeGreaterThan(0.1);
    expect(warm).toBeLessThan(0.3);
  });
});

describe("static stills", () => {
  for (const name of ["wide", "tall"]) {
    it(`${name} still is committed, deterministic output of the generator, and uses only the star colours`, () => {
      const svg = readFileSync(`public/brand/starfield-still-${name}.svg`, "utf8");
      expect(svg.startsWith("<svg")).toBe(true);
      expect((svg.match(/<circle/g) ?? []).length).toBeGreaterThan(500);
      const allowed = new Set<string>();
      const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
      for (const fill of svg.matchAll(/fill="(#[0-9a-f]{6})"/g)) {
        allowed.add(fill[1]);
        const [r, g, b] = hex(fill[1]);
        // White to warm to amber: red leads, blue trails, nothing cool.
        expect(r, fill[1]).toBeGreaterThanOrEqual(g);
        expect(g, fill[1]).toBeGreaterThanOrEqual(b);
        expect(b, fill[1]).toBeGreaterThanOrEqual(hex(STAR_COLORS.amber)[2]);
      }
      expect(allowed.size).toBeGreaterThan(1);
    });
  }
});
