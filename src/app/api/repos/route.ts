import { NextResponse } from "next/server";
import { getEnrichedProjects } from "@/lib/github";
import { isProjectLive } from "@/lib/deployments";

export const revalidate = 3600;

const IS_DEV = process.env.NODE_ENV === "development";

function safeApiError(err: unknown): { message: string; detail?: string } {
  if (err instanceof Error) {
    return {
      message: "Failed to fetch projects",
      ...(IS_DEV && { detail: err.message }),
    };
  }
  return { message: "Failed to fetch projects" };
}

/**
 * Public API endpoint for project data.
 * SECURITY: Strips sensitive fields — no repo URLs, no private flags, no owner info.
 */
export async function GET() {
  try {
    const projects = await getEnrichedProjects();
    return NextResponse.json({
      count: projects.length,
      updated: new Date().toISOString(),
      projects: projects.map((p) => ({
        slug: p.slug,
        name: p.displayName,
        tagline: p.tagline,
        category: p.category,
        type: p.type,
        language: p.language,
        techStack: p.techStack,
        stars: p.stars,
        forks: p.forks,
        openIssues: p.openIssuesCount,
        lastUpdated: p.lastUpdated,
        liveUrl: isProjectLive(p) ? p.liveUrl || p.demoUrl || null : null,
        demoOffline: !!p.demoOffline,
      })),
    });
  } catch (error) {
    const { message, detail } = safeApiError(error);
    console.error("[api/repos] GET failed:", error);
    return NextResponse.json(
      {
        error: message,
        ...(detail && { detail }),
      },
      { status: 500 }
    );
  }
}
