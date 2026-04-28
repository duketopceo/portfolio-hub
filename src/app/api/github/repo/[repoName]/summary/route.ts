import { NextResponse } from "next/server";
import {
  fetchRepoSummaryPayload,
  isCuratedRepoName,
} from "@/lib/github-repo-api";

export const revalidate = 180;

export async function GET(
  _request: Request,
  context: { params: Promise<{ repoName: string }> }
) {
  const { repoName: raw } = await context.params;
  const repoName = decodeURIComponent(raw);
  if (!isCuratedRepoName(repoName)) {
    return NextResponse.json({ error: "Unknown repo" }, { status: 404 });
  }
  try {
    const payload = await fetchRepoSummaryPayload(repoName);
    return NextResponse.json(payload);
  } catch (e) {
    console.error("[api/github/repo/summary]", repoName, e);
    return NextResponse.json(
      { error: "GitHub unavailable", repo: repoName },
      { status: 502 }
    );
  }
}
