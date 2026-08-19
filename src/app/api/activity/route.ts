import { NextResponse } from "next/server";
import { getHomepageActivityShowcase } from "@/lib/github-activity";

export const revalidate = 3600;

/** Homepage activity highlights (last 7 days, featured projects). */
export async function GET() {
  try {
    const data = await getHomepageActivityShowcase();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/activity] failed:", err);
    return NextResponse.json({
      lines: [],
      fetchedAt: new Date().toISOString(),
      source: "empty",
    });
  }
}
