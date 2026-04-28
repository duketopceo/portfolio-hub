import { NextResponse } from "next/server";
import { fetchAllOpenPullsAggregated } from "@/lib/github-repo-api";

export const revalidate = 240;

export async function GET() {
  try {
    const pulls = await fetchAllOpenPullsAggregated();
    return NextResponse.json({
      pulls,
      updated: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[api/github/pulls]", e);
    return NextResponse.json({
      pulls: [] as Awaited<ReturnType<typeof fetchAllOpenPullsAggregated>>,
      updated: new Date().toISOString(),
    });
  }
}
