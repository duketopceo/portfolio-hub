import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { projects } from "@/data/resume";
import { projectConfigs } from "@/data/projects";
import { RANKING_PINS } from "@/data/ranking-pins";
import { GET as getJson } from "@/app/resume.json/route";
import { GET as getMarkdown } from "@/app/resume.md/route";
import ResumePage from "@/app/resume/page";
import { rankedResumeProjects } from "./resume-order";
import { rankProjects } from "./ranking";

const ranked = rankProjects(projectConfigs);

describe("résumé follows the ranking", () => {
  it("every authored entry names only catalog slugs", () => {
    const slugs = new Set(projectConfigs.map((p) => p.slug));
    for (const p of projects) {
      expect(p.slugs.length).toBeGreaterThan(0);
      for (const s of p.slugs) expect(slugs.has(s)).toBe(true);
    }
  });

  it("every pinned project has an authored entry", () => {
    for (const pin of RANKING_PINS) {
      expect(projects.some((p) => p.slugs.includes(pin))).toBe(true);
    }
  });

  it("the first entry leads with ranking position 1", () => {
    expect(rankedResumeProjects()[0].slugs[0]).toBe(ranked[0].slug);
  });

  it("entries are sorted by the best rank among the projects they cover", () => {
    const pos = new Map(ranked.map((p, i) => [p.slug, i] as const));
    const best = rankedResumeProjects().map((p) =>
      Math.min(...p.slugs.map((s) => pos.get(s) ?? Infinity))
    );
    expect(best).toEqual([...best].sort((a, b) => a - b));
  });

  it("resume.json lists projects in ranking order", async () => {
    const body = await getJson().json();
    expect(body.projects.map((p: { name: string }) => p.name)).toEqual(
      rankedResumeProjects().map((p) => p.name)
    );
  });

  it("resume.md lists projects in ranking order", async () => {
    const md = await getMarkdown().text();
    const section = md.split("## Selected Projects")[1].split("## Experience")[0];
    const headings = [...section.matchAll(/^### (.+)$/gm)].map((m) => m[1]);
    expect(headings).toEqual(rankedResumeProjects().map((p) => p.name));
  });

  it("renders no OpenRouter evidence panel above the résumé body", () => {
    const html = renderToStaticMarkup(ResumePage());
    expect(html).not.toContain("OpenRouter demos");
    expect(html).not.toContain("Featured evidence");
    expect(html).not.toContain("<video");
    expect(html).not.toContain("Applied AI · OpenRouter-native");
    expect(html.indexOf("resume-doc__hero")).toBeGreaterThan(-1);
    expect(html.indexOf("Selected projects")).toBeGreaterThan(-1);
    const firstProject = rankedResumeProjects()[0].name.replace(/&/g, "&amp;");
    expect(html).toContain(firstProject);
  });
});
