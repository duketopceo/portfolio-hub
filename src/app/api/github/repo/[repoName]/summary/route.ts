import { NextResponse } from "next/server";
import {
  fetchRepoSummaryPayload,
  isCuratedRepoName,
} from "@/lib/github-repo-api";
import {
  curatedSummaryFallback,
  hasGithubToken,
  isCatalogPrivateRepo,
  mapGithubSummaryStatus,
  type GithubSummaryOutcome,
} from "@/lib/github-summary-status";

export const revalidate = 180;

/** Dynamic-param routes get no Cache-Control from `revalidate`, so say it here. */
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=180, stale-while-revalidate=600",
};

function githubOutcomeFromFetch(
  result: Awaited<ReturnType<typeof fetchRepoSummaryPayload>>
): GithubSummaryOutcome {
  if (result.ok) return { type: "ok" };
  if (result.timeout) return { type: "timeout" };
  return { type: "http", status: result.status };
}

/** Malformed percent-encoding (e.g. "%E0%A4%A") must be a 404, not a 500. */
function safeDecode(raw: string): string | null {
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ repoName: string }> }
) {
  const { repoName: raw } = await context.params;
  const repoName = safeDecode(raw);
  if (repoName === null || !isCuratedRepoName(repoName)) {
    return NextResponse.json({ error: "Unknown repo" }, { status: 404 });
  }

  const catalogPrivate = isCatalogPrivateRepo(repoName);
  let github: GithubSummaryOutcome;
  let fetched: Awaited<ReturnType<typeof fetchRepoSummaryPayload>> | null =
    null;

  if (catalogPrivate) {
    github = { type: "skipped" };
  } else if (!hasGithubToken()) {
    github = { type: "missing-token" };
  } else {
    try {
      fetched = await fetchRepoSummaryPayload(repoName);
      github = githubOutcomeFromFetch(fetched);
    } catch (e) {
      console.error("[api/github/repo/summary]", repoName, e);
      return NextResponse.json(
        { error: "GitHub unavailable", repo: repoName },
        { status: 502 }
      );
    }
  }

  const mapped = mapGithubSummaryStatus({
    curated: true,
    catalogPrivate,
    github,
  });
  if (mapped.httpStatus === 502) {
    return NextResponse.json(
      { error: "GitHub unavailable", repo: repoName },
      { status: 502 }
    );
  }
  if (mapped.bodyKind === "full" && fetched?.ok) {
    return NextResponse.json(fetched.payload, { headers: CACHE_HEADERS });
  }
  return NextResponse.json(curatedSummaryFallback(repoName), {
    status: mapped.httpStatus,
    ...(mapped.httpStatus === 200 ? { headers: CACHE_HEADERS } : {}),
  });
}
