#!/usr/bin/env node
// Record a scripted browser walkthrough of a web app running against a fixture seed.
//
//   node scripts/media/record-web.mjs --scenario portfolio-hub --base http://127.0.0.1:3190 \
//        --slug portfolio-hub --out ~/Downloads/claude/portfolio/demos
//
// Playwright writes low-bitrate WebM at the viewport size; encode.sh then produces
// <slug>-demo.mp4 + poster, and contact-sheet.sh the review grid. The app under
// test must already be running in its fixture/demo mode (docs/MEDIA.md section 2).
//
// Guards, because this footage gets published:
//  - the base URL must be loopback unless --allow-remote is passed;
//  - every request to another origin is aborted, so no third-party call or real
//    account can appear in frame;
//  - fixed viewport, deviceScaleFactor 1, UTC, en-US, frozen clock.
import { spawnSync } from "node:child_process";
import { mkdirSync, renameSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));

// A scenario is a list of beats run in order. `hold` is the pause (ms) after the beat.
// Add a scenario here for each web project: routes only, no typing of real data.
const SCENARIOS = {
  "portfolio-hub": [
    { goto: "/", hold: 3500 },
    { scroll: 700, hold: 2000 },
    { scroll: 1400, hold: 2000 },
    { goto: "/projects", hold: 3000 },
    { scroll: 600, hold: 2000 },
    { goto: "/projects/kurultai", hold: 3500 },
    { scroll: 700, hold: 2500 },
    { goto: "/hire", hold: 3000 },
    { scroll: 700, hold: 2500 },
  ],
};

function parseArgs(argv) {
  const args = { width: 1280, height: 720, fps: 30 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--allow-remote") args.allowRemote = true;
    else if (a.startsWith("--")) args[a.slice(2)] = argv[++i];
    else throw new Error(`unexpected argument: ${a}`);
  }
  for (const k of ["width", "height", "fps"]) args[k] = Number(args[k]);
  return args;
}

const args = parseArgs(process.argv.slice(2));
const { scenario, base, slug } = args;
if (!scenario || !base || !slug || !args.out) {
  console.error("usage: record-web.mjs --scenario NAME --base URL --slug SLUG --out DIR [--width 1280 --height 720 --allow-remote]");
  console.error(`scenarios: ${Object.keys(SCENARIOS).join(", ")}`);
  process.exit(2);
}
const beats = SCENARIOS[scenario];
if (!beats) {
  console.error(`unknown scenario "${scenario}"; known: ${Object.keys(SCENARIOS).join(", ")}`);
  process.exit(2);
}
const origin = new URL(base);
const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(origin.hostname);
if (!loopback && !args.allowRemote) {
  console.error(`refusing non-loopback base ${origin.origin}; recordings run against a local fixture instance. Pass --allow-remote only for a hosted demo instance.`);
  process.exit(2);
}

const out = resolve(args.out.replace(/^~(?=\/)/, process.env.HOME));
const rawDir = join(out, `.raw-${slug}`);
rmSync(rawDir, { recursive: true, force: true });
mkdirSync(rawDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: args.width, height: args.height },
  deviceScaleFactor: 1,
  locale: "en-US",
  timezoneId: "UTC",
  colorScheme: "dark",
  recordVideo: { dir: rawDir, size: { width: args.width, height: args.height } },
});
await context.route("**/*", (route) => {
  const url = new URL(route.request().url());
  if (url.protocol === "data:" || url.protocol === "blob:" || url.origin === origin.origin) return route.continue();
  return route.abort();
});
const page = await context.newPage();
await page.clock.install({ time: new Date("2026-10-01T12:00:00Z") });
await page.clock.resume();

// Dismiss the first-visit guide popover so it never covers the footage.
await page.goto(new URL("/", origin).toString(), { waitUntil: "networkidle" });
const gotIt = page.getByRole("button", { name: /got it/i });
if (await gotIt.first().isVisible({ timeout: 3000 }).catch(() => false)) await gotIt.first().click();

for (const beat of beats) {
  if (beat.goto) await page.goto(new URL(beat.goto, origin).toString(), { waitUntil: "networkidle" });
  if (beat.scroll !== undefined) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "smooth" }), beat.scroll);
  }
  await page.waitForTimeout(beat.hold ?? 1500);
}

const video = page.video();
await context.close(); // finalizes the WebM
const raw = await video.path();
await browser.close();

const rawNamed = join(out, `${slug}-raw.webm`);
renameSync(raw, rawNamed);
rmSync(rawDir, { recursive: true, force: true });

const enc = spawnSync(join(here, "encode.sh"), [rawNamed, slug, out, "--fps", String(args.fps)], { stdio: "inherit" });
if (enc.status !== 0) process.exit(enc.status ?? 1);
const sheet = spawnSync(join(here, "contact-sheet.sh"), [join(out, `${slug}-demo.mp4`)], { stdio: "inherit" });
process.exit(sheet.status ?? 0);
