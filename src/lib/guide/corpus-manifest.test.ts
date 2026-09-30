import { describe, expect, it } from "vitest";
import { buildCorpusManifest } from "./corpus-entries";
import {
  chunkEntry,
  retrievable,
  validateManifest,
  type CorpusEntry,
} from "./corpus-manifest";

const base: CorpusEntry = {
  sourceId: "test-entry",
  scope: "test",
  corpusClass: "public-source",
  title: "T",
  url: "https://luke-the-duke.com/projects/test",
  text: "approved text",
  provenance: "test fixture",
};

describe("corpus manifest validation", () => {
  it("rejects duplicate sourceIds", () => {
    const errors = validateManifest([base, { ...base }]);
    expect(errors.some((e) => e.includes("duplicate sourceId"))).toBe(true);
  });

  it("rejects bad sourceId format", () => {
    expect(
      validateManifest([{ ...base, sourceId: "Bad ID!" }]).length,
    ).toBeGreaterThan(0);
  });

  it("requires approval metadata on curated-private entries", () => {
    const errors = validateManifest([
      { ...base, corpusClass: "curated-private" },
    ]);
    expect(errors.some((e) => e.includes("curated-private requires"))).toBe(
      true,
    );
  });

  it("accepts a properly approved curated-private package", () => {
    const errors = validateManifest([
      {
        ...base,
        corpusClass: "curated-private",
        approvedBy: "luke",
        approvedAt: "2026-09-30",
      },
    ]);
    expect(errors).toEqual([]);
  });

  it("rejects public-source entries carrying approval metadata", () => {
    const errors = validateManifest([
      { ...base, approvedBy: "luke", approvedAt: "2026-09-30" },
    ]);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects forbidden leak-guard fields", () => {
    const errors = validateManifest([
      { ...base, email: "x@y.z" } as CorpusEntry,
    ]);
    expect(errors.some((e) => e.includes('forbidden field "email"'))).toBe(
      true,
    );
  });

  it("rejects expired reviewBy dates", () => {
    const errors = validateManifest(
      [{ ...base, reviewBy: "2020-01-01" }],
      "2026-09-30",
    );
    expect(errors.some((e) => e.includes("expired"))).toBe(true);
  });

  it("retrievable() drops revoked and expired entries", () => {
    const list = retrievable(
      [
        base,
        { ...base, sourceId: "revoked-one", revoked: true },
        { ...base, sourceId: "expired-one", reviewBy: "2020-01-01" },
        { ...base, sourceId: "live-one", reviewBy: "2099-01-01" },
      ],
      "2026-09-30",
    );
    expect(list.map((e) => e.sourceId)).toEqual(["test-entry", "live-one"]);
  });
});

describe("corpus chunking", () => {
  it("produces deterministic chunkIds and content hashes", async () => {
    const entry = { ...base, text: "x".repeat(3000) };
    const a = await chunkEntry(entry);
    const b = await chunkEntry(entry);
    expect(a.map((c) => c.chunkId)).toEqual(b.map((c) => c.chunkId));
    expect(a.map((c) => c.contentHash)).toEqual(b.map((c) => c.contentHash));
    expect(a.length).toBeGreaterThan(1);
    expect(a[0].chunkId).toBe("test-entry#0");
    expect(a[0].embedVersion).toBe(1);
  });
});

describe("real corpus manifest", () => {
  const manifest = buildCorpusManifest();

  it("is valid against the schema", () => {
    expect(validateManifest(manifest)).toEqual([]);
  });

  it("covers every catalog project", () => {
    const ids = new Set(manifest.map((e) => e.sourceId));
    expect(ids.has("project-khan")).toBe(true);
    expect(ids.has("project-argus")).toBe(true);
    expect(ids.has("project-pixel-tycoon")).toBe(true);
  });

  it("contains résumé sections", () => {
    expect(
      manifest.some((e) => e.scope === "resume:work"),
    ).toBe(true);
  });
});
