// Capture the cosmic background in each rendition for review.
//
//   node scripts/capture-background.mjs --out ~/Downloads/claude/portfolio-r2/background-full \
//     [--url http://127.0.0.1:3100] [--chromium /usr/bin/chromium] [--gpu] [--only live]
//
// Renditions: live (WebGL, needs --gpu to get a real GPU), static (?cosmos=static),
// reduced (prefers-reduced-motion). Each at 1440x900 and 390x844, scrolled to the
// top and 900 px down, once with the page content ("page") and once the
// background alone ("bg"), so legibility and composition can both be judged.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};
const url = opt("url", "http://127.0.0.1:3100");
const out = opt("out", "background-full");
const only = opt("only", "");
const gpuArgs = args.includes("--gpu")
  ? ["--ignore-gpu-blocklist", "--enable-gpu-rasterization", "--use-gl=angle"]
  : [];
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: opt("chromium", undefined), args: ["--enable-unsafe-swiftshader", ...gpuArgs] });
const renditions = [
  { name: "live", path: "/?cosmos=live&cosmos-tier=pin", reduced: false },
  { name: "static", path: "/?cosmos=static", reduced: false },
  { name: "reduced", path: "/", reduced: true },
].filter((r) => !only || r.name === only);
const viewports = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];
for (const r of renditions) {
  for (const v of viewports) {
    const ctx = await browser.newContext({
      viewport: { width: v.width, height: v.height },
      colorScheme: "dark",
      reducedMotion: r.reduced ? "reduce" : "no-preference",
    });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => console.error("pageerror", e.message));
    await page.goto(`${url}${r.path}`, { waitUntil: "networkidle" });
    if (r.name === "live") await page.waitForSelector('.cosmic-bg[data-scene="live"]', { state: "attached", timeout: 30000 });
    await page.waitForTimeout(1500);
    for (const [pos, y] of [["top", 0], ["scrolled", 900]]) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${out}/${r.name}-${v.name}-${pos}-page.png` });
      const style = await page.addStyleTag({ content: "main, header, footer, nav { visibility: hidden !important; }" });
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${out}/${r.name}-${v.name}-${pos}-bg.png` });
      await style.evaluate((el) => el.remove());
    }
    await ctx.close();
  }
}
await browser.close();
