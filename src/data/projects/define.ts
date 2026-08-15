import type { ProjectConfig } from "@/lib/types";

type RequiredProjectField =
  | "slug"
  | "repoName"
  | "displayName"
  | "tagline"
  | "description"
  | "category"
  | "type"
  | "techStack";

export type ProjectTier = NonNullable<ProjectConfig["tier"]>;
export type ProjectStatus = NonNullable<ProjectConfig["status"]>;
export type ProjectDefinition = Pick<ProjectConfig, RequiredProjectField> &
  Partial<Omit<ProjectConfig, RequiredProjectField>>;

/**
 * Define one portfolio entry while keeping catalog files small and consistent.
 * Public is the safe default; private projects must opt in explicitly.
 */
export function defineProject(config: ProjectDefinition): ProjectConfig {
  return {
    featured: false,
    private: false,
    highlights: [],
    status: "active",
    tier: "supporting",
    ...config,
  };
}
