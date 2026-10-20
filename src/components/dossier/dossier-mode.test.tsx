import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { listedProjects, componentsOf } from "@/lib/catalog";
import type { EnrichedProject } from "@/lib/types";
import { ProjectFilmView } from "./ProjectFilm";
import { PlanetNode } from "@/components/planet/PlanetNode";

function enrich(cfg: ReturnType<typeof listedProjects>[number]): EnrichedProject {
  return {
    ...cfg,
    repo: null,
    lastUpdated: "2026-10-01T00:00:00Z",
    language: null,
    languages: [],
    stars: 0,
    forks: 0,
    openIssuesCount: 0,
    ciStatus: null,
    githubUrl: cfg.private
      ? null
      : `https://github.com/duketopceo/${cfg.repoName}`,
  };
}

vi.mock("@/lib/github", () => ({
  getEnrichedProjects: async () => listedProjects().map(enrich),
  getProjectBySlug: async () => null,
  getAllSlugs: () => listedProjects().map((p) => p.slug),
  fetchReadme: async () => "<p>README-BODY-SENTINEL</p>",
  fetchShowcaseMd: async () => "SHOWCASE-MD-SENTINEL",
  enrichProjectActivity: async (p: EnrichedProject) => p,
}));
vi.mock("@/lib/github-activity", () => ({
  getProjectActivityTimeline: async (slug: string) => ({
    slug,
    displayName: slug,
    private: false,
    headline: "",
    items: [],
    days: [],
    fetchedAt: "2026-10-20T00:00:00Z",
    source: "empty",
  }),
}));

async function dossier(slug: string): Promise<string> {
  const { default: Page } = await import("@/app/projects/[slug]/page");
  return renderToStaticMarkup(
    await Page({ params: Promise.resolve({ slug }) })
  );
}

describe("U4 dossier film and showcase mode", () => {
  it("private entry with showcase and film renders card and film, no repo link, activity, or README", async () => {
    const html = await dossier("kate");
    expect(html).toContain("<video");
    expect(html).toContain("kate-launch.mp4");
    expect(html).toContain('data-umami-section="Showcase card"');
    expect(html).not.toContain("github.com/duketopceo/kate");
    expect(html).not.toContain("GitHub activity");
    expect(html).not.toContain("README-BODY-SENTINEL");
    expect(html).not.toContain("SHOWCASE-MD-SENTINEL");
    expect(html).not.toContain("Restricted survey");
  });

  it("khan has a showcase and no film slot", async () => {
    const html = await dossier("khan");
    expect(html).toContain('data-umami-section="Showcase card"');
    expect(html).not.toContain("<video");
    expect(html).not.toContain("dossier-film");
  });

  it("private entry without showcase keeps today's restricted body", async () => {
    const slug = listedProjects().find((p) => p.private && !p.showcase)!.slug;
    const html = await dossier(slug);
    expect(html).toContain("Restricted survey");
    expect(html).toContain("GitHub activity");
    expect(html).not.toContain('data-umami-section="Showcase card"');
  });

  it("public entry without film renders no film element and no coming-soon text", async () => {
    const slug = listedProjects().find(
      (p) => !p.private && !p.film && !p.siteOnly && componentsOf(p.slug).length === 0
    )!.slug;
    const html = await dossier(slug);
    expect(html).not.toContain("<video");
    expect(html).not.toContain("dossier-film");
    expect(html.toLowerCase()).not.toContain("coming soon");
  });

  it("a parent lists components under #components; public link to GitHub, private have none", async () => {
    const kate = await dossier("kate");
    expect(kate).toContain('id="components"');
    expect(kate).toContain("Kate iOS");
    expect(kate).not.toContain("github.com/duketopceo/kate-ios");

    const pub = componentsOf("omarchy-plugins").find((c) => !c.private)!;
    const plugins = await dossier("omarchy-plugins");
    expect(plugins).toContain('id="components"');
    expect(plugins).toContain(
      `href="https://github.com/duketopceo/${pub.repoName}"`
    );
  });

  it("a component moon on the homepage links to the parent's #components in the same tab", () => {
    const kate = enrich(listedProjects().find((p) => p.slug === "kate")!);
    const html = renderToStaticMarkup(
      <PlanetNode
        project={{
          ...kate,
          planetVisual: {
            moons: [
              {
                label: "Kate iOS",
                kind: "subproject",
                href: "/projects/kate#components",
              },
            ],
          },
        }}
        tier="primary"
        href="/projects/kate"
      />
    );
    const m = html.match(/<a[^>]*href="\/projects\/kate#components"[^>]*>/);
    expect(m).not.toBeNull();
    expect(m![0]).not.toContain("target=");
  });

  it("film element: preload none, poster, playsinline, no crossorigin, labelled with project name", () => {
    const html = renderToStaticMarkup(
      <ProjectFilmView
        film={{
          url: "https://media.luke-the-duke.com/demos/x.mp4",
          poster: "https://media.luke-the-duke.com/launch/x-poster.jpg",
          transcript: "A plain description.",
        }}
        title="Argus"
        status="idle"
        onPlay={() => {}}
      />
    );
    expect(html).toContain('preload="none"');
    expect(html).toContain('poster="https://media.luke-the-duke.com/launch/x-poster.jpg"');
    expect(html.toLowerCase()).toContain("playsinline");
    expect(html.toLowerCase()).not.toContain("crossorigin");
    expect(html).toContain('aria-label="Play Argus film"');
    expect(html).toContain("A plain description.");
  });

  it("a film that fails to load shows poster and transcript, not a player", () => {
    const html = renderToStaticMarkup(
      <ProjectFilmView
        film={{
          url: "https://media.luke-the-duke.com/demos/x.mp4",
          poster: "https://media.luke-the-duke.com/launch/x-poster.jpg",
          transcript: "A plain description.",
        }}
        title="Argus"
        status="error"
        onPlay={() => {}}
      />
    );
    expect(html).not.toContain("<video");
    expect(html).toContain("x-poster.jpg");
    expect(html).toContain("A plain description.");
    expect(html.toLowerCase()).not.toContain("error");
  });

  it("every dossier links to the résumé PDF", async () => {
    for (const slug of ["kate", "khan", "kurultai", "argus", "omarchy-plugins"]) {
      expect(await dossier(slug), slug).toContain('href="/resume.pdf"');
    }
  });
});
