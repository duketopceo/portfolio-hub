/**
 * Renderer capability checks for the homepage 3D scenes.
 *
 * The contour shader is per-pixel work; on a software rasteriser it burns CPU
 * and inflates main-thread time, so the scenes stay line-art there.
 */

const SOFTWARE_RENDERER = /llvmpipe|swiftshader|software|microsoft basic render driver/i;

/**
 * True when the WebGL renderer string identifies a real GPU. Software
 * rasterisers (llvmpipe, SwiftShader, anything calling itself "software")
 * and an unidentifiable renderer both return false.
 */
export function shouldUseShader(renderer: string | null | undefined): boolean {
  if (!renderer) return false;
  return !SOFTWARE_RENDERER.test(renderer);
}

/** Unmasked renderer string from a live WebGL context, or null. */
export function readRendererString(
  gl: WebGLRenderingContext | WebGL2RenderingContext | null | undefined
): string | null {
  if (!gl) return null;
  try {
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const value = info
      ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);
    return typeof value === "string" ? value : null;
  } catch {
    return null;
  }
}

export interface FramePolicy {
  frameloop: "always" | "demand" | "never";
  dpr: [number, number] | number;
  antialias: boolean;
  /** Drive a throttled invalidate loop (software rasteriser, on screen). */
  throttle: boolean;
}

/**
 * Canvas frame policy: paused off screen; on a software rasteriser demand
 * frames with DPR 1, no antialiasing and a throttled invalidate loop.
 */
export function framePolicy(opts: {
  inView: boolean;
  software: boolean;
  dpr: [number, number];
}): FramePolicy {
  const { inView, software, dpr } = opts;
  return {
    frameloop: !inView ? "never" : software ? "demand" : "always",
    dpr: software ? 1 : dpr,
    antialias: !software,
    throttle: software && inView,
  };
}
