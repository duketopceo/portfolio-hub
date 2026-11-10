import { describe, expect, it } from "vitest";
import { bodyOpacity, bodyPlacement, cosmosLayout, layoutVariant, scrollOffset } from "./cosmos-layout";

describe("cosmos layout", () => {
  it("picks the tall variant for portrait viewports only", () => {
    expect(layoutVariant(390, 844)).toBe("tall");
    expect(layoutVariant(1440, 900)).toBe("wide");
    expect(layoutVariant(1000, 1000)).toBe("wide");
  });
  it.each(["wide", "tall"] as const)("%s places only the black hole, in view and off-centre", (v) => {
    expect(cosmosLayout(v).map((b) => b.id)).toEqual(["blackhole"]);
    const hole = bodyPlacement(v, "blackhole");
    expect(hole.x).toBeGreaterThan(0.6);
    expect(hole.x).toBeLessThan(1);
    expect(hole.y).toBeGreaterThan(0);
    expect(hole.y).toBeLessThan(0.5);
  });
  it("keeps the black hole small: about a third of the old radius", () => {
    expect(bodyPlacement("wide", "blackhole").size).toBeLessThanOrEqual(0.4);
    expect(bodyPlacement("tall", "blackhole").size).toBeLessThanOrEqual(0.55);
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
