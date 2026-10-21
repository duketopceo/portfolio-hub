import { describe, expect, it } from "vitest";
import { buildStarfield, STAR_LAYERS } from "./starfield-data";

describe("buildStarfield", () => {
  const f = buildStarfield(20260911);

  it("is deterministic per seed", () => {
    expect(Array.from(buildStarfield(20260911).positions)).toEqual(
      Array.from(f.positions)
    );
  });

  it("splits stars into parallax depth layers", () => {
    const layers = new Set(Array.from(f.depths));
    expect(layers.size).toBe(STAR_LAYERS);
    expect(f.depths.length * 3).toBe(f.positions.length);
    expect(Math.min(...f.depths)).toBe(0);
    expect(Math.max(...f.depths)).toBe(1);
  });

  it("gives every constellation vertex a depth", () => {
    expect(f.segmentDepths.length * 3).toBe(f.segmentPositions.length);
  });
});
