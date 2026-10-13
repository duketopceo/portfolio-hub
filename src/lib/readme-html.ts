/**
 * Post-processing for GitHub-rendered README HTML before it is embedded in a
 * project dossier. Pure string transforms (no DOM) so they are cheap to test.
 *
 * GitHub's `application/vnd.github.html+json` output keeps relative paths
 * verbatim ("docs/assets/hero.png"), which 404 once embedded on our origin.
 */

export interface ReadmeContext {
  owner: string;
  repo: string;
  /** Default branch of the repo (falls back to "main"). */
  branch?: string;
  /** Path of the README inside the repo, e.g. "README.md" or "docs/README.md". */
  readmePath?: string;
  /** Names that count as "the project name" for duplicate-H1 stripping. */
  projectNames?: string[];
}

const ABSOLUTE_RE = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function dirname(path: string): string {
  const i = path.lastIndexOf("/");
  return i < 0 ? "" : path.slice(0, i);
}

/** Resolve a repo-relative reference to a normalised path inside the repo. */
export function resolveRepoPath(ref: string, readmePath = "README.md"): string {
  const base = ref.startsWith("/") ? [] : dirname(readmePath).split("/").filter(Boolean);
  for (const seg of ref.replace(/^\/+/, "").split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") base.pop();
    else base.push(seg);
  }
  return base.join("/");
}

function splitSuffix(ref: string): { path: string; suffix: string } {
  const m = ref.match(/^([^?#]*)([?#][\s\S]*)?$/);
  return { path: m?.[1] ?? ref, suffix: m?.[2] ?? "" };
}

function encodePath(path: string): string {
  return path
    .split("/")
    .map((s) => encodeURIComponent(safeDecode(s)))
    .join("/");
}

/**
 * Rewrite one URL. Returns null when the reference cannot be resolved to
 * anything public (empty, or a local filesystem path like "~/Pictures/x.png").
 * `kind` picks the target: raw file host for assets, github.com/blob for links.
 */
export function rewriteUrl(
  url: string,
  ctx: ReadmeContext,
  kind: "asset" | "link"
): string | null {
  const ref = url.trim();
  if (!ref) return null;
  if (ABSOLUTE_RE.test(ref)) {
    if (/^(?:file|javascript|vbscript):/i.test(ref)) return null;
    return ref;
  }
  if (/^(?:~|[a-z]:[\\/])/i.test(ref) || ref.startsWith("/home/") || ref.startsWith("/Users/")) {
    return null;
  }
  const branch = ctx.branch || "main";
  const { path, suffix } = splitSuffix(ref);
  const resolved = resolveRepoPath(path, ctx.readmePath);
  if (!resolved) return null;
  const enc = encodePath(resolved);
  if (kind === "asset") {
    return `https://raw.githubusercontent.com/${ctx.owner}/${ctx.repo}/${branch}/${enc}`;
  }
  return `https://github.com/${ctx.owner}/${ctx.repo}/blob/${branch}/${enc}${suffix}`;
}

function rewriteSrcset(value: string, ctx: ReadmeContext): string {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [u, ...descriptor] = part.split(/\s+/);
      const out = rewriteUrl(u, ctx, "asset");
      return out ? [out, ...descriptor].join(" ") : "";
    })
    .filter(Boolean)
    .join(", ");
}

const ATTR_RE = /(\s)(src|srcset|poster|href)=("([^"]*)"|'([^']*)')/gi;

function getAttr(attrs: string, name: string): string | null {
  const m = attrs.match(new RegExp(`(?:^|\\s)${name}=("([^"]*)"|'([^']*)')`, "i"));
  return m ? (m[2] ?? m[3] ?? "") : null;
}

/** Rewrite relative URLs on img/source/video/audio/a tags. */
export function rewriteRelativeUrls(html: string, ctx: ReadmeContext): string {
  return html.replace(
    /<(img|source|video|audio|a)\b([^>]*?)(\/?)>/gi,
    (full, tag: string, attrs: string, selfClose: string) => {
      const t = tag.toLowerCase();
      let drop = false;
      const nextAttrs = attrs.replace(
        ATTR_RE,
        (_m, ws: string, name: string, quoted: string, dq?: string, sq?: string) => {
          const value = dq ?? sq ?? "";
          const n = name.toLowerCase();
          if (n === "href") {
            if (t !== "a") return _m;
            const out = rewriteUrl(value, ctx, "link");
            return out ? `${ws}href="${out}"` : "";
          }
          if (n === "srcset") {
            const out = rewriteSrcset(value, ctx);
            return out ? `${ws}srcset="${out}"` : "";
          }
          const out = rewriteUrl(value, ctx, "asset");
          if (!out) {
            if (t === "img") drop = true;
            return "";
          }
          return `${ws}${n}="${out}"`;
        }
      );
      if (drop) return "";
      return `<${tag}${nextAttrs}${selfClose}>`;
    }
  );
}

/**
 * Remove <video> elements that have no playable source (empty `src`, or only
 * empty <source> children). Falls back to the poster as a plain image.
 */
export function dropEmptyMedia(html: string): string {
  const out = html.replace(
    /<video\b([^>]*)>([\s\S]*?)<\/video>/gi,
    (_full, attrs: string, inner: string) => {
      const src = getAttr(attrs, "src");
      const hasSource = /<source\b[^>]*\ssrc=("[^"]+"|'[^']+')/i.test(inner);
      if ((src && src.trim()) || hasSource) {
        // Keep the video but remove its empty <source> children.
        return `<video${attrs}>${stripEmptySources(inner)}</video>`;
      }
      const poster = getAttr(attrs, "poster");
      return poster && poster.trim() ? `<img src="${poster}" alt="">` : "";
    }
  );
  return stripEmptySources(out);
}

function stripEmptySources(html: string): string {
  return html.replace(/<source\b[^>]*>/gi, (tag) => {
    const src = getAttr(tag, "src");
    const srcset = getAttr(tag, "srcset");
    const hasSrc = (src ?? "").trim() !== "";
    const hasSrcset = (srcset ?? "").trim() !== "";
    return hasSrc || hasSrcset ? tag : "";
  });
}

// ---------------------------------------------------------------------------
// Headings

const HEADING_LINE_RE = /^<div class="markdown-heading"[^>]*><h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/i;

function stripTags(s: string): string {
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function normaliseName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * The dossier already renders the project name as the page H1. Drop the
 * README's first H1 when it just repeats that name, then demote every
 * remaining heading one level so a README can never add a second H1.
 */
export function normaliseHeadings(html: string, projectNames: string[] = []): string {
  const names = new Set(projectNames.map(normaliseName).filter(Boolean));
  let out = html;

  const wrapped = out.match(
    /<div class="markdown-heading"[^>]*>\s*<h1\b[^>]*>([\s\S]*?)<\/h1>[\s\S]*?<\/div>/i
  );
  const bare = wrapped ? null : out.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const hit = wrapped ?? bare;
  if (hit && names.has(normaliseName(stripTags(hit[1])))) {
    out = out.replace(hit[0], "");
  }

  return out
    .replace(/<h([1-6])\b/gi, (_m, n: string) => `<h${Math.min(Number(n) + 1, 6)}`)
    .replace(/<\/h([1-6])>/gi, (_m, n: string) => `</h${Math.min(Number(n) + 1, 6)}>`);
}

// ---------------------------------------------------------------------------
// Leaks: internal TODO / placeholder notes

const LEAK_HEADING_RE = /placeholder|no more placeholders|work in progress notes/i;
const LEAK_LINE_RE = /^(?:todo|fixme|tbd|xxx|wip)\b\s*[:\-–—(]/i;
const LEAK_ANYWHERE_RE = /\bno more placeholders?\b|\b(?:insert|add|put)\s+(?:a\s+)?(?:screenshot|image|logo|gif)\s+here\b|lorem ipsum/i;

/**
 * Drop internal-note leakage from an embedded README:
 *  - whole sections whose heading mentions "placeholder",
 *  - lines that begin with TODO:/FIXME:/TBD: (outside <pre> blocks),
 *  - lines containing "NO MORE PLACEHOLDERS" style markers.
 */
export function sanitiseReadmeLeaks(html: string): string {
  const lines = html.split("\n");
  const out: string[] = [];
  let skipUntilLevel: number | null = null;
  let preDepth = 0;

  for (const line of lines) {
    const heading = preDepth === 0 ? line.match(HEADING_LINE_RE) : null;
    if (heading) {
      const level = Number(heading[1]);
      if (skipUntilLevel !== null && level <= skipUntilLevel) skipUntilLevel = null;
      if (skipUntilLevel === null && LEAK_HEADING_RE.test(stripTags(heading[2]))) {
        skipUntilLevel = level;
        continue;
      }
    }
    if (skipUntilLevel !== null) {
      // Track <pre> balance so we never resume mid-code-block.
      preDepth += (line.match(/<pre\b/gi) ?? []).length - (line.match(/<\/pre>/gi) ?? []).length;
      if (preDepth < 0) preDepth = 0;
      continue;
    }

    const wasInPre = preDepth > 0;
    preDepth += (line.match(/<pre\b/gi) ?? []).length - (line.match(/<\/pre>/gi) ?? []).length;
    if (preDepth < 0) preDepth = 0;
    if (wasInPre || preDepth > 0) {
      out.push(line);
      continue;
    }

    const text = stripTags(line);
    if (LEAK_LINE_RE.test(text) || LEAK_ANYWHERE_RE.test(text)) {
      // Keep only closing tags that were opened on an earlier line.
      const closers = line.match(/<\/(?:p|li|blockquote|ul|ol|div)>/gi) ?? [];
      const opened = (line.match(/<(?:p|li|blockquote|ul|ol|div)\b/gi) ?? []).length;
      const keep = closers.slice(opened).join("");
      if (keep) out.push(keep);
      continue;
    }
    out.push(line);
  }

  return out
    .join("\n")
    .replace(/<p\b[^>]*>\s*<\/p>/gi, "")
    .replace(/<blockquote>\s*<\/blockquote>/gi, "");
}

/**
 * The site is dark-only, but <picture> sources keyed on prefers-color-scheme
 * follow the visitor's OS. Collapse each picture to its dark variant so a
 * light-OS visitor does not get dark-on-dark artwork.
 */
export function preferDarkPictures(html: string): string {
  return html.replace(/<picture\b[^>]*>([\s\S]*?)<\/picture>/gi, (full, inner: string) => {
    const dark = inner.match(
      /<source\b[^>]*media="[^"]*prefers-color-scheme:\s*dark[^"]*"[^>]*\ssrcset="([^"]+)"/i
    );
    const img = inner.match(/<img\b[^>]*>/i);
    if (!dark || !img) return full;
    const url = dark[1].split(",")[0].trim().split(/\s+/)[0];
    const tag = /\ssrc="[^"]*"/i.test(img[0])
      ? img[0].replace(/(\ssrc=)"[^"]*"/i, `$1"${url}"`)
      : img[0].replace(/<img/i, `<img src="${url}"`);
    return tag;
  });
}

/** Full pipeline used by fetchReadme. */
export function prepareReadmeHtml(html: string, ctx: ReadmeContext): string {
  let out = sanitiseReadmeLeaks(html);
  out = rewriteRelativeUrls(out, ctx);
  out = dropEmptyMedia(out);
  out = preferDarkPictures(out);
  out = normaliseHeadings(out, ctx.projectNames);
  return out;
}
