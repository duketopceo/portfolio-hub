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
  summarizeProject,
} from "./signal-summary";

const NOW = new Date("2026-11-10T12:00:00.000Z");

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
    expect(formatCounts({ merged: 2, opened: 0, releases: 1, issues: 0 })).toBe(
      "2 merged, 1 release"
    );
    expect(formatCounts({ merged: 0, opened: 0, releases: 0, issues: 0 })).toBe("");
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
    expect(row.counts7).toEqual({ merged: 2, opened: 1, releases: 1, issues: 1 });
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
      { fetchedAt: NOW.toISOString(), source: "github" }
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
    const s = buildSignalSummary([], { fetchedAt: NOW.toISOString(), source: "github" });
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
      { fetchedAt: NOW.toISOString(), source: "github" }
    );
    expect(JSON.stringify(s).length).toBeLessThan(1500);
  });
});
