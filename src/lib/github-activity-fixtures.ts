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
      headline: "PR #225 opened · 3 merged this week",
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
          id: "k-2",
          kind: "pr_merged",
          at: "2026-08-17T10:00:00.000Z",
          label: "PR #220 merged into main",
          ref: "220",
          url: "https://github.com/duketopceo/kurultai/pull/220",
          mergeTarget: "main",
        },
      ],
      days: [
        {
          date: "2026-08-18",
          prsOpened: 1,
          prsMerged: 0,
          reviews: 0,
          releases: 0,
          items: [],
        },
        {
          date: "2026-08-17",
          prsOpened: 0,
          prsMerged: 1,
          reviews: 2,
          releases: 0,
          items: [],
        },
      ],
    };
  }

  return {
    ...base,
    displayName: slug,
    private: true,
    headline: "Activity available on dossier",
    items: [
      {
        id: `${slug}-1`,
        kind: "pr_merged",
        at: "2026-08-18T09:00:00.000Z",
        label: "PR merged",
        ref: "42",
      },
    ],
    days: [
      {
        date: "2026-08-18",
        prsOpened: 0,
        prsMerged: 1,
        reviews: 1,
        releases: 0,
        items: [],
      },
    ],
  };
}
