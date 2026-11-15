/**
 * Capability groups (KD2): what the work is for, in the terms AI-native teams
 * hire for. Client-safe: no catalog import. Order here is the order of the
 * sphere's sectors and legend.
 */
export const CAPABILITY_IDS = [
  "evals-routing",
  "retrieval-memory",
  "agents-computer-use",
  "desktop-devtools",
  "platforms-web",
  "mobile-apps",
  "hardware-sim",
] as const;

export type CapabilityId = (typeof CAPABILITY_IDS)[number];

export interface CapabilityMeta {
  label: string;
  /** Short label for phone widths, where the full one would not fit beside its dots. */
  short: string;
  description: string;
  /** One of the COSMOS_PALETTE values (src/lib/palette.ts); a test enforces it. */
  color: string;
}

export const capabilityMeta: Record<CapabilityId, CapabilityMeta> = {
  "evals-routing": {
    label: "Evals & routing",
    short: "Evals",
    description: "Measuring models on cost and quality, and routing work to the right one",
    color: "#FFFFFF",
  },
  "retrieval-memory": {
    label: "Retrieval & memory",
    short: "Memory",
    description: "Search, ranking, context and journals: what an agent can recall",
    color: "#B3B3B3",
  },
  "agents-computer-use": {
    label: "Agents & computer use",
    short: "Agents",
    description: "Agent runtimes, harnesses and tools that act on a computer",
    color: "#FF9F1C",
  },
  "desktop-devtools": {
    label: "Desktop & dev tools",
    short: "Dev tools",
    description: "Linux desktop software, CLIs and standards for building with agents",
    color: "#E8DCC8",
  },
  "platforms-web": {
    label: "Platforms & web",
    short: "Platforms",
    description: "Hosted products, servers and sites that run in production",
    color: "#F5D76E",
  },
  "mobile-apps": {
    label: "Mobile apps",
    short: "Mobile",
    description: "iPhone apps built, signed and shipped from Linux",
    color: "#FF5C1A",
  },
  "hardware-sim": {
    label: "Hardware, sim & infra",
    short: "Hardware",
    description: "Firmware, simulators, installations and the home cluster",
    color: "#A89C8A",
  },
};

export function isCapabilityId(value: string | null | undefined): value is CapabilityId {
  return !!value && (CAPABILITY_IDS as readonly string[]).includes(value);
}

/** The capability meta for a project, when it has one. */
export function capabilityOf(p: { capability?: string | null }): CapabilityMeta | undefined {
  return isCapabilityId(p.capability) ? capabilityMeta[p.capability] : undefined;
}

const FALLBACK_ACCENT = "#FFFFFF";

/** Accent color for a project: its capability color, else the legacy category color. */
export function capabilityAccent(
  p: { capability?: string | null; category: string },
  categoryColors: Record<string, string>
): string {
  return capabilityOf(p)?.color ?? (categoryColors[p.category] || FALLBACK_ACCENT);
}

/** Group label for a project: its capability label, else the legacy category label. */
export function capabilityLabel(
  p: { capability?: string | null; category: string },
  categoryLabel: string | undefined
): string {
  return capabilityOf(p)?.label ?? categoryLabel ?? p.category;
}
