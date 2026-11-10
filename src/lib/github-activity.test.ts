import { afterEach, describe, expect, it, vi } from "vitest";
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

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.doUnmock("@/lib/github-app");
    vi.resetModules();
  });

  const recent = (hoursAgo: number) =>
    new Date(Date.now() - hoursAgo * 3_600_000).toISOString();

  /** REST stub: one merged PR and one release per repo; repo metadata public. */
  function rest(url: string): Response {
    const json = (v: unknown) => new Response(JSON.stringify(v), { status: 200 });
    if (/\/pulls\?state=open/.test(url)) return json([]);
    if (/\/pulls\?state=closed/.test(url) && /page=1\b/.test(url)) {
      return json([
        {
          number: 7,
          title: "Ship the thing",
          html_url: "https://github.com/x/y/pull/7",
          state: "closed",
          merged_at: recent(2),
          created_at: recent(5),
          closed_at: recent(2),
          updated_at: recent(2),
          base: { ref: "main" },
        },
      ]);
    }
    if (/\/pulls\/\d+\/reviews/.test(url)) return json([]);
    if (/\/releases/.test(url)) return json([]);
    if (/\/issues\?/.test(url)) return json([]);
    if (/\/repos\/[^/]+\/[^/?]+$/.test(url)) return json({ private: false });
    return json([]);
  }

  function stub(graphql: () => Response | Promise<Response>) {
    const calls: Array<{ url: string; method: string }> = [];
    vi.stubEnv("GITHUB_TOKEN", "test-token-not-real");
    vi.stubEnv("ACTIVITY_USE_FIXTURES", "");
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), method: init?.method ?? "GET" });
      if (String(url).endsWith("/graphql")) return graphql();
      return rest(String(url));
    });
    return calls;
  }

  async function run(graphql: () => Response | Promise<Response>) {
    const calls = stub(graphql);
    const { getSignalActivity } = await import("./github-activity");
    const out = await getSignalActivity();
    return { out, calls };
  }

  it("adds exactly one GraphQL call and survives its failure", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const failing = await run(() => new Response("nope", { status: 502 }));
    warn.mockRestore();
    const graphqlCalls = failing.calls.filter((c) => c.url.endsWith("/graphql"));
    expect(graphqlCalls).toHaveLength(1);
    expect(graphqlCalls[0].method).toBe("POST");
    expect(failing.out.contributions).toEqual([]);
    expect(failing.out.source).toBe("github");
    expect(failing.out.payloads).toHaveLength(featuredCount);
    // Real featured data came from the REST stubs, not the test fixture fallback.
    for (const p of failing.out.payloads) {
      expect(p.items.some((i) => i.kind === "pr_merged" && i.ref === "7")).toBe(true);
    }
    // Every other call is per-repo REST traffic (pulls, releases, issues, repo meta).
    const rest = failing.calls.filter((c) => !c.url.endsWith("/graphql"));
    expect(rest.some((c) => c.url.includes("/pulls?state=closed"))).toBe(true);
    expect(rest.some((c) => c.url.includes("/releases"))).toBe(true);
    expect(failing.out.publicSlugs).toHaveLength(featuredCount);
  });

  it("resolves with featured data when the contributions token lookup throws", async () => {
    stub(() => new Response("{}", { status: 200 }));
    const real = await vi.importActual<typeof import("@/lib/github-app")>("@/lib/github-app");
    let first = true;
    vi.doMock("@/lib/github-app", () => ({
      ...real,
      // The contributions call starts first, so it takes the throwing lookup.
      getGithubAccessToken: async () => {
        if (first) {
          first = false;
          throw new Error("token service down");
        }
        return "test-token-not-real";
      },
    }));
    vi.resetModules();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getSignalActivity } = await import("./github-activity");
    const out = await getSignalActivity();
    warn.mockRestore();
    expect(out.contributions).toEqual([]);
    expect(out.payloads).toHaveLength(featuredCount);
    expect(out.payloads[0].items.length).toBeGreaterThan(0);
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
