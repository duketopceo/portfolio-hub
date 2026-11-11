import { describe, expect, it } from "vitest";
import queue from "@/data/video-queue.json";
import snapshot from "@/data/ranking-snapshot.json";
import { projectConfigs } from "@/data/projects";
import { RANKING_PINS } from "@/data/ranking-pins";
import { isListedProject } from "@/lib/catalog-filter";
import { rankProjects } from "@/lib/ranking";

describe("frozen video queue", () => {
  const ranked = rankProjects(projectConfigs).slice(0, 15).map((p) => p.slug);

  it("holds the top 15 ranked projects, leads first", () => {
    expect(queue.slugs).toHaveLength(15);
    expect(new Set(queue.slugs).size).toBe(15);
    expect(queue.slugs).toEqual(ranked);
    expect(queue.slugs.slice(0, RANKING_PINS.length)).toEqual([...RANKING_PINS]);
  });

  it("was frozen from the committed snapshot", () => {
    expect(queue.asOf).toBe(snapshot.asOf);
  });

  it("names only listed catalog projects", () => {
    const listed = new Set(projectConfigs.filter(isListedProject).map((p) => p.slug));
    for (const slug of queue.slugs) expect(listed.has(slug)).toBe(true);
  });
});
