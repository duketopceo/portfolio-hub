import { projects } from "@/data/resume";
import { projectConfigs } from "@/data/projects";
import { orderByRank, rankProjects } from "@/lib/ranking";

/**
 * Résumé projects in ranking order (KTD2). Entries keep their authored
 * prose; each sorts by the best rank among the projects it covers.
 */
export function rankedResumeProjects(): typeof projects {
  return orderByRank(projects, (p) => p.slugs, rankProjects(projectConfigs));
}
