import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { projectConfigs } from "@/data/projects";
import { derivePrivateRepoSlugs } from "./private-denylist";

const script = join(process.cwd(), "scripts/check-privacy-built.mjs");

function fixture(html: string) {
  const root = mkdtempSync(join(tmpdir(), "privacy-built-"));
  mkdirSync(join(root, ".next/server/app"), { recursive: true });
  mkdirSync(join(root, "public"));
  writeFileSync(join(root, ".next/server/app/index.html"), html);
  writeFileSync(join(root, "public/llms.txt"), "# Luke\n");
  return root;
}

const run = (root: string) =>
  spawnSync(process.execPath, [script, "--root", root], { encoding: "utf8" });

describe("check:privacy:built", () => {
  const privateSlug = derivePrivateRepoSlugs(projectConfigs)[0];

  it("fails and names file and match when a private repo URL is planted", () => {
    const root = fixture(`<a href="https://github.com/${privateSlug}">repo</a>`);
    const res = run(root);
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("index.html");
    expect(res.stderr).toContain(privateSlug);
  });

  it("fails on a JSON-escaped slug and a work-org name", () => {
    const esc = privateSlug.replace("/", "\\/");
    expect(run(fixture(`{"u":"github.com\\/${esc}"}`)).status).toBe(1);
    expect(run(fixture("<p>Herzog-LLC</p>")).status).toBe(1);
  });

  it("passes on a clean fixture, including a private display name", () => {
    const res = run(fixture('<h1>Khan</h1><a href="https://github.com/duketopceo/kurultai">x</a>'));
    expect(res.status).toBe(0);
  });

  it("derives the same private slugs as the script reads from the catalog", () => {
    const slugs = derivePrivateRepoSlugs(projectConfigs);
    expect(slugs).toContain("duketopceo/Khan");
    const root = fixture(slugs.map((s) => `github.com/${s}`).join(" "));
    const res = run(root);
    for (const s of slugs) expect(res.stderr, s).toContain(`private repo ${s} `);
  });
});
