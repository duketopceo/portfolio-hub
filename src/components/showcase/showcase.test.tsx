// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { CAPABILITY_IDS } from "@/data/capability-meta";
import { listedProjects } from "@/lib/catalog";
import type { EnrichedProject, ShowcaseCardData } from "@/lib/types";
import ProjectCard from "@/components/ProjectCard";
import ThemedPoster from "./ThemedPoster";
import ShowcaseMedia from "./ShowcaseMedia";
import ShowcaseExplainer from "./ShowcaseExplainer";
import RoadmapTimeline from "./RoadmapTimeline";
import SkillChips from "./SkillChips";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const loop = { url: "/loops/a.mp4", poster: "/loops/a.jpg", alt: "A terminal run" };
const card: ShowcaseCardData = { tier: "B", gif: loop };

function mockMedia(reduced: boolean) {
  window.matchMedia = ((q: string) => ({
    matches: reduced && q.includes("prefers-reduced-motion"),
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

function project(over: Partial<EnrichedProject> = {}): EnrichedProject {
  const cfg = listedProjects().find((p) => !p.private && !p.siteOnly && p.slug !== "bartlett-permits")!;
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
    githubUrl: `https://github.com/duketopceo/${cfg.repoName}`,
    ...over,
  };
}

describe("ThemedPoster", () => {
  const render = (slug: string, capability?: string) =>
    renderToStaticMarkup(<ThemedPoster slug={slug} name="Name" capability={capability} accent="#FF9F1C" />);

  it("is deterministic per slug and differs between slugs", () => {
    expect(render("orchestral", "evals-routing")).toBe(render("orchestral", "evals-routing"));
    expect(render("orchestral", "evals-routing")).not.toBe(render("argus", "evals-routing"));
  });

  it("draws a motif for every capability group and a fallback without one", () => {
    for (const id of [...CAPABILITY_IDS, undefined]) {
      const html = render("x", id);
      expect(html).toContain("<svg");
      expect(html).toContain("showcase-art__name");
    }
  });

  it("uses tokens through classes: no colour literals in the markup, only the accent variable", () => {
    const html = render("kurultai", "retrieval-memory");
    expect(html).not.toMatch(/(fill|stroke)="#/i);
    expect(html).not.toMatch(/rgb\(|hsl\(/i);
    expect(html).toContain("--poster-accent");
  });
});

describe("ShowcaseMedia", () => {
  let root: Root;
  let container: HTMLDivElement;
  beforeEach(() => {
    HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
    HTMLMediaElement.prototype.pause = vi.fn();
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  async function mount(ui: React.ReactNode) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root.render(ui);
    });
  }

  const media = (c: ShowcaseCardData | undefined, mode: "hover" | "auto") => (
    <article data-showcase-host>
      <ShowcaseMedia slug="orchestral" name="Orchestral" capability="evals-routing" accent="#FFFFFF" card={c} mode={mode} />
    </article>
  );

  it("renders the generated poster and no video when the card has no media", async () => {
    mockMedia(false);
    await mount(media(undefined, "hover"));
    expect(container.querySelector(".showcase-art")).not.toBeNull();
    expect(container.querySelector("video")).toBeNull();
    await mount(media({ tier: "C" }, "auto"));
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("button")).toBeNull();
  });

  it("shows only the poster under reduced motion, even with a loop", async () => {
    mockMedia(true);
    await mount(media(card, "auto"));
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector<HTMLImageElement>("img.showcase-media__still")?.getAttribute("src")).toBe(loop.poster);
  });

  it("plays the muted loop on host hover and focus, and stops on leave", async () => {
    mockMedia(false);
    await mount(media(card, "hover"));
    const video = container.querySelector("video")!;
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    const root = container.querySelector<HTMLElement>("[data-showcase-host]")!;
    const slot = container.querySelector<HTMLElement>(".showcase-media")!;
    expect(slot.dataset.playing).toBe("false");
    await act(async () => {
      root.dispatchEvent(new MouseEvent("mouseenter"));
    });
    expect(slot.dataset.playing).toBe("true");
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    await act(async () => {
      root.dispatchEvent(new MouseEvent("mouseleave"));
    });
    expect(slot.dataset.playing).toBe("false");
    await act(async () => {
      root.dispatchEvent(new FocusEvent("focusin"));
    });
    expect(slot.dataset.playing).toBe("true");
  });

  it("autoplays in the dossier and offers a pause control", async () => {
    mockMedia(false);
    await mount(media(card, "auto"));
    const slot = container.querySelector<HTMLElement>(".showcase-media")!;
    expect(slot.dataset.playing).toBe("true");
    const button = container.querySelector("button")!;
    await act(async () => {
      button.click();
    });
    expect(slot.dataset.playing).toBe("false");
    expect(button.textContent).toBe("Play loop");
  });
});

describe("ShowcaseExplainer", () => {
  it("renders description, poster, skills and roadmap together", () => {
    const html = renderToStaticMarkup(
      <ShowcaseExplainer
        accentColor="#FFFFFF"
        project={project({
          showcaseCard: {
            tier: "A",
            skills: ["Python"],
            roadmap: { started: { date: "2026-09-09", summary: "Began." }, done: ["Shipped"], next: ["Next"], source: "ROADMAP.md read 2026-11-14" },
          },
        })}
      />,
    );
    expect(html).toContain("showcase-explain__figure");
    expect(html).toContain("showcase-skills__chip");
    expect(html).toContain("showcase-roadmap");
  });

  it("renders gracefully with no showcaseCard at all", () => {
    const html = renderToStaticMarkup(<ShowcaseExplainer accentColor="#FFFFFF" project={project({ showcaseCard: undefined })} />);
    expect(html).toContain("showcase-explain__figure");
    expect(html).not.toContain("showcase-roadmap");
    expect(html).not.toContain("showcase-skills");
  });

  it("leaves excluded entries as plain description", () => {
    const html = renderToStaticMarkup(
      <ShowcaseExplainer accentColor="#FFFFFF" project={project({ slug: "bartlett-permits", description: "Plain." })} />,
    );
    expect(html).not.toContain("showcase-explain");
    expect(html).toContain("Plain.");
  });
});

describe("RoadmapTimeline and SkillChips", () => {
  const roadmap = {
    started: { date: "2026-09-09", summary: "Began." },
    done: ["One", "Two"],
    next: [],
    source: "ROADMAP.md read 2026-11-14",
  };

  it("lists Started, Done and Remaining in order, with the source", () => {
    const html = renderToStaticMarkup(<RoadmapTimeline roadmap={roadmap} />);
    const order = ["Started", "Done", "Remaining"].map((l) => html.indexOf(`>${l}<`));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(html).toContain("Sep 9, 2026");
    expect(html).toContain("Nothing open is listed.");
    expect(html).toContain("Source: ROADMAP.md read 2026-11-14");
  });

  it("stacks vertically below 720px and runs three columns above it", () => {
    const css = readFileSync(join(process.cwd(), "src/app/design-system/showcase.css"), "utf8");
    expect(css).toMatch(/\.showcase-roadmap__steps\s*\{[^}]*grid-template-columns:\s*repeat\(3,/);
    const phone = css.match(/@media \(max-width: 719px\)\s*\{([\s\S]*?)\n\}\n/);
    expect(phone).not.toBeNull();
    expect(phone![1]).toMatch(/\.showcase-roadmap__steps\s*\{[^}]*grid-template-columns:\s*1fr/);
  });

  it("wraps text around the loop above 720px and stacks it below", () => {
    const css = readFileSync(join(process.cwd(), "src/app/design-system/showcase.css"), "utf8");
    const wide = css.match(/@media \(min-width: 720px\)\s*\{([\s\S]*?)\n\}\n/);
    expect(wide![1]).toMatch(/float:\s*right/);
    expect(wide![1]).toMatch(/shape-outside/);
    expect(css).not.toMatch(/^\.showcase-explain__figure\s*\{[^}]*float/m);
  });

  it("render nothing when there is no data", () => {
    expect(renderToStaticMarkup(<RoadmapTimeline />)).toBe("");
    expect(renderToStaticMarkup(<SkillChips skills={[]} />)).toBe("");
    expect(renderToStaticMarkup(<SkillChips />)).toBe("");
  });
});

describe("ProjectCard media", () => {
  it("shows a themed thumbnail without any media data", () => {
    const html = renderToStaticMarkup(<ProjectCard project={project({ showcaseCard: undefined })} />);
    expect(html).toContain("cosmic-project-card__thumb");
    expect(html).toContain("data-showcase-host");
  });

  it("omits the thumbnail for excluded entries", () => {
    const html = renderToStaticMarkup(<ProjectCard project={project({ slug: "bartlett-permits" })} />);
    expect(html).not.toContain("cosmic-project-card__thumb");
  });
});
