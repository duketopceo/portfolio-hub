import type { EnrichedProject } from "@/lib/types";
import { mediaAsset } from "@/lib/types";

/**
 * Gravity-map taxonomy for the orbital hub.
 *
 * The catalog's `category` field collapses into two catch-alls (ai/apps), and
 * its `HOMEPAGE_FEATURED_SLUGS` mixes shipped products with libraries. This
 * module is the display taxonomy for the gravity map: six named centres with a
 * floor of four members each, plus a separate finished-products tier.
 *
 * Membership is an explicit slug -> centre map so a repo's home is a deliberate
 * decision, not a side effect of its `category` string. An unmapped repo is
 * reported by `taxonomyGaps()` instead of being folded into a catch-all.
 *
 * Six centres, not ten: only 33 entries are *listed* — components (parentSlug)
 * and "earlier work" (era) are excluded site-wide, and 28 categorised repos
 * cannot support ten fields of four.
 */

export interface GravityCentre {
  key: string;
  label: string;
  /**
   * Relative luminance, 0..1. The map is a hard black-and-white contract: hue
   * never carries meaning, so this single channel is all a field may vary on.
   */
  tone: number;
  blurb: string;
}

/** No named centre may hold fewer than this — smaller is not a family. */
export const MIN_CENTRE_SIZE = 4;

export const GRAVITY_CENTRES: readonly GravityCentre[] = [
  {
    key: "agents",
    label: "Agent Systems",
    tone: 0.96,
    blurb: "Harnesses, orchestration, shared memory",
  },
  {
    key: "models",
    label: "Models & Evals",
    tone: 0.84,
    blurb: "Routing, benchmarks, spend",
  },
  {
    key: "interfaces",
    label: "Computer & Voice",
    tone: 0.74,
    blurb: "Screen control, speech, input",
  },
  {
    key: "ios",
    label: "iOS & Mobile",
    tone: 0.64,
    blurb: "Native Swift clients",
  },
  {
    key: "desktop",
    label: "Desktop & Web",
    tone: 0.54,
    blurb: "Omarchy surfaces, journals, sites",
  },
  {
    key: "infra",
    label: "Infrastructure & Data",
    tone: 0.44,
    blurb: "Homelab, permits, datasets",
  },
] as const;

/**
 * Finished products — the tier above the categories.
 *
 * A hero is a shipped, substantial thing, not the best repo in a bucket. Each
 * carries a one-line "why this matters"; it is the only copy the hover card
 * leads with, so it must name a concrete outcome.
 */
export const FINISHED_PRODUCTS: Readonly<Record<string, string>> = {
  "pace-server": "One login, one bill, AI built in — the private cloud for small businesses",
  wordink: "Speech-to-text dictation on Groq, a Wispr Flow alternative",
  "reactor-sim": "Deterministic PWR plant simulator with a walkable Unity control room",
  tallyline: "Self-hostable issue tracker where humans and agents share one board",
  kurultai: "Unified knowledge retrieval for agents and humans, in Rust",
};

/**
 * Card images shipped in `public/media/gravity/`.
 *
 * - `poster` backfills a release video that has no poster in the catalog; without
 *   one the card shows black until the first frame decodes.
 * - `still` is for projects with a shipped render but no recorded video at all
 *   (reactor-sim today).
 *
 * Both are keyed by slug so a repo never has to carry a path in its copy.
 */
export const CARD_POSTERS: Readonly<Record<string, string>> = {
  "dayflow-linux": "/media/gravity/dayflow-launch.jpg",
  kate: "/media/gravity/kate-launch.jpg",
  kurultai: "/media/gravity/kurultai-launch.jpg",
  "openrouter-demos": "/media/gravity/openrouter-demos-walkthrough.jpg",
};

export const CARD_STILLS: Readonly<Record<string, string>> = {
  "reactor-sim": "/media/gravity/reactor-sim.jpg",
};

/** slug -> centre key. Heroes are mapped too, then removed from their field. */
export const REPO_CENTRE: Readonly<Record<string, string>> = {
  // — agent systems: harnesses, plugins, orchestration, shared memory
  "agent-zero-plugins": "agents",
  agentflow: "agents",
  "jev-compact": "agents",
  khan: "agents",
  "luke-agents": "agents",
  omaseal: "agents",
  // kurultai is a finished product, but mapped so it is never "unmapped"
  kurultai: "agents",

  // — models & evals: routing, benchmarking, spend, and the vision tester
  orchestral: "models",
  "openrouter-demos": "models",
  "openrouter-usage": "models",
  argus: "models",

  // — computer & voice: screen control, speech, physical input
  "open-computer": "interfaces",
  wisp: "interfaces",
  dixi: "interfaces",
  "helm-qmk-macropad": "interfaces",

  // — iOS & mobile: native Swift clients
  cairn: "ios",
  kate: "ios",
  "harbor-openrouter-ios-client": "ios",
  "scooter-ios": "ios",

  // — desktop & web: Omarchy surfaces, journals, and sites
  "dayflow-linux": "desktop",
  snapdex: "desktop",
  "rts-skyrim": "desktop",
  "personal-blog": "desktop",
  "portfolio-hub": "desktop",
  "omarchy-plugins": "desktop",

  // — infrastructure & data: homelab, vertical back-ends, datasets
  homelab: "infra",
  "bartlett-permits": "infra",
  "military-hardware-db": "infra",
  "pinetree-solari-demo": "infra",

  // — finished products (mapped so the one-home check passes; removed from
  //   their field before the map is built, see buildGravityMap)
  "pace-server": "infra",
  wordink: "desktop",
  "reactor-sim": "desktop",
  tallyline: "agents",
};

/** A repo as the map needs it — no repo identifiers, so private entries are safe. */
export interface MapRepo {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  type: string;
  private: boolean;
  featured: boolean;
  tech: string[];
  /** One-line "why this matters", heroes only. */
  why?: string;
  isHero?: boolean;
  /** Card media. A still is used when there is no release video. */
  video?: string;
  poster?: string;
  still?: string;
  /** Public outbound link, or null when the entry is private. */
  href: string | null;
}

export interface GravityField {
  key: string;
  label: string;
  /** Luminance 0..1 — see GravityCentre.tone. */
  tone: number;
  blurb: string;
  count: number;
  repoCount: number;
}

export interface GravityMapData {
  heroes: MapRepo[];
  centres: GravityField[];
  /** slug -> repos, in the order they should be drawn. */
  fields: Record<string, MapRepo[]>;
  total: number;
  privateTotal: number;
}

const TYPE_RANK: Record<string, number> = {
  platform: 0,
  app: 1,
  library: 2,
  experiment: 3,
};

function toMapRepo(project: EnrichedProject): MapRepo {
  const video = mediaAsset(project.media?.release);
  return {
    slug: project.slug,
    name: project.displayName,
    tagline: project.tagline,
    description: project.description,
    type: project.type,
    private: project.private,
    featured: project.featured,
    tech: project.techStack.slice(0, 4),
    video: video?.url,
    // catalog poster wins; the shipped frame is a fallback, not an override
    poster: video?.poster ?? CARD_POSTERS[project.slug],
    still: video ? undefined : CARD_STILLS[project.slug],
    // Private entries never expose a link, matching toClientProject/server rules.
    href: project.private ? null : `/projects/${project.slug}`,
  };
}

/**
 * Build the gravity map from enriched projects.
 *
 * - Heroes are pulled out of their category entirely so nothing is counted
 *   twice, and so a finished product is not shown as a category's child.
 * - Every centre is sorted featured-first, then public-before-private, then
 *   by kind, so the inner ring of each field holds what matters most.
 */
export function buildGravityMap(
  projects: readonly EnrichedProject[],
): GravityMapData {
  const bySlug = new Map(projects.map((p) => [p.slug, p]));

  const heroes: MapRepo[] = [];
  for (const [slug, why] of Object.entries(FINISHED_PRODUCTS)) {
    const project = bySlug.get(slug);
    if (!project) continue;
    heroes.push({ ...toMapRepo(project), why, isHero: true });
  }
  heroes.sort((a, b) => Number(a.private) - Number(b.private));

  const fields: Record<string, MapRepo[]> = {};
  for (const centre of GRAVITY_CENTRES) fields[centre.key] = [];

  for (const project of projects) {
    if (FINISHED_PRODUCTS[project.slug]) continue;
    const key = REPO_CENTRE[project.slug];
    if (!key || !(key in fields)) {
      // A repo with no home would silently inflate a catch-all; surface it
      // instead. taxonomyGaps() reports the same condition to the caller.
      continue;
    }
    fields[key].push(toMapRepo(project));
  }

  for (const list of Object.values(fields)) {
    list.sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        Number(a.private) - Number(b.private) ||
        (TYPE_RANK[a.type] ?? 9) - (TYPE_RANK[b.type] ?? 9) ||
        a.name.localeCompare(b.name),
    );
  }

  const centres: GravityField[] = GRAVITY_CENTRES.map((centre) => {
    const repos = fields[centre.key] ?? [];
    return {
      key: centre.key,
      label: centre.label,
      tone: centre.tone,
      blurb: centre.blurb,
      count: repos.length,
      repoCount: repos.length,
    };
  }).sort((a, b) => b.count - a.count);

  return {
    heroes,
    centres,
    fields,
    total: heroes.length + centres.reduce((n, c) => n + c.count, 0),
    privateTotal:
      heroes.filter((h) => h.private).length +
      Object.values(fields).reduce(
        (n, list) => n + list.filter((r) => r.private).length,
        0,
      ),
  };
}

/**
 * Slug assignments that cannot be satisfied from a project list — an unmapped
 * repo, a hero whose slug is not in the catalog, or a centre below the floor.
 * Returns an empty array when the taxonomy is consistent.
 */
export function taxonomyGaps(
  projects: readonly EnrichedProject[],
): string[] {
  const gaps: string[] = [];
  const slugs = new Set(projects.map((p) => p.slug));

  for (const project of projects) {
    if (FINISHED_PRODUCTS[project.slug]) continue;
    if (!REPO_CENTRE[project.slug]) {
      gaps.push(`${project.slug} has no centre`);
    }
  }

  for (const slug of Object.keys(FINISHED_PRODUCTS)) {
    if (!slugs.has(slug)) gaps.push(`hero ${slug} is not in the catalog`);
  }

  const map = buildGravityMap(projects);
  for (const centre of map.centres) {
    if (centre.count < MIN_CENTRE_SIZE) {
      gaps.push(`${centre.label} has ${centre.count} repos (< ${MIN_CENTRE_SIZE})`);
    }
  }
  return gaps;
}
