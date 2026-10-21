/**
 * Renderer capability checks for the homepage 3D scenes.
 *
 * The contour shader is per-pixel work; on a software rasteriser it burns CPU
 * and inflates main-thread time, so the scenes stay line-art there.
 */

const SOFTWARE_RENDERER = /llvmpipe|swiftshader|software/i;

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
