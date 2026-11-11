// Capture the cosmic background in each rendition for review, and measure
// text contrast against it.
//
//   node scripts/capture-background.mjs --out ~/Downloads/claude/portfolio-r2/background-full2 \
//     [--url http://127.0.0.1:3100] [--chromium /usr/bin/chromium] [--gpu] \
//     [--only live] [--pages /,/projects,/resume]
//
// Renditions: live (WebGL, needs --gpu for a real GPU), static (?cosmos=static),
// reduced (prefers-reduced-motion). Each page at 1440x900 and 390x844, at the top
// and 900 px down, as "page" (with content), "bg" (background alone) and, for the
// contrast report, a hidden "textless" capture (text transparent, panels kept).
// contrast.json lists, per capture, the worst WCAG contrast of any text element
// against what is actually painted under it (95th-percentile brightest pixel).
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};
const url = opt("url", "http://127.0.0.1:3100");
const out = opt("out", "background-full2");
const only = opt("only", "");
const pages = opt("pages", "/,/projects,/resume").split(",");
const gpuArgs = args.includes("--gpu") ? ["--ignore-gpu-blocklist", "--enable-gpu-rasterization", "--use-gl=angle"] : [];
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: opt("chromium", undefined), args: ["--enable-unsafe-swiftshader", ...gpuArgs] });
const renditions = [
  { name: "live", suffix: "cosmos=live&cosmos-tier=pin", reduced: false },
  { name: "static", suffix: "cosmos=static", reduced: false },
  { name: "reduced", suffix: "", reduced: true },
].filter((r) => !only || r.name === only);
const viewports = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

/** Text boxes in the viewport with their computed colour and size. */
const collectText = () =>
  [...document.querySelectorAll("body *")].flatMap((el) => {
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!own) return [];
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) return [];
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return [];
    const m = cs.color.match(/[\d.]+/g).map(Number);
    return [{ tag: el.tagName, text: el.textContent.trim().slice(0, 40), x: r.left, y: r.top, w: r.width, h: r.height, rgb: m.slice(0, 3), a: m[3] ?? 1, size: parseFloat(cs.fontSize), bold: +cs.fontWeight >= 700 }];
  });

/** Decode a PNG in the page and return, per box, the 95th-percentile relative luminance. */
const sampleLuminance = (page, png, boxes) =>
  page.evaluate(
    async ({ b64, boxes }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const g = c.getContext("2d", { willReadFrequently: true });
      g.drawImage(img, 0, 0);
      const lin = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return boxes.map((bx) => {
        const x = Math.max(0, Math.floor(bx.x)), y = Math.max(0, Math.floor(bx.y));
        const w = Math.min(img.width - x, Math.ceil(bx.w)), h = Math.min(img.height - y, Math.ceil(bx.h));
        if (w < 1 || h < 1) return 0;
        const d = g.getImageData(x, y, w, h).data;
        const ls = [];
        for (let i = 0; i < d.length; i += 4) ls.push(0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]));
        ls.sort((p, q) => p - q);
        return ls[Math.floor(ls.length * 0.95)];
      });
    },
    { b64: png.toString("base64"), boxes }
  );

const lum = ([r, g, b]) => {
  const lin = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const report = [];
for (const r of renditions) {
  for (const v of viewports) {
    const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, colorScheme: "dark", reducedMotion: r.reduced ? "reduce" : "no-preference" });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => console.error("pageerror", e.message.slice(0, 80)));
    for (const path of pages) {
      const name = path === "/" ? "home" : path.slice(1);
      const sep = path.includes("?") ? "&" : "?";
      await page.goto(`${url}${path}${r.suffix ? sep + r.suffix : ""}`, { waitUntil: "load" });
      await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
      if (r.name === "live") await page.waitForSelector('.cosmic-bg[data-scene="live"]', { state: "attached", timeout: 30000 });
      await page.waitForTimeout(1200);
      for (const [pos, y] of [["top", 0], ["scrolled", 900]]) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await page.waitForTimeout(600);
        const base = `${out}/${name}-${r.name}-${v.name}-${pos}`;
        await page.screenshot({ path: `${base}-page.png` });
        const boxes = await page.evaluate(collectText);
        let st = await page.addStyleTag({ content: "main, header, footer, nav { visibility: hidden !important; }" });
        await page.waitForTimeout(150);
        await page.screenshot({ path: `${base}-bg.png` });
        await st.evaluate((el) => el.remove());
        st = await page.addStyleTag({ content: "body *{color:transparent !important;text-shadow:none !important;-webkit-text-fill-color:transparent !important}svg,img,canvas:not(.cosmic-bg canvas){visibility:hidden !important}" });
        await page.waitForTimeout(150);
        const textless = await page.screenshot();
        await st.evaluate((el) => el.remove());
        const bgL = await sampleLuminance(page, textless, boxes);
        const rows = boxes.map((b, i) => {
          const fg = lum(b.rgb) * b.a + bgL[i] * (1 - b.a);
          const ratio = (Math.max(fg, bgL[i]) + 0.05) / (Math.min(fg, bgL[i]) + 0.05);
          const large = b.size >= 24 || (b.size >= 18.66 && b.bold);
          return { text: b.text, at: [Math.round(b.x), Math.round(b.y), Math.round(b.w), Math.round(b.h)], color: b.rgb.join(","), tag: b.tag, size: b.size, ratio: +ratio.toFixed(2), need: large ? 3 : 4.5, bgL: +bgL[i].toFixed(3) };
        });
        const fails = rows.filter((x) => x.ratio < x.need);
        report.push({ capture: `${name}-${r.name}-${v.name}-${pos}`, texts: rows.length, minRatio: Math.min(...rows.map((x) => x.ratio)), fails: fails.slice(0, 8) });
      }
    }
    await ctx.close();
  }
}
writeFileSync(`${out}/contrast.json`, JSON.stringify(report, null, 1));
for (const c of report) console.log(c.capture.padEnd(34), "texts", String(c.texts).padStart(3), "min", String(c.minRatio).padStart(6), "fails", c.fails.length);
await browser.close();
