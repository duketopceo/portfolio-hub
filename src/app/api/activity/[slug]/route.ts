import { NextResponse } from "next/server";
import { getAllSlugs } from "@/lib/github";
import { getProjectActivityTimeline } from "@/lib/github-activity";

export const revalidate = 3600;

/** Dynamic-param routes get no Cache-Control from `revalidate`, so say it here. */
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  if (!getAllSlugs().includes(slug)) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  try {
    const data = await getProjectActivityTimeline(slug);
    return NextResponse.json(data, { headers: CACHE_HEADERS });
  } catch (err) {
    console.error(`[api/activity/${slug}] failed:`, err);
    return NextResponse.json({
      slug,
      displayName: slug,
      private: false,
      headline: "Activity unavailable",
      items: [],
      days: [],
      fetchedAt: new Date().toISOString(),
      source: "empty",
    });
  }
}
