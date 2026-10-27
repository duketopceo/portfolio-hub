import type { PlanetSurface } from "@/lib/planet-spec";

/**
 * One GLSL snippet per surface type. Each defines
 *
 *   vec3 surfaceColor(vec3 p, out float height)
 *
 * `p` is the unit direction in the planet's own (spinning) frame, so features
 * rotate with the body; `height` feeds the screen-space bump in the shared
 * fragment shader (scaled by BUMP). Colours come from the spec palette
 * uniforms uLow / uMid / uHigh and noise from uSeed. Adding a surface type
 * means adding a snippet here and its name to PLANET_SURFACES.
 */

const ramp = /* glsl */ `
vec3 ramp3(float t) {
  t = clamp(t, 0.0, 1.0);
  return t < 0.5 ? mix(uLow, uMid, t * 2.0) : mix(uMid, uHigh, (t - 0.5) * 2.0);
}
`;

export const SURFACE_GLSL: Record<PlanetSurface, string> = {
  // Banded gas giant: latitude stripes warped by turbulence, one storm.
  gas: /* glsl */ `
${ramp}
#define BUMP 0.0
vec3 surfaceColor(vec3 p, out float height) {
  float warp = fbm(p * vec3(2.4, 3.2, 2.4) + uSeed, 4);
  float lat = p.y + warp * 0.12;
  float broad = 0.5 + 0.5 * sin(lat * 15.0 + uSeed);
  float fine = 0.5 + 0.5 * sin(lat * 31.0 + uSeed * 2.0 + warp * 3.0);
  float t = clamp(0.6 * broad + 0.28 * fine + 0.3 * warp + 0.06, 0.0, 1.0);
  vec3 c = ramp3(t);
  vec3 sc = normalize(vec3(cos(uSeed), -0.28, sin(uSeed)));
  float sd = length((p - sc) * vec3(1.0, 2.6, 1.0));
  c = mix(c, mix(uHigh, uLow, 0.3), (1.0 - smoothstep(0.07, 0.2, sd)) * 0.65);
  height = 0.0;
  return c;
}
`,

  // Rocky: mottled mid-frequency relief with ridged detail.
  rocky: /* glsl */ `
${ramp}
#define BUMP 0.55
vec3 surfaceColor(vec3 p, out float height) {
  vec3 q = p * 2.3 + uSeed;
  float h = fbm(q, 5);
  float ridge = 1.0 - abs(snoise(q * 2.7));
  height = h * 0.7 + ridge * ridge * 0.3;
  float t = smoothstep(-0.55, 0.6, h) * 0.8 + ridge * 0.15;
  return ramp3(t);
}
`,

  // Cratered: cellular craters at two scales over a dusty base.
  cratered: /* glsl */ `
${ramp}
#define BUMP 1.1
vec3 surfaceColor(vec3 p, out float height) {
  float base = fbm(p * 2.8 + uSeed, 4);
  float big = craterField(p, 2.4, uSeed);
  float small = craterField(p + 3.1, 6.2, uSeed + 5.0);
  height = big * 0.9 + small * 0.45 + base * 0.12;
  float t = 0.5 + base * 0.55 + big * 0.28 + small * 0.12;
  return ramp3(t);
}
`,

  // Ice: smooth pale body, fine fracture lines, brighter poles.
  ice: /* glsl */ `
${ramp}
#define BUMP 0.2
vec3 surfaceColor(vec3 p, out float height) {
  float n = fbm(p * 2.0 + uSeed, 4);
  vec3 q = p * 4.2 + vec3(n * 0.9) + uSeed;
  float crack = 1.0 - abs(snoise(q));
  float line = smoothstep(0.92, 0.995, crack);
  float cap = smoothstep(0.62, 0.95, abs(p.y) + n * 0.12);
  float t = 0.55 + n * 0.4 + cap * 0.35;
  vec3 c = ramp3(t);
  c = mix(c, uLow, line * 0.55);
  height = -line * 0.4 + n * 0.08;
  return c;
}
`,

  // Terrain: continents over ocean, elevation colouring, polar caps.
  terrain: /* glsl */ `
${ramp}
#define BUMP 0.5
vec3 surfaceColor(vec3 p, out float height) {
  float h = fbm(p * 1.5 + uSeed, 5);
  float sea = 0.04;
  float land = smoothstep(sea - 0.015, sea + 0.02, h);
  float elev = clamp((h - sea) / 0.7, 0.0, 1.0);
  vec3 ocean = mix(uLow, uMid, 0.05 + 0.22 * smoothstep(-0.6, sea, h));
  vec3 ground = ramp3(0.5 + elev * 0.6);
  vec3 c = mix(ocean, ground, land);
  float cap = smoothstep(0.78, 0.94, abs(p.y) + h * 0.1);
  c = mix(c, uHigh, cap * 0.85);
  height = land * (elev * 0.9 + 0.1);
  return c;
}
`,
};
