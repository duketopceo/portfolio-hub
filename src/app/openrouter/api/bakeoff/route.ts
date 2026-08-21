import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * GET /openrouter/api/bakeoff
 * Serves the pre-baked 3-model bakeoff results (Qwen 3.8-27b / Muse Glimmer 30B / Gemma 4 31B).
 * Public — no API key required. Reads a committed JSON snapshot so it works standalone on Railway.
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
