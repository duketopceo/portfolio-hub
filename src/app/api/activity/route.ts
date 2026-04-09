import { NextResponse } from "next/server";

export const revalidate = 300;

const GITHUB_API = "https://api.github.com";
const GITHUB_USER = process.env.GITHUB_USER || "duketopceo";
const TOKEN = process.env.GITHUB_TOKEN;

interface GitHubPushEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: {
    ref?: string;
    size?: number;
    commits?: Array<{ message: string }>;
  };
}

export interface ActivityEvent {
  repo: string;
  branch: string;
  message: string;
  count: number;
  timestamp: string;
}

function authHeaders(): HeadersInit {
  const h: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "portfolio-hub",
  };
  if (TOKEN) {
    h.Authorization = `Bearer ${TOKEN}`;
  }
  return h;
}

export async function GET() {
  try {
    const res = await fetch(
      `${GITHUB_API}/users/${GITHUB_USER}/events/public?per_page=50`,
      {
        headers: authHeaders(),
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(10_000),
      }
    );

    if (!res.ok) {
      console.error(`[api/activity] GitHub API ${res.status}`);
      return NextResponse.json({ events: [] });
    }

    const raw = (await res.json()) as GitHubPushEvent[];

    const pushEvents = raw.filter(
      (e) =>
        e.type === "PushEvent" &&
        e.repo.name.startsWith(`${GITHUB_USER}/`)
    );

    // Deduplicate: merge consecutive pushes to same repo within 5 min
    const deduped: ActivityEvent[] = [];
    for (const event of pushEvents) {
      const repo = event.repo.name.replace(`${GITHUB_USER}/`, "");
      const branch = (event.payload.ref || "").replace("refs/heads/", "");
      const message = event.payload.commits?.[0]?.message
        ? event.payload.commits[0].message.slice(0, 60)
        : "";
      const count = event.payload.size || event.payload.commits?.length || 1;
      const timestamp = event.created_at;

      const last = deduped[deduped.length - 1];
      if (last && last.repo === repo) {
        const timeDiff =
          new Date(last.timestamp).getTime() - new Date(timestamp).getTime();
        if (Math.abs(timeDiff) < 5 * 60 * 1000) {
          last.count += count;
          if (!last.message && message) last.message = message;
          continue;
        }
      }

      deduped.push({ repo, branch, message, count, timestamp });
    }

    return NextResponse.json({ events: deduped.slice(0, 20) });
  } catch (err) {
    console.error("[api/activity] fetch failed:", err);
    return NextResponse.json({ events: [] });
  }
}
