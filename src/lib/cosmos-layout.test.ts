import { describe, expect, it } from "vitest";
import { DISK_OUTER, DISK_SPAN, bodyPlacement, layoutVariant, scrollFade, shadowRadius } from "./cosmos-layout";

describe("cosmos layout", () => {
  it("picks the tall variant for portrait viewports only", () => {
    expect(layoutVariant(390, 844)).toBe("tall");
    expect(layoutVariant(1440, 900)).toBe("wide");
    expect(layoutVariant(1000, 1000)).toBe("wide");
  });
  it.each(["wide", "tall"] as const)("%s centres the hole horizontally and frames the first screen", (v) => {
    const hole = bodyPlacement(v);
    expect(hole.x).toBe(0.5);
    expect(hole.y).toBeGreaterThan(0.35);
    expect(hole.y).toBeLessThan(0.55);
  });
  it.each([
    [1440 / 900],
    [390 / 844],
    [2560 / 1080],
    [1],
  ])("the disk bleeds off both edges at aspect %f", (aspect) => {
    const variant = aspect < 1 / 1.05 ? "tall" : "wide";
    const r = shadowRadius(aspect, bodyPlacement(variant).size);
    // Disk half-width (height units) must reach past the viewport half-width.
    expect(r * DISK_OUTER).toBeGreaterThanOrEqual(aspect * (DISK_SPAN / 2) * 2 - 1e-9);
  });
  it("fades slightly with scroll, never to nothing", () => {
    expect(scrollFade(0, 900)).toBe(1);
    expect(scrollFade(1e6, 900)).toBeCloseTo(0.55);
    expect(scrollFade(675, 900)).toBeCloseTo(0.775);
    expect(scrollFade(100, 0)).toBe(1);
  });
});
