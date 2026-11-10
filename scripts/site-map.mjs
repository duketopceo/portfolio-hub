#!/usr/bin/env node
// Regenerates docs/sitemap.md from a running site (live or a local build).
//
//   node scripts/site-map.mjs [--base https://luke-the-duke.com] [--out docs/sitemap.md]
//                             [--external] [--json out.json]
//
// Read-only: GET requests only, one request per URL, low concurrency.
// --external also HEAD-checks every outbound link (slower; GET fallback on 405).
// Local build: `npm run build && PORT=3187 node scripts/start-standalone.mjs`,
// then `--base http://localhost:3187`.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = args.indexOf(name);
  return i > -1 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : dflt;
};
const BASE = flag("--base", "https://luke-the-duke.com").replace(/\/+$/, "");
const OUT = join(root, flag("--out", "docs/sitemap.md"));
const JSON_OUT = flag("--json", null);
const CHECK_EXTERNAL = args.includes("--external");
const origin = new URL(BASE).origin;
const UA = "portfolio-hub-site-map/1 (read-only audit)";

const API_ENDPOINTS = [
  "/api/health",
  "/api/repos",
  "/api/activity",
  "/api/activity/kurultai",
  "/api/github/pulls",
  "/api/github/repo/kurultai/summary",
  "/openrouter/api/bakeoff",
  "/resume.json",
  "/resume.md",
  "/sitemap.xml",
  "/robots.txt",
  "/llms.txt",
];

async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    })
  );
  return out;
}

async function probe(url, init = {}) {
  const t = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "manual",
      headers: { "user-agent": UA },
      signal: AbortSignal.timeout(20_000),
      ...init,
    });
    const body = init.method === "HEAD" ? "" : await res.text();
    return {
      status: res.status,
      location: res.headers.get("location"),
      type: (res.headers.get("content-type") || "").split(";")[0],
      cache: res.headers.get("cache-control") || "",
      bytes: Buffer.byteLength(body),
      ms: Date.now() - t,
      body,
    };
  } catch (e) {
    return { status: 0, error: e.cause?.code || e.name, ms: Date.now() - t, bytes: 0, body: "" };
  }
}

function hrefs(html) {
  return [...html.matchAll(/<a\b[^>]*?\shref=("([^"]*)"|'([^']*)')/gi)].map((m) =>
    (m[2] ?? m[3]).replace(/&amp;/g, "&")
  );
}
const titleOf = (html) => html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].trim() ?? "";

function normalise(href, from) {
  try {
    const u = new URL(href, origin + from);
    u.hash = "";
    return u;
  } catch {
    return null;
  }
}

function redirectSources() {
  const src = readFileSync(join(root, "src/data/redirects.ts"), "utf8");
  const slugs = [...src.matchAll(/from:\s*"([^"]+)"/g)].map((m) => `/projects/${m[1]}`);
  const site = [...src.matchAll(/source:\s*"([^"]+)"/g)].map((m) => m[1]);
  return [...new Set([...site, ...slugs, "/podcast/episodes/ep009"])];
}

// ---- crawl internal pages -------------------------------------------------
const pages = new Map(); // path -> probe
const edges = new Map(); // path -> Set(path)
const externals = new Map(); // url -> Set(source path)
const queue = ["/"];
const seen = new Set(queue);
while (queue.length) {
  const batch = queue.splice(0, 6);
  await pool(batch, 6, async (path) => {
    const r = await probe(origin + path);
    pages.set(path, r);
    if (r.status !== 200 || !r.type.includes("html")) return;
    const out = new Set();
    for (const h of hrefs(r.body)) {
      if (/^(mailto:|tel:|javascript:|#)/i.test(h)) continue;
      const u = normalise(h, path);
      if (!u) continue;
      if (u.origin === origin) {
        const p = u.pathname.replace(/(.)\/$/, "$1") + u.search;
        out.add(p);
        if (!seen.has(p) && !/^\/(_next|api|monitoring|cdn-cgi)\b/.test(p) && !/\.[a-z0-9]{2,5}$/i.test(p)) {
          seen.add(p);
          queue.push(p);
        }
      } else if (/^https?:$/.test(u.protocol)) {
        const key = u.href;
        if (!externals.has(key)) externals.set(key, new Set());
        externals.get(key).add(path);
      }
    }
    edges.set(path, out);
  });
}

// ---- redirects, endpoints, externals --------------------------------------
const redirects = await pool(redirectSources(), 6, async (p) => ({ from: p, ...(await probe(origin + p)) }));
const endpoints = await pool(API_ENDPOINTS, 4, async (p) => ({ path: p, ...(await probe(origin + p)) }));

const ext = [];
if (CHECK_EXTERNAL) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const check = async (u) => {
    let r = await probe(u, { method: "HEAD", redirect: "follow" });
    if (r.status === 405 || r.status === 403 || r.status === 0) r = await probe(u, { redirect: "follow" });
    // Hosts that throttle: back off and retry instead of reporting a false failure.
    for (let i = 0; i < 3 && r.status === 429; i++) {
      await sleep(5000 * (i + 1));
      r = await probe(u, { redirect: "follow" });
    }
    return { url: u, status: r.status, error: r.error };
  };
  const urls = [...externals.keys()];
  // github.com is polite-throttled (one at a time); everything else runs in parallel.
  const gh = urls.filter((u) => new URL(u).hostname === "github.com");
  const other = urls.filter((u) => new URL(u).hostname !== "github.com");
  const [a, b] = await Promise.all([
    pool(other, 8, check),
    pool(gh, 1, async (u) => {
      await sleep(300);
      return check(u);
    }),
  ]);
  for (const r of [...a, ...b]) ext.push({ ...r, from: [...externals.get(r.url)].sort() });
}

// ---- render ----------------------------------------------------------------
const kb = (n) => (n / 1024).toFixed(1);
const date = new Date().toISOString().slice(0, 10);
const L = [];
L.push("# Site map");
L.push("");
L.push(`Generated ${date} by \`node scripts/site-map.mjs --base ${BASE}${CHECK_EXTERNAL ? " --external" : ""}\`. Do not edit by hand; rerun the script.`);
L.push("");
L.push("## Pages");
L.push("");
L.push("| Path | Status | KB | ms | Title |");
L.push("| --- | --- | ---: | ---: | --- |");
for (const [p, r] of [...pages].sort((a, b) => a[0].localeCompare(b[0]))) {
  L.push(`| \`${p}\` | ${r.status || r.error} | ${kb(r.bytes)} | ${r.ms} | ${titleOf(r.body).replace(/\|/g, "\\|")} |`);
}
L.push("");
L.push(`${pages.size} pages reachable from \`/\` by internal links.`);
L.push("");
L.push("## Links off the home page");
L.push("");
const home = [...(edges.get("/") ?? [])].sort();
for (const p of home) L.push(`- \`${p}\``);
L.push("");
L.push("## Redirects");
L.push("");
L.push("Sources come from `src/data/redirects.ts` (`siteRedirects`, `retiredSlugs`) plus the podcast move in `next.config.ts`.");
L.push("");
L.push("| From | Status | To |");
L.push("| --- | --- | --- |");
for (const r of redirects) {
  const to = r.location ? r.location.replace(origin, "") : "";
  L.push(`| \`${r.from}\` | ${r.status || r.error} | ${to ? `\`${to}\`` : ""} |`);
}
L.push("");
L.push("## API and data endpoints");
L.push("");
L.push("| Path | Status | Type | KB | Cache-Control |");
L.push("| --- | --- | --- | ---: | --- |");
for (const e of endpoints) {
  L.push(`| \`${e.path}\` | ${e.status || e.error} | ${e.type || ""} | ${kb(e.bytes)} | ${e.cache ? `\`${e.cache}\`` : "none"} |`);
}
L.push("");
L.push("## Outbound links");
L.push("");
L.push(`${externals.size} distinct outbound URLs across ${pages.size} pages.`);
L.push("");
if (CHECK_EXTERNAL) {
  const bad = ext.filter((e) => e.status === 0 || e.status >= 400).sort((a, b) => a.url.localeCompare(b.url));
  L.push("### Failing (status 0 or >= 400)");
  L.push("");
  L.push("403/429 from npm, claude.ai and similar are bot blocks; verify in a browser before changing anything.");
  L.push("");
  L.push("| URL | Status | Linked from |");
  L.push("| --- | --- | --- |");
  for (const e of bad) L.push(`| ${e.url} | ${e.status || e.error} | ${e.from.map((f) => `\`${f}\``).join(", ")} |`);
  if (!bad.length) L.push("| none | | |");
  L.push("");
} else {
  L.push("Run with `--external` to check each one.");
  L.push("");
}
writeFileSync(OUT, L.join("\n"));
const noBody = (r) => {
  const o = { ...r };
  delete o.body;
  return o;
};
if (JSON_OUT) {
  writeFileSync(
    JSON_OUT,
    JSON.stringify(
      {
        pages: Object.fromEntries([...pages].map(([p, r]) => [p, { status: r.status, bytes: r.bytes, ms: r.ms }])),
        edges: Object.fromEntries([...edges].map(([p, s]) => [p, [...s].sort()])),
        redirects: redirects.map(noBody),
        endpoints: endpoints.map(noBody),
        external: ext,
      },
      null,
      2
    )
  );
}
console.log(`wrote ${OUT}: ${pages.size} pages, ${redirects.length} redirects, ${externals.size} outbound`);
