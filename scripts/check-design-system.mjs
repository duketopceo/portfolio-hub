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
