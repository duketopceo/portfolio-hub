import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { listedProjects, componentsOf } from "@/lib/catalog";
import type { EnrichedProject } from "@/lib/types";
import { ProjectMediaSection, ProjectMediaView } from "./ProjectMedia";
import type { MediaAsset } from "@/lib/types";
import { ShowcaseCard } from "./ShowcaseCard";
import { PlanetNode } from "@/components/planet/PlanetNode";

const asset: MediaAsset = {
  url: "https://media.luke-the-duke.com/demos/x.mp4",
  poster: "https://media.luke-the-duke.com/launch/x-poster.jpg",
  transcript: "A plain description.",
};

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

describe("U4 dossier media and showcase mode", () => {
  it("private entry with showcase and release video renders card and video, no repo link, activity, or README", async () => {
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

  it("khan has a showcase and no video slots", async () => {
    const html = await dossier("khan");
    expect(html).toContain('data-umami-section="Showcase card"');
    expect(html).not.toContain("<video");
    expect(html).not.toContain("dossier-media");
  });

  it("private entry without showcase keeps today's restricted body", async () => {
    const slug = listedProjects().find((p) => p.private && !p.showcase)!.slug;
    const html = await dossier(slug);
    expect(html).toContain("Restricted survey");
    expect(html).toContain("GitHub activity");
    expect(html).not.toContain('data-umami-section="Showcase card"');
  });

  it("public entry with both slots unrecorded renders no media element and no coming-soon text", async () => {
    const slug = listedProjects().find(
      (p) =>
        !p.private &&
        typeof p.media.release === "string" &&
        typeof p.media.demo === "string" &&
        !p.siteOnly && componentsOf(p.slug).length === 0
    )!.slug;
    const html = await dossier(slug);
    expect(html).not.toContain("<video");
    expect(html).not.toContain("dossier-media");
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

  it("release element: preload none, poster, playsinline, no crossorigin, labelled with project name", () => {
    const html = renderToStaticMarkup(
      <ProjectMediaView
        kind="release"
        media={asset}
        title="Argus"
        status="idle"
        onPlay={() => {}}
      />
    );
    expect(html).toContain('preload="none"');
    expect(html).toContain('poster="https://media.luke-the-duke.com/launch/x-poster.jpg"');
    expect(html.toLowerCase()).toContain("playsinline");
    expect(html.toLowerCase()).not.toContain("crossorigin");
    expect(html).toContain('aria-label="Argus release video"');
    expect(html).toContain('aria-label="Play Argus release video"');
    expect(html).toContain("A plain description.");
  });

  it("a failing release player falls back to poster and transcript", () => {
    const html = renderToStaticMarkup(
      <ProjectMediaView
        kind="release"
        media={asset}
        title="Argus"
        status="error"
        onPlay={() => {}}
      />
    );
    expect(html).not.toContain("<video");
    expect(html).toContain("x-poster.jpg");
    expect(html).toContain("A plain description.");
    expect(html).not.toContain("unavailable");
  });

  it("a failing player with no poster shows the unavailable line and a file link", () => {
    const noPoster: MediaAsset = { url: asset.url, transcript: asset.transcript };
    const html = renderToStaticMarkup(
      <ProjectMediaView
        kind="demo"
        media={noPoster}
        title="Argus"
        status="error"
        onPlay={() => {}}
      />
    );
    expect(html).toContain("Demo recording unavailable");
    expect(html).toContain(`href="${asset.url}"`);
    expect(html).toContain("A plain description.");
  });

  it("a captions path renders a track element; none renders no track", () => {
    const withTrack = renderToStaticMarkup(
      <ProjectMediaView
        kind="release"
        media={{ ...asset, captions: "/media/captions/argus-release.vtt" }}
        title="Argus"
        status="idle"
        onPlay={() => {}}
      />
    );
    expect(withTrack).toMatch(
      /<track[^>]*kind="captions"[^>]*src="\/media\/captions\/argus-release\.vtt"/
    );
    const without = renderToStaticMarkup(
      <ProjectMediaView
        kind="release"
        media={asset}
        title="Argus"
        status="idle"
        onPlay={() => {}}
      />
    );
    expect(without).not.toContain("<track");
  });

  it("two players have distinct accessible names and each view renders from its own status prop", () => {
    const html = renderToStaticMarkup(
      <ProjectMediaSection
        media={{ release: asset, demo: { ...asset, url: "https://m/d.mp4" } }}
        title="Argus"
      />
    );
    expect(html).toContain('aria-label="Argus release video"');
    expect(html).toContain('aria-label="Argus demo recording"');
    expect(html.match(/<video/g)).toHaveLength(2);
    // views take status as a prop: one in error, the other idle
    const failed = renderToStaticMarkup(
      <>
        <ProjectMediaView kind="release" media={asset} title="Argus" status="error" onPlay={() => {}} />
        <ProjectMediaView kind="demo" media={asset} title="Argus" status="idle" onPlay={() => {}} />
      </>
    );
    expect(failed.match(/<video/g)).toHaveLength(1);
    expect(failed).toContain('aria-label="Argus demo recording"');
    expect(failed).toContain("x-poster.jpg");
  });

  it("release present and demo to-record renders one player and no placeholder", () => {
    const html = renderToStaticMarkup(
      <ProjectMediaSection media={{ release: asset, demo: "to-record" }} title="Argus" />
    );
    expect(html.match(/<video/g)).toHaveLength(1);
    expect(html).not.toContain("demo recording");
    expect(html.toLowerCase()).not.toContain("to record");
  });

  it("both n/a renders no media section", () => {
    const html = renderToStaticMarkup(
      <ProjectMediaSection media={{ release: "n/a", demo: "n/a" }} title="Argus" />
    );
    expect(html).toBe("");
  });

  it("media renders directly after the summary hero, release before demo", async () => {
    const html = await dossier("kurultai");
    const release = html.indexOf('aria-label="Kurultai release video"');
    expect(release).toBeGreaterThan(-1);
    const hero = html.indexOf("dossier-hero");
    expect(hero).toBeGreaterThan(-1);
    expect(release).toBeGreaterThan(hero);
    expect(html.indexOf("GitHub activity")).toBeGreaterThan(release);
  });

  it("every dossier links to the résumé PDF", async () => {
    for (const slug of ["kate", "khan", "kurultai", "argus", "omarchy-plugins"]) {
      expect(await dossier(slug), slug).toContain('href="/resume.pdf"');
    }
  });
});

describe("U4 showcase v2 sections", () => {
  const five = {
    whatItIs: "WHAT-IT-IS",
    whoItsFor: "WHO-FOR",
    whatLukeBuilt: "BUILT",
    stack: ["Rust"],
    status: "STATUS",
  };

  it("a five-field showcase renders none of the new sections", () => {
    const html = renderToStaticMarkup(<ShowcaseCard showcase={five} />);
    for (const label of ["What it is", "Who it is for", "What Luke built", "Status", "Stack"]) {
      expect(html).toContain(label);
    }
    for (const label of ["Problem", "Approach", "Architecture", "Outcomes"]) {
      expect(html).not.toContain(`>${label}<`);
    }
  });

  it("renders problem, approach, architecture, outcomes in order under headings", () => {
    const html = renderToStaticMarkup(
      <ShowcaseCard
        showcase={{
          ...five,
          problem: "PROB-TEXT",
          approach: "APPR-TEXT",
          architecture: "ARCH-TEXT",
          outcomes: "OUT-TEXT",
        }}
      />
    );
    const idx = ["STATUS", ">Problem<", "PROB-TEXT", ">Approach<", "APPR-TEXT", ">Architecture<", "ARCH-TEXT", ">Outcomes<", "OUT-TEXT"].map((t) => html.indexOf(t));
    expect(idx.every((i) => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });

  it("no showcase section links to github.com", async () => {
    for (const p of listedProjects().filter((x) => x.showcase)) {
      const html = renderToStaticMarkup(<ShowcaseCard showcase={p.showcase!} />);
      expect(html).not.toContain("github.com");
    }
  });
});
