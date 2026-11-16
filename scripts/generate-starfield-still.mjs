// Writes the static starfield stills (public/brand/starfield-still-{wide,tall}.svg).
// They stand in for the WebGL starfield under prefers-reduced-motion, with no
// WebGL, and on software GL. Same generator as the live layer (src/lib/starfield.ts),
// so the sky is made the same way; deterministic, so re-running changes nothing.
// Usage: node scripts/generate-starfield-still.mjs   (needs Node 22.18+ for .ts imports)
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { generateStars } from "../src/lib/starfield.ts";
import { STAR_COLORS } from "../src/lib/cosmos-colors.ts";

const out = fileURLToPath(new URL("../public/brand/", import.meta.url));
mkdirSync(out, { recursive: true });

// Three exact colours only (white, the warm tint, the amber accent), so the stills
// stay inside the palette; the live shader may blend between them.
function colour(warmth) {
  if (warmth > 0.9) return STAR_COLORS.amber.toLowerCase();
  return (warmth > 0.3 ? STAR_COLORS.warm : STAR_COLORS.white).toLowerCase();
}

/** One still: `w` x `h` user units drawn at 1 unit per CSS pixel when the viewport matches. */
function still(file, w, h, count, seed) {
  const r = (n) => Math.round(n * 10) / 10;
  const dots = generateStars(count, seed)
    // The still has no motion, so every star is steady; brightness stays as the opacity.
    .map((s) => {
      const rad = r(Math.max(s.size / 2, 0.45));
      return `<circle cx="${r(s.x * w)}" cy="${r(s.y * h)}" r="${rad}" fill="${colour(s.warmth)}" fill-opacity="${r(s.brightness * 100) / 100}"/>`;
    })
    .join("");
  writeFileSync(
    out + file,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">${dots}</svg>\n`
  );
  console.log(file, count, "stars");
}

still("starfield-still-wide.svg", 1920, 1200, 1500, 20261114);
still("starfield-still-tall.svg", 900, 1600, 900, 20261115);
