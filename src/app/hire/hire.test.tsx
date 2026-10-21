import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { listedProjects } from "@/lib/catalog";
import { HOMEPAGE_FEATURED_SLUGS } from "@/lib/project-completeness";

const upstream = vi.hoisted(() => ({
  data: null as null | {
    merged: unknown[];
    open: unknown[];
    closed: unknown[];
  },
}));

vi.mock("@/lib/upstream", async (orig) => ({
  ...(await orig<typeof import("@/lib/upstream")>()),
  getUpstreamContributions: async () => upstream.data,
}));
vi.mock("@/lib/github", () => ({
  getEnrichedProjects: async () => [],
  getProjectBySlug: async () => null,
  getAllSlugs: () => [],
  fetchReadme: async () => null,
  fetchShowcaseMd: async () => null,
  enrichProjectActivity: async (p: unknown) => p,
}));
vi.mock("@/lib/github-activity", () => ({
  getProjectActivityTimeline: async () => null,
}));

async function hire(): Promise<string> {
  const { default: Page } = await import("@/app/hire/page");
  return renderToStaticMarkup(await Page());
}

describe("U7 /hire", () => {
  it("renders the featured five, each linking to a listed dossier", async () => {
    upstream.data = null;
    const html = await hire();
    const listed = new Set(listedProjects().map((p) => p.slug));
    expect(HOMEPAGE_FEATURED_SLUGS).toHaveLength(5);
    for (const slug of HOMEPAGE_FEATURED_SLUGS) {
      expect(listed.has(slug)).toBe(true);
      expect(html).toContain(`href="/projects/${slug}"`);
    }
  });

  it("uses each featured project's release poster", async () => {
    upstream.data = null;
    const html = await hire();
    const posters = listedProjects()
      .filter((p) => (HOMEPAGE_FEATURED_SLUGS as readonly string[]).includes(p.slug))
      .flatMap((p) =>
        typeof p.media.release === "string" || !p.media.release.poster
          ? []
          : [p.media.release.poster]
      );
    expect(posters.length).toBeGreaterThan(0);
    for (const poster of posters) expect(html).toContain(`src="${poster}"`);
  });

  it("puts the Résumé and Email actions before the featured strip", async () => {
    upstream.data = null;
    const html = await hire();
    const featured = html.indexOf('data-umami-section="Featured work"');
    expect(featured).toBeGreaterThan(-1);
    const resume = html.indexOf('href="/resume.pdf"');
    const email = html.indexOf('href="mailto:');
    expect(resume).toBeGreaterThan(-1);
    expect(email).toBeGreaterThan(-1);
    expect(resume).toBeLessThan(featured);
    expect(email).toBeLessThan(featured);
  });

  it("shows the unavailable state, never zeros, when upstream data is null", async () => {
    upstream.data = null;
    const html = await hire();
    expect(html).toContain("unavailable");
    expect(html).not.toContain("0 merged");
    expect(html).toContain('href="/contributions"');
  });

  it("shows counts when upstream data exists", async () => {
    upstream.data = { merged: [{}, {}], open: [{}], closed: [] };
    const html = await hire();
    expect(html).toContain("2 merged");
    expect(html).toContain("1 open");
  });
});
