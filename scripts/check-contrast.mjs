// WCAG 2.x contrast check for text tokens against the surfaces they sit on.
// Each theme block is checked on its own: `:root` is the default set and every
// `[data-theme="x"]` block is a set named x (a block that does not redefine a
// token inherits it from `:root`).
// Usage: node scripts/check-contrast.mjs [--file <css>]   (exit 1 if any pair is below 4.5:1)
import { readFileSync } from "node:fs";

const defaultFiles = ["src/app/design-system/tokens.css", "public/cosmic-theme.css"];
const fileArg = process.argv.indexOf("--file");
const files = fileArg > -1 ? [process.argv[fileArg + 1]] : defaultFiles;
const MIN = 4.5;

const SURFACES = ["color-bg", "color-surface", "color-surface-2", "color-surface-3"];
// Body, muted and faint text, plus the accents that appear as text.
const TEXT = [
  "color-text",
  "color-text-muted",
  "color-text-faint",
  "color-accent",
  "color-signal",
  "color-heat",
  "color-pop",
];

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** Theme name to its own token map, in file order. `:root` alone is "default". */
function themeBlocks(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks = new Map();
  for (const m of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim();
    const named = selector.match(/\[data-theme=["']?([a-z0-9-]+)["']?\]/);
    const isRoot = /(^|,)\s*:root\s*(,|$)/.test(selector);
    const name = named ? named[1] : isRoot ? "default" : null;
    if (!name) continue;
    const tokens = blocks.get(name) ?? {};
    for (const t of m[2].matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\b/g)) tokens[t[1]] = t[2];
    blocks.set(name, tokens);
  }
  return blocks;
}

let failed = false;
let checked = 0;
for (const f of files) {
  const blocks = themeBlocks(readFileSync(f, "utf8"));
  const base = blocks.get("default") ?? {};
  const themed = [...blocks].filter(([name]) => name !== "default");
  // Without data-theme blocks the :root set is the only one; otherwise check every named block.
  const sets = themed.length ? themed : [["default", base]];
  for (const [name, own] of sets) {
    const tokens = { ...base, ...own };
    for (const text of TEXT) {
      for (const s of SURFACES) {
        const fg = tokens[text];
        const bg = tokens[s];
        if (!fg || !bg) {
          // A named theme must define every token: a skipped pair is a silent pass.
          if (name !== "default" && (own[text] || own[s] || base[text] || base[s])) {
            failed = true;
            console.log(`FAIL ${f} [${name}] ${text} on ${s}: token missing or not a #RRGGBB hex`);
          }
          continue;
        }
        const r = ratio(fg, bg);
        const ok = r >= MIN;
        if (!ok) failed = true;
        checked++;
        console.log(`${ok ? "ok  " : "FAIL"} ${f} [${name}] ${text} ${fg} on ${s} ${bg} = ${r.toFixed(2)}:1`);
      }
    }
  }
}
if (checked === 0) {
  console.log("FAIL no color tokens found to check");
  failed = true;
}
process.exit(failed ? 1 : 0);
