import { readRendererString, shouldUseShader } from "@/lib/render-capability";

export type WebGLTier = "gpu" | "software" | "none";

let cached: WebGLTier | undefined;

/**
 * Probe WebGL once on a throwaway context: "gpu" (a real renderer),
 * "software" (llvmpipe, SwiftShader, unidentifiable) or "none" (no context
 * at all). The context is released immediately.
 */
export function probeWebGL(): WebGLTier {
  if (cached !== undefined) return cached;
  if (typeof document === "undefined") return "none";
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  try {
    const canvas = document.createElement("canvas");
    gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    cached = !gl
      ? "none"
      : shouldUseShader(readRendererString(gl))
        ? "gpu"
        : "software";
  } catch {
    cached = "none";
  }
  gl?.getExtension("WEBGL_lose_context")?.loseContext();
  return cached;
}
