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

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgb = (c) => `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
const white = hex(STAR_COLORS.white);
const warm = hex(STAR_COLORS.warm);
const amber = hex(STAR_COLORS.amber);

function colour(warmth) {
  const c = mix(white, warm, Math.min(warmth / 0.5, 1));
  return rgb(warmth > 0.85 ? mix(c, amber, (warmth - 0.85) / 0.15) : c);
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
