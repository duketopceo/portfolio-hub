import { NextResponse } from "next/server";
import { getProjectActivityTimeline } from "@/lib/github-activity";

export const revalidate = 3600;

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  try {
    const data = await getProjectActivityTimeline(slug);
    return NextResponse.json(data);
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
