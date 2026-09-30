/**
 * Portfolio Guide corpus manifest — the contract every retrievable source
 * record must satisfy before ingestion (docs/plans/2026-09-14-0229).
 *
 * Two classes only:
 *  - public-source: approved public repos, portfolio data, résumé surfaces
 *  - curated-private: separately authored+approved evidence packages for
 *    private projects. Approval covers the package text ONLY — never the
 *    repository.
 *
 * Validation is dependency-free so the same module runs in the Next build,
 * the corpus generator script, and inside the Worker before retrieval.
 */

export type CorpusClass = "public-source" | "curated-private";

export interface CorpusEntry {
  /** Stable ID — used in citations and Vectorize metadata. */
  sourceId: string;
  /** Owning project slug or résumé section id. */
  scope: string;
  corpusClass: CorpusClass;
  /** Human-readable citation title shown to recruiters. */
  title: string;
  /** Public destination the citation links to. */
  url: string;
  /** Approved text — the only text the model may ground on. */
  text: string;
  /** Where this evidence came from (repo path, dossier section, package file). */
  provenance: string;
  /** curated-private only: who approved the package and when (ISO date). */
  approvedBy?: string;
  approvedAt?: string;
  /** Optional review/expiry date (ISO date). Retrieval must exclude expired. */
  reviewBy?: string;
  /** Revoked entries are excluded from ingestion and retrieval entirely. */
  revoked?: boolean;
}

/** Fields that must never appear in a manifest record — leak guards. */
const FORBIDDEN_KEYS = new Set([
  "email",
  "phone",
  "token",
  "secret",
  "apiKey",
  "env",
  "credentials",
  "rawSource",
  "privateNotes",
]);

const SOURCE_ID_RE = /^[a-z0-9][a-z0-9-]{1,63}$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateEntry(
  entry: CorpusEntry,
  seen: Set<string>,
  today = new Date().toISOString().slice(0, 10),
): string[] {
  const errors: string[] = [];

  if (!SOURCE_ID_RE.test(entry.sourceId))
    errors.push(`${entry.sourceId || "(empty)"}: bad sourceId format`);
  if (seen.has(entry.sourceId))
    errors.push(`${entry.sourceId}: duplicate sourceId`);
  if (!entry.scope) errors.push(`${entry.sourceId}: missing scope`);
  if (!entry.title) errors.push(`${entry.sourceId}: missing title`);
  if (!entry.url) errors.push(`${entry.sourceId}: missing url`);
  if (!entry.text?.trim())
    errors.push(`${entry.sourceId}: empty approved text`);
  if (!entry.provenance)
    errors.push(`${entry.sourceId}: missing provenance`);

  for (const key of Object.keys(entry))
    if (FORBIDDEN_KEYS.has(key))
      errors.push(`${entry.sourceId}: forbidden field "${key}"`);

  if (entry.corpusClass === "curated-private") {
    if (!entry.approvedBy || !entry.approvedAt)
      errors.push(
        `${entry.sourceId}: curated-private requires approvedBy + approvedAt`,
      );
  } else if (entry.corpusClass === "public-source") {
    if (entry.approvedBy || entry.approvedAt)
      errors.push(
        `${entry.sourceId}: public-source must not carry approval metadata`,
      );
  } else {
    errors.push(`${entry.sourceId}: unknown corpusClass`);
  }

  if (entry.approvedAt && !ISO_DATE_RE.test(entry.approvedAt))
    errors.push(`${entry.sourceId}: approvedAt must be ISO date`);
  if (entry.reviewBy && !ISO_DATE_RE.test(entry.reviewBy))
    errors.push(`${entry.sourceId}: reviewBy must be ISO date`);
  if (entry.reviewBy && entry.reviewBy < today)
    errors.push(`${entry.sourceId}: reviewBy expired (${entry.reviewBy})`);

  return errors;
}

/** Validate the whole manifest; returns every error (empty = valid). */
export function validateManifest(
  entries: CorpusEntry[],
  today?: string,
): string[] {
  const seen = new Set<string>();
  const errors: string[] = [];
  for (const entry of entries) {
    errors.push(...validateEntry(entry, seen, today));
    seen.add(entry.sourceId);
  }
  return errors;
}

/** Entries eligible for ingestion: not revoked, not expired. */
export function retrievable(
  entries: CorpusEntry[],
  today = new Date().toISOString().slice(0, 10),
): CorpusEntry[] {
  return entries.filter(
    (e) => !e.revoked && (!e.reviewBy || e.reviewBy >= today),
  );
}

export interface CorpusChunk {
  chunkId: string;
  sourceId: string;
  index: number;
  text: string;
  /** sha-256 hex of the chunk text — drift detection + vector versioning. */
  contentHash: string;
  /** Bumped when chunking rules change; retrieval filters on it. */
  embedVersion: number;
}

export const EMBED_VERSION = 1;
const CHUNK_SIZE = 1400;
const CHUNK_OVERLAP = 200;

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Deterministic chunking: fixed window + overlap, stable chunkIds
 * (`<sourceId>#<index>`) so re-ingestion can diff by hash.
 */
export async function chunkEntry(entry: CorpusEntry): Promise<CorpusChunk[]> {
  const chunks: CorpusChunk[] = [];
  const step = CHUNK_SIZE - CHUNK_OVERLAP;
  for (let i = 0, start = 0; start < entry.text.length; i++, start += step) {
    const text = entry.text.slice(start, start + CHUNK_SIZE);
    chunks.push({
      chunkId: `${entry.sourceId}#${i}`,
      sourceId: entry.sourceId,
      index: i,
      text,
      contentHash: await sha256(text),
      embedVersion: EMBED_VERSION,
    });
  }
  return chunks;
}
