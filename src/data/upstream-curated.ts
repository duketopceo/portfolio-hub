/** Hand-curated non-PR contributions (R14). No GitHub fetch; copy is written here. */
export type UpstreamCuratedType = "issue comment" | "kernel patch";

export interface UpstreamCuratedItem {
  type: UpstreamCuratedType;
  title: string;
  /** Public repo or subsystem the item targets. */
  target: string;
  status: string;
  /** Omitted when there is nothing public to link to. */
  url?: string;
}

export const UPSTREAM_CURATED: readonly UpstreamCuratedItem[] = [
  {
    type: "issue comment",
    title: "Asahi lid-switch binds do not fire on Apple silicon",
    target: "omacom/omarchy #8418",
    status: "posted",
    url: "https://github.com/omacom/omarchy/issues/8418",
  },
  {
    type: "kernel patch",
    title: "Asahi typec identity-pointer fix",
    target: "Linux typec",
    status: "prepared, not yet sent",
  },
];
