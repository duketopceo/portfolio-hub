/**
 * Outbound links that must never ship as clickable hrefs on the public site.
 *
 * README HTML is fetched from GitHub at render time, so these links arrive
 * from upstream text we do not own. The README pipeline calls
 * `isUnpublishableLink` and drops the href (the text stays, inert).
 */

/** Exact URLs verified dead on 2026-11-10 (404 / 530), normalised without a trailing slash. */
const DEAD_OUTBOUND_URLS: readonly string[] = [
  // Plugin mirrors that are private or no longer exist on GitHub (404).
  "https://github.com/duketopceo/omarchy-hotkey-tally",
  "https://github.com/duketopceo/omarchy-lidguard",
  "https://github.com/duketopceo/omarchy-notch",
  "https://github.com/duketopceo/omarchy-wordink",
  // Path missing on the branch the README links to (404).
  "https://github.com/duketopceo/pace-gallery/blob/feat/component-card-gallery/vendor/threeui/README.md",
  // Origin offline (Cloudflare 530); the legacy Swarm deployment is retired.
  "https://omhdb.luke-the-duke.com",
  "https://omhdb.luke-the-duke.com/#",
  "https://omhdb.luke-the-duke.com/#/",
];

const DEAD = new Set(DEAD_OUTBOUND_URLS.map(normalise));

function normalise(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/** localhost, loopback, RFC 1918, link-local and `.local` hosts: meaningless to a visitor. */
export function isLocalOnlyUrl(url: string): boolean {
  let host: string;
  try {
    host = new URL(url.trim()).hostname.toLowerCase();
  } catch {
    return false;
  }
  host = host.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    return true;
  }
  if (host === "::1" || host === "0.0.0.0") return true;
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (!m) return false;
  const a = Number(m[1]);
  const b = Number(m[2]);
  return (
    a === 127 ||
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  );
}

export function isUnpublishableLink(url: string): boolean {
  return isLocalOnlyUrl(url) || DEAD.has(normalise(url));
}
