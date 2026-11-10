import { describe, expect, it } from "vitest";
import { HOLE_COLORS } from "./cosmos-colors";
import {
  STARDUST_COLORS,
  dustProgress,
  moteCount,
  pickColor,
  seedMotes,
  spawnMote,
  staticDust,
  stepMote,
} from "./stardust";

const rng = (seed = 7) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

describe("stardust", () => {
  it("is sparse and scales with width", () => {
    expect(moteCount(0)).toBe(0);
    expect(moteCount(390)).toBe(14);
    expect(moteCount(1440)).toBe(38);
    expect(moteCount(5000)).toBe(44);
  });
  it("is idle at the top of the page and ramps in with scroll", () => {
    expect(dustProgress(0, 900)).toBe(0);
    expect(dustProgress(405, 900)).toBeCloseTo(0.5);
    expect(dustProgress(9999, 900)).toBe(1);
    expect(dustProgress(100, 0)).toBe(0);
  });
  it("draws only warm colours, warm white dominant", () => {
    expect(STARDUST_COLORS).toEqual([HOLE_COLORS.white, HOLE_COLORS.amber, HOLE_COLORS.ember]);
    expect(pickColor(0.1)).toBe(0);
    expect(pickColor(0.7)).toBe(1);
    expect(pickColor(0.95)).toBe(2);
    const r = rng();
    const counts = [0, 0, 0];
    for (let i = 0; i < 4000; i++) counts[pickColor(r())]++;
    expect(counts[0]).toBeGreaterThan(counts[1]);
    expect(counts[2]).toBeLessThan(counts[1]);
  });
  it("falls down, respawns past the bottom, and drifts against scroll", () => {
    const m = spawnMote(rng(), 800, 600, false);
    const y0 = m.y;
    expect(stepMote(m, 1, 600, 0)).toBe(m.y > 612);
    expect(m.y).toBeGreaterThan(y0);
    const m2 = { ...m, y: 100 };
    stepMote(m2, 0, 600, 100);
    expect(m2.y).toBe(65);
    expect(stepMote({ ...m, y: 700 }, 0, 600, 0)).toBe(true);
    expect(spawnMote(rng(), 800, 600, true).y).toBeLessThan(0);
  });
  it("seeds a full field inside the viewport", () => {
    const motes = seedMotes(rng(), 1000, 700);
    expect(motes).toHaveLength(moteCount(1000));
    for (const m of motes) {
      expect(m.x).toBeLessThanOrEqual(1000);
      expect(m.y).toBeLessThanOrEqual(700);
    }
  });
  it("static dust is deterministic and in the unit tile", () => {
    const a = staticDust(1, 30);
    expect(staticDust(1, 30)).toEqual(a);
    expect(staticDust(2, 30)).not.toEqual(a);
    for (const p of a) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThan(1);
      expect(p.color).toBeLessThan(STARDUST_COLORS.length);
    }
  });
});
