import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const scannedRoots = ["src", "public", "docs", "scripts", "tests", ".github"];
const extensions = new Set([
  ".css",
  ".html",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);
const skippedNames = new Set(["package-lock.json", "bun.lock"]);
const skippedDirectories = new Set(["__screenshots__", "node_modules"]);

const forbidden = [
  {
    label: "personal Gmail mailbox",
    pattern: /[a-z0-9._%+-]+@gmail\.com/i,
  },
  {
    label: "employer mailbox",
    pattern: /luke\.k@bartlettroofs\.com/i,
  },
  {
    label: "telephone link",
    pattern: /\bhref\s*=\s*["']\s*tel\s*:/i,
  },
  {
    label: "phone number",
    pattern: /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/,
  },
  {
    label: "precise coordinates",
    pattern:
      /(?:\b-?\d{1,3}\.\d{3,}\s*,\s*-?\d{1,3}\.\d{3,}\b|\b-?\d{1,3}\.\d{3,}\s*°\s*[NSEW]\b)/i,
  },
];

function lineOf(source, index) {
  return source.slice(0, index).split("\n").length;
}

function shouldScan(path) {
  if (skippedNames.has(path.split("/").pop())) return false;
  if (/\.(?:test|spec)\.[tj]sx?$/.test(path)) return false;
  return extensions.has(extname(path));
}

function* walk(directory) {
  let entries;
  try {
    entries = readdirSync(directory);
  } catch {
    return;
  }

  for (const entry of entries) {
    const path = join(directory, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (!skippedDirectories.has(entry)) yield* walk(path);
    } else if (shouldScan(path)) {
      yield path;
    }
  }
}

const failures = [];

function scanFile(path) {
  const rel = relative(root, path);
  const source = readFileSync(path, "utf8");

  for (const { label, pattern } of forbidden) {
    for (const match of source.matchAll(new RegExp(pattern, "gi"))) {
      failures.push(`${rel}:${lineOf(source, match.index)} ${label}`);
    }
  }
}

for (const scannedRoot of scannedRoots) {
  for (const path of walk(join(root, scannedRoot))) scanFile(path);
}

for (const entry of readdirSync(root)) {
  const path = join(root, entry);
  if (statSync(path).isFile() && shouldScan(path)) scanFile(path);
}

if (failures.length > 0) {
  console.error("Privacy source check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Privacy source check passed.");
