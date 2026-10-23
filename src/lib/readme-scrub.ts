const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
const PUBLIC_CONTACT = "hello@luke-the-duke.com";

/**
 * Replaces email addresses in README markdown/HTML with plain text, keeping
 * only the site's public contact address. Also drops mailto: anchors so no
 * dead links are left behind.
 */
export function scrubEmails(source: string): string {
  const withoutMailto = source.replace(
    /<a\b[^>]*href\s*=\s*["']mailto:[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi,
    (anchor, inner: string) =>
      anchor.toLowerCase().includes(PUBLIC_CONTACT) ? anchor : inner
  );
  return withoutMailto.replace(EMAIL_PATTERN, (match) =>
    match.toLowerCase() === PUBLIC_CONTACT ? match : "[email removed]"
  );
}
