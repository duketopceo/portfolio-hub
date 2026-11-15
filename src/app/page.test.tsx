import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { projectConfigs } from "@/data/projects";
import { RANKING_PINS } from "@/data/ranking-pins";
import { CAPABILITY_IDS, capabilityMeta } from "@/data/capability-meta";
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

  it("leads with the words on the left and the gravity map on the right, then the card grid, the signal and the close", async () => {
    const html = await home();
    const landing = html.indexOf('class="landing"');
    const words = html.indexOf("landing__words");
    const map = html.indexOf("landing__map");
    const catalog = html.indexOf('id="project-catalog"');
    const signal = html.indexOf("home-transmissions-heading");
    const close = html.indexOf("home-close");
    expect(landing).toBeGreaterThan(-1);
    expect([landing, words, map, catalog, signal, close].every((n, i, a) => i === 0 || n > a[i - 1])).toBe(true);
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    expect(html).toMatch(/Luke\s*<br\/>\s*Kimball/);
    expect(html).not.toContain("home-hero");
  });

  it("names the five leads as text links, in pin order, with Resume and Hire as the actions", async () => {
    const html = await home();
    const words = html.slice(html.indexOf("landing__words"), html.indexOf("landing__map"));
    const links = [...words.matchAll(/href="\/projects\/([a-z0-9-]+)"/g)].map((m) => m[1]);
    expect(links).toEqual([...RANKING_PINS]);
    const resume = words.indexOf('href="/resume"');
    const hire = words.indexOf('href="/hire"');
    expect(resume).toBeGreaterThan(words.indexOf("landing__leads"));
    expect(hire).toBeGreaterThan(resume);
    // Resume is the primary action: no secondary modifier on it.
    expect(words.slice(words.lastIndexOf("<a", resume), resume)).not.toContain("detail-cta--secondary");
  });

  it("puts every listed project on the map, in one group each", async () => {
    const html = await home();
    const map = html.slice(html.indexOf("landing__map"), html.indexOf('id="project-catalog"'));
    expect(map).toContain('aria-label="Lead projects at the centre, capability groups around them"');
    const groups = [...map.matchAll(/role="button"[^>]*aria-label="([^"]+), (\d+) projects\. Show this group\."/g)];
    expect(groups.map((m) => m[1].replaceAll("&amp;", "&"))).toEqual(CAPABILITY_IDS.map((id) => capabilityMeta[id].label));
    const ranked = rankProjects(projectConfigs);
    expect(groups.reduce((n, m) => n + Number(m[2]), 0)).toBe(ranked.length);
    for (const p of ranked) expect(map).toContain(`href="/projects/${p.slug}"`);
  });

  it("follows the map with one card per listed project, grouped by capability, and links to /projects", async () => {
    const html = await home();
    const grid = html.slice(html.indexOf('id="project-catalog"'), html.indexOf("home-transmissions-heading"));
    const ranked = rankProjects(projectConfigs);
    for (const p of ranked) {
      expect(grid, p.slug).toContain(`href="/projects/${p.slug}"`);
    }
    expect((grid.match(/class="category-group"/g) ?? []).length).toBeGreaterThanOrEqual(CAPABILITY_IDS.length - 1);
    expect(grid).toContain('href="/projects"');
  });
});
