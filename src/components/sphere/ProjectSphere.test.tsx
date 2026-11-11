import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CAPABILITY_IDS, capabilityMeta } from "@/data/capability-meta";
import { projectConfigs } from "@/data/projects";
import { rankProjects } from "@/lib/ranking";
import { toSphereProjects } from "@/lib/sphere-projects";
import ProjectSphere from "./ProjectSphere";

const projects = toSphereProjects(rankProjects(projectConfigs));

describe("ProjectSphere markup", () => {
  it("links every project's dot and list entry to its dossier", () => {
    for (const variant of ["full", "compact"] as const) {
      const html = renderToStaticMarkup(<ProjectSphere projects={projects} variant={variant} />);
      for (const p of projects) {
        const links = html.split(`href="/projects/${p.slug}"`).length - 1;
        expect(links, `${variant} ${p.slug}`).toBe(2);
        expect(html).toContain(`aria-label="${p.name.replace(/&/g, "&amp;")}, ${capabilityMeta[p.capability].label.replace(/&/g, "&amp;")}"`);
      }
    }
  });

  it("renders the five-group legend with counts", () => {
    const html = renderToStaticMarkup(<ProjectSphere projects={projects} />);
    for (const id of CAPABILITY_IDS) {
      expect(html).toContain(capabilityMeta[id].label.replace(/&/g, "&amp;"));
    }
    expect(html.match(/project-sphere__legend-item/g)).toHaveLength(5);
  });

  it("shows the list as a disclosure on the full variant and hides it on the compact one", () => {
    expect(renderToStaticMarkup(<ProjectSphere projects={projects} />)).toContain("<details");
    const compact = renderToStaticMarkup(<ProjectSphere projects={projects} variant="compact" />);
    expect(compact).not.toContain("<details");
    expect(compact).toContain('class="sr-only"');
  });

  it("draws plain SVG: no canvas", () => {
    const html = renderToStaticMarkup(<ProjectSphere projects={projects} />);
    expect(html).toContain("<svg");
    expect(html).not.toContain("<canvas");
  });

  it("carries no repo identifiers in its props", () => {
    expect(Object.keys(projects[0]).sort()).toEqual(["capability", "lead", "name", "rank", "slug"]);
  });
});
