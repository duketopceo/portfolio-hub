import { afterEach, describe, expect, it, vi } from "vitest";
import {
  commitContributionDay,
  getSignalContributions,
  mapContributionsToCatalog,
  parseContributionResponse,
  type ContributionRepo,
} from "./github-contributions";
import type { ProjectConfig } from "@/lib/types";

const catalog = [
  { slug: "alpha", displayName: "Alpha", repoName: "alpha-repo", private: false },
  { slug: "beta", displayName: "Beta", repoName: "beta-repo", repoOwner: "other", private: true },
] as unknown as ProjectConfig[];

function repo(owner: string, name: string, isPrivate = false): ContributionRepo {
  return {
    owner,
    name,
    isPrivate,
    days: [{ date: "2026-11-10", commits: 2, prsOpened: 0, issuesOpened: 0 }],
  };
}

describe("mapContributionsToCatalog", () => {
  it("drops repositories with no catalog entry", () => {
    const out = mapContributionsToCatalog(
      [repo("duketopceo", "not-in-catalog"), repo("duketopceo", "alpha-repo")],
      catalog
    );
    expect(out.map((c) => c.slug)).toEqual(["alpha"]);
    expect(JSON.stringify(out)).not.toContain("not-in-catalog");
  });

  it("marks GitHub-private repos even when the catalog says public", () => {
    const [c] = mapContributionsToCatalog([repo("duketopceo", "alpha-repo", true)], catalog);
    expect(c).toMatchObject({ catalogPrivate: false, githubPrivate: true });
  });

  it("honours the catalog private flag and repoOwner", () => {
    const [c] = mapContributionsToCatalog([repo("other", "beta-repo")], catalog);
    expect(c).toMatchObject({ slug: "beta", catalogPrivate: true, githubPrivate: false });
  });
});

describe("parseContributionResponse", () => {
  const entry = (name: string, nodes: object[], isPrivate?: boolean) => ({
    repository: { name, isPrivate, owner: { login: "duketopceo" } },
    contributions: { nodes },
  });

  it("folds commits, PRs and issues per repo and UTC day", () => {
    const out = parseContributionResponse({
      data: {
        user: {
          contributionsCollection: {
            commitContributionsByRepository: [
              entry("a", [{ occurredAt: "2026-11-10T00:00:00Z", commitCount: 3 }], false),
            ],
            pullRequestContributionsByRepository: [
              entry("a", [{ occurredAt: "2026-11-10T14:00:00Z" }], false),
            ],
            issueContributionsByRepository: [],
          },
        },
      },
    });
    expect(out).toEqual([
      {
        owner: "duketopceo",
        name: "a",
        isPrivate: false,
        days: [{ date: "2026-11-10", commits: 3, prsOpened: 1, issuesOpened: 0 }],
      },
    ]);
  });

  it("fails closed when isPrivate is missing", () => {
    const out = parseContributionResponse({
      data: {
        user: {
          contributionsCollection: {
            commitContributionsByRepository: [
              entry("a", [{ occurredAt: "2026-11-10T00:00:00Z", commitCount: 1 }]),
            ],
          },
        },
      },
    });
    expect(out?.[0].isPrivate).toBe(true);
  });

  it("returns null when the user is not readable", () => {
    expect(parseContributionResponse({ data: { user: null } })).toBeNull();
    expect(parseContributionResponse({})).toBeNull();
  });
});

describe("day bucketing", () => {
  const entry = (nodes: object[]) => ({
    repository: { name: "a", isPrivate: false, owner: { login: "duketopceo" } },
    contributions: { nodes },
  });

  it("treats commit occurredAt as GitHub's local contribution day", () => {
    // UTC+2 contributor: local midnight Nov 10 is 22:00Z on Nov 9.
    expect(commitContributionDay("2026-11-09T22:00:00Z")).toBe("2026-11-10");
    // UTC-8 contributor: local midnight Nov 10 is 08:00Z the same UTC date.
    expect(commitContributionDay("2026-11-10T08:00:00Z")).toBe("2026-11-10");
    expect(commitContributionDay("2026-11-10T00:00:00Z")).toBe("2026-11-10");
  });

  it("keeps PR and issue days as UTC dates while commit days are calendar dates", () => {
    const out = parseContributionResponse({
      data: {
        user: {
          contributionsCollection: {
            commitContributionsByRepository: [
              entry([{ occurredAt: "2026-11-09T22:00:00Z", commitCount: 2 }]),
            ],
            pullRequestContributionsByRepository: [
              entry([{ occurredAt: "2026-11-09T23:30:00Z" }]),
            ],
            issueContributionsByRepository: [],
          },
        },
      },
    });
    const days = out![0].days;
    expect(days.find((d) => d.date === "2026-11-10")).toMatchObject({ commits: 2, prsOpened: 0 });
    expect(days.find((d) => d.date === "2026-11-09")).toMatchObject({ commits: 0, prsOpened: 1 });
  });
});

describe("getSignalContributions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  function stub(response: () => Response | Promise<Response>) {
    const bodies: string[] = [];
    vi.stubEnv("GITHUB_TOKEN", "test-token-not-real");
    vi.stubGlobal("fetch", async (_url: string, init?: RequestInit) => {
      bodies.push(String(init?.body));
      return response();
    });
    return bodies;
  }

  it("sends identical request bodies for two calls within the same UTC hour", async () => {
    const bodies = stub(() => new Response(JSON.stringify({ data: { user: null } }), { status: 200 }));
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-11-10T12:05:01.123Z"));
      await getSignalContributions(Date.now() - 90 * 86_400_000, 3600);
      vi.setSystemTime(new Date("2026-11-10T12:47:59.987Z"));
      await getSignalContributions(Date.now() - 90 * 86_400_000, 3600);
    } finally {
      vi.useRealTimers();
    }
    expect(bodies).toHaveLength(2);
    expect(bodies[0]).toBe(bodies[1]);
    expect(JSON.parse(bodies[0]).variables.to).toBe("2026-11-10T12:00:00.000Z");
  });

  it("warns with status only on a non-OK response and returns []", async () => {
    stub(() => new Response("secret body", { status: 502 }));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await getSignalContributions(0, 3600)).toEqual([]);
    const logged = warn.mock.calls.flat().join(" ");
    expect(logged).toContain("502");
    expect(logged).not.toContain("secret body");
    expect(logged).not.toContain("test-token-not-real");
  });

  it("warns on GraphQL errors returned with HTTP 200 and returns []", async () => {
    stub(
      () =>
        new Response(
          JSON.stringify({ errors: [{ type: "FORBIDDEN", message: "private-repo-name leak" }] }),
          { status: 200 }
        )
    );
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await getSignalContributions(0, 3600)).toEqual([]);
    const logged = warn.mock.calls.flat().join(" ");
    expect(logged).toContain("FORBIDDEN");
    expect(logged).not.toContain("private-repo-name");
  });

  it("warns with the error type when fetch throws and returns []", async () => {
    vi.stubEnv("GITHUB_TOKEN", "test-token-not-real");
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("connect failed to secret-host");
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await getSignalContributions(0, 3600)).toEqual([]);
    const logged = warn.mock.calls.flat().join(" ");
    expect(logged).toContain("TypeError");
    expect(logged).not.toContain("secret-host");
  });
});
