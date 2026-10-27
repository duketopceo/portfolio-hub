import { describe, expect, it } from "vitest";
import {
  LABEL_BOX,
  moonOffset,
  orbitLayout,
  orbitRadiiRem,
  slotsOverlap,
} from "./orbit-layout";

describe("orbitLayout", () => {
  it("keeps five bodies on one ring at the plate's angles", () => {
    const slots = orbitLayout(5, 23, 11.5);
    expect(slots.every((s) => s.ring === 0)).toBe(true);
    expect(slots[0].x).toBeCloseTo(0, 6);
    expect(slots[0].z).toBeCloseTo(-11.5, 6);
    expect(slots[1].x).toBeCloseTo(23 * Math.cos(-Math.PI / 2 + (2 * Math.PI) / 5), 6);
  });

  it("points labels outward: above on the far half, below on the near half", () => {
    const slots = orbitLayout(5, 23, 11.5);
    expect(slots[0].labelAbove).toBe(true);
    expect(slots[2].labelAbove).toBe(false);
    expect(slots[3].labelAbove).toBe(false);
  });

  it("leaves no overlapping label boxes for a crowded orbit", () => {
    const slots = orbitLayout(22, 25, 12.5);
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        expect(slotsOverlap(slots[i], slots[j])).toBe(false);
      }
    }
    expect(new Set(slots.map((s) => s.ring)).size).toBeGreaterThan(1);
    expect(LABEL_BOX.w).toBeGreaterThan(0);
  });
});

describe("moonOffset", () => {
  it("is deterministic and periodic", () => {
    const a = moonOffset(1, 3, 0, 2);
    const b = moonOffset(1, 3, 0, 2);
    expect(a).toEqual(b);
    const period = (Math.PI * 2) / (0.25 + 0.07 * 1);
    const c = moonOffset(1, 3, period, 2);
    expect(c[0]).toBeCloseTo(a[0], 6);
    expect(c[2]).toBeCloseTo(a[2], 6);
  });

  it("spreads moons around the planet and keeps them near the radius", () => {
    const m0 = moonOffset(0, 3, 0, 2);
    const m1 = moonOffset(1, 3, 0, 2);
    expect(m0).not.toEqual(m1);
    for (const m of [m0, m1]) {
      const d = Math.hypot(m[0], m[1], m[2]);
      expect(d).toBeGreaterThan(1);
      expect(d).toBeLessThanOrEqual(2.0001);
    }
  });
});

describe("orbitRadiiRem", () => {
  it("follows the stage width and caps at 25rem", () => {
    expect(orbitRadiiRem(900).rx).toBeCloseTo(900 / 32 - 4.5, 6);
    expect(orbitRadiiRem(900).ry).toBeCloseTo(orbitRadiiRem(900).rx / 2, 6);
    expect(orbitRadiiRem(2000).rx).toBe(25);
  });

  it("switches to the rounder orbit at exactly 34rem", () => {
    expect(orbitRadiiRem(544).ry / orbitRadiiRem(544).rx).toBeCloseTo(0.8, 6);
    expect(orbitRadiiRem(545).ry / orbitRadiiRem(545).rx).toBeCloseTo(0.5, 6);
  });

  it("rounds the orbit and floors the radius on narrow stages", () => {
    const narrow = orbitRadiiRem(358);
    expect(narrow.rx).toBeGreaterThanOrEqual(7);
    expect(narrow.ry / narrow.rx).toBeCloseTo(0.8, 6);
    expect(orbitRadiiRem(100).rx).toBe(7);
  });
});
