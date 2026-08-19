import type {
  HomepageActivityPayload,
  ProjectActivityPayload,
} from "@/lib/github-activity-types";

const now = new Date("2026-08-19T12:00:00.000Z");

export function fixtureHomepageActivity(): HomepageActivityPayload {
  return {
    fetchedAt: now.toISOString(),
    source: "fixture",
    lines: [
      {
        slug: "khan",
        displayName: "Khan",
        private: true,
        line: "4 PRs merged Aug 18 · 2 reviews · release cut",
        href: "/projects/khan",
      },
      {
        slug: "kurultai",
        displayName: "Kurultai",
        private: false,
        line: "PR #225 opened · 3 merged this week",
        href: "/projects/kurultai",
      },
      {
        slug: "pace-server",
        displayName: "Pace Server",
        private: true,
        line: "12 PRs merged this week · 5 reviews",
        href: "/projects/pace-server",
      },
      {
        slug: "openrouter",
        displayName: "OpenRouter Demos",
        private: false,
        line: "PR merged · fixtures pytest green",
        href: "/projects/openrouter",
      },
    ],
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

  return {
    ...base,
    displayName: slug,
    private: true,
    headline: "4 PRs merged Aug 18 · 1 review",
    items: [
      {
        id: `${slug}-1`,
        kind: "pr_merged",
        at: "2026-08-18T09:00:00.000Z",
        label: "PR merged",
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
