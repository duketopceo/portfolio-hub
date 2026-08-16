import { describe, expect, it } from "vitest";
import {
  curatedSummaryFallback,
  mapGithubSummaryStatus,
} from "./github-summary-status";

describe("mapGithubSummaryStatus", () => {
  it("returns 404 for an unknown repo name", () => {
    expect(
      mapGithubSummaryStatus({
        curated: false,
        catalogPrivate: false,
        github: { type: "missing-token" },
      })
    ).toEqual({ httpStatus: 404, bodyKind: "unknown" });
  });

  it("returns 200 fallback for catalog-private curated names without calling GitHub", () => {
    expect(
      mapGithubSummaryStatus({
        curated: true,
        catalogPrivate: true,
        github: { type: "skipped" },
      })
    ).toEqual({ httpStatus: 200, bodyKind: "fallback" });
  });

  it("does not use a stub GitHub 200 when the catalog row is private", () => {
    expect(
      mapGithubSummaryStatus({
        curated: true,
        catalogPrivate: true,
        github: { type: "ok" },
      })
    ).toEqual({ httpStatus: 200, bodyKind: "fallback" });
  });

  it("returns 200 full payload for curated public + GitHub 200", () => {
    expect(
      mapGithubSummaryStatus({
        curated: true,
        catalogPrivate: false,
        github: { type: "ok" },
      })
    ).toEqual({ httpStatus: 200, bodyKind: "full" });
  });

  it("returns 200 fallback when the token is missing", () => {
    expect(
      mapGithubSummaryStatus({
        curated: true,
        catalogPrivate: false,
        github: { type: "missing-token" },
      })
    ).toEqual({ httpStatus: 200, bodyKind: "fallback" });
  });

  it("returns 200 fallback on GitHub 404 for a public curated name", () => {
    expect(
      mapGithubSummaryStatus({
        curated: true,
        catalogPrivate: false,
        github: { type: "http", status: 404 },
      })
    ).toEqual({ httpStatus: 200, bodyKind: "fallback" });
  });

  it("returns 200 fallback on GitHub 401/403 for a public curated name", () => {
    expect(
      mapGithubSummaryStatus({
        curated: true,
        catalogPrivate: false,
        github: { type: "http", status: 401 },
      })
    ).toEqual({ httpStatus: 200, bodyKind: "fallback" });
    expect(
      mapGithubSummaryStatus({
        curated: true,
        catalogPrivate: false,
        github: { type: "http", status: 403 },
      })
    ).toEqual({ httpStatus: 200, bodyKind: "fallback" });
  });

  it("returns 502 on GitHub 5xx", () => {
    expect(
      mapGithubSummaryStatus({
        curated: true,
        catalogPrivate: false,
        github: { type: "http", status: 503 },
      })
    ).toEqual({ httpStatus: 502, bodyKind: "unavailable" });
  });

  it("returns 502 on timeout", () => {
    expect(
      mapGithubSummaryStatus({
        curated: true,
        catalogPrivate: false,
        github: { type: "timeout" },
      })
    ).toEqual({ httpStatus: 502, bodyKind: "unavailable" });
  });
});

describe("curatedSummaryFallback", () => {
  it("omits githubPath, pull htmlUrl, and GitHub error fields", () => {
    const body = curatedSummaryFallback("Khan");
    const json = JSON.stringify(body);
    expect(body.pulls).toEqual([]);
    expect(body).not.toHaveProperty("githubPath");
    expect(json).not.toMatch(/github\.com/);
    expect(json).not.toMatch(/ghp_/);
    expect(json).not.toMatch(/Bearer/);
    expect(json).not.toMatch(/Bad credentials/);
    expect(json).not.toMatch(/"message"/);
  });
});
