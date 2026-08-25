import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * GET /openrouter/api/bakeoff
 * Serves the committed 3-model coding comparison snapshot (Qwen / Muse / Gemma).
 * Source: src/data/bakeoff.json in portfolio-hub — not openrouter-demos harness output.
 * Public — no API key required.
 */
export async function GET(_req: NextRequest) {
  const p = path.join(process.cwd(), "src", "data", "bakeoff.json");
  try {
    const raw = fs.readFileSync(p, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "Bakeoff data not available", detail: (e as Error).message },
      { status: 404 }
    );
  }
}
