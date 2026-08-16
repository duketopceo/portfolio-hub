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

function githubOutcomeFromFetch(
  result: Awaited<ReturnType<typeof fetchRepoSummaryPayload>>
): GithubSummaryOutcome {
  if (result.ok) return { type: "ok" };
  if (result.timeout) return { type: "timeout" };
  return { type: "http", status: result.status };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ repoName: string }> }
) {
  const { repoName: raw } = await context.params;
  const repoName = decodeURIComponent(raw);
  if (!isCuratedRepoName(repoName)) {
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
    return NextResponse.json(fetched.payload);
  }
  return NextResponse.json(curatedSummaryFallback(repoName), {
    status: mapped.httpStatus,
  });
}
