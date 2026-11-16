import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ACCENTS, COSMOS_PALETTE, PALETTE_TOKENS } from "./palette";
import { catColors } from "./utils";

const tokens = readFileSync("src/app/design-system/tokens.css", "utf8");

function tokenHex(name: string): string | undefined {
  return tokens.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1]?.toUpperCase();
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
function hue(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}
const hueGap = (a: string, b: string) => {
  const d = Math.abs(hue(a) - hue(b));
  return Math.min(d, 360 - d);
};
const chromatic = (hex: string) => {
  const c = rgb(hex);
  return Math.max(...c) - Math.min(...c) > 40;
};
function luminance(hex: string) {
  const [r, g, b] = rgb(hex).map((v) => v / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("palette tokens", () => {
  it("mirrors the CSS tokens in palette.ts", () => {
    for (const [role, token] of Object.entries(PALETTE_TOKENS)) {
      expect(tokenHex(token), token).toBe(COSMOS_PALETTE[role as keyof typeof PALETTE_TOKENS]);
    }
    expect(tokenHex("--color-bg")).toBe(COSMOS_PALETTE.night);
  });

  it("uses exactly two chromatic colours in the token layer, both warm: amber and ember", () => {
    const hexes = [...tokens.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0].toUpperCase());
    const chroma = new Set(hexes.filter(chromatic));
    expect([...chroma].sort()).toEqual([...ACCENTS].map((h) => h.toUpperCase()).sort());
    for (const hex of chroma) expect(hue(hex), hex).toBeLessThanOrEqual(40);
  });

  it("has no purple, blue, teal or green anywhere in the token layer, the palette or the shared theme", () => {
    const theme = readFileSync("public/cosmic-theme.css", "utf8");
    for (const css of [tokens, theme]) {
      const hexes = [...css.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0]);
      for (const hex of hexes.filter(chromatic)) expect(hue(hex) <= 40 || hue(hex) >= 345, hex).toBe(true);
      expect(css).not.toMatch(/45,\s*212,\s*191/);
    }
    for (const hex of Object.values(COSMOS_PALETTE)) {
      if (chromatic(hex)) expect(hue(hex), hex).toBeLessThanOrEqual(40);
    }
  });

  it("keeps white primary, a barely warm tint, and a true black ground", () => {
    expect(COSMOS_PALETTE.accent).toBe("#FFFFFF");
    expect(tokenHex("--color-text")).toBe("#FFFFFF");
    expect(tokenHex("--color-bg")).toBe("#000000");
    const [r, g, b] = rgb(COSMOS_PALETTE.tint);
    // Subtle: warm (r >= g >= b), but within 12 of grey and brighter than 90% white.
    expect(r).toBeGreaterThanOrEqual(g);
    expect(g).toBeGreaterThanOrEqual(b);
    expect(r - b).toBeLessThanOrEqual(12);
    expect(luminance(COSMOS_PALETTE.tint)).toBeGreaterThan(0.85);
  });

  it("keeps ember and amber distinguishable by hue", () => {
    expect(hueGap(COSMOS_PALETTE.ember, COSMOS_PALETTE.heat)).toBeGreaterThan(15);
  });

  it("keeps every palette colour readable as text on every surface", () => {
    for (const surface of ["--color-bg", "--color-surface", "--color-surface-2", "--color-surface-3"]) {
      const bg = tokenHex(surface)!;
      for (const c of [COSMOS_PALETTE.accent, COSMOS_PALETTE.tint, COSMOS_PALETTE.ember, COSMOS_PALETTE.heat]) {
        expect(contrast(c, bg), `${c} on ${surface}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("makes live status amber and retires the old green and gold", () => {
    expect(tokens).toMatch(/--color-live:\s*var\(--color-heat\)/);
    expect(tokens.toUpperCase()).not.toContain("#34D399");
    expect(tokens.toUpperCase()).not.toContain("#F5D76E");
    expect(tokens).not.toMatch(/--color-(pop|group-sand|group-clay)/);
  });

  it("makes every category colour white: groups are told apart by name, not hue", () => {
    for (const [cat, hex] of Object.entries(catColors)) expect(hex, cat).toBe("#FFFFFF");
  });
});
