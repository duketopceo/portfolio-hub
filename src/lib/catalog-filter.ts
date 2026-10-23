/** Pure predicate (no data import, safe in client bundles): a listed entry is
 *  neither a component of another entry nor earlier work. */
export function isListedProject(p: {
  parentSlug?: string;
  era?: "earlier";
}): boolean {
  return !p.parentSlug && p.era !== "earlier";
}
