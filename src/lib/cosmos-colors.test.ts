import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { HOLE_COLORS } from "./cosmos-colors";

const SCENE_FILES = [
  "src/components/scene/BlackHole.tsx",
  "src/components/cosmos/BlackHoleSvg.tsx",
  "src/components/cosmos/StaticStardust.tsx",
  "src/lib/stardust.ts",
];

/** Hue in degrees of a #RRGGBB colour. */
function hue(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (d === 0) return 0;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

describe("black-hole scene colours", () => {
  it("are all warm (red to amber hue), never teal, green or violet", () => {
    for (const hex of Object.values(HOLE_COLORS)) {
      const h = hue(hex);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(45);
    }
  });
  it("scene sources do not reach for the site's teal or pop accents", () => {
    for (const file of SCENE_FILES) {
      const src = readFileSync(file, "utf8");
      expect(src, file).not.toMatch(/COSMOS_PALETTE|palette\.teal|#2DD4BF|#A78BFA|uTeal/i);
    }
  });
});
