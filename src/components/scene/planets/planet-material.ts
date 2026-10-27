import * as THREE from "three";
import { mixHex, type PlanetPalette, type PlanetSurface } from "@/lib/planet-spec";
import { NOISE_GLSL, RING_PROFILE_GLSL } from "./glsl";
import { SURFACE_GLSL } from "./surfaces";

/**
 * Procedural materials. Both are ShaderMaterials sharing one lighting model
 * (see glsl.ts): a single point-light star in world space, hard terminator,
 * flat ambient, inside-the-limb atmosphere rim. Per-frame uniforms
 * (star, centre, ring plane) are written by the Planet component.
 */

export interface RingShadowInput {
  /** Ring edges in planet radii. */
  inner: number;
  outer: number;
  opacity: number;
  bands: number;
}

const PLANET_VERTEX = /* glsl */ `
varying vec3 vObj;
varying vec3 vN;
varying vec3 vWorldPos;
void main() {
  vObj = normalize(position);
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

function planetFragment(surface: PlanetSurface): string {
  return /* glsl */ `
precision highp float;
uniform vec3 uLow;
uniform vec3 uMid;
uniform vec3 uHigh;
uniform float uSeed;
uniform vec3 uStar;
uniform vec3 uCenter;
uniform float uRadius;
uniform float uAmbient;
uniform float uAtmo;
uniform vec3 uAtmoColor;
// Primary ring shadow on the planet (alpha 0 = no ring).
uniform vec3 uRingN;
uniform float uRingInner;
uniform float uRingOuter;
uniform float uRingAlpha;
varying vec3 vObj;
varying vec3 vN;
varying vec3 vWorldPos;
${NOISE_GLSL}
${RING_PROFILE_GLSL}
${SURFACE_GLSL[surface]}

// Screen-space bump (Mikkelsen): perturb N by the screen derivatives of h.
vec3 bumpNormal(vec3 N, vec3 P, float h, float strength) {
  vec3 dpx = dFdx(P);
  vec3 dpy = dFdy(P);
  float dhx = dFdx(h);
  float dhy = dFdy(h);
  vec3 r1 = cross(dpy, N);
  vec3 r2 = cross(N, dpx);
  float det = dot(dpx, r1);
  vec3 g = sign(det) * (dhx * r1 + dhy * r2);
  return normalize(abs(det) * N - strength * g);
}

void main() {
  float h = 0.0;
  vec3 albedo = surfaceColor(normalize(vObj), h);
  vec3 Ng = normalize(vN);
  vec3 P = vWorldPos;
  vec3 L = normalize(uStar - P);
  vec3 V = normalize(cameraPosition - P);

  vec3 N = Ng;
  if (BUMP > 0.0) {
    // Scale so the effect is independent of how big the planet is on screen.
    N = bumpNormal(Ng, P, h, BUMP * 0.045 * uRadius);
  }

  float ndlGeo = dot(Ng, L);
  float w = fwidth(ndlGeo) * 1.2 + 0.0015;
  float term = smoothstep(-w, w, ndlGeo);
  float diffuse = clamp(dot(N, L), 0.0, 1.0);
  float lit = term * (0.38 + 0.62 * pow(diffuse, 0.85));

  // Ring shadow: the ring plane crossed on the way to the star.
  float shadow = 0.0;
  if (uRingAlpha > 0.0) {
    float dn = dot(L, uRingN);
    if (abs(dn) > 0.001) {
      float t = dot(uCenter - P, uRingN) / dn;
      if (t > 0.0) {
        float d = length(P + L * t - uCenter) / uRadius;
        float u = (d - uRingInner) / (uRingOuter - uRingInner);
        if (u > 0.0 && u < 1.0) shadow = ringProfile(u) * uRingAlpha;
      }
    }
  }

  vec3 col = albedo * (uAmbient + lit * (1.0 - 0.8 * shadow));

  // Atmosphere: a rim tint blended inside the silhouette on the lit side.
  float fres = pow(1.0 - clamp(dot(Ng, V), 0.0, 1.0), 3.0);
  float rim = fres * uAtmo * smoothstep(-0.05, 0.35, ndlGeo);
  col = mix(col, uAtmoColor * (0.5 + 0.5 * term), clamp(rim, 0.0, 0.6));

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;
}

export interface PlanetMaterialInput {
  surface: PlanetSurface;
  palette: PlanetPalette;
  seed: number;
  atmosphere: { strength: number; color: string };
  ring?: RingShadowInput;
}

const AMBIENT = 0.075;

export function createPlanetMaterial(input: PlanetMaterialInput): THREE.ShaderMaterial {
  const { palette, ring } = input;
  return new THREE.ShaderMaterial({
    vertexShader: PLANET_VERTEX,
    fragmentShader: planetFragment(input.surface),
    uniforms: {
      uLow: { value: new THREE.Color(palette[0]) },
      uMid: { value: new THREE.Color(palette[1]) },
      uHigh: { value: new THREE.Color(palette[2]) },
      uSeed: { value: input.seed },
      uStar: { value: new THREE.Vector3() },
      uCenter: { value: new THREE.Vector3() },
      uRadius: { value: 1 },
      uAmbient: { value: AMBIENT },
      uAtmo: { value: input.atmosphere.strength },
      uAtmoColor: { value: new THREE.Color(input.atmosphere.color) },
      uRingN: { value: new THREE.Vector3(0, 1, 0) },
      uRingInner: { value: ring?.inner ?? 1 },
      uRingOuter: { value: ring?.outer ?? 2 },
      uRingAlpha: { value: ring ? Math.min(0.85, ring.opacity * 2) : 0 },
      uRingBands: { value: ring?.bands ?? 0 },
    },
  });
}

const RING_VERTEX = /* glsl */ `
varying float vU;
varying vec3 vWorldPos;
uniform float uInner;
uniform float uOuter;
void main() {
  float r = length(position.xy);
  vU = (r - uInner) / (uOuter - uInner);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const RING_FRAGMENT = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uSeed;
uniform float uAmbient;
uniform vec3 uStar;
uniform vec3 uCenter;
uniform float uRadius;
uniform vec3 uRingN;
varying float vU;
varying vec3 vWorldPos;
${NOISE_GLSL}
${RING_PROFILE_GLSL}
void main() {
  float prof = ringProfile(clamp(vU, 0.0, 1.0));
  float alpha = prof * uOpacity;
  if (alpha < 0.01) discard;
  vec3 P = vWorldPos;
  vec3 L = normalize(uStar - P);
  // The planet's shadow across the ring (hard, ~1px soft edge).
  vec3 oc = P - uCenter;
  float b = dot(oc, L);
  float c = dot(oc, oc) - uRadius * uRadius;
  float disc = b * b - c;
  float shadow = b < 0.0 ? smoothstep(0.0, uRadius * 0.06, disc) : 0.0;
  float face = 0.4 + 0.6 * abs(dot(uRingN, L));
  vec3 tint = uColor * (0.8 + 0.4 * prof);
  vec3 col = tint * (uAmbient + face * (1.0 - 0.92 * shadow));
  gl_FragColor = vec4(col, alpha);
  #include <colorspace_fragment>
}
`;

export interface RingMaterialInput {
  color: string;
  inner: number;
  outer: number;
  opacity: number;
  bands: number;
  seed: number;
  /** Planet palette highlight, blended in so rings read as dust or ice. */
  highlight: string;
}

export function createRingMaterial(input: RingMaterialInput): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: RING_VERTEX,
    fragmentShader: RING_FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: new THREE.Color(mixHex(input.color, input.highlight, 0.45)) },
      uOpacity: { value: Math.min(0.85, input.opacity * 2) },
      uSeed: { value: input.seed },
      uAmbient: { value: AMBIENT },
      uInner: { value: input.inner },
      uOuter: { value: input.outer },
      uRingBands: { value: input.bands },
      uStar: { value: new THREE.Vector3() },
      uCenter: { value: new THREE.Vector3() },
      uRadius: { value: 1 },
      uRingN: { value: new THREE.Vector3(0, 1, 0) },
    },
  });
}

/** Write the per-frame world-space uniforms shared by planet and ring. */
export function setLightingUniforms(
  material: THREE.ShaderMaterial,
  star: THREE.Vector3,
  center: THREE.Vector3,
  radius: number,
  ringNormal: THREE.Vector3
) {
  const u = material.uniforms;
  (u.uStar.value as THREE.Vector3).copy(star);
  (u.uCenter.value as THREE.Vector3).copy(center);
  u.uRadius.value = radius;
  (u.uRingN.value as THREE.Vector3).copy(ringNormal);
}
