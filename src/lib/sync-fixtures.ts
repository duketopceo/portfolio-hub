import type { CatalogEntry } from "../data/catalog/schema";
import type { RepoNode } from "./sync";

/** Fixed clock so recency checks are deterministic. */
export const NOW = new Date("2026-10-21T00:00:00Z");

/** A GraphQL node above the curation bar unless overridden. */
export function makeNode(name: string, over: Partial<RepoNode> = {}): RepoNode {
  return {
    id: `node-${name}`,
    name,
    description: `${name} description`,
    homepageUrl: null,
    isFork: false,
    isArchived: false,
    isPrivate: false,
    owner: { login: "duketopceo" },
    repositoryTopics: { nodes: [{ topic: { name: "zeta" } }, { topic: { name: "alpha" } }] },
    defaultBranchRef: {
      target: { history: { totalCount: 40, nodes: [{ committedDate: "2026-10-02T10:00:00Z" }] } },
    },
    latestRelease: null,
    object: { byteSize: 2500 },
    ...over,
  };
}

/** A catalog entry whose github block already matches `makeNode(name)`. */
export function makeEntry(
  slug: string,
  opts: {
    repoName?: string;
    private?: boolean;
    nodeId?: string | null;
    github?: Partial<CatalogEntry["github"]>;
    curated?: Partial<CatalogEntry["curated"]>;
  } = {},
): CatalogEntry {
  const repoName = opts.repoName ?? slug;
  return {
    slug,
    order: 0,
    curated: {
      displayName: slug,
      tagline: "Hand written tagline",
      description: "Hand written description.\nSecond line.",
      category: "apps",
      type: "app",
      featured: false,
      private: opts.private ?? false,
      techStack: ["TypeScript"],
      highlights: ["one", "two"],
      media: { release: "to-record", demo: "n/a" },
      ...opts.curated,
    },
    github: {
      repoName,
      owner: "duketopceo",
      node_id: opts.nodeId === undefined ? `node-${repoName}` : opts.nodeId,
      description: `${repoName} description`,
      topics: ["alpha", "zeta"],
      homepage: null,
      isFork: false,
      isArchived: false,
      readmeLength: 2500,
      commitCount: 40,
      lastCommitMonth: "2026-10",
      latestRelease: null,
      ...opts.github,
    },
  };
}
