import { isCapabilityId } from "@/data/capability-meta";
import type { SphereProject } from "@/components/sphere/ProjectSphere";
import { DEFAULT_PIN_COUNT } from "@/lib/ranking-core";

/**
 * The sphere's props from a ranked project list: slug, name, capability and
 * rank only, so no repo identifier or private field reaches the client.
 */
export function toSphereProjects(
  ranked: readonly { slug: string; displayName: string; capability?: string }[]
): SphereProject[] {
  const out: SphereProject[] = [];
  ranked.forEach((p, rank) => {
    if (!isCapabilityId(p.capability)) return;
    out.push({
      slug: p.slug,
      name: p.displayName,
      capability: p.capability,
      rank,
      lead: rank < DEFAULT_PIN_COUNT,
    });
  });
  return out;
}
