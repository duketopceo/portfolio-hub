import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { projectConfigs } from "@/data/projects";
import { RANKING_PINS } from "@/data/ranking-pins";
import { rankProjects } from "@/lib/ranking";
import type { EnrichedProject } from "@/lib/types";

const enriched = vi.hoisted(() => ({ all: [] as unknown[] }));

vi.mock("@/lib/github", () => ({
  getEnrichedProjects: async () => enriched.all,
}));
vi.mock("@/lib/github-activity", () => ({
  getSignalActivity: async () => ({
    payloads: [],
    contributions: [],
    fetchedAt: "2026-11-10T12:00:00.000Z",
    source: "fixture",
    publicSlugs: [],
    totalProjects: 35,
  }),
}));

enriched.all = projectConfigs.map((p) => ({
  ...p,
  repo: null,
  stars: 0,
  language: null,
  languages: [],
  forks: 0,
  openIssuesCount: 0,
  ciStatus: null,
  lastUpdated: "",
  githubUrl: p.private ? null : `https://github.com/duketopceo/${p.repoName}`,
})) as unknown as EnrichedProject[];

async function home(): Promise<string> {
  const { default: Page } = await import("@/app/page");
  return renderToStaticMarkup(await Page());
}

describe("home layout", () => {
  it("renders the five pinned projects before the signal section", async () => {
    const html = await home();
    const signal = html.indexOf("home-transmissions-heading");
    expect(signal).toBeGreaterThan(-1);
    const cards = [...html.matchAll(/<article class="lead-card"[^>]*data-lead-rank="(\d)"[\s\S]*?<\/article>/g)];
    expect(cards.map((m) => m[1])).toEqual(["1", "2", "3", "4", "5"]);
    cards.forEach((m, i) => {
      expect(m[0]).toContain(`href="/projects/${RANKING_PINS[i]}`);
      expect(m.index!).toBeLessThan(signal);
    });
  });

  it("never renders a private project's repository path or GitHub URL", async () => {
    const html = await home();
    for (const p of projectConfigs.filter((c) => c.private)) {
      expect(html).not.toContain(`github.com/duketopceo/${p.repoName}`);
      expect(html).not.toContain(`duketopceo/${p.repoName}`);
    }
  });

  it("drops the orbit poster and its map", async () => {
    const html = await home();
    expect(html).not.toContain("poster__");
    expect(html).not.toContain("solar-system");
  });

  it("caps each capability group at its top 4, never repeats a pinned project, and links to the full group", async () => {
    const html = await home();
    const rest = html.slice(html.indexOf("home-rest-heading"));
    const ranked = rankProjects(projectConfigs);
    const pinned = new Set<string>(RANKING_PINS);
    const byCategory = new Map<string, string[]>();
    for (const p of ranked) {
      if (pinned.has(p.slug)) continue;
      byCategory.set(p.capability as string, [...(byCategory.get(p.capability as string) ?? []), p.slug]);
    }
    for (const [category, slugs] of byCategory) {
      slugs.slice(0, 4).forEach((slug) => expect(rest).toContain(`href="/projects/${slug}"`));
      slugs.slice(4).forEach((slug) => expect(rest).not.toContain(`href="/projects/${slug}"`));
      const total = ranked.filter((p) => p.capability === category).length;
      expect(rest).toContain(`href="/projects?group=${category}"`);
      expect(rest).toMatch(new RegExp(`See all ${total} in `));
    }
    for (const slug of pinned) expect(rest).not.toContain(`href="/projects/${slug}"`);
    expect(rest).toContain('href="/projects"');
  });

  it("groups cards in rank order inside each category", async () => {
    const html = await home();
    const rest = html.slice(html.indexOf("home-rest-heading"));
    const ranked = rankProjects(projectConfigs).filter(
      (p) => p.capability === "agents-computer-use" && !(RANKING_PINS as readonly string[]).includes(p.slug)
    ).slice(0, 4);
    const order = ranked.map((p) => rest.indexOf(`href="/projects/${p.slug}"`));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("gives lead cards with and without video the same structure", async () => {
    const html = await home();
    const cards = [...html.matchAll(/<article class="lead-card"[\s\S]*?<\/article>/g)].map((m) => m[0]);
    expect(cards).toHaveLength(5);
    const shape = (c: string) =>
      [...c.matchAll(/class="(lead-card__[a-z-]+)/g)]
        .map((m) => m[1])
        .filter((c) =>
          ["lead-card__figure", "lead-card__body", "lead-card__kicker", "lead-card__title", "lead-card__outcome", "lead-card__proof", "lead-card__stack", "lead-card__cta"].includes(c)
        );
    expect(shape(cards[1])).toEqual(shape(cards[0]));
    cards.slice(2).forEach((c) => expect(shape(c)).toEqual(shape(cards[0])));
  });

  it("orders each lead card outcome, proof, stack", async () => {
    const html = await home();
    const cards = [...html.matchAll(/<article class="lead-card"[\s\S]*?<\/article>/g)].map((m) => m[0]);
    expect(cards).toHaveLength(5);
    for (const c of cards) {
      const outcome = c.indexOf("lead-card__outcome");
      const proof = c.indexOf("lead-card__proof");
      const stack = c.indexOf("lead-card__stack");
      expect(outcome).toBeGreaterThan(-1);
      expect(proof).toBeGreaterThan(outcome);
      expect(stack).toBeGreaterThan(proof);
      // proof is a link even when no number exists
      expect(c.slice(proof, stack)).toMatch(/href="/);
    }
  });

  it("shows the sphere after the lead band and before the signal, linking to /projects", async () => {
    const html = await home();
    const leads = html.indexOf("home-leads-heading");
    const map = html.indexOf("home-map-heading");
    const signal = html.indexOf("home-transmissions-heading");
    expect(leads).toBeGreaterThan(-1);
    expect(map).toBeGreaterThan(leads);
    expect(signal).toBeGreaterThan(map);
    const section = html.slice(map, signal);
    expect(section).toContain('href="/projects"');
    // the hidden list names every listed project
    for (const p of rankProjects(projectConfigs)) {
      expect(section).toContain(`href="/projects/${p.slug}"`);
    }
  });
});
