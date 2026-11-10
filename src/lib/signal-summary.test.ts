import { describe, expect, it } from "vitest";
import type {
  ActivityDayBucket,
  ActivityTimelineItem,
  ProjectActivityPayload,
} from "@/lib/github-activity-types";
import {
  buildSignalSummary,
  formatAge,
  formatCounts,
  levelFor,
  SIGNAL_MAX_MOVING,
  summarizeProject,
  type SignalContribution,
} from "./signal-summary";

const NOW = new Date("2026-11-10T12:00:00.000Z");
// GitHub positively reported these featured slugs public this revalidate.
const PUBLIC_META = {
  fetchedAt: NOW.toISOString(),
  source: "github" as const,
  publicSlugs: ["quiet-old", "busy", "quiet-new", "light", "big", "x", "q", "feat", "featured-quiet"],
};

function day(date: string, over: Partial<ActivityDayBucket> = {}): ActivityDayBucket {
  return {
    date,
    prsOpened: 0,
    prsMerged: 0,
    reviews: 0,
    releases: 0,
    issuesOpened: 0,
    issuesClosed: 0,
    items: [],
    ...over,
  };
}

function item(
  kind: ActivityTimelineItem["kind"],
  at: string,
  label = "PR #1 merged — safe title"
): ActivityTimelineItem {
  return { id: `${kind}-${at}`, kind, at, label, ref: "1" };
}

function payload(
  slug: string,
  over: Partial<ProjectActivityPayload> = {}
): ProjectActivityPayload {
  return {
    slug,
    displayName: slug.toUpperCase(),
    private: false,
    headline: "",
    days: [],
    items: [],
    fetchedAt: NOW.toISOString(),
    source: "github",
    ...over,
  };
}

describe("levelFor / formatAge / formatCounts", () => {
  it("buckets counts into 0-4 relative to the max", () => {
    expect(levelFor(0, 4)).toBe(0);
    expect(levelFor(1, 4)).toBe(1);
    expect(levelFor(2, 4)).toBe(2);
    expect(levelFor(3, 4)).toBe(3);
    expect(levelFor(4, 4)).toBe(4);
    expect(levelFor(3, 0)).toBe(0);
  });

  it("formats age at day granularity", () => {
    expect(formatAge(0)).toBe("today");
    expect(formatAge(1)).toBe("yesterday");
    expect(formatAge(5)).toBe("5d ago");
    expect(formatAge(null)).toBe("no recent events");
  });

  it("joins non-zero kinds only", () => {
    expect(formatCounts({ commits: 0, merged: 2, opened: 0, releases: 1, issues: 0 })).toBe(
      "2 merged, 1 release"
    );
    expect(formatCounts({ commits: 0, merged: 0, opened: 0, releases: 0, issues: 0 })).toBe("");
  });
});

describe("summarizeProject", () => {
  it("counts by kind and buckets recency into the 7-day heat strip", () => {
    const row = summarizeProject(
      payload("a", {
        days: [
          day("2026-11-10", { prsMerged: 2, releases: 1 }),
          day("2026-11-08", { prsOpened: 1, issuesClosed: 1 }),
          day("2026-11-01", { prsMerged: 5 }), // inside 30d, outside 7d
          day("2026-09-01", { prsMerged: 9 }), // outside 30d
        ],
        items: [item("pr_merged", "2026-11-10T09:00:00.000Z")],
      }),
      NOW
    );
    expect(row.state).toBe("moving");
    expect(row.heat).toHaveLength(7);
    expect(row.heat[6]).toMatchObject({ date: "2026-11-10", count: 3, level: 4 });
    expect(row.heat[4]).toMatchObject({ date: "2026-11-08", count: 2 });
    expect(row.counts7).toEqual({
      commits: 0,
      merged: 2,
      opened: 1,
      releases: 1,
      issues: 1,
    });
    expect(row.events7).toBe(5);
    expect(row.events30).toBe(10);
    expect(row.lastAgeDays).toBe(0);
  });

  it("is quiet with no 7d events and reports last event age", () => {
    const row = summarizeProject(
      payload("q", {
        days: [day("2026-10-25", { prsMerged: 1 })],
        items: [item("release", "2026-10-25T10:00:00.000Z", "Release v1")],
      }),
      NOW
    );
    expect(row.state).toBe("quiet");
    expect(row.events7).toBe(0);
    expect(row.events30).toBe(1);
    expect(row.lastAgeDays).toBe(16);
    expect(row.heat.every((h) => h.level === 0)).toBe(true);
  });

  it("prefers non-review events for the latest line", () => {
    const row = summarizeProject(
      payload("r", {
        items: [
          item("pr_merged", "2026-11-09T10:00:00.000Z", "PR #1 merged — real"),
          item("review", "2026-11-10T10:00:00.000Z", "PR #1 approved"),
        ],
      }),
      NOW
    );
    expect(row.lastKind).toBe("pr_merged");
  });

  it("never exposes titles or refs for private repos", () => {
    const row = summarizeProject(
      payload("p", {
        private: true,
        days: [day("2026-11-10", { prsMerged: 1 })],
        items: [
          item("pr_merged", "2026-11-10T10:00:00.000Z", "PR #9 merged — secret client migration"),
        ],
      }),
      NOW
    );
    expect(row.lastLine).toBe("PR merged");
    expect(JSON.stringify(row)).not.toContain("secret");
  });

  it("handles empty history", () => {
    const row = summarizeProject(payload("e"), NOW);
    expect(row.state).toBe("quiet");
    expect(row.lastKind).toBeNull();
    expect(row.lastLine).toBeNull();
    expect(row.lastAgeDays).toBeNull();
  });

  it("ignores future-dated buckets", () => {
    const row = summarizeProject(
      payload("f", { days: [day("2026-11-20", { prsMerged: 4 })] }),
      NOW
    );
    expect(row.events7).toBe(0);
    expect(row.events30).toBe(0);
  });
});

describe("buildSignalSummary", () => {
  it("sorts moving by volume then recency, quiet last by recency", () => {
    const s = buildSignalSummary(
      [
        payload("quiet-old", {
          items: [item("pr_merged", "2026-10-01T00:00:00.000Z")],
        }),
        payload("busy", {
          days: [day("2026-11-10", { prsMerged: 3 })],
          items: [item("pr_merged", "2026-11-09T00:00:00.000Z")],
        }),
        payload("quiet-new", {
          items: [item("pr_merged", "2026-10-20T00:00:00.000Z")],
        }),
        payload("light", {
          days: [day("2026-11-10", { prsOpened: 1 })],
          items: [item("pr_opened", "2026-11-10T08:00:00.000Z")],
        }),
      ],
      PUBLIC_META
    );
    expect(s.rows.map((r) => r.slug)).toEqual([
      "busy",
      "light",
      "quiet-new",
      "quiet-old",
    ]);
    expect(s.movingCount).toBe(2);
    expect(s.totalCount).toBe(4);
    expect(s.events7).toBe(4);
  });

  it("reports empty state when no projects", () => {
    const s = buildSignalSummary([], PUBLIC_META);
    expect(s.rows).toEqual([]);
    expect(s.source).toBe("empty");
    expect(s.movingCount).toBe(0);
  });

  it("falls back to current time on an invalid fetchedAt", () => {
    const s = buildSignalSummary([payload("x")], { fetchedAt: "nope", source: "github" });
    expect(s.rows).toHaveLength(1);
  });

  it("serialises small", () => {
    const items = Array.from({ length: 500 }, (_, i) =>
      item("pr_merged", `2026-10-${String((i % 28) + 1).padStart(2, "0")}T00:00:00.000Z`)
    );
    const s = buildSignalSummary(
      [payload("big", { items, days: [day("2026-11-10", { prsMerged: 1 })] })],
      PUBLIC_META
    );
    expect(JSON.stringify(s).length).toBeLessThan(1500);
  });
});

function contrib(
  slug: string,
  commits: number,
  over: Partial<SignalContribution> = {},
  date = "2026-11-10"
): SignalContribution {
  return {
    slug,
    displayName: slug.toUpperCase(),
    catalogPrivate: false,
    githubPrivate: false,
    days: [{ date, commits, prsOpened: 0, issuesOpened: 0 }],
    ...over,
  };
}

const META = PUBLIC_META;

describe("signal with contributions", () => {
  it("counts commits in heat on the correct UTC day", () => {
    const row = summarizeProject(payload("a"), NOW, [
      { date: "2026-11-08", commits: 4, prsOpened: 0, issuesOpened: 0 },
      { date: "2026-11-10", commits: 1, prsOpened: 0, issuesOpened: 0 },
    ]);
    expect(row.heat[4]).toMatchObject({ date: "2026-11-08", count: 4, level: 4 });
    expect(row.heat[6]).toMatchObject({ date: "2026-11-10", count: 1 });
    expect(row.counts7.commits).toBe(5);
    expect(row.state).toBe("moving");
    expect(row.lastKind).toBe("commit");
    expect(formatCounts(row.counts7)).toBe("5 commits");
  });

  it("yields moving rows for six repos with commits, sorted by events then recency", () => {
    const cs = [3, 6, 1, 6, 2, 4].map((n, i) =>
      contrib(`r${i}`, n, {}, i === 3 ? "2026-11-09" : "2026-11-10")
    );
    const s = buildSignalSummary([], META, cs);
    expect(s.rows).toHaveLength(6);
    expect(s.rows.every((r) => r.state === "moving")).toBe(true);
    // r1 (6, today) before r3 (6, yesterday), then 4, 3, 2, 1.
    expect(s.rows.map((r) => r.slug)).toEqual(["r1", "r3", "r5", "r0", "r4", "r2"]);
    expect(s.hiddenMovingCount).toBe(0);
  });

  it("caps at 8 moving rows and reports the overflow", () => {
    const cs = Array.from({ length: 11 }, (_, i) => contrib(`p${i}`, 20 - i));
    const s = buildSignalSummary([], META, cs);
    expect(SIGNAL_MAX_MOVING).toBe(8);
    expect(s.rows).toHaveLength(8);
    expect(s.movingCount).toBe(11);
    expect(s.hiddenMovingCount).toBe(3);
    expect(s.moreHref).toBe("/projects");
  });

  it("keeps featured quiet rows below the capped moving rows", () => {
    const cs = Array.from({ length: 9 }, (_, i) => contrib(`p${i}`, 5));
    const s = buildSignalSummary([payload("featured-quiet")], META, cs);
    expect(s.rows).toHaveLength(9);
    expect(s.rows[8]).toMatchObject({ slug: "featured-quiet", state: "quiet" });
    expect(s.hiddenMovingCount).toBe(1);
  });

  it("adds commits to a featured project without double counting its PRs", () => {
    const s = buildSignalSummary(
      [
        payload("feat", {
          days: [day("2026-11-10", { prsMerged: 1 })],
          items: [item("pr_merged", "2026-11-10T09:00:00.000Z")],
        }),
      ],
      META,
      [
        contrib("feat", 3, {
          days: [{ date: "2026-11-10", commits: 3, prsOpened: 7, issuesOpened: 7 }],
        }),
      ]
    );
    expect(s.rows[0].counts7).toEqual({
      commits: 3,
      merged: 1,
      opened: 0,
      releases: 0,
      issues: 0,
    });
    expect(s.rows[0].events7).toBe(4);
  });

  it("counts a PR opened before the window and merged inside it as merged", () => {
    const row = summarizeProject(
      payload("m", {
        days: [day("2026-11-09", { prsMerged: 1 })],
        items: [item("pr_merged", "2026-11-09T09:00:00.000Z")],
      }),
      NOW
    );
    expect(row.counts7.merged).toBe(1);
    expect(row.counts7.opened).toBe(0);
    expect(row.state).toBe("moving");
  });

  it("shows contribution-only projects with kind lines and no titles", () => {
    const s = buildSignalSummary([], META, [
      contrib("solo", 2, {
        days: [{ date: "2026-11-10", commits: 2, prsOpened: 1, issuesOpened: 1 }],
      }),
    ]);
    expect(s.rows[0].counts7).toMatchObject({ commits: 2, opened: 1, issues: 1 });
    expect(s.rows[0].lastLine).toMatch(/^(PR opened|Issue started)$/);
  });

  it("renders a repo GitHub reports private (catalog public) kind-only, name absent", () => {
    const s = buildSignalSummary([], META, [
      contrib("secret-slug", 4, { displayName: "Secret Display Name", githubPrivate: true }),
    ]);
    const json = JSON.stringify(s);
    expect(s.rows[0]).toMatchObject({ private: true, lastLine: "Commits pushed" });
    expect(json).not.toMatch(/secret/i);
    expect(s.rows[0].href).toBe("/projects");
  });

  it("conceals a featured project GitHub reports private while the catalog says public", () => {
    const s = buildSignalSummary(
      [
        payload("leaky", {
          displayName: "Leaky Name",
          days: [day("2026-11-10", { prsMerged: 1 })],
          items: [item("pr_merged", "2026-11-10T09:00:00.000Z", "PR #1 merged — secret plan")],
        }),
      ],
      META,
      [contrib("leaky", 1, { githubPrivate: true })]
    );
    const json = JSON.stringify(s);
    expect(json).not.toMatch(/leaky|secret/i);
    expect(s.rows[0].lastLine).toBe("PR merged");
  });

  it("shows private commit counts without the repo name", () => {
    const s = buildSignalSummary([], META, [
      contrib("priv", 9, {
        displayName: "Curated Private",
        catalogPrivate: true,
        githubPrivate: true,
      }),
    ]);
    expect(s.rows[0].counts7.commits).toBe(9);
    expect(s.rows[0].lastLine).toBe("Commits pushed");
    expect(JSON.stringify(s)).not.toContain("priv-repo-name");
  });

  it("reports nothing moving for an empty window", () => {
    const s = buildSignalSummary([payload("q")], META, []);
    expect(s.movingCount).toBe(0);
    expect(s.rows).toHaveLength(1);
    expect(s.hiddenMovingCount).toBe(0);
  });
});

describe("privacy fails closed for featured projects", () => {
  const featured = (slug: string) =>
    payload(slug, {
      displayName: "Visible Name",
      days: [day("2026-11-10", { prsMerged: 1 })],
      items: [item("pr_merged", "2026-11-10T09:00:00.000Z", "PR #1 merged — roadmap title")],
    });
  const base = { fetchedAt: NOW.toISOString(), source: "github" as const };

  it("conceals a catalog-public featured repo with no contributions entry and no visibility info", () => {
    const s = buildSignalSummary([featured("mystery")], base, []);
    const json = JSON.stringify(s);
    expect(s.rows[0]).toMatchObject({ private: true, displayName: "Private project", lastLine: "PR merged" });
    expect(json).not.toMatch(/mystery|Visible Name|roadmap/i);
  });

  it("conceals a GitHub-private, catalog-public featured repo when contributions failed", () => {
    // Contributions failed (empty) and repo metadata did not say public.
    const s = buildSignalSummary([featured("leaky")], { ...base, publicSlugs: [] }, []);
    expect(JSON.stringify(s)).not.toMatch(/leaky|Visible Name|roadmap/i);
  });

  it("conceals when contributions say private even if metadata says public", () => {
    const s = buildSignalSummary(
      [featured("leaky")],
      { ...base, publicSlugs: ["leaky"] },
      [contrib("leaky", 1, { githubPrivate: true })]
    );
    expect(JSON.stringify(s)).not.toMatch(/leaky|Visible Name/i);
  });

  it("still shows the name of a featured repo GitHub reports public", () => {
    const s = buildSignalSummary([featured("open")], { ...base, publicSlugs: ["open"] }, []);
    expect(s.rows[0]).toMatchObject({ slug: "open", displayName: "Visible Name", private: false });
    expect(s.rows[0].lastLine).toContain("roadmap title");
  });

  it("shows a public name when a contributions entry reports isPrivate false", () => {
    const s = buildSignalSummary([featured("open")], base, [contrib("open", 1)]);
    expect(s.rows[0].displayName).toBe("Visible Name");
  });
});

describe("signal denominator and labels", () => {
  it("uses all considered catalog projects as the total", () => {
    const s = buildSignalSummary([], { ...META, totalProjects: 30 }, [contrib("a", 2), contrib("b", 1)]);
    expect(s.movingCount).toBe(2);
    expect(s.totalCount).toBe(30);
  });

  it("never reports a total below the rows built", () => {
    const s = buildSignalSummary([], { ...META, totalProjects: 1 }, [contrib("a", 2), contrib("b", 1)]);
    expect(s.totalCount).toBe(2);
  });

  it("commit rows carry the shared commit noun", () => {
    const row = summarizeProject(payload("a"), NOW, [
      { date: "2026-11-10", commits: 1, prsOpened: 0, issuesOpened: 0 },
    ]);
    expect(row.lastLine).toBe("Commits pushed");
  });
});
