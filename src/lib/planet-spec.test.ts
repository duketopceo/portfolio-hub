import { describe, expect, it } from "vitest";
import {
  PLANET_SURFACES,
  SPEC_LIMITS,
  derivePalette,
  hexToRgb,
  mixHex,
  resolvePlanetLook,
  resolveRing,
  rgbToHex,
  slugHash,
  unit,
} from "./planet-spec";

const look = (slug: string, authored = {}) =>
  resolvePlanetLook({ slug, type: "platform", baseColor: "#A78BFA", authored });

describe("planet spec defaults", () => {
  it("is deterministic per slug and varies across slugs", () => {
    expect(look("argus")).toEqual(look("argus"));
    expect(look("argus").seed).not.toBe(look("kurultai").seed);
    expect(slugHash("a")).not.toBe(slugHash("b"));
    for (let i = 0; i < 20; i++) {
      const u = unit(slugHash("x"), i);
      expect(u).toBeGreaterThanOrEqual(0);
      expect(u).toBeLessThan(1);
    }
  });

  it("keeps every default inside the schema limits", () => {
    for (const slug of ["a", "b", "tallyline", "pace-server", "orchestral"]) {
      const l = look(slug);
      expect(l.tilt).toBeGreaterThanOrEqual(SPEC_LIMITS.tilt[0]);
      expect(l.tilt).toBeLessThanOrEqual(SPEC_LIMITS.tilt[1]);
      expect(Math.abs(l.rotationSpeed)).toBeLessThanOrEqual(SPEC_LIMITS.rotationSpeed[1]);
      expect(l.atmosphere.strength).toBeLessThanOrEqual(SPEC_LIMITS.atmosphere[1]);
      expect(PLANET_SURFACES).toContain(l.surface);
    }
  });

  it("lets authored fields win and clamps out-of-range ones", () => {
    const l = look("argus", {
      surface: "ice",
      seed: 9,
      tilt: 200,
      rotationSpeed: -3,
      palette: ["#000000", "#111111", "#222222"],
      atmosphere: { strength: 0.9, color: "#FFFFFF" },
    });
    expect(l.surface).toBe("ice");
    expect(l.seed).toBe(9);
    expect(l.tilt).toBe(SPEC_LIMITS.tilt[1]);
    expect(l.rotationSpeed).toBe(SPEC_LIMITS.rotationSpeed[0]);
    expect(l.palette).toEqual(["#000000", "#111111", "#222222"]);
    expect(l.atmosphere).toEqual({ strength: SPEC_LIMITS.atmosphere[1], color: "#FFFFFF" });
  });

  it("derives a surface from the project type when none is authored", () => {
    const by = (type: string) =>
      resolvePlanetLook({ slug: "x", type, baseColor: "#2DD4BF" }).surface;
    expect(by("platform")).toBe("gas");
    expect(by("infra")).toBe("cratered");
    expect(by("experiment")).toBe("ice");
    expect(by("app")).toBe("terrain");
  });
});

describe("palette", () => {
  it("round-trips hex and mixes endpoints", () => {
    expect(rgbToHex(hexToRgb("#2DD4BF"))).toBe("#2dd4bf");
    expect(mixHex("#000000", "#ffffff", 0)).toBe("#000000");
    expect(mixHex("#000000", "#ffffff", 1)).toBe("#ffffff");
  });

  it("orders low < mid < high by luminance for every surface", () => {
    const lum = (hex: string) => {
      const [r, g, b] = hexToRgb(hex);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    for (const surface of PLANET_SURFACES) {
      const [lo, mid, hi] = derivePalette("#A78BFA", surface);
      expect(lum(lo), surface).toBeLessThan(lum(mid));
      expect(lum(mid), surface).toBeLessThan(lum(hi));
    }
  });
});

describe("resolveRing", () => {
  it("fills defaults and keeps outer beyond inner", () => {
    const r = resolveRing({}, "#fff");
    expect(r.inner).toBeLessThan(r.outer);
    expect(r.bands).toBeGreaterThanOrEqual(0);
    expect(resolveRing({ inner: 2, outer: 1.5 }, "#fff").outer).toBeGreaterThan(2);
  });

  it("stacks a following ring outside the previous one", () => {
    const a = resolveRing({}, "#fff");
    const b = resolveRing({}, "#fff", a.outer);
    expect(b.inner).toBeGreaterThan(a.outer);
  });
});
