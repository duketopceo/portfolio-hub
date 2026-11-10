// Measure the live cosmic background against a running site.
//
//   node scripts/measure-background.mjs [--url http://127.0.0.1:3100] \
//     [--path "/?cosmos=live"] [--chromium /usr/bin/chromium] [--gpu] \
//     [--seconds 6] [--cpu-throttle 1] [--out dir]
//
// Reports: WebGL renderer string, JS bytes transferred before the page is
// idle, fps (rAF frame deltas) idle and while scrolling at 1440x900, and the
// quality tier (`data-cosmos-tier`) and scene state (`data-scene`) reached.
// `--gpu` asks Chromium for a real GPU via ANGLE; without it you get whatever
// the bundled browser picks (software GL in CI and in Playwright's build).
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};
const flag = (name) => args.includes(`--${name}`);

const url = opt("url", "http://127.0.0.1:3100");
const path = opt("path", "/?cosmos=live");
const seconds = Number(opt("seconds", "6"));
const cpuThrottle = Number(opt("cpu-throttle", "1"));
const executablePath = opt("chromium", undefined);
const gpuArgs = flag("gpu")
  ? ["--ignore-gpu-blocklist", "--enable-gpu-rasterization", "--enable-zero-copy", "--use-gl=angle"]
  : [];

const browser = await chromium.launch({
  executablePath,
  args: ["--enable-unsafe-swiftshader", ...gpuArgs],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
const page = await context.newPage();
const logs = [];
page.on("console", (m) => {
  if (m.text().includes("[cosmos]")) logs.push(m.text());
});

const cdp = await context.newCDPSession(page);
await cdp.send("Network.enable");
if (cpuThrottle > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpuThrottle });
const scripts = new Map();
cdp.on("Network.responseReceived", (e) => {
  if (e.type === "Script") scripts.set(e.requestId, e.response.url);
});
let jsBytes = 0;
cdp.on("Network.loadingFinished", (e) => {
  if (scripts.has(e.requestId)) jsBytes += e.encodedDataLength;
});

await page.goto(`${url}${path}`, { waitUntil: "networkidle" });
const renderer = await page.evaluate(() => {
  const gl = document.createElement("canvas").getContext("webgl2");
  const info = gl?.getExtension("WEBGL_debug_renderer_info");
  return gl && info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : "unknown";
});

const fpsProbe = (ms) =>
  page.evaluate(
    (duration) =>
      new Promise((resolve) => {
        const deltas = [];
        let last = performance.now();
        const start = last;
        const tick = (now) => {
          deltas.push(now - last);
          last = now;
          if (now - start < duration) requestAnimationFrame(tick);
          else {
            const s = [...deltas].sort((a, b) => a - b);
            const total = deltas.reduce((a, b) => a + b, 0);
            resolve({
              frames: deltas.length,
              avgFps: +((deltas.length / total) * 1000).toFixed(1),
              p5Fps: +(1000 / s[Math.floor(s.length * 0.95)]).toFixed(1),
              worstMs: +s[s.length - 1].toFixed(1),
            });
          }
        };
        requestAnimationFrame(tick);
      }),
    ms
  );

const state = () =>
  page.evaluate(() => {
    const bg = document.querySelector(".cosmic-bg");
    return {
      cosmos: bg?.getAttribute("data-cosmos"),
      scene: bg?.getAttribute("data-scene"),
      tier: bg?.getAttribute("data-cosmos-tier"),
      canvases: document.querySelectorAll(".cosmic-bg canvas").length,
    };
  });

await page.waitForTimeout(2500); // let the live scene mount and settle
const before = await state();
const idle = await fpsProbe(seconds * 1000);

// Scroll continuously in the page while sampling.
await page.evaluate(() => {
  const step = () => {
    window.scrollBy(0, 12);
    if (window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 2) {
      window.__scrollId = requestAnimationFrame(step);
    } else {
      window.scrollTo(0, 0);
      window.__scrollId = requestAnimationFrame(step);
    }
  };
  window.__scrollId = requestAnimationFrame(step);
});
const scrolling = await fpsProbe(seconds * 1000);
await page.evaluate(() => cancelAnimationFrame(window.__scrollId));
const after = await state();

console.log(
  JSON.stringify(
    { url: `${url}${path}`, browser: executablePath ?? "playwright-bundled", gpuFlags: gpuArgs, renderer, cpuThrottle, jsBytesTransferred: jsBytes, before, idle, scrolling, after, logs },
    null,
    2
  )
);
await browser.close();
