import type {
  HomepageActivityPayload,
  ProjectActivityPayload,
} from "@/lib/github-activity-types";
import { condenseProjectActivity } from "@/lib/activity-aggregate";

const now = new Date("2026-08-19T12:00:00.000Z");

function homepageRepo(summary: ProjectActivityPayload) {
  const condensed = condenseProjectActivity(summary, {
    anchorDate: now,
    windowDays: 7,
  });
  return {
    slug: summary.slug,
    displayName: summary.displayName,
    private: summary.private,
    href: `/projects/${summary.slug}`,
    headline: summary.headline,
    activity: summary,
    condensed,
  };
}

export function fixtureHomepageActivity(): HomepageActivityPayload {
  const summaries = [
    fixtureProjectActivity("khan"),
    fixtureProjectActivity("kurultai"),
    fixtureProjectActivity("pace-server"),
    fixtureProjectActivity("openrouter"),
  ];
  const repos = summaries.map(homepageRepo);
  return {
    fetchedAt: now.toISOString(),
    source: "fixture",
    repos,
    lines: repos.map((r) => ({
      slug: r.slug,
      displayName: r.displayName,
      private: r.private,
      line: r.headline,
      href: r.href,
    })),
    historyDays: 90,
    defaultRangeDays: 7,
  };
}

export function fixtureProjectActivity(slug: string): ProjectActivityPayload {
  const base = {
    slug,
    fetchedAt: now.toISOString(),
    source: "fixture" as const,
  };

  if (slug === "kurultai") {
    return {
      ...base,
      displayName: "Kurultai",
      private: false,
      headline: "PR #225 opened · 3 merged this week · 2 reviews",
      items: [
        {
          id: "k-1",
          kind: "pr_opened",
          at: "2026-08-18T15:00:00.000Z",
          label: "PR #225 opened — sqlite-vec retrieval path",
          ref: "225",
          url: "https://github.com/duketopceo/kurultai/pull/225",
          mergeTarget: "main",
        },
        {
          id: "k-r1",
          kind: "review",
          at: "2026-08-18T16:30:00.000Z",
          label: "PR #225 approved",
          ref: "225",
          url: "https://github.com/duketopceo/kurultai/pull/225",
        },
        {
          id: "k-2",
          kind: "pr_merged",
          at: "2026-08-17T10:00:00.000Z",
          label: "PR #220 merged — FTS5 query planner",
          ref: "220",
          url: "https://github.com/duketopceo/kurultai/pull/220",
          mergeTarget: "main",
        },
        {
          id: "k-i1",
          kind: "issue_opened",
          at: "2026-08-16T09:00:00.000Z",
          label: "Issue #88 started — MCP tool registry",
          ref: "88",
          url: "https://github.com/duketopceo/kurultai/issues/88",
        },
        {
          id: "k-rel",
          kind: "release",
          at: "2026-08-15T18:00:00.000Z",
          label: "Release v0.4.2 — MCP server bundle",
          ref: "v0.4.2",
          url: "https://github.com/duketopceo/kurultai/releases/tag/v0.4.2",
        },
      ],
      days: [
        {
          date: "2026-08-18",
          prsOpened: 1,
          prsMerged: 0,
          reviews: 1,
          releases: 0,
          issuesOpened: 0,
          issuesClosed: 0,
          items: [],
        },
        {
          date: "2026-08-17",
          prsOpened: 0,
          prsMerged: 1,
          reviews: 1,
          releases: 0,
          issuesOpened: 0,
          issuesClosed: 0,
          items: [],
        },
        {
          date: "2026-08-16",
          prsOpened: 0,
          prsMerged: 0,
          reviews: 0,
          releases: 0,
          issuesOpened: 1,
          issuesClosed: 0,
          items: [],
        },
        {
          date: "2026-08-15",
          prsOpened: 0,
          prsMerged: 0,
          reviews: 0,
          releases: 1,
          issuesOpened: 0,
          issuesClosed: 0,
          items: [],
        },
      ],
    };
  }

  if (slug === "pace-server") {
    const reviewItems = [1, 2, 3, 4, 5].map((n) => ({
      id: `pace-r${n}`,
      kind: "review" as const,
      at: `2026-08-18T1${n}:00:00.000Z`,
      label: `Review on PR #938 (${n === 1 ? "approved" : "commented"})`,
      ref: "938",
    }));
    return {
      ...base,
      displayName: "Pace Server",
      private: true,
      headline: "12 PRs merged this week · 18 reviews",
      items: [
        {
          id: "pace-m1",
          kind: "pr_merged",
          at: "2026-08-18T14:00:00.000Z",
          label: "PR #938 merged",
          ref: "938",
        },
        {
          id: "pace-o1",
          kind: "pr_opened",
          at: "2026-08-17T09:00:00.000Z",
          label: "PR #938 opened",
          ref: "938",
        },
        ...reviewItems,
        {
          id: "pace-m2",
          kind: "pr_merged",
          at: "2026-08-17T16:00:00.000Z",
          label: "PR #920 merged",
          ref: "920",
        },
        {
          id: "pace-rel",
          kind: "release",
          at: "2026-08-16T12:00:00.000Z",
          label: "Release v0.9.1",
          ref: "v0.9.1",
        },
      ],
      days: [
        {
          date: "2026-08-18",
          prsOpened: 0,
          prsMerged: 1,
          reviews: 5,
          releases: 0,
          issuesOpened: 0,
          issuesClosed: 0,
          items: [],
        },
        {
          date: "2026-08-17",
          prsOpened: 1,
          prsMerged: 1,
          reviews: 0,
          releases: 0,
          issuesOpened: 0,
          issuesClosed: 0,
          items: [],
        },
        {
          date: "2026-08-16",
          prsOpened: 0,
          prsMerged: 0,
          reviews: 0,
          releases: 1,
          issuesOpened: 0,
          issuesClosed: 0,
          items: [],
        },
      ],
    };
  }

  if (slug === "openrouter") {
    return {
      ...base,
      displayName: "OpenRouter Demos",
      private: false,
      headline: "PR merged · fixtures pytest green",
      items: [
        {
          id: "or-1",
          kind: "pr_merged",
          at: "2026-08-18T11:00:00.000Z",
          label: "PR #12 merged — caesar trace schema",
          ref: "12",
          url: "https://github.com/duketopceo/openrouter-demos/pull/12",
        },
      ],
      days: [
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
    };
  }

  return {
    ...base,
    displayName: slug === "khan" ? "Khan" : slug,
    private: true,
    headline: "4 PRs merged Aug 18 · 1 review",
    items: [
      {
        id: `${slug}-1`,
        kind: "pr_merged",
        at: "2026-08-18T09:00:00.000Z",
        label: "PR #42 merged",
        ref: "42",
      },
      {
        id: `${slug}-2`,
        kind: "review",
        at: "2026-08-18T10:00:00.000Z",
        label: "Review on PR #42 (approved)",
        ref: "42",
      },
      {
        id: `${slug}-3`,
        kind: "issue_closed",
        at: "2026-08-17T14:00:00.000Z",
        label: "Issue #12 finished",
        ref: "12",
      },
    ],
    days: [
      {
        date: "2026-08-18",
        prsOpened: 0,
        prsMerged: 1,
        reviews: 1,
        releases: 0,
        issuesOpened: 0,
        issuesClosed: 0,
        items: [],
      },
      {
        date: "2026-08-17",
        prsOpened: 0,
        prsMerged: 0,
        reviews: 0,
        releases: 0,
        issuesOpened: 0,
        issuesClosed: 1,
        items: [],
      },
    ],
  };
}
