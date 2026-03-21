import { NextResponse } from "next/server";

/**
 * Liveness probe — no GitHub or external I/O.
 * Use for Traefik/Docker healthchecks to avoid 502 when /api/repos is slow or GitHub errors.
 */
export async function GET() {
  return NextResponse.json(
    { ok: true, service: "portfolio-hub" },
    { status: 200, headers: { "cache-control": "no-store" } }
  );
}
