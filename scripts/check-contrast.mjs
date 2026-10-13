// WCAG 2.x contrast check for text tokens against the surfaces they sit on.
// Usage: node scripts/check-contrast.mjs   (exit 1 if any pair is below 4.5:1)
import { readFileSync } from "node:fs";

const files = ["src/app/design-system/tokens.css", "public/cosmic-theme.css"];
const MIN = 4.5;

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
const token = (css, name) =>
  css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];

let failed = false;
for (const f of files) {
  const css = readFileSync(f, "utf8");
  const surfaces = ["color-bg", "color-surface", "color-surface-2", "color-surface-3"];
  for (const text of ["color-text", "color-text-muted", "color-text-faint"]) {
    const fg = token(css, text);
    for (const s of surfaces) {
      const bg = token(css, s);
      if (!fg || !bg) continue;
      const r = ratio(fg, bg);
      const ok = r >= MIN;
      if (!ok) failed = true;
      console.log(`${ok ? "ok  " : "FAIL"} ${f} ${text} ${fg} on ${s} ${bg} = ${r.toFixed(2)}:1`);
    }
  }
}
process.exit(failed ? 1 : 0);
