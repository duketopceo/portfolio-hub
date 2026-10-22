import { describe, expect, it } from "vitest";
import type { ProjectActivityPayload } from "@/lib/github-activity-types";
import {
  buildDaySeries,
  condenseProjectActivity,
  filterActivityByWindow,
  formatTotalsLine,
} from "./activity-aggregate";

const anchor = new Date("2026-08-19T12:00:00.000Z");

function makePayload(
  overrides: Partial<ProjectActivityPayload> = {}
): ProjectActivityPayload {
  return {
    slug: "pace-server",
    displayName: "Pace Server",
    private: true,
    headline: "busy week",
    items: [],
    days: [],
    fetchedAt: anchor.toISOString(),
    source: "fixture",
    ...overrides,
  };
}

describe("condenseProjectActivity", () => {
  it("aggregates multiple reviews on the same PR into one row", () => {
    const payload = makePayload({
      items: [
        {
          id: "1",
          kind: "pr_opened",
          at: "2026-08-18T10:00:00.000Z",
          label: "PR #938 opened",
          ref: "938",
        },
        {
          id: "2",
          kind: "review",
          at: "2026-08-18T11:00:00.000Z",
          label: "Review on PR #938 (approved)",
          ref: "938",
        },
        {
          id: "3",
          kind: "review",
          at: "2026-08-18T12:00:00.000Z",
          label: "Review on PR #938 (commented)",
          ref: "938",
        },
        {
          id: "4",
          kind: "review",
          at: "2026-08-18T13:00:00.000Z",
          label: "Review on PR #938 (changes requested)",
          ref: "938",
        },
        {
          id: "5",
          kind: "pr_merged",
          at: "2026-08-18T15:00:00.000Z",
          label: "PR #938 merged",
          ref: "938",
        },
      ],
      days: [
        {
          date: "2026-08-18",
          prsOpened: 1,
          prsMerged: 1,
          reviews: 3,
          releases: 0,
          issuesOpened: 0,
          issuesClosed: 0,
          items: [],
        },
      ],
    });

    const condensed = condenseProjectActivity(payload, { anchorDate: anchor });
    expect(condensed.showcase).toHaveLength(1);
    expect(condensed.showcase[0].label).toBe("PR #938 — merged · 3 reviews");
    expect(condensed.grouped).toHaveLength(0);
  });

  it("puts in-flight PRs in grouped, merged and releases in showcase", () => {
    const payload = makePayload({
      private: false,
      items: [
        {
          id: "m1",
          kind: "pr_merged",
          at: "2026-08-18T09:00:00.000Z",
          label: "PR #900 merged — gateway fix",
          ref: "900",
          url: "https://github.com/example/pull/900",
        },
        {
          id: "r1",
          kind: "release",
          at: "2026-08-17T18:00:00.000Z",
          label: "Release v2.1.0 — billing",
          ref: "v2.1.0",
          url: "https://github.com/example/releases/v2.1.0",
        },
        {
          id: "o1",
          kind: "pr_opened",
          at: "2026-08-16T10:00:00.000Z",
          label: "PR #880 opened — auth tweak",
          ref: "880",
          url: "https://github.com/example/pull/880",
        },
        {
          id: "rv1",
          kind: "review",
          at: "2026-08-16T11:00:00.000Z",
          label: "PR #880 approved",
          ref: "880",
          url: "https://github.com/example/pull/880",
        },
      ],
      days: [],
    });

    const { showcase, grouped } = condenseProjectActivity(payload, {
      anchorDate: anchor,
    });
    expect(showcase.map((r) => r.primaryKind)).toEqual([
      "pr_merged",
      "release",
    ]);
    expect(grouped).toHaveLength(1);
    expect(grouped[0].label).toContain("PR #880");
    expect(grouped[0].reviewCount).toBe(1);
  });

  it("buildDaySeries fills seven days with zeros for gaps", () => {
    const series = buildDaySeries(
      [
        {
          date: "2026-08-18",
          prsOpened: 2,
          prsMerged: 4,
          reviews: 5,
          releases: 1,
          issuesOpened: 0,
          issuesClosed: 0,
          items: [],
        },
      ],
      anchor,
      7
    );
    expect(series).toHaveLength(7);
    const aug18 = series.find((d) => d.date === "2026-08-18");
    expect(aug18?.merged).toBe(4);
    expect(series[0].merged).toBe(0);
  });

  it("filterActivityByWindow trims items outside range", () => {
    const payload = makePayload({
      items: [
        {
          id: "old",
          kind: "pr_merged",
          at: "2026-05-01T10:00:00.000Z",
          label: "PR #1 merged",
          ref: "1",
        },
        {
          id: "new",
          kind: "pr_merged",
          at: "2026-08-18T10:00:00.000Z",
          label: "PR #2 merged",
          ref: "2",
        },
      ],
      days: [
        {
          date: "2026-05-01",
          prsOpened: 0,
          prsMerged: 1,
          reviews: 0,
          releases: 0,
          issuesOpened: 0,
          issuesClosed: 0,
          items: [],
        },
        {
          date: "2026-08-18",
          prsOpened: 0,
          prsMerged: 1,
          reviews: 0,
          releases: 0,
          issuesOpened: 0,
          issuesClosed: 0,
          items: [],
        },
      ],
    });

    const scoped = filterActivityByWindow(payload, 7, anchor);
    expect(scoped.items).toHaveLength(1);
    expect(scoped.items[0].ref).toBe("2");
    expect(scoped.days).toHaveLength(1);
  });

  it("buildDaySeries uses weekly buckets for 90d", () => {
    const series = buildDaySeries([], anchor, 90);
    expect(series.length).toBeGreaterThanOrEqual(12);
    expect(series.length).toBeLessThanOrEqual(14);
  });

  it("formatTotalsLine summarizes counts", () => {
    expect(
      formatTotalsLine({
        merged: 12,
        opened: 3,
        reviews: 5,
        releases: 0,
        issuesOpened: 0,
        issuesClosed: 1,
      })
    ).toBe("12 merged · 3 opened · 5 reviews · 1 finished");
  });
});

import { toClientActivityPayload, condenseProjectActivity as condenseForClient } from "./activity-aggregate";
import type { HomepageActivityPayload } from "./github-activity-types";

describe("toClientActivityPayload", () => {
  const item = (id: string, at: string) => ({ id, kind: "pr_merged" as const, at, label: "PR #1 — x", ref: "1" });
  const activity: ProjectActivityPayload = {
    slug: "a",
    displayName: "A",
    private: false,
    headline: "h",
    fetchedAt: "2026-10-12T00:00:00Z",
    source: "github",
    items: [item("1", "2026-10-11T00:00:00Z")],
    days: [
      {
        date: "2026-10-11",
        prsOpened: 0,
        prsMerged: 1,
        reviews: 0,
        releases: 0,
        issuesOpened: 0,
        issuesClosed: 0,
        items: [item("1", "2026-10-11T00:00:00Z")],
      },
    ],
  };
  const data: HomepageActivityPayload = {
    lines: [{ slug: "a", displayName: "A", private: false, line: "l", href: "/projects/a" }],
    repos: [
      {
        slug: "a",
        displayName: "A",
        private: false,
        href: "/projects/a",
        headline: "h",
        activity,
        condensed: condenseForClient(activity),
      },
    ],
    fetchedAt: activity.fetchedAt,
    source: "github",
    historyDays: 90,
    defaultRangeDays: 7,
  };

  it("ships pre-condensed ranges, not the raw event history", () => {
    const out = toClientActivityPayload(data);
    expect("activity" in out.repos[0]).toBe(false);
    expect("lines" in out).toBe(false);
    expect(Object.keys(out.repos[0].byRange).sort()).toEqual(["30", "7", "90"]);
  });

  it("matches the full condense for totals, days and showcase", () => {
    const out = toClientActivityPayload(data);
    for (const range of [7, 30, 90] as const) {
      const full = condenseForClient(activity, { windowDays: range });
      const slim = out.repos[0].byRange[range];
      expect(slim.totals).toEqual(full.totals);
      expect(slim.days).toEqual(full.days);
      expect(slim.showcase).toEqual(full.showcase.slice(0, 2));
      expect(slim.groupedCount).toBe(full.grouped.length);
      expect(slim.grouped).toEqual([]);
    }
  });
});
