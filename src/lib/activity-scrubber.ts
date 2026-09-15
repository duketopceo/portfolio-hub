/**
 * Scrub strings from private-repo GitHub activity before they reach React.
 * Fail closed: if a title still looks sensitive, return the fallback label only.
 */

const EMAIL = /@[\w.-]+\.[a-z]{2,}/i;
const GITHUB_TOKEN =
  /\b(ghp_[A-Za-z0-9]{20,}|gho_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{10,})\b/;
const PHONE =
  /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/;
const COORDINATES =
  /(?:\b-?\d{1,3}\.\d{3,}\s*,\s*-?\d{1,3}\.\d{3,}\b|\b-?\d{1,3}\.\d{3,}\s*°\s*[NSEW]\b)/i;
const BEARER = /Bearer\s+\S+/i;
const SECRET_PATH =
  /(?:^|\s)(?:\/(?:etc|home|Users|var|tmp)|~\/|\.\/)[^\s]*/i;
const ENV_FILE = /\.env(?:\.[\w.-]+)?\b/i;
const BARTLETT = /\bbartlett\b/i;
const INTERNAL_HOST =
  /\b(?:cluster-\d|luke-the-duke\.railway\.internal|[\w.-]+\.internal)\b/i;

const COMBINED =
  /(?:password|secret|token|api[_-]?key|credential|private[_-]?key)\s*[:=]/i;

export function looksLikeSecret(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (EMAIL.test(t)) return true;
  if (GITHUB_TOKEN.test(t)) return true;
  if (BEARER.test(t)) return true;
  if (SECRET_PATH.test(t)) return true;
  if (ENV_FILE.test(t)) return true;
  if (PHONE.test(t)) return true;
  if (COORDINATES.test(t)) return true;
  if (COMBINED.test(t)) return true;
  if (INTERNAL_HOST.test(t)) return true;
  return false;
}

/**
 * Sanitize display text for activity timelines.
 * @param text Raw GitHub title/message
 * @param isPrivate Whether the source repo is private
 * @param fallback e.g. "PR merged", "Release published"
 */
export function scrubActivityText(
  text: string,
  isPrivate: boolean,
  fallback: string
): string {
  if (!isPrivate) {
    return text.trim().slice(0, 140);
  }

  let s = text.trim();
  const patterns = [
    EMAIL,
    GITHUB_TOKEN,
    BEARER,
    SECRET_PATH,
    ENV_FILE,
    PHONE,
    COORDINATES,
    BARTLETT,
    INTERNAL_HOST,
    COMBINED,
  ];
  let redacted = false;

  for (const p of patterns) {
    if (p.test(s)) {
      s = s.replace(p, "");
      redacted = true;
    }
  }

  s = s.replace(/\s{2,}/g, " ").trim();

  if (redacted || looksLikeSecret(s) || s.length < 3) {
    return fallback;
  }

  return s.slice(0, 140);
}

/** Strip merge target / branch refs for private display when they look internal */
export function scrubBranchRef(ref: string, isPrivate: boolean): string | undefined {
  if (!isPrivate) return ref;
  if (looksLikeSecret(ref) || INTERNAL_HOST.test(ref)) return undefined;
  return ref;
}
