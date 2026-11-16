#!/usr/bin/env node
/**
 * Builds the 1280x720 project thumbnails in public/media/thumbs/<slug>.webp.
 *
 * Every thumbnail shares one frame: black ground, the real image inset with a
 * thin off-white hairline, a tiny mono slug label and a source label that says
 * what the picture is (live capture, README image, terminal output, generated
 * poster). Nothing here draws product UI; sources are real captures only.
 *
 *   node scripts/media/build-thumbs.mjs [slug ...]
 *
 * Env: THUMB_REPOS (dir holding the local clones), THUMB_TERM (dir of captured
 * terminal output as <slug>.txt), THUMB_SRC (downloaded media), THUMB_SITE
 * (origin used for site and generated-poster captures).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(root, "public/media/thumbs");
const REPOS = process.env.THUMB_REPOS ?? "/tmp/repos-p";
const TERM = process.env.THUMB_TERM ?? "/tmp/thumbwork/term";
const SRC = process.env.THUMB_SRC ?? "/tmp/thumbwork/src";
const SITE = process.env.THUMB_SITE ?? "https://luke-the-duke.com";
const POSTER_SITE = process.env.THUMB_POSTER_SITE ?? SITE;

/** Greyscale for every chromatic source: no purple, blue, teal or green in thumbnails. */
const MUTE = "grayscale(1)";

/**
 * kind: "img" (file under REPOS or SRC), "shot" (live page), "term" (captured
 * output), "poster" (generated line-diagram poster from the live site).
 */
const SPECS = {
  kurultai: { kind: "img", file: "kurultai/launch/qc/explainer/e5.png", label: "launch film frame", filter: MUTE },
  argus: { kind: "img", file: "argus/docs/assets/hero-dark.png", label: "README image", fit: "contain", filter: MUTE },
  "dayflow-linux": { kind: "img", file: "dayflow-linux/preview.png", label: "README image", fit: "contain", filter: MUTE },
  kate: { kind: "shot", url: "https://kate.shippedit.dev", label: "live capture", filter: "saturate(0.6)" },
  orchestral: { kind: "poster", label: "generated poster" },
  tallyline: { kind: "shot", url: "https://tallyline.app", label: "live capture", filter: MUTE },
  wordink: { kind: "img", file: "WordInk/docs/screenshots/docs-after-dark.png", label: "docs screenshot", filter: MUTE },
  khan: { kind: "poster", label: "generated poster" },
  "pace-server": { kind: "img", file: `${SRC}/pace-poster.jpg`, label: "launch film poster", filter: MUTE },
  openrouter: { kind: "shot", url: `${SITE}/projects/openrouter`, label: "live capture", filter: MUTE },
  "military-hardware-db": { kind: "poster", label: "generated poster" },
  dixi: { kind: "poster", label: "generated poster" },
  omaseal: { kind: "term", cmd: "omaseal --help", label: "terminal output" },
  wisp: { kind: "img", file: "wisp/assets/readme/panel.png", label: "README image", fit: "contain", filter: MUTE },
  "open-computer": { kind: "img", file: "open-computer/docs/screenshots/console/after-approvals-dark-1440.png", label: "console screenshot", filter: MUTE },
  agentflow: { kind: "img", file: "agentflow/assets/brand/social-card.png", label: "README image", filter: MUTE },
  cairn: { kind: "poster", label: "generated poster" },
  "portfolio-hub": { kind: "shot", url: SITE, label: "live capture", filter: MUTE },
  "reactor-sim": { kind: "img", file: "reactor-sim/docs/media/control-room-standing.png", label: "README image", filter: MUTE },
  homelab: { kind: "poster", label: "generated poster" },
  "luke-agents": { kind: "poster", label: "generated poster" },
  "personal-blog": { kind: "poster", label: "generated poster" },
  "omarchy-plugins": { kind: "img", file: "omarchy-plugins/plugins/io.github.duketopceo.bumblebee/preview.png", label: "plugin preview", filter: MUTE },
  "openrouter-usage": { kind: "img", file: "openrouter_usage/docs/social.png", label: "README image", filter: MUTE },
  "helm-qmk-macropad": { kind: "img", file: "helm-qmk-macropad/cad/preview_plate.png", label: "CAD render", filter: "grayscale(1) brightness(0.75)" },
  "harbor-openrouter-ios-client": { kind: "poster", label: "generated poster" },
  "agent-zero-plugins": { kind: "poster", label: "generated poster" },
  "rts-skyrim": { kind: "poster", label: "generated poster" },
  "scooter-ios": { kind: "poster", label: "generated poster" },
  "jev-compact": { kind: "term", cmd: "jev-compact --help", label: "terminal output" },
  "pinetree-solari-demo": { kind: "img", file: "pinetree-solari-demo/assets/social-screenshot.png", label: "README image", fit: "contain", filter: MUTE },
  snapdex: { kind: "term", cmd: "README: before and after", label: "README example", prompt: false },
  keytypist: { kind: "term", cmd: "keytypist --help", label: "terminal output" },
  fivebyfive: { kind: "poster", label: "generated poster" },
  "pace-gallery": { kind: "poster", label: "generated poster" },
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function frame({ slug, label, inner }) {
  return `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
html,body{width:1280px;height:720px;background:#000;overflow:hidden;font-family:'JetBrains Mono','DejaVu Sans Mono',monospace}
.box{position:absolute;left:64px;top:40px;width:1152px;height:620px;border:1px solid rgba(242,239,234,.28);background:#000;overflow:hidden}
.box img{width:100%;height:100%;display:block}
.tag{position:absolute;top:676px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:rgba(242,239,234,.55)}
.l{left:64px}.r{right:64px}
.term{padding:34px 44px;color:#F2EFEA;font-size:19px;line-height:1.38;white-space:pre}
.term .p{color:rgba(242,239,234,.5)}
</style>
<div class="box">${inner}</div>
<div class="tag l">${esc(slug)}</div><div class="tag r">${esc(label)}</div>`;
}

async function sourceImage(browser, slug, spec) {
  if (spec.kind === "img") {
    const p = path.isAbsolute(spec.file) ? spec.file : path.join(REPOS, spec.file);
    return `data:image/png;base64,${(await sharp(p).png().toBuffer()).toString("base64")}`;
  }
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  let buf;
  if (spec.kind === "shot") {
    await page.addInitScript(() => {
      try { localStorage.setItem("welcome-seen", "1"); sessionStorage.setItem("welcome-seen", "1"); } catch {}
    });
    await page.goto(spec.url, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(2500);
    buf = await page.screenshot({ type: "png" });
  } else {
    // Generated poster: capture the card's own SVG from the site, scaled up.
    await page.goto(`${POSTER_SITE}/projects`, { waitUntil: "load", timeout: 45000 });
    let el = page.locator(`article.cosmic-project-card:has(a[href="/projects/${slug}"]) .showcase-media`).first();
    // Lead projects are not in the card grid; use the dossier's media slot instead.
    if (!(await el.count())) {
      await page.goto(`${POSTER_SITE}/projects/${slug}`, { waitUntil: "load", timeout: 45000 });
      el = page.locator(".showcase-media").first();
    }
    await el.waitFor({ state: "attached", timeout: 15000 });
    await el.evaluate((n) => {
      const wrap = document.createElement("div");
      wrap.style.cssText = "position:fixed;left:0;top:0;width:100vw;height:100vh;background:#000;z-index:2147483647";
      const c = n.cloneNode(true);
      c.style.cssText = "position:absolute;left:0;top:0;width:1152px;border:0";
      wrap.appendChild(c);
      document.body.appendChild(wrap);
    });
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.addStyleTag({ content: "*{transition:none!important;animation:none!important}" });
    await page.waitForTimeout(400);
    buf = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: 1152, height: 648 }, animations: "disabled" });
  }
  await ctx.close();
  return `data:image/png;base64,${buf.toString("base64")}`;
}

async function build(browser, slug) {
  const spec = SPECS[slug];
  let inner;
  if (spec.kind === "term") {
    const body = esc(await readFile(path.join(TERM, `${slug}.txt`), "utf8")).replace(/\s+$/, "");
    const head = spec.prompt === false ? `<span class="p"># ${esc(spec.cmd)}</span>\n\n` : `<span class="p">$</span> ${esc(spec.cmd)}\n\n`;
    inner = `<div class="term">${head}${body}</div>`;
  } else {
    const src = await sourceImage(browser, slug, spec);
    const fit = spec.kind === "img" ? (spec.fit ?? "cover") : "cover";
    const filter = spec.filter ? `filter:${spec.filter};` : "";
    inner = `<img src="${src}" style="object-fit:${fit};object-position:${spec.pos ?? "center top"};${filter}">`;
  }
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.setContent(frame({ slug, label: spec.label, inner }), { waitUntil: "load" });
  const png = await page.screenshot({ type: "png" });
  await page.close();
  let q = 80;
  let out = await sharp(png).webp({ quality: q }).toBuffer();
  while (out.length > 115_000 && q > 40) {
    q -= 5;
    out = await sharp(png).webp({ quality: q }).toBuffer();
  }
  await writeFile(path.join(OUT, `${slug}.webp`), out);
  console.log(`${slug}\t${spec.kind}\tq${q}\t${(out.length / 1024).toFixed(1)} KB`);
}

await mkdir(OUT, { recursive: true });
const want = process.argv.slice(2);
const slugs = want.length ? want : Object.keys(SPECS);
const browser = await chromium.launch();
try {
  for (const s of slugs) {
    if (!SPECS[s]) throw new Error(`no spec for ${s}`);
    await build(browser, s).catch((e) => console.error(`FAIL ${s}: ${e.message}`));
  }
} finally {
  await browser.close();
}
