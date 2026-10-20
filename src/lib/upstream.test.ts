import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

vi.mock("@/lib/github-app", () => ({
  getGithubAccessToken: async () => "test-token",
}));

import { getUpstreamContributions } from "./upstream";
import { fixtureSearchItems } from "./upstream-fixtures";
import {
  UpstreamContributions,
  UpstreamSummary,
} from "@/components/UpstreamContributions";

let queries: string[] = [];

/** Faithful stub: honors `is:public` the way GitHub search does. */
function stubGithub(items = fixtureSearchItems()) {
  queries = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      const q = url.searchParams.get("q") ?? "";
      queries.push(q);
      const page = Number(url.searchParams.get("page") ?? "1");
      const perPage = Number(url.searchParams.get("per_page") ?? "30");
      const visible = q.includes("is:public")
        ? items.filter((i) => i.fixtureVisibility !== "private")
        : items;
      return new Response(
        JSON.stringify({
          total_count: visible.length,
          items: visible.slice((page - 1) * perPage, page * perPage),
        }),
        { status: 200 }
      );
    })
  );
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getUpstreamContributions", () => {
  it("searches public PRs by the author outside their own repos", async () => {
    stubGithub();
    await getUpstreamContributions();
    expect(queries[0]).toBe("author:duketopceo is:pr is:public -user:duketopceo");
  });

  it("drops non-allowlisted and private-repo rows", async () => {
    stubGithub();
    const data = await getUpstreamContributions();
    const all = [...data!.merged, ...data!.open, ...data!.closed];
    expect(all.some((p) => p.repo === "someone-else/not-allowlisted")).toBe(false);
    expect(all.some((p) => p.number === 9003)).toBe(false);
    expect(all.some((p) => /Cofounder|Herzog/i.test(p.repo))).toBe(false);
  });

  it("scrubs sensitive titles to PR #n", async () => {
    stubGithub();
    const data = await getUpstreamContributions();
    const byNum = (n: number) => data!.open.find((p) => p.number === n);
    expect(byNum(9001)?.title).toBe("PR #9001");
    expect(byNum(9002)?.title).toBe("PR #9002");
    expect(byNum(26)?.title).toContain("Restyle panel");
  });

  it("resolves closed PRs to merged or closed without merge", async () => {
    stubGithub();
    const data = await getUpstreamContributions();
    expect(data!.merged.map((p) => p.number)).toContain(406);
    expect(data!.closed.map((p) => p.number)).toContain(407);
    expect(data!.merged.map((p) => p.number)).not.toContain(407);
    expect(data!.merged).toHaveLength(5);
    expect(data!.closed).toHaveLength(5);
  });

  it("returns null when the fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 500 }))
    );
    expect(await getUpstreamContributions()).toBeNull();
  });
});

describe("UpstreamContributions", () => {
  it("renders the unavailable state with no counts when data is null", () => {
    const html = renderToStaticMarkup(
      createElement(UpstreamContributions, { data: null })
    );
    expect(html).toContain("unavailable");
    expect(html).not.toMatch(/\b0\s+merged/i);
    expect(html).not.toContain("<table");
  });

  it("renders curated items with type labels and no GitHub fetch", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const html = renderToStaticMarkup(
      createElement(UpstreamContributions, { data: null })
    );
    expect(html).toContain("issue comment");
    expect(html).toContain("kernel patch");
    expect(html).toContain("prepared, not yet sent");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("groups merged, open and closed with counts", async () => {
    stubGithub();
    const data = await getUpstreamContributions();
    const html = renderToStaticMarkup(
      createElement(UpstreamContributions, { data })
    );
    expect(html).toContain("<details");
    expect(html).toContain("https://github.com/akitaonrails/ai-usagebar/pull/406");
    const summary = renderToStaticMarkup(
      createElement(UpstreamSummary, { data })
    );
    expect(summary).toContain("5");
    expect(summary).toContain(String(data!.open.length));
  });
});
