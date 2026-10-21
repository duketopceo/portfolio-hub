import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { projectConfigs } from "@/data/projects";
import snapshot from "@/data/__fixtures__/project-configs.pre-u1.json";
import { catalogEntries } from "./index";
import { catalogEntrySchema } from "./schema";

const dir = join(process.cwd(), "src/data/catalog");
const jsonFiles = readdirSync(dir)
  .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
  .sort();
const load = (f: string) => JSON.parse(readFileSync(join(dir, f), "utf8"));

describe("catalog JSON", () => {
  it("has 70 entries and every file validates against the schema", () => {
    expect(jsonFiles).toHaveLength(70);
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
    const { displayName: _omit, ...curated } = base.curated;
    expect(catalogEntrySchema.safeParse({ ...base, curated }).success).toBe(false);
  });

  it("projectConfigs deep-equals the pre-migration snapshot", () => {
    expect(JSON.parse(JSON.stringify(projectConfigs))).toEqual(snapshot);
    expect(projectConfigs.map((c) => c.slug)).toEqual(snapshot.map((c) => c.slug));
  });

  it("the generated index imports every JSON file in the directory", () => {
    const src = readFileSync(join(dir, "index.ts"), "utf8");
    const imported = [...src.matchAll(/from "\.\/([^"]+\.json)"/g)].map((m) => m[1]).sort();
    expect(imported).toEqual(jsonFiles);
    expect(catalogEntries).toHaveLength(jsonFiles.length);
  });
});
