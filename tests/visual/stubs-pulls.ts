import type { Page } from "@playwright/test";

/**
 * /about lists open pull requests from live GitHub (client fetch of
 * /api/github/pulls) with ages computed from Date.now(), so its height and
 * text change by the hour. Serve a fixed list and freeze the page clock so
 * the baseline is deterministic. Server-rendered fixtures stay on
 * ACTIVITY_USE_FIXTURES (see playwright.config.ts).
 */
export const FIXED_NOW = "2026-11-15T12:00:00.000Z";

function row(n: number, slug: string, displayName: string, title: string, hoursAgo: number, status: string, draft = false) {
  return {
    repoName: slug,
    slug,
    displayName,
    number: n,
    title,
    author: "duketopceo",
    branch: `feat/fixture-${n}`,
    updatedAt: new Date(Date.parse(FIXED_NOW) - hoursAgo * 3_600_000).toISOString(),
    htmlUrl: `https://github.com/duketopceo/${slug}/pull/${n}`,
    draft,
    status,
  };
}

export async function stubLivePulls(page: Page) {
  // Top frame only: freezing the clock inside the (masked) Spotify iframe makes
  // its scripts log "sendMetric before initSemanticMetrics" console errors.
  await page.addInitScript((now) => {
    if (window.top !== window) return;
    const fixed = Date.parse(now);
    Date.now = () => fixed;
  }, FIXED_NOW);
  const pulls = [
    row(12, "kurultai", "Kurultai", "feat: fixture pull request one", 3, "review_requested"),
    row(11, "kurultai", "Kurultai", "fix: fixture pull request two", 30, "approved"),
    row(7, "argus", "Argus", "docs: fixture pull request three", 80, "open"),
    row(4, "dayflow-linux", "Dayflow", "chore: fixture pull request four", 200, "draft", true),
  ];
  await page.route("**/api/github/pulls", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ pulls, updated: FIXED_NOW }) }),
  );
}
