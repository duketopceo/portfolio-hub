import { describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { projectConfigs } from "@/data/projects";
import { RANKING_PINS } from "@/data/ranking-pins";
import { isListedProject } from "@/lib/catalog-filter";
import {
  buildRanking,
  categoryGroups,
  leadProjects,
  rankProjects,
  rankingSnapshot,
  type RankingSnapshot,
} from "./ranking";

function proj(slug: string, category = "ai", name = slug) {
  return { slug, displayName: name, category };
}

const snap = (scores: Record<string, number>): RankingSnapshot => ({
  asOf: "2026-11-10",
  entries: Object.entries(scores).map(([slug, score]) => ({ slug, score })),
});

describe("buildRanking", () => {
  const projects = [
    proj("a", "ai"),
    proj("b", "finance"),
    proj("c", "apps"),
    proj("d", "ai"),
    proj("e", "finance"),
  ];
  const scores = snap({ a: 10, b: 90, c: 80, d: 70, e: 60 });

  it("puts the three pins first in pin order regardless of score", () => {
    const out = buildRanking(projects, { snapshot: scores, pins: ["a", "e", "d"] });
    expect(out.slice(0, 3).map((p) => p.slug)).toEqual(["a", "e", "d"]);
  });

  it("interleaves categories by score after the pins, ties by name", () => {
    const tie = snap({ a: 10, b: 50, c: 50, d: 70, e: 60 });
    const out = buildRanking(projects, { snapshot: tie, pins: ["a", "b", "c"] });
    expect(out.map((p) => p.slug)).toEqual(["a", "b", "c", "d", "e"]);
    const out2 = buildRanking(projects, { snapshot: tie, pins: ["d", "e", "a"] });
    // rest: b and c tie at 50, "b" sorts before "c"
    expect(out2.slice(3).map((p) => p.slug)).toEqual(["b", "c"]);
    // categories interleave: finance (b), apps (c)
    expect(out2.slice(3).map((p) => p.category)).toEqual(["finance", "apps"]);
  });

  it("skips an unlisted pin, fills the slot with the next-ranked project and reports it", () => {
    const sub = vi.fn();
    const out = buildRanking(
      [...projects, { ...proj("hidden"), parentSlug: "a" }],
      { snapshot: scores, pins: ["a", "hidden", "c"], onSubstitute: sub }
    );
    expect(out.slice(0, 3).map((p) => p.slug)).toEqual(["a", "c", "b"]);
    expect(out.some((p) => p.slug === "hidden")).toBe(false);
    expect(sub).toHaveBeenCalledWith("hidden", "b");
  });

  it("gives the same order on every run regardless of the date", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-01-01"));
      const first = buildRanking(projects, { snapshot: scores, pins: ["a", "b", "c"] });
      vi.setSystemTime(new Date("2030-06-01"));
      const second = buildRanking(projects, { snapshot: scores, pins: ["a", "b", "c"] });
      expect(second.map((p) => p.slug)).toEqual(first.map((p) => p.slug));
    } finally {
      vi.useRealTimers();
    }
  });

  it("category group views list no pinned project and keep rank order", () => {
    const ranked = buildRanking(projects, { snapshot: scores, pins: ["a", "e", "d"] });
    const groups = categoryGroups(ranked);
    const slugs = groups.flatMap((g) => g.projects.map((p) => p.slug));
    expect(slugs).not.toContain("a");
    expect(slugs).not.toContain("e");
    expect(slugs).not.toContain("d");
    expect(groups.map((g) => g.category)).toEqual(["finance", "apps"]);
  });
});

describe("committed snapshot", () => {
  const listed = projectConfigs.filter(isListedProject);

  it("covers every listed project exactly once", () => {
    const slugs = rankingSnapshot.entries.map((e) => e.slug).sort();
    expect(slugs).toEqual(listed.map((p) => p.slug).sort());
  });

  it("is current against the catalog (refresh with scripts/rank-projects.mjs --refresh)", () => {
    // Recompute offline from the stored inputs; throws on drift.
    const out = execFileSync("node", ["scripts/rank-projects.mjs", "--check"], {
      cwd: join(__dirname, "../.."),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    expect(out).toContain("current");
  });

  it("ranks the pins first and every pin is listed", () => {
    const ranked = rankProjects(projectConfigs);
    expect(leadProjects(ranked).map((p) => p.slug)).toEqual([...RANKING_PINS]);
    expect(ranked).toHaveLength(listed.length);
  });

  it("holds only slugs and numbers, never an owner/repo path or URL", () => {
    const raw = readFileSync(join(__dirname, "../data/ranking-snapshot.json"), "utf8");
    expect(raw).not.toMatch(/duketopceo\/|github\.com|https?:/);
  });
});
