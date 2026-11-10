import { describe, expect, it } from "vitest";
import { bodyOpacity, bodyPlacement, cosmosLayout, layoutVariant, scrollOffset } from "./cosmos-layout";

describe("cosmos layout", () => {
  it("picks the tall variant for portrait viewports only", () => {
    expect(layoutVariant(390, 844)).toBe("tall");
    expect(layoutVariant(1440, 900)).toBe("wide");
    expect(layoutVariant(1000, 1000)).toBe("wide");
  });
  it.each(["wide", "tall"] as const)("%s places only the black hole, in view and near the middle", (v) => {
    expect(cosmosLayout(v).map((b) => b.id)).toEqual(["blackhole"]);
    const hole = bodyPlacement(v, "blackhole");
    expect(hole.x).toBeGreaterThan(0.4);
    expect(hole.x).toBeLessThan(0.7);
    expect(hole.y).toBeGreaterThan(0.2);
    expect(hole.y).toBeLessThan(0.55);
  });
  it("is full-screen: the disk (about 5x the shadow) spans most of the short side", () => {
    expect(bodyPlacement("wide", "blackhole").size * 5).toBeGreaterThan(1);
    expect(bodyPlacement("tall", "blackhole").size * 5).toBeGreaterThan(1);
  });
  it("scrolls bodies up, clamped, and fades them out at the top", () => {
    expect(scrollOffset(0, 900, 0.5)).toBe(-0);
    expect(scrollOffset(900, 900, 0.5)).toBeCloseTo(-0.5);
    expect(scrollOffset(1e6, 900, 0.5)).toBeCloseTo(-3);
    expect(scrollOffset(100, 0, 0.5)).toBe(0);
    expect(bodyOpacity(0.5)).toBe(1);
    expect(bodyOpacity(-0.2)).toBe(0);
    expect(bodyOpacity(0.065)).toBeCloseTo(0.5);
  });
});
