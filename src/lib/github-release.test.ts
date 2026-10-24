import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/github-app", () => ({ getGithubAccessToken: async () => null }));

import { fetchLatestRelease } from "./github";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const ok = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

describe("fetchLatestRelease", () => {
  it("maps a 200 response", async () => {
    const f = vi.fn(async (..._a: unknown[]) =>
      ok({
        tag_name: "v1.2.0",
        published_at: "2026-09-02T10:00:00Z",
        html_url: "https://github.com/duketopceo/x/releases/tag/v1.2.0",
        body: "ignored",
      })
    );
    vi.stubGlobal("fetch", f);
    expect(await fetchLatestRelease("x", "duketopceo")).toEqual({
      tag: "v1.2.0",
      publishedAt: "2026-09-02T10:00:00Z",
      url: "https://github.com/duketopceo/x/releases/tag/v1.2.0",
    });
    expect(String(f.mock.calls[0]?.[0])).toContain(
      "/repos/duketopceo/x/releases/latest"
    );
  });

  it("returns undefined on 404 without logging a failure", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(async () => ok({ message: "Not Found" }, 404)));
    expect(await fetchLatestRelease("x")).toBeUndefined();
    expect(err).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it("returns undefined on a network error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("boom");
      })
    );
    expect(await fetchLatestRelease("x")).toBeUndefined();
  });

  it("returns undefined for malformed or non-github payloads", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ok({ tag_name: "v1" })));
    expect(await fetchLatestRelease("x")).toBeUndefined();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        ok({
          tag_name: "v1",
          published_at: "2026-01-01T00:00:00Z",
          html_url: "javascript:alert(1)",
        })
      )
    );
    expect(await fetchLatestRelease("x")).toBeUndefined();
  });
});

describe("getEnrichedProjects privacy gate", () => {
  it("never fetches releases for private projects", async () => {
    vi.resetModules();
    const calls: string[] = [];
    vi.doMock("@/lib/github-app", () => ({ getGithubAccessToken: async () => null }));
    vi.doMock("@/lib/catalog", () => ({
      listedProjects: () => [
        { slug: "pub", repoName: "pub", private: false, siteOnly: false },
        { slug: "priv", repoName: "secret-repo", private: true, siteOnly: false },
      ],
    }));
    vi.doMock("@/lib/deployments", () => ({ applyDeploymentOverlay: (c: unknown) => c }));
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        calls.push(String(url));
        if (String(url).includes("/releases/latest")) {
          return ok({
            tag_name: "v9",
            published_at: "2026-01-01T00:00:00Z",
            html_url: "https://github.com/duketopceo/pub/releases/tag/v9",
          });
        }
        return ok([]);
      })
    );
    const { getEnrichedProjects } = await import("./github");
    const projects = await getEnrichedProjects();
    const pub = projects.find((p) => p.slug === "pub");
    const priv = projects.find((p) => p.slug === "priv");
    expect(pub?.latestRelease?.tag).toBe("v9");
    expect(priv?.latestRelease).toBeUndefined();
    expect(calls.some((u) => u.includes("secret-repo"))).toBe(false);
  });
});
