import { describe, expect, it } from "vitest";
import { DECLINE_BELOW_FPS, stepDown, starCount, tierSettings } from "./cosmos-quality";

describe("cosmos quality ladder", () => {
  it("steps full -> high -> low -> plate and stays on the plate", () => {
    expect(stepDown("full")).toBe("high");
    expect(stepDown("high")).toBe("low");
    expect(stepDown("low")).toBe("plate");
    expect(stepDown("plate")).toBe("plate");
  });
  it("caps DPR at 1 on every rung", () => {
    for (const t of ["full", "high", "low", "plate"] as const) {
      expect(tierSettings(t).dpr[1]).toBeLessThanOrEqual(1);
    }
  });
  it("drops the lensing first, and only the lensing", () => {
    const full = tierSettings("full");
    const high = tierSettings("high");
    expect(full.lensing).toBe(true);
    expect(high.lensing).toBe(false);
    expect({ ...high, lensing: true, stars: full.stars }).toEqual(full);
  });
  it("gets cheaper each step: fewer pixels, no glow, no extra octave", () => {
    const high = tierSettings("high");
    const low = tierSettings("low");
    expect(low.dpr[1]).toBeLessThan(high.dpr[1]);
    expect(high.glow && !low.glow).toBe(true);
    expect(high.detail).toBe(1);
    expect(low.detail).toBe(0);
  });
  it("thins the starfield on every rung and scales it by viewport area", () => {
    const [full, high, low] = (["full", "high", "low"] as const).map((t) => tierSettings(t).stars);
    expect(full).toBeGreaterThan(high);
    expect(high).toBeGreaterThan(low);
    expect(starCount("full", 1440, 900)).toBe(full);
    expect(starCount("full", 390, 844)).toBeLessThan(full * 0.5);
    expect(starCount("full", 390, 844)).toBeGreaterThan(1000);
    expect(starCount("full", 3840, 2160)).toBeLessThanOrEqual(Math.round(full * 1.2));
    expect(starCount("full", 1441, 900)).toBe(full);
  });
  it("declines below the 55 fps budget with margin for 60 Hz jitter", () => {
    expect(DECLINE_BELOW_FPS).toBeLessThan(55);
    expect(DECLINE_BELOW_FPS).toBeGreaterThan(30);
  });
});
