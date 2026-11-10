import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Server-only modules read tokens or the filesystem. A client component that
 * reaches one (directly or through imports) would ship it to the browser.
 */
const SRC = resolve(__dirname, "..");
const SERVER_ONLY = [
  "lib/github-app",
  "lib/github",
  "lib/github-repo-api",
  "lib/github-activity",
];
const SERVER_BUILTINS = /from\s+["'](?:node:)?(?:fs|path|child_process|crypto)["']/;

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e) && !/\.test\.tsx?$/.test(e)) out.push(p);
  }
  return out;
}

function resolveImport(from: string, spec: string): string | null {
  const base = spec.startsWith("@/")
    ? join(SRC, spec.slice(2))
    : spec.startsWith(".")
      ? resolve(dirname(from), spec)
      : null;
  if (!base) return null;
  for (const c of [base + ".ts", base + ".tsx", join(base, "index.ts"), join(base, "index.tsx"), base]) {
    try {
      if (statSync(c).isFile()) return c;
    } catch {
      /* try next candidate */
    }
  }
  return null;
}

function importsOf(file: string, src: string): string[] {
  // `import type` / `export type` are erased at compile time and cannot ship server code.
  const runtime = src.replace(/^\s*(?:import|export)\s+type\b[^;]*;/gm, "");
  const specs = [...runtime.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)].map((m) => m[1]);
  return specs.map((s) => resolveImport(file, s)).filter((x): x is string => !!x);
}

describe("client/server boundary", () => {
  const files = walk(SRC);
  const isClient = (src: string) => /^\s*["']use client["']/.test(src);

  it("no client component reaches a server-only module", () => {
    const offenders: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      if (!isClient(src)) continue;
      const seen = new Set<string>();
      const stack = [f];
      while (stack.length) {
        const cur = stack.pop()!;
        if (seen.has(cur)) continue;
        seen.add(cur);
        const s = readFileSync(cur, "utf8");
        const rel = cur.slice(SRC.length + 1).replace(/\.tsx?$/, "");
        if (cur !== f && SERVER_ONLY.includes(rel)) offenders.push(`${f.slice(SRC.length + 1)} -> ${rel}`);
        if (SERVER_BUILTINS.test(s)) offenders.push(`${f.slice(SRC.length + 1)} -> node builtin in ${rel}`);
        stack.push(...importsOf(cur, s));
      }
    }
    expect(offenders).toEqual([]);
  });

  it("no client component reads a non-public env var", () => {
    const bad = files.filter((f) => {
      const src = readFileSync(f, "utf8");
      return isClient(src) && /process\.env\.(?!NEXT_PUBLIC_|NODE_ENV)/.test(src);
    });
    expect(bad.map((f) => f.slice(SRC.length + 1))).toEqual([]);
  });
});
