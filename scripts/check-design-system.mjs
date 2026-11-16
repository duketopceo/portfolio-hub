import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const sourceRoot = join(root, "src");
const extensions = new Set([".css", ".ts", ".tsx", ".js", ".jsx"]);
const retiredTokens = [
  "--font-exo",
  "--hud-",
  "--launch-blue",
  "--black-hole",
  "--radius-card",
];

function* walk(directory) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) yield* walk(path);
    else if (extensions.has(extname(path))) yield path;
  }
}

function lineOf(source, index) {
  return source.slice(0, index).split("\n").length;
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, (comment) =>
    comment.replace(/[^\n]/g, " "),
  );
}

function radiusPixels(value) {
  const match = /^([0-9]+(?:\.[0-9]+)?)(px|rem|em)$/.exec(value);
  if (!match) return null;
  const amount = Number(match[1]);
  return match[2] === "px" ? amount : amount * 16;
}

function isCircular(value) {
  return value === "50%" || value === "999px" || value === "9999px";
}

function checkRadiusValues(source, rel, declaration, index) {
  for (const value of declaration.trim().split(/\s+/)) {
    const clean = value.replace(/^['"]|['"]$/g, "");
    const pixels = radiusPixels(clean);
    if (pixels !== null && pixels > 4 && !isCircular(clean)) {
      failures.push(
        `${rel}:${lineOf(source, index)} unsupported border-radius ${clean}`,
      );
    } else if (/^[0-9]+(?:\.[0-9]+)?%$/.test(clean) && clean !== "50%") {
      failures.push(
        `${rel}:${lineOf(source, index)} unsupported percentage border-radius ${clean}`,
      );
    }
  }
}

const failures = [];

// Palette (BRAND.md, 2026-11-15): black, white, a warm-tinted white and greys, plus at
// most TWO accents. Any other chromatic colour (purple, blue, teal, green, gold, ...) fails.
const ACCENT_HEX = new Set(["#ff9f1c", "#ff5c1a"]); // amber, ember
const ACCENT_RGB = new Set(["255,159,28", "255,92,26"]);
const NEUTRAL_CHROMA = 12; // the warm tint #F2EFEA sits at 8
const paletteRoots = [
  [join(root, "src"), new Set([".css", ".ts", ".tsx", ".js", ".jsx", ".json"])],
  [join(root, "public"), new Set([".css", ".svg"])],
  [join(root, "scripts"), new Set([".mjs", ".css"])],
];
// Tests and fixtures name colours on purpose; the resume PDF is a print document (black on white, no hue).
const paletteSkip = /(\.test\.|ranking-snapshot\.json|\.fixture\.|export-resume-pdf|check-design-system)/;

function expandHex(h) {
  const x = h.slice(1);
  if (x.length === 3 || x.length === 4) return "#" + [...x.slice(0, 3)].map((c) => c + c).join("");
  return "#" + x.slice(0, 6);
}

function chroma(r, g, b) {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function checkPalette(source, rel) {
  for (const m of source.matchAll(/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g)) {
    // Skip prose like "PR #225" and anchors such as "#a1": a colour follows a delimiter.
    const before = source[m.index - 1] ?? "";
    if (!/[\s:(,"'`]/.test(before)) continue;
    if (/^#\d{3,4}$/.test(m[0]) && !/(?:color|fill|stroke|background|border|shadow)[^;\n]*$/i.test(source.slice(Math.max(0, m.index - 80), m.index))) continue;
    const hex = expandHex(m[0]).toLowerCase();
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    if (chroma(r, g, b) <= NEUTRAL_CHROMA || ACCENT_HEX.has(hex)) continue;
    failures.push(`${rel}:${lineOf(source, m.index)} ${m[0]} is outside the palette (black, white, tinted white, greys, amber #FF9F1C, ember #FF5C1A)`);
  }
  for (const m of source.matchAll(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g)) {
    const [r, g, b] = [m[1], m[2], m[3]].map(Number);
    if (chroma(r, g, b) <= NEUTRAL_CHROMA || ACCENT_RGB.has(`${r},${g},${b}`)) continue;
    failures.push(`${rel}:${lineOf(source, m.index)} ${m[0]}) is outside the palette`);
  }
  for (const m of source.matchAll(/\bhsla?\(/g)) {
    failures.push(`${rel}:${lineOf(source, m.index)} hsl() colours are not allowed; use palette tokens`);
  }
  for (const m of source.matchAll(
    /\b(?:text|bg|border|fill|stroke|from|to|via|ring|outline|decoration|accent|caret|shadow)-(?:purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|fuchsia|pink|rose|red|orange|amber|yellow)-\d{2,3}\b/g,
  )) {
    failures.push(`${rel}:${lineOf(source, m.index)} Tailwind colour ${m[0]} is outside the palette`);
  }
}

function* walkAll(d, exts) {
  for (const entry of readdirSync(d)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const path = join(d, entry);
    if (statSync(path).isDirectory()) yield* walkAll(path, exts);
    else if (exts.has(extname(path))) yield path;
  }
}

for (const [dir, exts] of paletteRoots) {
  for (const path of walkAll(dir, exts)) {
    const rel = relative(root, path);
    if (paletteSkip.test(rel)) continue;
    checkPalette(readFileSync(path, "utf8"), rel);
  }
}

for (const path of walk(sourceRoot)) {
  const rel = relative(root, path);
  const source = stripComments(readFileSync(path, "utf8"));

  for (const match of source.matchAll(/backdrop-?filter\s*:/gi)) {
    failures.push(`${rel}:${lineOf(source, match.index)} backdrop-filter is retired`);
  }

  for (const match of source.matchAll(
    /var\(\s*--(?:color|text|font|radius|space|cosmic|page|measure|glass)-[\w-]+\s*,\s*(?!var\()[^)]+\)/g,
  )) {
    failures.push(`${rel}:${lineOf(source, match.index)} raw CSS variable fallback`);
  }

  for (const token of retiredTokens) {
    let index = source.indexOf(token);
    while (index !== -1) {
      failures.push(`${rel}:${lineOf(source, index)} retired token ${token}`);
      index = source.indexOf(token, index + token.length);
    }
  }

  for (const match of source.matchAll(
    /\bborder(?:-[a-z]+){0,3}-radius\s*:\s*([^;\n]+)/gi,
  )) {
    checkRadiusValues(source, rel, match[1], match.index);
  }

  for (const match of source.matchAll(
    /\bborderRadius\s*:\s*("[^"]+"|'[^']+'|[0-9]+(?:\.[0-9]+)?(?:px|rem|em)?)/g,
  )) {
    checkRadiusValues(source, rel, match[1], match.index);
  }

  for (const match of source.matchAll(/\brounded(?:-([A-Za-z0-9_[\]%-]+))?/g)) {
    const utility = match[1];
    if (utility && !["full", "none", "sm"].includes(utility)) {
      failures.push(
        `${rel}:${lineOf(source, match.index)} unsupported Tailwind radius rounded-${utility}`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error("Design-system source check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Design-system source check passed.");
