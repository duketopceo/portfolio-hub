import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { catalogFileNames } from "../../../scripts/lib/catalog-files.mjs";
import { projectConfigs } from "@/data/projects";
import { listedProjects } from "@/lib/catalog";
import { isListedProject } from "@/lib/catalog-filter";
import { catalogEntries } from "./index";
import { catalogEntrySchema } from "./schema";

const dir = join(process.cwd(), "src/data/catalog");
const jsonFiles: string[] = catalogFileNames(dir);
const load = (f: string) => JSON.parse(readFileSync(join(dir, f), "utf8"));

describe("catalog JSON", () => {
  it("has one entry per file and every file validates against the schema", () => {
    expect(catalogEntries).toHaveLength(jsonFiles.length);
    for (const f of jsonFiles) {
      const res = catalogEntrySchema.safeParse(load(f));
      expect(res.success, `${f}: ${res.success ? "" : res.error.message}`).toBe(true);
    }
  });

  it("names every file after its slug", () => {
    for (const f of jsonFiles) expect(load(f).slug).toBe(f.replace(/\.json$/, ""));
  });

  it("rejects an unknown field and a missing curated.displayName", () => {
    const base = load("kurultai.json");
    expect(catalogEntrySchema.safeParse({ ...base, extra: 1 }).success).toBe(false);
    expect(
      catalogEntrySchema.safeParse({ ...base, curated: { ...base.curated, bogus: 1 } }).success,
    ).toBe(false);
    const curated = { ...base.curated };
    delete curated.displayName;
    expect(catalogEntrySchema.safeParse({ ...base, curated }).success).toBe(false);
  });

  it("has unique slugs and unique, stable order", () => {
    const entries = jsonFiles.map(load);
    expect(new Set(entries.map((e) => e.slug)).size).toBe(entries.length);
    expect(new Set(entries.map((e) => e.order)).size).toBe(entries.length);
    const sorted = [...entries].sort((a, b) => a.order - b.order).map((e) => e.slug);
    expect(projectConfigs.map((c) => c.slug)).toEqual(sorted);
  });

  it("lists the same number of projects as the entries say", () => {
    const expected = jsonFiles.map(load).filter((e) => isListedProject(e.curated)).length;
    expect(listedProjects()).toHaveLength(expected);
  });

  it("private entries carry no public GitHub URL in curated", () => {
    for (const f of jsonFiles) {
      const e = load(f);
      if (!e.curated.private) continue;
      const url = `github.com/${e.github.owner}/${e.github.repoName}`.toLowerCase();
      expect(JSON.stringify(e.curated).toLowerCase(), f).not.toContain(url);
    }
  });

  it("the generated index imports every JSON file in the directory", () => {
    const src = readFileSync(join(dir, "index.ts"), "utf8");
    const imported = [...src.matchAll(/from "\.\/([^"]+\.json)"/g)].map((m) => m[1]).sort();
    expect(imported).toEqual(jsonFiles);
    expect(catalogEntries).toHaveLength(jsonFiles.length);
  });
});
