import { ASHIMA_SNOISE } from "./noise";

/**
 * Shared GLSL for the planet materials. Lighting model, kept deliberately
 * simple and consistent with BRAND.md ("lit survey bodies, never glow"):
 *
 *  - ONE key light, the star, a point at `uStar` (world space).
 *  - A hard terminator: a ~1px anti-aliased step on N.L, no soft falloff.
 *  - A small flat ambient so the night side still reads against the plate.
 *  - An atmosphere that is a rim tint blended INSIDE the silhouette on the
 *    lit side. Nothing is drawn outside the limb: no additive blending, no
 *    radial alpha falloff, no bloom.
 */

export const NOISE_GLSL = /* glsl */ `
${ASHIMA_SNOISE}

float fbm(vec3 p, int octaves) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    s += a * snoise(p);
    p = p * 2.03 + vec3(11.3, 3.7, 7.1);
    a *= 0.5;
  }
  return s;
}

vec3 hash33(vec3 p) {
  p = fract(p * vec3(.1031, .1030, .0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

// 3D cellular crater field: x = height (bowl negative, raised rim positive).
float craterField(vec3 p, float scale, float seed) {
  p *= scale;
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float h = 0.0;
  for (int i = -1; i <= 1; i++) {
    for (int j = -1; j <= 1; j++) {
      for (int k = -1; k <= 1; k++) {
        vec3 g = vec3(float(i), float(j), float(k));
        vec3 o = hash33(ip + g + seed);
        if (o.z > 0.62) continue; // not every cell holds a crater
        vec3 d = g + (0.2 + 0.6 * o) - fp;
        float rad = 0.2 + 0.26 * o.x;
        float q = length(d) / rad;
        float bowl = -(1.0 - smoothstep(0.0, 1.0, q)) * 0.9;
        float rim = exp(-pow((q - 1.05) * 4.5, 2.0)) * 0.55;
        h += bowl + rim;
      }
    }
  }
  return h;
}
`;

/** Ring radial profile: alpha 0..1 at normalised radius u in [0, 1].
 *  `uRingBands` dark gaps, soft inner/outer edges, fine grain from noise. */
export const RING_PROFILE_GLSL = /* glsl */ `
uniform float uRingBands;
float ringProfile(float u) {
  float edge = smoothstep(0.0, 0.06, u) * (1.0 - smoothstep(0.94, 1.0, u));
  float grain = 0.82 + 0.18 * snoise(vec3(u * 9.0, uSeed, 1.7));
  float gaps = 1.0;
  for (int i = 0; i < 8; i++) {
    if (float(i) >= uRingBands) break;
    float c = fract(sin((float(i) + 1.0) * 12.9898 + uSeed) * 43758.5453);
    float w = 0.03 + 0.05 * fract(c * 7.0);
    gaps *= 1.0 - 0.85 * (1.0 - smoothstep(0.0, w, abs(u - (0.12 + 0.76 * c))));
  }
  return clamp(edge * grain * gaps, 0.0, 1.0);
}
`;
