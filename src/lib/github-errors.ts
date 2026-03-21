/**
 * Structured GitHub API errors — no secrets in messages.
 */

export type GithubFailureKind =
  | "unauthorized"
  | "forbidden"
  | "rate_limited"
  | "not_found"
  | "server_error"
  | "network"
  | "parse"
  | "unknown";

export interface GithubRequestFailure {
  kind: GithubFailureKind;
  status?: number;
  message: string;
  /** ISO time when rate limit resets (from GitHub headers), if applicable */
  rateLimitReset?: string;
}

export function classifyHttpStatus(status: number): GithubFailureKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server_error";
  return "unknown";
}

/**
 * Best-effort parse of GitHub JSON error body (does not throw).
 */
export async function parseGithubErrorBody(res: Response): Promise<string> {
  try {
    const text = await res.text();
    if (!text) return res.statusText || `HTTP ${res.status}`;
    const parsed = JSON.parse(text) as { message?: string; documentation_url?: string };
    if (typeof parsed.message === "string") return parsed.message;
    return text.slice(0, 200);
  } catch {
    return res.statusText || `HTTP ${res.status}`;
  }
}

export function rateLimitResetFromHeaders(res: Response): string | undefined {
  const reset = res.headers.get("x-ratelimit-reset");
  if (!reset) return undefined;
  const sec = Number.parseInt(reset, 10);
  if (Number.isNaN(sec)) return undefined;
  return new Date(sec * 1000).toISOString();
}

export function logGithubFailure(
  context: string,
  failure: GithubRequestFailure
): void {
  const parts = [`[github] ${context}`, failure.message];
  if (failure.status != null) parts.push(`status=${failure.status}`);
  if (failure.kind === "rate_limited" && failure.rateLimitReset) {
    parts.push(`reset=${failure.rateLimitReset}`);
  }
  console.error(parts.join(" | "));
}

export function failureFromUnknown(context: string, err: unknown): GithubRequestFailure {
  if (err instanceof Error && err.name === "AbortError") {
    return { kind: "unknown", message: "Request aborted" };
  }
  const message =
    err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";
  const isNetwork =
    err instanceof TypeError ||
    (err instanceof Error &&
      /fetch|network|failed to fetch|ECONNRESET|ETIMEDOUT/i.test(err.message));
  return {
    kind: isNetwork ? "network" : "unknown",
    message: `${context}: ${message}`,
  };
}
