import { ProjectConfig } from "@/lib/types";
import { catalogEntries } from "./catalog";
import { catalogEntrySchema } from "./catalog/schema";

export const MEDIA_BASE_URL = "https://media.luke-the-duke.com/demos";

export const OPENROUTER_DEMO_VIDEO_URL = `${MEDIA_BASE_URL}/openrouter-demos-walkthrough.mp4`;
export const KURULTAI_LAUNCH_VIDEO_URL = `${MEDIA_BASE_URL}/kurultai-launch.mp4`;
export const DAYFLOW_LAUNCH_VIDEO_URL = `${MEDIA_BASE_URL}/dayflow-launch.mp4`;
export const ORCHESTRAL_LAUNCH_VIDEO_URL = `${MEDIA_BASE_URL}/orchestral-launch.mp4`;
export const ARGUS_WITNESS_VIDEO_URL = `${MEDIA_BASE_URL}/argus-witness.mp4`;
export const PACE_DEBUT_VIDEO_URL = `${MEDIA_BASE_URL}/pace-debut.mp4`;
export const KATE_LAUNCH_VIDEO_URL = `${MEDIA_BASE_URL}/kate-launch.mp4`;

/**
 * Master project configuration — curated for recruiter/professional viewing.
 * SECURITY: No personal emails, no GitHub usernames, no internal details.
 *
 * Loaded from `src/data/catalog/<slug>.json` (validated by zod, ordered by
 * `order`). `curated` is human-owned, `github` is bot-owned (KTD1).
 */
const DEFAULT_REPO_OWNER = "duketopceo";

export const projectConfigs: ProjectConfig[] = catalogEntries
  .map((entry) => catalogEntrySchema.parse(entry))
  .sort((a, b) => a.order - b.order)
  .map(({ slug, curated, github }) => ({
    slug,
    repoName: github.repoName,
    ...(github.owner !== DEFAULT_REPO_OWNER && { repoOwner: github.owner }),
    ...curated,
  }));

// Re-exported for server callers; client components import "@/data/category-meta"
// so the catalog (private repo names) never enters a client bundle.
export { categoryMeta } from "./category-meta";
