import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import queue from "@/data/video-queue.json";
import { projectConfigs } from "@/data/projects";
import { isListedProject } from "@/lib/catalog-filter";
import { SHOWCASE_EXCLUDED } from "@/lib/showcase";
import { catalogEntrySchema } from "./schema";

const load = (slug: string) =>
  JSON.parse(readFileSync(join(process.cwd(), `src/data/catalog/${slug}.json`), "utf8"));
const withCard = (showcaseCard: unknown) => {
  const b = load("kurultai");
  return { ...b, curated: { ...b.curated, showcaseCard } };
};
const ok = (card: unknown) => catalogEntrySchema.safeParse(withCard(card)).success;

const loop = { url: "/media/loops/x.mp4", poster: "/media/loops/x.jpg", alt: "A terminal run" };
const roadmap = {
  started: { date: "2026-09-01", summary: "First commit." },
  done: ["A thing"],
  next: [],
  source: "README read 2026-11-14",
};

describe("showcaseCard schema", () => {
  it("needs only a tier; every media slot is optional", () => {
    expect(ok({ tier: "A" })).toBe(true);
    expect(ok({ tier: "C", thumbnail: "/t.png", gif: loop, skills: ["Python"], roadmap })).toBe(true);
    expect(catalogEntrySchema.safeParse(load("kurultai")).success).toBe(true);
  });

  it("rejects an unknown tier, a missing tier and unknown keys", () => {
    expect(ok({ tier: "D" })).toBe(false);
    expect(ok({})).toBe(false);
    expect(ok({ tier: "A", extra: 1 })).toBe(false);
  });

  it("requires a poster and an alt line on the loop", () => {
    expect(ok({ tier: "B", gif: { url: "/x.mp4", alt: "x" } })).toBe(false);
    expect(ok({ tier: "B", gif: { url: "/x.mp4", poster: "/x.jpg" } })).toBe(false);
  });

  it("reuses the media asset shape for the video (transcript required)", () => {
    const video = { url: "https://media.example/v.mp4", transcript: "A narrated tour." };
    expect(ok({ tier: "A", video })).toBe(true);
    expect(ok({ tier: "A", video: { url: video.url } })).toBe(false);
  });

  it("validates the roadmap shape: ISO date, a done item and a source", () => {
    expect(ok({ tier: "A", roadmap: { ...roadmap, started: { date: "Sept 2026", summary: "x" } } })).toBe(false);
    expect(ok({ tier: "A", roadmap: { ...roadmap, done: [] } })).toBe(false);
    expect(ok({ tier: "A", roadmap: { ...roadmap, source: "" } })).toBe(false);
    const { source, ...noSource } = roadmap;
    void source;
    expect(ok({ tier: "A", roadmap: noSource })).toBe(false);
    expect(ok({ tier: "A", skills: [] })).toBe(false);
  });
});

describe("showcase card data", () => {
  const listed = projectConfigs.filter(isListedProject);

  it("tiers every listed project except the excluded ones", () => {
    for (const p of listed) {
      if (SHOWCASE_EXCLUDED.has(p.slug)) expect(p.showcaseCard, p.slug).toBeUndefined();
      else expect(p.showcaseCard?.tier, p.slug).toMatch(/^[ABC]$/);
    }
  });

  it("keeps Bartlett work out of the card system", () => {
    expect(SHOWCASE_EXCLUDED.has("bartlett-permits")).toBe(true);
  });

  it("fills skills and roadmap only for the frozen video queue, and skills come from the stack", () => {
    const inQueue = new Set(queue.slugs);
    for (const p of projectConfigs) {
      const card = p.showcaseCard;
      if (!card) continue;
      if (!inQueue.has(p.slug)) {
        expect(card.skills, p.slug).toBeUndefined();
        expect(card.roadmap, p.slug).toBeUndefined();
      }
      for (const s of card.skills ?? []) expect(p.techStack, `${p.slug} skill ${s}`).toContain(s);
    }
  });

  it("dates every roadmap no later than the queue freeze and names a source", () => {
    for (const p of projectConfigs) {
      const r = p.showcaseCard?.roadmap;
      if (!r) continue;
      expect(r.started.date <= "2026-11-14", p.slug).toBe(true);
      expect(r.source.length, p.slug).toBeGreaterThan(10);
    }
  });

  it("carries no media slots yet (real clips come after tier approval)", () => {
    for (const p of projectConfigs) {
      expect(p.showcaseCard?.gif, p.slug).toBeUndefined();
      expect(p.showcaseCard?.video, p.slug).toBeUndefined();
    }
  });

  it("matches docs/showcase/readiness-tiers.md row for row", () => {
    const doc = readFileSync(join(process.cwd(), "docs/showcase/readiness-tiers.md"), "utf8");
    const rows = new Map(
      [...doc.matchAll(/^\| `([a-z0-9-]+)` \| ([ABC]) \|/gm)].map((m) => [m[1], m[2]] as const),
    );
    const tiered = projectConfigs.filter((p) => p.showcaseCard);
    expect(rows.size).toBe(tiered.length);
    for (const p of tiered) expect(rows.get(p.slug), p.slug).toBe(p.showcaseCard!.tier);
  });

  it("matches docs/showcase/categories.md: every listed project's new group, row for row", () => {
    const doc = readFileSync(join(process.cwd(), "docs/showcase/categories.md"), "utf8");
    const rows = new Map(
      [...doc.matchAll(/^\| `([a-z0-9-]+)` \| `([a-z-]+)` \| `([a-z-]+)` \|/gm)].map((m) => [m[1], m[3]] as const),
    );
    expect(rows.size).toBe(listed.length);
    for (const p of listed) expect(rows.get(p.slug), p.slug).toBe(p.capability);
  });
});
