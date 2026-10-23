import { ProjectConfig } from "@/lib/types";
import { catalogEntries } from "./catalog";
import { catalogEntrySchema } from "./catalog/schema";
import { DEFAULT_REPO_OWNER } from "./private-denylist";

export const MEDIA_BASE_URL = "https://media.luke-the-duke.com/demos";

export const OPENROUTER_DEMO_VIDEO_URL = `${MEDIA_BASE_URL}/openrouter-demos-walkthrough.mp4`;

/**
 * Master project configuration — curated for recruiter/professional viewing.
 * SECURITY: No personal emails, no GitHub usernames, no internal details.
 *
 * Loaded from `src/data/catalog/<slug>.json` (validated by zod, ordered by
 * `order`). `curated` is human-owned, `github` is bot-owned (KTD1).
 */
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
