import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
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

  // Private repoNames that are not also a slug or displayName.
  const publicNames = new Set(
    projectConfigs.flatMap((c) => [c.slug, c.displayName]).map((n) => n.toLowerCase()),
  );
  const bareName = projectConfigs.find(
    (c) => c.private === true && !publicNames.has(c.repoName.toLowerCase()),
  )?.repoName as string;

  it("fails on a quoted bare private repoName in client JS under .next/static", () => {
    expect(bareName).toBeTruthy();
    const root = fixture("<p>clean</p>");
    mkdirSync(join(root, ".next/static/chunks"), { recursive: true });
    writeFileSync(
      join(root, ".next/static/chunks/app.js"),
      `x={slug:"a",repoName:"${bareName}"}`,
    );
    const res = run(root);
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("app.js");
    expect(res.stderr).toContain(`private repo name ${bareName}`);
  });

  it("fails on an employer domain and on a slug planted in public/llms.txt", () => {
    expect(run(fixture("<a>jobs@bartlettroofs.com</a>")).status).toBe(1);
    const root = fixture("<p>clean</p>");
    writeFileSync(join(root, "public/llms.txt"), `see github.com/${privateSlug}\n`);
    const res = run(root);
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("llms.txt");
  });

  it("fails when zero private patterns can be derived", () => {
    const sandbox = mkdtempSync(join(tmpdir(), "privacy-built-empty-"));
    mkdirSync(join(sandbox, "scripts"));
    mkdirSync(join(sandbox, "src/data/catalog"), { recursive: true });
    copyFileSync(script, join(sandbox, "scripts/check-privacy-built.mjs"));
    copyFileSync(
      join(process.cwd(), "src/data/private-denylist.ts"),
      join(sandbox, "src/data/private-denylist.ts"),
    );
    // An empty catalog directory: no entries, so no private patterns derive.
    const root = fixture("<p>clean</p>");
    const res = spawnSync(
      process.execPath,
      [join(sandbox, "scripts/check-privacy-built.mjs"), "--root", root],
      { encoding: "utf8" },
    );
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("zero private catalog patterns");
  });
});
