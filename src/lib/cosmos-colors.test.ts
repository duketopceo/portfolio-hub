import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { STAR_COLORS } from "./cosmos-colors";

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
  it("star colours are white or warm, never cool", () => {
    for (const hex of Object.values(STAR_COLORS)) {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
      expect(r, hex).toBeGreaterThanOrEqual(g);
      expect(g, hex).toBeGreaterThanOrEqual(b);
      expect(b, hex).toBeGreaterThanOrEqual(0x6b);
    }
  });
  it("scene sources do not reach for the site's teal or pop accents", () => {
    for (const file of SCENE_FILES) {
      const src = readFileSync(file, "utf8");
      expect(src, file).not.toMatch(/COSMOS_PALETTE|teal|#2DD4BF|#A78BFA/i);
    }
  });
});
