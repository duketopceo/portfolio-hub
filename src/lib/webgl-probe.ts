import { isNamedSoftwareRenderer, readRendererString } from "@/lib/render-capability";

export type WebGLTier = "gpu" | "software" | "none";

let cached: WebGLTier | undefined;

/**
 * Probe WebGL once on a throwaway context: "gpu" (any renderer not
 * named as software, including unknown strings), "software" (llvmpipe,
 * SwiftShader, softpipe) or "none" (no context
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
      : isNamedSoftwareRenderer(readRendererString(gl))
        ? "software"
        : "gpu";
  } catch {
    cached = "none";
  }
  gl?.getExtension("WEBGL_lose_context")?.loseContext();
  return cached;
}
