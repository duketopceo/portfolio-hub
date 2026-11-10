import { describe, expect, it, vi } from "vitest";
import {
  activityKindVerb,
  getHomepageActivityShowcase,
  getProjectActivityTimeline,
} from "./github-activity";
import { fixtureHomepageActivity } from "./github-activity-fixtures";

describe("github-activity fixtures", () => {
  it("homepage fixture returns up to 4 repos with condensed charts", async () => {
    const data = await getHomepageActivityShowcase({ useFixtures: true });
    expect(data.source).toBe("fixture");
    expect(data.repos.length).toBeGreaterThanOrEqual(1);
    expect(data.repos.length).toBeLessThanOrEqual(4);
    expect(data.repos[0].condensed.days).toHaveLength(7);
    expect(data.repos[0].condensed.showcase.length).toBeGreaterThan(0);
  });

  it("pace-server fixture condenses review flood to one PR row", async () => {
    const data = await getProjectActivityTimeline("pace-server", {
      useFixtures: true,
    });
    const { condenseProjectActivity } = await import("./activity-aggregate");
    const condensed = condenseProjectActivity(data, {
      anchorDate: new Date(data.fetchedAt),
    });
    const pr938 = condensed.showcase.find((r) => r.ref === "938");
    expect(pr938?.reviewCount).toBe(5);
    expect(pr938?.label).toBe("PR #938 — merged · 5 reviews");
  });

  it("project fixture for kurultai includes reviews, issues, releases", async () => {
    const data = await getProjectActivityTimeline("kurultai", {
      useFixtures: true,
    });
    expect(data.private).toBe(false);
    expect(data.items.some((i) => i.kind === "review")).toBe(true);
    expect(data.items.some((i) => i.kind === "issue_opened")).toBe(true);
    expect(data.items.some((i) => i.kind === "release")).toBe(true);
    expect(data.items.some((i) => i.url?.includes("github.com"))).toBe(true);
  });

  it("private fixture omits github deep links", async () => {
    const data = await getProjectActivityTimeline("khan", {
      useFixtures: true,
    });
    expect(data.private).toBe(true);
    expect(data.items.every((i) => !i.url?.includes("github.com"))).toBe(true);
    expect(data.items.some((i) => i.kind === "review")).toBe(true);
  });

  it("fixtureHomepageActivity matches shape", () => {
    const f = fixtureHomepageActivity();
    expect(f.repos.every((r) => r.href.startsWith("/projects/"))).toBe(true);
    expect(f.repos.every((r) => r.condensed.days.length === 7)).toBe(true);
    expect(f.repos.every((r) => r.activity.items.length > 0)).toBe(true);
    expect(f.historyDays).toBe(90);
    expect(f.defaultRangeDays).toBe(7);
  });

  it("activityKindVerb covers all event kinds", () => {
    expect(activityKindVerb("pr_opened")).toBe("Opened");
    expect(activityKindVerb("review")).toBe("Reviewed");
    expect(activityKindVerb("issue_opened")).toBe("Started");
    expect(activityKindVerb("issue_closed")).toBe("Finished");
  });
});

describe("getSignalActivity GitHub calls", () => {
  const featuredCount = 5;

  async function run(graphql: () => Response | Promise<Response>) {
    const calls: Array<{ url: string; method: string }> = [];
    vi.stubEnv("GITHUB_TOKEN", "test-token-not-real");
    vi.stubEnv("ACTIVITY_USE_FIXTURES", "");
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), method: init?.method ?? "GET" });
      if (String(url).endsWith("/graphql")) return graphql();
      return new Response("[]", { status: 200 });
    });
    const { getSignalActivity } = await import("./github-activity");
    const out = await getSignalActivity();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    return { out, calls };
  }

  it("adds exactly one GraphQL call and survives its failure", async () => {
    const failing = await run(() => new Response("nope", { status: 502 }));
    const graphqlCalls = failing.calls.filter((c) => c.url.endsWith("/graphql"));
    expect(graphqlCalls).toHaveLength(1);
    expect(graphqlCalls[0].method).toBe("POST");
    expect(failing.out.contributions).toEqual([]);
    expect(failing.out.payloads.length).toBe(featuredCount);
    // Everything else is the existing per-repo REST traffic.
    expect(failing.calls.length - 1).toBeGreaterThan(0);
  });

  it("maps contributions to catalog projects only", async () => {
    const { listedProjects } = await import("@/lib/catalog");
    const cfg = listedProjects().find((p) => !p.private && p.repoName)!;
    const node = {
      repository: {
        name: cfg.repoName,
        isPrivate: false,
        owner: { login: cfg.repoOwner ?? process.env.GITHUB_USER ?? "duketopceo" },
      },
      contributions: { nodes: [{ occurredAt: "2026-11-09T00:00:00Z", commitCount: 2 }] },
    };
    const stranger = {
      repository: { name: "no-such-catalog-repo", isPrivate: false, owner: { login: "duketopceo" } },
      contributions: { nodes: [{ occurredAt: "2026-11-09T00:00:00Z", commitCount: 9 }] },
    };
    const { out } = await run(
      () =>
        new Response(
          JSON.stringify({
            data: {
              user: {
                contributionsCollection: {
                  commitContributionsByRepository: [node, stranger],
                  pullRequestContributionsByRepository: [],
                  issueContributionsByRepository: [],
                },
              },
            },
          }),
          { status: 200 }
        )
    );
    expect(out.contributions.map((c) => c.slug)).toEqual([cfg.slug]);
    expect(JSON.stringify(out.contributions)).not.toContain("no-such-catalog-repo");
  });
});
