// Sanitization for narration scripts, captions and transcripts (KTD6).
// Fails on: private repo names, work orgs and employer domains (the shared list in
// scripts/lib/private-names.mjs), the repo's source-level privacy patterns, internal
// hostnames, absolute filesystem paths and token-shaped strings.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadPrivateNames } from "../../lib/private-names.mjs";
import { forbidden } from "../../lib/privacy-patterns.mjs";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const boundary = String.raw`(?![A-Za-z0-9_-])`;
const lead = String.raw`(?<![A-Za-z0-9_-])`;

/** Hostnames that name this machine or private infrastructure, beyond the generic patterns. */
export const INTERNAL_HOST_NAMES = ["omarchy-max", "omarchy-macbook", "cyberpowa", "cluster1", "cluster2", "cluster3"];

const GENERIC_RULES = [
  { id: "internal-host", label: "internal hostname", re: /(?<![a-z0-9-])[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:local|internal|lan|home\.arpa|ts\.net|corp|intranet)\b/i },
  { id: "internal-host", label: "loopback or private address", re: /\b(?:localhost|127\.\d{1,3}\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d{1,3}\.\d{1,3}|0\.0\.0\.0)\b/i },
  { id: "abs-path", label: "absolute filesystem path", re: /(?<![A-Za-z0-9_.:/-])\/(?:home|Users|root|etc|var|usr|opt|tmp|mnt|srv|run|proc|sys|dev|boot|media)\/[^\s"'`)>,]+/ },
  { id: "abs-path", label: "home-relative path", re: /(?<![A-Za-z0-9_])~\/[^\s"'`)>,]+/ },
  { id: "abs-path", label: "Windows path", re: /\b[A-Za-z]:\\[^\s"'`)>,]+/ },
  { id: "token", label: "OpenAI/OpenRouter-style key", re: /\bsk-(?:or-)?[A-Za-z0-9_-]{16,}/ },
  { id: "token", label: "GitHub token", re: /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})/ },
  { id: "token", label: "AWS access key", re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { id: "token", label: "Slack token", re: /\bxox[abprs]-[A-Za-z0-9-]{10,}/ },
  { id: "token", label: "JSON web token", re: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/ },
  { id: "token", label: "bearer credential", re: /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}/i },
  { id: "token", label: "private key block", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { id: "token", label: "long hex string", re: /\b[0-9a-f]{32,}\b/i },
  { id: "token", label: "long mixed-case secret-like string", re: /(?<![A-Za-z0-9_/-])(?=[A-Za-z0-9_-]{32,})(?=[A-Za-z0-9_-]*[a-z])(?=[A-Za-z0-9_-]*[A-Z])(?=[A-Za-z0-9_-]*\d)[A-Za-z0-9_-]{32,}(?![A-Za-z0-9_-])/ },
];

/**
 * Build the rule set. `names` is the output of loadPrivateNames; the default reads
 * this repo's catalog and denylist, so private entries are covered automatically.
 */
export function buildRules(names = loadPrivateNames(repoRoot)) {
  // Fail closed: an empty list would let every private name pass as clean.
  if (names.slugs.size === 0 || names.workOrgs.length === 0 || names.domains.length === 0) {
    throw new Error("sanitize: private-name list loaded empty (catalog or src/data/private-denylist.ts drift); refusing to run");
  }
  const rules = [];
  for (const slug of names.slugs) {
    rules.push({ id: "private-name", label: `private repo ${slug}`, re: new RegExp(lead + esc(slug) + boundary, "i") });
  }
  for (const name of names.bareChecked) {
    rules.push({ id: "private-name", label: `private repo name ${name}`, re: new RegExp(lead + esc(name) + boundary, "i") });
  }
  for (const org of names.workOrgs) {
    rules.push({ id: "private-name", label: `work org ${org}`, re: new RegExp(esc(org), "i") });
  }
  for (const domain of names.domains) {
    rules.push({ id: "private-name", label: `employer domain ${domain}`, re: new RegExp(esc(domain), "i") });
  }
  for (const { label, pattern } of forbidden) {
    rules.push({ id: "private-pattern", label, re: pattern });
  }
  for (const host of INTERNAL_HOST_NAMES) {
    rules.push({ id: "internal-host", label: `internal host ${host}`, re: new RegExp(lead + esc(host) + boundary, "i") });
  }
  rules.push(...GENERIC_RULES);
  return rules;
}

/** NFKC, drop invisible format characters, fold Unicode hyphens to "-", NBSP to space. */
export function normalizeForScan(text) {
  return text
    .normalize("NFKC")
    .replace(/[\p{Cf}\u00ad]/gu, "")
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/\u00a0/g, " ");
}

let defaultRules;

/**
 * @param {string} text
 * @param {{rules?: ReturnType<typeof buildRules>}} [opts]
 * @returns {{rule: string, label: string, line: number, excerpt: string}[]} findings (empty means clean).
 *   The excerpt is redacted for tokens so a failure never prints the secret itself.
 */
export function findIssues(text, opts = {}) {
  const rules = opts.rules ?? (defaultRules ??= buildRules());
  const findings = [];
  const seen = new Set();
  const record = ({ id, label }, hit, line) => {
    const key = `${label}@${line}`;
    if (seen.has(key)) return;
    seen.add(key);
    findings.push({ rule: id, label, line, excerpt: id === "token" ? `${hit.slice(0, 4)}…[${hit.length} chars]` : hit });
  };
  const scan = (source) => {
    source.split("\n").forEach((line, i) => {
      for (const rule of rules) {
        const m = line.match(rule.re);
        if (m) record(rule, m[0], i + 1);
      }
    });
    // A name or path broken across lines still reads as one string once spoken or captioned,
    // so every rule also runs on the whitespace-collapsed text (reported at line 0).
    const flat = source.replace(/\s+/g, " ");
    for (const rule of rules) {
      const m = flat.match(rule.re);
      if (m && !findings.some((f) => f.label === rule.label)) record(rule, m[0], 0);
    }
  };
  scan(text);
  // Lookalikes (zero-width, soft hyphen, non-breaking or fullwidth forms) read identically
  // to a viewer, so the normalized copy is scanned too.
  const normalized = normalizeForScan(text);
  if (normalized !== text) scan(normalized);
  return findings;
}

export class SanitizeError extends Error {
  constructor(source, findings) {
    super(
      `sanitization failed for ${source}:\n` +
        findings.map((f) => `  line ${f.line}: ${f.label} (${f.excerpt})`).join("\n"),
    );
    this.name = "SanitizeError";
    this.findings = findings;
  }
}

/** Throws SanitizeError when `text` has any finding. `source` names it in the message. */
export function assertClean(text, source, opts) {
  const findings = findIssues(text, opts);
  if (findings.length > 0) throw new SanitizeError(source, findings);
}

export function assertFileClean(path, opts) {
  assertClean(readFileSync(path, "utf8"), path, opts);
}
