import { describe, expect, it } from "vitest";
import { SanitizeError, assertClean, buildRules, findIssues } from "./sanitize.mjs";
import { loadPrivateNames } from "../../lib/private-names.mjs";
import { loadSanitizedScript, parseScript } from "./script.mjs";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("../../..", import.meta.url).pathname;
const names = loadPrivateNames(root);
const privateSlug = [...names.slugs][0];
const privateBare = names.bareChecked[0];

// Token-shaped fixtures are assembled at runtime so this file holds no literal secret.
const fake = {
  openrouter: "sk-" + "or-v1-" + "a1b2c3d4e5f6a7b8c9d0e1f2",
  github: "ghp_" + "A1b2C3d4E5f6G7h8I9j0K1l2M3n4",
  aws: "AKIA" + "ABCDEFGHIJKLMNOP",
  jwt: ["eyJhbGciOiJIUzI1NiJ9", "eyJzdWIiOiIxMjM0NTY3ODkwIn0", "abcDEF123456xyz"].join("."),
  hex: "0123456789abcdef".repeat(2),
  mixed: "Qx7" + "Lm2Zp9Rt4Vb8Nc1Ys6Wd3Kf5Hg0Jq",
  bearer: "Authorization: Bearer " + "abcdefgh" + "ijklmnop" + "qrstuvwx",
};

const rules = [
  ["private repo slug", `Source lives at github.com/${privateSlug} today.`, "private-name"],
  ["private repo bare name", `The ${privateBare} project is private.`, "private-name"],
  ["work org", "Built for Herzog-LLC customers.", "private-name"],
  ["employer domain", "Mail it to someone at bartlettroofs.com now.", "private-name"],
  ["source privacy pattern (phone)", `Call ${"555-123-"}${"4567"} for support.`, "private-pattern"],
  ["internal .local host", "Open http://nas.local/dashboard in the browser.", "internal-host"],
  ["tailscale name", "Reach it at box.tailnet-1234.ts.net over the tailnet.", "internal-host"],
  ["machine hostname", "Running on omarchy-max in the office.", "internal-host"],
  ["loopback address", "Serve it on 127.0.0.1 and open it.", "internal-host"],
  ["LAN address", "The device sits at 192.168.1.20 on the network.", "internal-host"],
  ["absolute path", "The config is in /home/someone/.config/app.toml on disk.", "abs-path"],
  ["tilde path", "Edit ~/.ssh/config before recording.", "abs-path"],
  ["windows path", String.raw`Saved to C:\Users\someone\notes.txt earlier.`, "abs-path"],
  ["openrouter key", `export KEY=${fake.openrouter}`, "token"],
  ["github token", `token ${fake.github} was pasted`, "token"],
  ["aws key", `access key ${fake.aws} leaked`, "token"],
  ["jwt", `header ${fake.jwt} shown`, "token"],
  ["bearer header", fake.bearer, "token"],
  ["long hex digest", `digest ${fake.hex} printed`, "token"],
  ["long mixed secret", `secret ${fake.mixed} printed`, "token"],
];

describe("sanitize", () => {
  it("loads real private names from the repo (guard against a silently empty list)", () => {
    expect(names.slugs.size).toBeGreaterThan(0);
    expect(names.workOrgs.length).toBeGreaterThan(0);
    expect(privateBare).toBeTruthy();
    expect(buildRules(names).length).toBeGreaterThan(30);
  });

  it.each(rules)("fails on %s", (_label, text, rule) => {
    const findings = findIssues(text);
    expect(findings.map((f) => f.rule)).toContain(rule);
    expect(() => assertClean(text, "fixture")).toThrow(SanitizeError);
  });

  it("never echoes a token in the failure message", () => {
    const err = (() => {
      try {
        assertClean(`key ${fake.github}`, "fixture");
      } catch (e) {
        return e;
      }
    })();
    expect(err.message).toContain("GitHub token");
    expect(err.message).not.toContain(fake.github);
  });

  it("passes plain public narration, public repo names and web paths", () => {
    const clean =
      "Kurultai is a Rust knowledge layer. It serves retrieval over the Model Context Protocol. " +
      "Open the project page at /projects/kurultai, or visit luke-the-duke.com. Version 3.1.0 indexes 2000 nodes.";
    expect(findIssues(clean)).toEqual([]);
  });

  it("reports the line number of the offending line", () => {
    const f = findIssues("fine\nfine\nsee /home/someone/x here");
    expect(f[0].line).toBe(3);
  });
});

describe("script format", () => {
  it("rejects bad slugs and empty paragraphs", () => {
    expect(() => parseScript(JSON.stringify({ slug: "Bad Slug", paragraphs: [{ text: "x" }] }))).toThrow(/slug/);
    expect(() => parseScript(JSON.stringify({ slug: "ok", paragraphs: [] }))).toThrow(/paragraphs/);
    expect(() => parseScript(JSON.stringify({ slug: "ok", paragraphs: [{ text: " " }] }))).toThrow(/no text/);
  });
});

describe("sanitize evasions", () => {
  it("catches a path split across a line break", () => {
    expect(findIssues("see /home/someone/\nconfig for details").map((f) => f.rule)).toContain("abs-path");
  });

  it("catches a private name that is only visible after JSON decoding", () => {
    const raw = JSON.stringify({ slug: "x", paragraphs: [{ text: `use ${privateBare}` }] }).replace(privateBare, [...privateBare].map((c) => "\\u00" + c.charCodeAt(0).toString(16)).join(""));
    expect(raw).not.toContain(privateBare);
    const dir = mkdtempSync(join(tmpdir(), "san-"));
    const file = join(dir, "s.json");
    writeFileSync(file, raw);
    expect(() => loadSanitizedScript(file)).toThrow(SanitizeError);
  });

  it("fails closed when the private-name list is empty", () => {
    expect(() => buildRules({ slugs: new Set(), bareChecked: [], workOrgs: [], domains: [] })).toThrow(/empty/);
  });
});

describe("sanitize lookalikes and pathological input", () => {
  it("catches zero-width, soft-hyphen and non-breaking-hyphen variants of a work org", () => {
    expect(findIssues("Herzog​-LLC").length).toBeGreaterThan(0);
    expect(findIssues("Herzog­-LLC").length).toBeGreaterThan(0);
    expect(findIssues("Herzog‑LLC").length).toBeGreaterThan(0);
  });

  it("scans a long unbroken line in bounded time", () => {
    const start = Date.now();
    findIssues("a".repeat(100000));
    expect(Date.now() - start).toBeLessThan(2000);
  });
});
