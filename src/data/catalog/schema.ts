import { z } from "zod";

/**
 * One catalog entry = one JSON file. Ownership is split (KTD1):
 *  - `curated` is human-owned copy and placement; the sync never writes it.
 *  - `github` is bot-owned facts; fields stay absent/null until the sync fills them.
 */

const planetRing = z.strictObject({
  color: z.string().optional(),
  opacity: z.number().optional(),
  tilt: z.number().optional(),
});

const planetMoon = z.strictObject({
  label: z.string(),
  kind: z.enum(["subproject", "live", "stack"]),
  href: z.string().optional(),
});

const planetVisual = z.strictObject({
  size: z.enum(["xs", "sm", "md", "lg", "xl"]).optional(),
  shape: z.enum(["sphere", "hex", "diamond", "cube"]).optional(),
  color: z.string().optional(),
  rings: z.array(planetRing).optional(),
  moons: z.array(planetMoon).optional(),
});

const mediaAsset = z.strictObject({
  url: z.string(),
  poster: z.string().optional(),
  /** Path under the site origin, e.g. /media/captions/<slug>-release.vtt */
  captions: z.string().optional(),
  transcript: z.string(),
});

const mediaSlot = z.union([mediaAsset, z.literal("to-record"), z.literal("n/a")]);

const media = z.strictObject({ release: mediaSlot, demo: mediaSlot });

const showcase = z.strictObject({
  whatItIs: z.string(),
  whoItsFor: z.string(),
  whatLukeBuilt: z.string(),
  stack: z.array(z.string()),
  status: z.string(),
});

export const curatedSchema = z.strictObject({
  displayName: z.string().min(1),
  tagline: z.string(),
  description: z.string(),
  category: z.enum(["finance", "ai", "osint", "infra", "apps", "data"]),
  type: z.enum(["app", "library", "infra", "experiment", "platform"]),
  featured: z.boolean(),
  private: z.boolean(),
  techStack: z.array(z.string()),
  highlights: z.array(z.string()),
  orbitTier: z.enum(["featured", "secondary", "catalog-only"]).optional(),
  planetVisual: planetVisual.optional(),
  liveUrl: z.string().optional(),
  demoUrl: z.string().optional(),
  media,
  showcase: showcase.optional(),
  parentSlug: z.string().optional(),
  era: z.literal("earlier").optional(),
  embeddable: z.boolean().optional(),
  demoOffline: z.boolean().optional(),
  subdomain: z.string().optional(),
  previewImages: z.array(z.string()).optional(),
  architecture: z.string().optional(),
  businessContext: z.string().optional(),
  scopeAndScale: z.string().optional(),
  engineeringDecisions: z.array(z.string()).optional(),
  siteOnly: z.boolean().optional(),
  finishLine: z.string().optional(),
});

export const githubSchema = z.strictObject({
  repoName: z.string().min(1),
  owner: z.string().min(1),
  node_id: z.string().nullish(),
  description: z.string().nullish(),
  topics: z.array(z.string()).nullish(),
  homepage: z.string().nullish(),
  isFork: z.boolean().nullish(),
  isArchived: z.boolean().nullish(),
  readmeLength: z.number().int().nullish(),
  commitCount: z.number().int().nullish(),
  lastCommitMonth: z.string().nullish(),
  latestRelease: z.string().nullish(),
});

export const catalogEntrySchema = z.strictObject({
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  /** Position in the rendered `projectConfigs` array (ascending). */
  order: z.number().int().nonnegative(),
  curated: curatedSchema,
  github: githubSchema,
});

export type CatalogEntry = z.infer<typeof catalogEntrySchema>;
