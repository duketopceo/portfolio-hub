import { describe, expect, it } from "vitest";
import {
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
