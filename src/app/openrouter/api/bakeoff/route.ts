import { NextResponse } from "next/server";
import bakeoff from "@/data/bakeoff.json";

/**
 * GET /openrouter/api/bakeoff
 * Serves the committed 3-model coding comparison snapshot (Qwen / Muse / Gemma).
 * Source: src/data/bakeoff.json in portfolio-hub — not openrouter-demos harness output.
 * Public — no API key required, no upstream call. The JSON is bundled at build
 * time, so the route is static and has no filesystem or error-detail surface.
 */
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(bakeoff);
}
