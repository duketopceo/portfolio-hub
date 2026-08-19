import { createSign } from "crypto";

const APP_ID = process.env.GITHUB_APP_ID;
const INSTALLATION_ID = process.env.GITHUB_APP_INSTALLATION_ID;
const PRIVATE_KEY_RAW = process.env.GITHUB_APP_PRIVATE_KEY;

type CachedInstallationToken = {
  token: string;
  expiresAtMs: number;
};

let cachedInstallation: CachedInstallationToken | null = null;

function normalizePrivateKey(pem: string): string {
  const trimmed = pem.trim();
  if (trimmed.includes("\\n")) {
    return trimmed.replace(/\\n/g, "\n");
  }
  return trimmed;
}

function base64Url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/** RS256 JWT for GitHub App authentication (server-only). */
export function createGitHubAppJwt(appId: string, privateKeyPem: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iat: now - 60,
      exp: now + 9 * 60,
      iss: appId,
    })
  );
  const unsigned = `${header}.${payload}`;
  const sign = createSign("RSA-SHA256");
  sign.update(unsigned);
  sign.end();
  const signature = base64Url(
    sign.sign(normalizePrivateKey(privateKeyPem))
  );
  return `${unsigned}.${signature}`;
}

export function isGitHubAppConfigured(): boolean {
  return Boolean(APP_ID && INSTALLATION_ID && PRIVATE_KEY_RAW);
}

/**
 * Mint a short-lived installation access token.
 * Cached until ~5 minutes before expiry.
 */
export async function getGitHubAppInstallationToken(): Promise<string | null> {
  if (!isGitHubAppConfigured()) return null;

  const now = Date.now();
  if (
    cachedInstallation &&
    cachedInstallation.expiresAtMs - now > 5 * 60 * 1000
  ) {
    return cachedInstallation.token;
  }

  const jwt = createGitHubAppJwt(APP_ID!, PRIVATE_KEY_RAW!);
  const url = `https://api.github.com/app/installations/${INSTALLATION_ID}/access_tokens`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${jwt}`,
        "User-Agent": "portfolio-hub",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return null;

    const body = (await res.json()) as {
      token?: string;
      expires_at?: string;
    };

    if (!body.token || !body.expires_at) return null;

    cachedInstallation = {
      token: body.token,
      expiresAtMs: new Date(body.expires_at).getTime(),
    };
    return body.token;
  } catch {
    return null;
  }
}

/**
 * Best available server token: GitHub App installation → GITHUB_TOKEN → none.
 */
export async function getGithubAccessToken(): Promise<string | null> {
  const appToken = await getGitHubAppInstallationToken();
  if (appToken) return appToken;
  return process.env.GITHUB_TOKEN?.trim() || null;
}
