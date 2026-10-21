import { describe, expect, it } from "vitest";
import type { CatalogEntry } from "@/data/catalog/schema";
import {
  CURATION_BAR,
  scoreRepo,
  summarizeCatalog,
  type CurationGithub,
} from "./curation";

const NOW = new Date("2026-10-21T00:00:00Z");

const good: CurationGithub = {
  repoName: "alpha",
  owner: "duketopceo",
  isFork: false,
  isArchived: false,
  readmeLength: 2000,
  commitCount: 50,
  lastCommitMonth: "2026-10",
  homepage: null,
  latestRelease: null,
};

function entry(
  slug: string,
  github: Partial<CurationGithub>,
  parentSlug?: string,
): CatalogEntry {
  return {
    slug,
    order: 0,
    curated: { parentSlug } as CatalogEntry["curated"],
    github: { ...good, repoName: slug, ...github },
  };
}

const catalog = [
  entry("omarchy-plugins", {}),
  entry("omarchy-ticker", {}, "omarchy-plugins"),
  entry("alpha", {}),
];

describe("scoreRepo", () => {
  it("exports the bar as one constant", () => {
    expect(CURATION_BAR).toMatchObject({
      minReadmeChars: 400,
      minCommits: 4,
      recentDays: 90,
      minListed: 30,
      maxListed: 40,
    });
  });

  it("scores a healthy original repo listable", () => {
    expect(scoreRepo(good, catalog, NOW)).toEqual({ verdict: "listable", reasons: [] });
  });

  it("scores a fork and an archived repo below-bar with a reason", () => {
    const fork = scoreRepo({ ...good, isFork: true }, catalog, NOW);
    expect(fork.verdict).toBe("below-bar");
    expect(fork.reasons).toContain("fork");
    const arch = scoreRepo({ ...good, isArchived: true }, catalog, NOW);
    expect(arch.verdict).toBe("below-bar");
    expect(arch.reasons).toContain("archived");
  });

  it("scores a 300-character README below-bar", () => {
    const r = scoreRepo({ ...good, readmeLength: 300 }, catalog, NOW);
    expect(r.verdict).toBe("below-bar");
    expect(r.reasons).toEqual(["README 300 chars (< 400)"]);
  });

  it("lists a 4-commit repo with a live URL and no recent activity", () => {
    const r = scoreRepo(
      { ...good, commitCount: 4, readmeLength: 400, lastCommitMonth: "2025-01", homepage: "https://x.example" },
      catalog,
      NOW,
    );
    expect(r).toEqual({ verdict: "listable", reasons: [] });
  });

  it("accepts a release as the activity signal and rejects none", () => {
    const stale = { ...good, lastCommitMonth: "2025-01" };
    expect(scoreRepo({ ...stale, latestRelease: "v1.0.0" }, catalog, NOW).verdict).toBe("listable");
    const r = scoreRepo(stale, catalog, NOW);
    expect(r.verdict).toBe("below-bar");
    expect(r.reasons).toEqual(["no commits in 90 days, no live URL, no release"]);
  });

  it("counts a commit month inside the 90-day window as recent", () => {
    expect(scoreRepo({ ...good, lastCommitMonth: "2026-07" }, catalog, NOW).verdict).toBe("listable");
    expect(scoreRepo({ ...good, lastCommitMonth: "2026-06" }, catalog, NOW).verdict).toBe("below-bar");
  });

  it("makes a mirror component-candidate by parentSlug and by pattern; parent stays listable", () => {
    const byParent = scoreRepo(catalog[1].github, catalog, NOW);
    expect(byParent.verdict).toBe("component-candidate");
    expect(byParent.reasons[0]).toContain("omarchy-plugins");
    const byPattern = scoreRepo({ ...good, repoName: "omarchy-newwidget" }, catalog, NOW);
    expect(byPattern.verdict).toBe("component-candidate");
    expect(scoreRepo({ ...good, repoName: "a0-plugin-zzz" }, catalog, NOW).verdict).toBe("component-candidate");
    expect(scoreRepo(catalog[0].github, catalog, NOW).verdict).toBe("listable");
  });

  it("lists every failing reason for a cataloged repo below the bar", () => {
    const r = scoreRepo(
      { ...good, isFork: true, readmeLength: 10, commitCount: 1, lastCommitMonth: "2024-01" },
      catalog,
      NOW,
    );
    expect(r.verdict).toBe("below-bar");
    expect(r.reasons).toEqual([
      "fork",
      "README 10 chars (< 400)",
      "1 commits (< 4)",
      "no commits in 90 days, no live URL, no release",
    ]);
  });
});

describe("summarizeCatalog", () => {
  const mk = (n: number) =>
    Array.from({ length: n }, (_, i) => entry(`p${i}`, {}));

  it("warns outside 30-40 and not inside", () => {
    expect(summarizeCatalog(mk(35), NOW)).toMatchObject({ listable: 35, warning: null });
    expect(summarizeCatalog(mk(30), NOW).warning).toBeNull();
    expect(summarizeCatalog(mk(40), NOW).warning).toBeNull();
    expect(summarizeCatalog(mk(29), NOW).warning).toMatch(/29 listable.*30-40/);
    expect(summarizeCatalog(mk(41), NOW).warning).toMatch(/41 listable.*30-40/);
  });

  it("counts only listable verdicts", () => {
    const c = [...mk(3), entry("omarchy-x", {}), entry("old", { isArchived: true })];
    const s = summarizeCatalog(c, NOW);
    expect(s.listable).toBe(3);
    expect(s.verdicts["omarchy-x"].verdict).toBe("component-candidate");
    expect(s.verdicts.old.verdict).toBe("below-bar");
  });
});
