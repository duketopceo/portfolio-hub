import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { listedProjects } from "@/lib/catalog";
import { toClientProject } from "@/lib/client-project";
import type { EnrichedProject } from "@/lib/types";
import ProjectCard from "./ProjectCard";

function base(): EnrichedProject {
  const cfg = listedProjects().find((p) => !p.private && !p.siteOnly)!;
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
  };
}

const release = {
  tag: "v2.3.1",
  publishedAt: "2026-08-15T00:00:00Z",
  url: "https://github.com/duketopceo/x/releases/tag/v2.3.1",
};

describe("ProjectCard latest release pill", () => {
  it("renders tag and month/year when present", () => {
    const html = renderToStaticMarkup(
      <ProjectCard project={{ ...base(), latestRelease: release }} />
    );
    expect(html).toContain("latest-release-pill");
    expect(html).toContain("v2.3.1 · Aug 2026");
  });

  it("renders nothing when absent", () => {
    const html = renderToStaticMarkup(<ProjectCard project={base()} />);
    expect(html).not.toContain("latest-release-pill");
  });

  it("does not render for private projects", () => {
    const html = renderToStaticMarkup(
      <ProjectCard
        project={{ ...base(), private: true, latestRelease: release }}
      />
    );
    expect(html).not.toContain("latest-release-pill");
  });

  it("toClientProject strips latestRelease for private only", () => {
    const priv = toClientProject({ ...base(), private: true, latestRelease: release });
    expect("latestRelease" in priv).toBe(false);
    expect(toClientProject({ ...base(), latestRelease: release }).latestRelease).toEqual(release);
  });
});
