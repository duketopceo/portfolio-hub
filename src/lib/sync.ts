import { z } from "zod";
import { catalogEntrySchema, type CatalogEntry } from "../data/catalog/schema";
import { CURATION_BAR, scoreRepo, summarizeCatalog, type CurationGithub } from "./curation";

/**
 * Pure logic behind scripts/sync-catalog.mjs (KTD6). The sync proposes; it
 * never decides. It sees PUBLIC repositories only, rewrites only `github`
 * fields of existing non-private entries, and reports everything else as
 * proposals. Imports are relative and extensionless-safe so the script can
 * load this file directly under Node's type stripping.
 */

export const REPOS_QUERY = /* GraphQL */ `
  query CatalogSync($owner: String!, $cursor: String, $pageSize: Int!) {
    repositoryOwner(login: $owner) {
      repositories(
        first: $pageSize
        after: $cursor
        privacy: PUBLIC
        ownerAffiliations: OWNER
        orderBy: { field: NAME, direction: ASC }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          name
          description
          homepageUrl
          isFork
          isArchived
          isPrivate
          owner {
            login
          }
          repositoryTopics(first: 20) {
            nodes {
              topic {
                name
              }
            }
          }
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 1) {
                  totalCount
                  nodes {
                    committedDate
                  }
                }
              }
            }
          }
          latestRelease {
            tagName
          }
          object(expression: "HEAD:README.md") {
            ... on Blob {
              byteSize
            }
          }
        }
      }
    }
  }
`;

export type RepoNode = {
  id: string;
  name: string;
  description?: string | null;
  homepageUrl?: string | null;
  isFork: boolean;
  isArchived: boolean;
  isPrivate: boolean;
  owner?: { login: string } | null;
  repositoryTopics?: { nodes: ({ topic: { name: string } } | null)[] } | null;
  defaultBranchRef?: {
    target?: { history?: { totalCount: number; nodes: ({ committedDate: string } | null)[] } } | null;
  } | null;
  latestRelease?: { tagName: string } | null;
  object?: { byteSize?: number } | null;
};

/** Thrown when the response contains a non-public node. The message never names a repository. */
export class PrivateNodeError extends Error {
  constructor() {
    super("aborted: the response contained a non-public repository; nothing was written");
    this.name = "PrivateNodeError";
  }
}

export function assertAllPublic(nodes: readonly RepoNode[]): void {
  if (nodes.some((n) => n.isPrivate !== false)) throw new PrivateNodeError();
}

type FetchFn = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

/** Fetch every public repo node for `owner`, following pagination. The token is never logged. */
export async function fetchRepoNodes(opts: {
  token: string;
  owner: string;
  pageSize?: number;
  fetchFn?: FetchFn;
}): Promise<RepoNode[]> {
  const fetchFn = opts.fetchFn ?? (fetch as unknown as FetchFn);
  const nodes: RepoNode[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 50; page += 1) {
    const res = await fetchFn("https://api.github.com/graphql", {
      method: "POST",
      headers: { authorization: `bearer ${opts.token}`, "content-type": "application/json" },
      body: JSON.stringify({ query: REPOS_QUERY, variables: { owner: opts.owner, cursor, pageSize: opts.pageSize ?? 25 } }),
    });
    if (!res.ok) throw new Error(`GitHub GraphQL request failed (HTTP ${res.status})`);
    const body = (await res.json()) as {
      errors?: unknown[];
      data?: {
        repositoryOwner?: {
          repositories: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: RepoNode[] };
        } | null;
      };
    };
    if (body.errors?.length) throw new Error("GitHub GraphQL returned errors");
    const repos = body.data?.repositoryOwner?.repositories;
    if (!repos) throw new Error("GitHub GraphQL returned no repository owner");
    nodes.push(...repos.nodes);
    if (!repos.pageInfo.hasNextPage) return nodes;
    cursor = repos.pageInfo.endCursor;
  }
  throw new Error("GitHub GraphQL pagination did not finish");
}

export type GithubFacts = CatalogEntry["github"];

/** Map a GraphQL node to the schema's `github` shape. Fast-changing values are not kept. */
export function nodeToGithub(node: RepoNode, fallbackOwner: string): GithubFacts {
  const history = node.defaultBranchRef?.target?.history;
  const committed = history?.nodes?.[0]?.committedDate ?? null;
  const topics = (node.repositoryTopics?.nodes ?? [])
    .map((t) => t?.topic.name)
    .filter((t): t is string => Boolean(t))
    .sort();
  return {
    repoName: node.name,
    owner: node.owner?.login ?? fallbackOwner,
    node_id: node.id,
    description: node.description || null,
    topics,
    homepage: node.homepageUrl || null,
    isFork: node.isFork,
    isArchived: node.isArchived,
    readmeLength: node.object?.byteSize ?? 0,
    commitCount: history?.totalCount ?? 0,
    lastCommitMonth: committed ? committed.slice(0, 7) : null,
    latestRelease: node.latestRelease?.tagName ?? null,
  };
}

const GITHUB_KEYS = [
  "repoName",
  "owner",
  "node_id",
  "description",
  "topics",
  "homepage",
  "isFork",
  "isArchived",
  "readmeLength",
  "commitCount",
  "lastCommitMonth",
  "latestRelease",
] as const;

function sameGithub(a: GithubFacts, b: GithubFacts): boolean {
  return GITHUB_KEYS.every((k) => JSON.stringify(a[k] ?? null) === JSON.stringify(b[k] ?? null));
}

export const proposalsSchema = z.strictObject({
  newCandidates: z.array(
    z.strictObject({
      repoName: z.string(),
      node_id: z.string(),
      description: z.string().nullable(),
      homepage: z.string().nullable(),
      lastCommitMonth: z.string().nullable(),
    }),
  ),
  demotions: z.array(z.strictObject({ slug: z.string(), reasons: z.array(z.string()) })),
  archived: z.array(z.strictObject({ slug: z.string(), era: z.literal("earlier") })),
  renamed: z.array(z.strictObject({ slug: z.string(), from: z.string(), to: z.string() })),
  nowFork: z.array(z.string()),
  stale: z.array(z.string()),
  privateNameMatches: z.array(z.string()),
  rangeWarning: z.string().nullable(),
});

export type Proposals = z.infer<typeof proposalsSchema>;

export type SyncResult = {
  /** New `github` object per slug, only for entries whose facts changed. */
  updates: Record<string, GithubFacts>;
  proposals: Proposals;
};

const byText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Compute the sync. Throws PrivateNodeError before doing anything else if any
 * node is non-public. Entries with `curated.private` are never read for
 * updates; they only take part in the name-match report and the range count.
 */
export function computeSync(input: {
  nodes: readonly RepoNode[];
  entries: readonly CatalogEntry[];
  now: Date;
  owner?: string;
}): SyncResult {
  assertAllPublic(input.nodes);
  const owner = input.owner ?? "duketopceo";
  const nodes = [...input.nodes].sort((a, b) => byText(a.name, b.name));
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const byName = new Map(nodes.map((n) => [n.name, n]));

  const privateEntries = input.entries.filter((e) => e.curated.private);
  const sharedEntries = input.entries.filter((e) => !e.curated.private && !e.curated.siteOnly);

  // A public repo named like a private entry: slug only, never a listing candidate.
  const privateNameMatches = new Set<string>();
  const privateMatchedIds = new Set<string>();
  for (const e of privateEntries) {
    const node =
      (e.github.node_id ? byId.get(e.github.node_id) : undefined) ?? byName.get(e.github.repoName);
    if (node) {
      privateNameMatches.add(e.slug);
      privateMatchedIds.add(node.id);
    }
  }

  const updates: Record<string, GithubFacts> = {};
  const renamed: Proposals["renamed"] = [];
  const nowFork: string[] = [];
  const stale: string[] = [];
  const archived: Proposals["archived"] = [];
  const matchedIds = new Set<string>();
  const merged = new Map<string, CatalogEntry>(input.entries.map((e) => [e.slug, e]));

  for (const e of sharedEntries) {
    const node = e.github.node_id ? byId.get(e.github.node_id) : byName.get(e.github.repoName);
    if (!node || privateMatchedIds.has(node.id)) {
      stale.push(e.slug);
      continue;
    }
    matchedIds.add(node.id);
    const next = nodeToGithub(node, e.github.owner || owner);
    if (e.github.node_id && e.github.repoName !== node.name) {
      renamed.push({ slug: e.slug, from: e.github.repoName, to: node.name });
    }
    if (node.isFork && e.github.isFork !== true) nowFork.push(e.slug);
    if (node.isArchived && e.curated.era !== "earlier") archived.push({ slug: e.slug, era: "earlier" });
    if (!sameGithub(e.github, next)) {
      updates[e.slug] = next;
      merged.set(e.slug, { ...e, github: next });
    }
  }

  const catalog = [...merged.values()];

  const newCandidates: Proposals["newCandidates"] = [];
  for (const node of nodes) {
    if (matchedIds.has(node.id) || privateMatchedIds.has(node.id)) continue;
    if (sharedEntries.some((e) => e.github.repoName === node.name)) continue;
    const github = nodeToGithub(node, owner);
    if (scoreRepo(github as CurationGithub, catalog, input.now).verdict === "listable") {
      newCandidates.push({
        repoName: node.name,
        node_id: node.id,
        description: github.description ?? null,
        homepage: github.homepage ?? null,
        lastCommitMonth: github.lastCommitMonth ?? null,
      });
    }
  }

  const demotions: Proposals["demotions"] = [];
  const archivedSlugs = new Set(archived.map((a) => a.slug));
  for (const e of sharedEntries) {
    const current = merged.get(e.slug);
    if (!current || stale.includes(e.slug) || archivedSlugs.has(e.slug) || e.curated.era === "earlier") continue;
    const res = scoreRepo(current.github, catalog, input.now);
    if (res.verdict === "below-bar") demotions.push({ slug: e.slug, reasons: res.reasons });
  }

  // R2: only the count of private entries is used; they are hand-listed.
  const summary = summarizeCatalog(
    catalog.filter((e) => !e.curated.private && !e.curated.siteOnly),
    input.now,
  );
  const listed = summary.listable + privateEntries.length;
  const rangeWarning =
    listed < CURATION_BAR.minListed || listed > CURATION_BAR.maxListed
      ? `${listed} listed projects, outside the ${CURATION_BAR.minListed}-${CURATION_BAR.maxListed} target`
      : null;

  const proposals: Proposals = {
    newCandidates: newCandidates.sort((a, b) => byText(a.repoName, b.repoName)),
    demotions: demotions.sort((a, b) => byText(a.slug, b.slug)),
    archived: archived.sort((a, b) => byText(a.slug, b.slug)),
    renamed: renamed.sort((a, b) => byText(a.slug, b.slug)),
    nowFork: nowFork.sort(byText),
    stale: stale.sort(byText),
    privateNameMatches: [...privateNameMatches].sort(byText),
    rangeWarning,
  };
  proposalsSchema.parse(proposals);
  return { updates, proposals };
}

/** Canonical on-disk form for catalog entries and proposals (2-space JSON, trailing newline). */
export const serialize = (value: unknown): string => JSON.stringify(value, null, 2) + "\n";

/**
 * Re-render an entry file with a new `github` block. `curated` and every
 * other key come from the parsed original untouched; throws if the result
 * fails the catalog schema.
 */
export function renderEntryWithGithub(rawText: string, github: GithubFacts): string {
  const parsed = JSON.parse(rawText) as CatalogEntry;
  const next = { ...parsed, github: Object.fromEntries(GITHUB_KEYS.map((k) => [k, github[k] ?? null])) };
  catalogEntrySchema.parse(next);
  return serialize(next);
}

const ZWSP = "\u200b";

/** One line of repo-sourced text, safe inside a PR body: code-wrapped, no backticks, no live @mentions. */
const inlineCode = (text: string): string =>
  "`" + text.replace(/\s+/g, " ").trim().replace(/`/g, "'").replace(/@/g, "@" + ZWSP) + "`";

/**
 * Markdown PR body for the sync PR (public names only). Every repo-sourced
 * string goes through inlineCode, so the body is safe to pass via body-path.
 */
export function renderSummary(p: Proposals): string {
  const lines: string[] = ["Weekly catalog sync. This PR only proposes; nothing here is listed until you edit `curated`.", ""];
  const section = (title: string, items: string[]) => {
    if (items.length === 0) return;
    lines.push(`### ${title}`, "", ...items.map((i) => `- ${i}`), "");
  };
  if (p.rangeWarning) lines.push(`> Range warning: ${inlineCode(p.rangeWarning)}`, "");
  section(
    "New candidates",
    p.newCandidates.map(
      (c) =>
        `${inlineCode(c.repoName)}${c.description ? " " + inlineCode(c.description) : ""}${c.lastCommitMonth ? ` (last commit ${c.lastCommitMonth})` : ""}`,
    ),
  );
  section("Below the bar", p.demotions.map((d) => `${inlineCode(d.slug)}: ${d.reasons.map(inlineCode).join(", ")}`));
  section("Archived upstream (propose era: earlier)", p.archived.map((a) => inlineCode(a.slug)));
  section("Renamed", p.renamed.map((r) => `${inlineCode(r.slug)}: ${inlineCode(r.from)} to ${inlineCode(r.to)}`));
  section("Now a fork", p.nowFork.map(inlineCode));
  section("No longer public", p.stale.map(inlineCode));
  section("Public repo shares a name with a private entry", p.privateNameMatches.map(inlineCode));
  if (lines.length === 2) lines.push("No proposals this week; only upstream `github` facts changed.", "");
  return lines.join("\n");
}
