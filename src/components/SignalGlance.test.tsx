import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { buildSignalSummary, type SignalContribution } from "@/lib/signal-summary";
import { SignalGlance } from "./SignalGlance";

const META = { fetchedAt: "2026-11-10T12:00:00.000Z", source: "github" as const };

function contrib(slug: string, commits: number): SignalContribution {
  return {
    slug,
    displayName: slug.toUpperCase(),
    catalogPrivate: false,
    githubPrivate: false,
    days: [{ date: "2026-11-10", commits, prsOpened: 0, issuesOpened: 0 }],
  };
}

describe("SignalGlance", () => {
  it("shows 8 rows and a +3 more moving link to /projects for eleven moving", () => {
    const cs = Array.from({ length: 11 }, (_, i) => contrib(`p${i}`, 20 - i));
    const html = renderToStaticMarkup(
      <SignalGlance summary={buildSignalSummary([], { ...META, totalProjects: 24 }, cs)} />
    );
    expect((html.match(/class="signal__row"/g) ?? []).length).toBe(8);
    expect(html).toContain("+3 more moving");
    expect(html).toContain('href="/projects"');
    expect(html).toContain("11 of 24");
    // The row reads once: no "Commits Commits pushed" kind-plus-line stutter.
    expect(html).toContain("Commits pushed");
    expect(html).not.toMatch(/Commits\s*(<[^>]+>)*\s*Commits pushed/);
  });

  it("does not repeat the verb on contribution-only PR rows", () => {
    const html = renderToStaticMarkup(
      <SignalGlance
        summary={buildSignalSummary([], META, [
          {
            slug: "s",
            displayName: "S",
            catalogPrivate: false,
            githubPrivate: false,
            days: [{ date: "2026-11-10", commits: 0, prsOpened: 1, issuesOpened: 0 }],
          },
        ])}
      />
    );
    expect(html).toContain("PR opened");
    expect(html).not.toMatch(/Opened\s*(<[^>]+>)*\s*PR opened/);
  });

  it("renders one quiet line, not a blank section, for an empty window", () => {
    const html = renderToStaticMarkup(
      <SignalGlance
        summary={buildSignalSummary(
          [
            {
              slug: "q",
              displayName: "Q",
              private: false,
              headline: "",
              days: [],
              items: [],
              fetchedAt: META.fetchedAt,
              source: "github",
            },
          ],
          META,
          []
        )}
      />
    );
    expect(html).toContain("Nothing moving this week");
    expect(html).not.toContain("more moving");
  });
});
