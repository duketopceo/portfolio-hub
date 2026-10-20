import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProjectConfig } from "@/lib/types";
import {
  componentsOf,
  earlierWork,
  listedProjects,
  validateCatalog,
} from "./catalog";
import { retiredSlugs as redirectEntries } from "@/data/redirects";
import { projectConfigs } from "@/data/projects";
import sitemap from "@/app/sitemap";

function cfg(slug: string, extra: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    slug,
    repoName: slug,
    displayName: slug,
    tagline: "t",
    description: "d",
    category: "infra",
    type: "app",
    featured: false,
    techStack: [],
    private: false,
    highlights: [],
    ...extra,
  };
}

const fixture: ProjectConfig[] = [
  cfg("omarchy-plugins"),
  cfg("omarchy-a", { parentSlug: "omarchy-plugins" }),
  cfg("solo"),
  cfg("omarchy-b", { parentSlug: "omarchy-plugins" }),
  cfg("old-thing", { era: "earlier" }),
];

describe("catalog helpers", () => {
  it("listedProjects excludes components and earlier work", () => {
    expect(listedProjects(fixture).map((p) => p.slug)).toEqual([
      "omarchy-plugins",
      "solo",
    ]);
  });

  it("componentsOf returns components in catalog order", () => {
    expect(componentsOf("omarchy-plugins", fixture).map((p) => p.slug)).toEqual([
      "omarchy-a",
      "omarchy-b",
    ]);
    expect(componentsOf("solo", fixture)).toEqual([]);
  });

  it("earlierWork returns only era earlier entries", () => {
    expect(earlierWork(fixture).map((p) => p.slug)).toEqual(["old-thing"]);
  });
});

describe("validateCatalog", () => {
  it("passes a consistent catalog", () => {
    expect(validateCatalog(fixture)).toEqual([]);
  });

  it("flags a parentSlug naming a missing slug", () => {
    const bad = [...fixture, cfg("orphan", { parentSlug: "nope" })];
    expect(validateCatalog(bad).join("\n")).toMatch(/orphan.*nope/);
  });

  it("flags a private component under a public parent", () => {
    const bad = [
      cfg("pub"),
      cfg("priv-part", { parentSlug: "pub", private: true }),
    ];
    expect(validateCatalog(bad).join("\n")).toMatch(/priv-part/);
  });

  it("flags a component whose parent is itself a component", () => {
    const bad = [
      cfg("top"),
      cfg("mid", { parentSlug: "top" }),
      cfg("leaf", { parentSlug: "mid" }),
    ];
    expect(validateCatalog(bad).join("\n")).toMatch(/leaf/);
  });

  it("the real catalog is consistent", () => {
    expect(validateCatalog(projectConfigs)).toEqual([]);
  });
});

describe("redirects.ts", () => {
  const listed = new Set(listedProjects().map((p) => p.slug));

  it("every from is absent from the listed catalog", () => {
    for (const r of redirectEntries) expect(listed.has(r.from)).toBe(false);
  });

  it("every to is a listed slug, /projects, or /projects#earlier-work", () => {
    for (const r of redirectEntries) {
      const ok =
        r.to === "/projects" ||
        r.to === "/projects#earlier-work" ||
        (r.to.startsWith("/projects/") && listed.has(r.to.slice(10)));
      expect(ok, `${r.from} -> ${r.to}`).toBe(true);
    }
  });
});

describe("sitemap", () => {
  it("lists exactly the listed project slugs", () => {
    const urls = sitemap()
      .map((e) => e.url)
      .filter((u) => u.includes("/projects/"))
      .map((u) => u.split("/projects/")[1]);
    expect(urls.sort()).toEqual(listedProjects().map((p) => p.slug).sort());
  });
});

describe("/api/github/pulls aggregation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
    vi.doUnmock("@/data/projects");
  });

  it("returns no row for private entries and attributes components to the parent", async () => {
    vi.resetModules();
    vi.doMock("@/data/projects", () => ({
      projectConfigs: [
        cfg("pub"),
        cfg("pub-part", { parentSlug: "pub", displayName: "Pub Part" }),
        cfg("secret", { private: true }),
      ],
    }));
    const requested: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL) => {
        const url = String(input);
        requested.push(url);
        const m = url.match(/\/repos\/[^/]+\/([^/]+)\/pulls\?/);
        if (!m) return new Response("{}", { status: 404 });
        return new Response(
          JSON.stringify([
            {
              number: 1,
              title: `PR in ${m[1]}`,
              draft: false,
              updated_at: "2026-10-01T00:00:00Z",
              html_url: `https://github.com/x/${m[1]}/pull/1`,
              user: { login: "u" },
              head: { ref: "feat" },
            },
          ]),
          { status: 200 }
        );
      })
    );
    const { fetchAllOpenPullsAggregated } = await import("./github-repo-api");
    const rows = await fetchAllOpenPullsAggregated();
    expect(rows.map((r) => r.repoName).sort()).toEqual(["pub", "pub-part"]);
    expect(rows.every((r) => r.slug === "pub")).toBe(true);
    expect(requested.some((u) => u.includes("/secret/"))).toBe(false);
  });
});
