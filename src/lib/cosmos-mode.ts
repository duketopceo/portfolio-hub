import type { WebGLTier } from "@/lib/webgl-probe";
import { shouldSkipScene } from "@/lib/render-capability";

/**
 * "static": the server-rendered SVG plate and CSS stardust only.
 * "live": the WebGL black hole + planets and the canvas stardust.
 */
export type CosmosMode = "static" | "live";

export type CosmosOverride = "live" | "static" | null;

/** `?cosmos=live|static` QA override; anything else is ignored. */
export function parseCosmosOverride(search: string): CosmosOverride {
  const v = new URLSearchParams(search).get("cosmos");
  return v === "live" || v === "static" ? v : null;
}

export interface CosmosModeInput {
  reducedMotion: boolean;
  webgl: WebGLTier;
  saveData: boolean;
  deviceMemory?: number;
  override?: CosmosOverride;
}

/**
 * Decide the background rendition. Reduced motion, no WebGL, a software
 * rasteriser (per-pixel black-hole shader would burn the CPU), Save-Data and
 * very low-memory devices all get the static plate. The override can force
 * "static" always; it can force "live" only when a WebGL context exists and
 * the visitor has not asked for reduced motion.
 */
export function pickCosmosMode(input: CosmosModeInput): CosmosMode {
  const { reducedMotion, webgl, saveData, deviceMemory, override } = input;
  if (override === "static") return "static";
  if (reducedMotion || webgl === "none") return "static";
  if (override === "live") return "live";
  if (webgl === "software") return "static";
  if (shouldSkipScene({ saveData, deviceMemory })) return "static";
  return "live";
}
