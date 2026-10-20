/**
 * Retired project slugs. Every slug that has ever had a dossier on `main`
 * keeps resolving, in one hop (KTD3). `src/lib/catalog.test.ts` checks that
 * each `from` is no longer a listed slug and each `to` resolves.
 *
 * - merged component  -> `/projects/<parent>`
 * - removed entry     -> `/projects`
 * - earlier work      -> `/projects#earlier-work`
 */
export interface RetiredSlug {
  from: string;
  to: string;
  reason: "merged" | "removed" | "earlier" | "duplicate";
}

export const retiredSlugs: RetiredSlug[] = [];

/** Next.js `redirects()` entries for the retired slugs (308). */
export function retiredSlugRedirects(
  list: RetiredSlug[] = retiredSlugs
): Array<{ source: string; destination: string; permanent: true }> {
  return list.map((r) => ({
    source: `/projects/${r.from}`,
    destination: r.to,
    permanent: true as const,
  }));
}
