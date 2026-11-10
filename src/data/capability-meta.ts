/**
 * Capability groups (KD2): what the work is for, in the terms AI-native teams
 * hire for. Client-safe: no catalog import. Order here is the order of the
 * sphere's sectors and legend.
 */
export const CAPABILITY_IDS = [
  "evals-routing",
  "retrieval-memory",
  "agents-computer-use",
  "products",
  "tooling-infra",
] as const;

export type CapabilityId = (typeof CAPABILITY_IDS)[number];

export interface CapabilityMeta {
  label: string;
  description: string;
  /** One of the COSMOS_PALETTE values (src/lib/palette.ts); a test enforces it. */
  color: string;
}

export const capabilityMeta: Record<CapabilityId, CapabilityMeta> = {
  "evals-routing": {
    label: "Evals & routing",
    description: "Measuring models on cost and quality, and routing work to the right one",
    color: "#2DD4BF",
  },
  "retrieval-memory": {
    label: "Retrieval & memory",
    description: "Search, ranking and context for agents that remember",
    color: "#A78BFA",
  },
  "agents-computer-use": {
    label: "Agents & computer use",
    description: "Agent runtimes, harnesses and tools that act on a computer",
    color: "#FF5C1A",
  },
  products: {
    label: "Products",
    description: "Shipped applications and platforms",
    color: "#E9ECEF",
  },
  "tooling-infra": {
    label: "Tooling & infra",
    description: "Developer tools, desktop plugins, hardware and infrastructure",
    color: "#9AA3AC",
  },
};

export function isCapabilityId(value: string | null | undefined): value is CapabilityId {
  return !!value && (CAPABILITY_IDS as readonly string[]).includes(value);
}

/** The capability meta for a project, when it has one. */
export function capabilityOf(p: { capability?: string | null }): CapabilityMeta | undefined {
  return isCapabilityId(p.capability) ? capabilityMeta[p.capability] : undefined;
}
