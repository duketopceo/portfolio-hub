import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { STAR_COLORS } from "./cosmos-colors";
import { COSMOS_PALETTE } from "./palette";

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(`${dir}/${e.name}`) : /\.(tsx?|css)$/.test(e.name) && !/\.test\./.test(e.name) ? [`${dir}/${e.name}`] : []
  );
const SCENE_FILES = [
  ...walk("src/components/scene"),
  ...walk("src/components/cosmos"),
  ...walk("src/components/planet"),
];


describe("background scene colours", () => {
  it("star colours are white, the warm tint, or the amber accent, never cool", () => {
    const allowed = new Set<string>([COSMOS_PALETTE.accent, COSMOS_PALETTE.tint, COSMOS_PALETTE.heat]);
    for (const hex of Object.values(STAR_COLORS)) {
      expect(allowed.has(hex), hex).toBe(true);
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
      expect(r, hex).toBeGreaterThanOrEqual(g);
      expect(g, hex).toBeGreaterThanOrEqual(b);
    }
  });
  it("scene sources do not reach for the site's teal or pop accents", () => {
    for (const file of SCENE_FILES) {
      const src = readFileSync(file, "utf8");
      expect(src, file).not.toMatch(/COSMOS_PALETTE|teal|#2DD4BF|#A78BFA/i);
    }
  });
});
