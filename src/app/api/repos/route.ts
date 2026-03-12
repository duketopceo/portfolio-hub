import { NextResponse } from "next/server";
import { getEnrichedProjects } from "@/lib/github";

export const revalidate = 3600;

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
        lastUpdated: p.lastUpdated,
        liveUrl: p.liveUrl || null,
        subdomain: p.subdomain || null,
        private: p.private,
      })),
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
