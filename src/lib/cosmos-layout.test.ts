import { describe, expect, it } from "vitest";
import { bodyOpacity, bodyPlacement, cosmosLayout, layoutVariant, scrollOffset } from "./cosmos-layout";

describe("cosmos layout", () => {
  it("picks the tall variant for portrait viewports only", () => {
    expect(layoutVariant(390, 844)).toBe("tall");
    expect(layoutVariant(1440, 900)).toBe("wide");
    expect(layoutVariant(1000, 1000)).toBe("wide");
  });
  it.each(["wide", "tall"] as const)("%s places the black hole and three distinct planets in view", (v) => {
    const ids = cosmosLayout(v).map((b) => b.id).sort();
    expect(ids).toEqual(["blackhole", "gas", "ice", "rocky"]);
    for (const b of cosmosLayout(v)) {
      expect(b.x).toBeGreaterThan(0);
      expect(b.x).toBeLessThan(1);
      expect(b.y).toBeGreaterThan(0);
      expect(b.y).toBeLessThan(1);
    }
  });
  it("keeps planets small next to the black hole (restraint)", () => {
    for (const v of ["wide", "tall"] as const) {
      const hole = bodyPlacement(v, "blackhole").size;
      for (const id of ["rocky", "gas", "ice"] as const) expect(bodyPlacement(v, id).size).toBeLessThan(hole / 3);
    }
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
