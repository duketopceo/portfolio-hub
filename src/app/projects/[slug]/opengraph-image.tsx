import { ImageResponse } from "next/og";
import { getProjectBySlug, getAllSlugs } from "@/lib/github";
import { categoryMeta } from "@/data/projects";

export const alt = "Project dossier";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

/** Per-dossier share card. Only curated catalog copy is used, so private
 *  entries never expose repo names or URLs. */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  const title = project?.displayName ?? "Project";
  const tagline = project?.tagline ?? "";
  const sector = project
    ? (categoryMeta[project.category]?.label ?? project.category)
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0a0d12",
          color: "#e8edf2",
          borderLeft: "12px solid #2dd4bf",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#9aa3ac",
          }}
        >
          {sector ? `${sector} sector` : "Project dossier"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 700 }}>
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              lineHeight: 1.35,
              color: "#9aa3ac",
              maxWidth: 980,
            }}
          >
            {tagline.length > 140 ? `${tagline.slice(0, 137)}...` : tagline}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#2dd4bf" }}>
          Luke Kimball — Cosmic Intelligence
        </div>
      </div>
    ),
    size,
  );
}
