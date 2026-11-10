"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { HOLE_COLORS } from "@/lib/cosmos-colors";

/**
 * Full-screen black hole drawn analytically in one fragment shader (no ray
 * marching): a black event-horizon shadow, a thin photon ring, a hot disk
 * seen near edge-on, and the disk's far side lensed up over and under the
 * hole, Doppler-brightened on the approaching (left) side, turning slowly.
 * The classic glowing-ring look, original rendering; only the soft bloom is
 * ported (below). Colours are warm white, amber and ember only.
 * Cost: two noise octaves (one on the low quality tier), see cosmos-quality.ts.
 * The ring glow (bloom, gauss) is ported from Rune's glow shader: see the
 * attribution at the top of FRAGMENT and THIRD_PARTY_NOTICES.md.
 *
 * One oversized-to-the-viewport quad in clip space. All geometry is in units
 * of the shadow radius (shadow = 1), so layout only supplies a centre and a
 * radius. Compositing is "emission + occlusion": premultiplied output with
 * rgb = emitted light and alpha = the shadow, so the hole stays pure black
 * over the stars while the disk adds light.
 */

/** One disk revolution at mid-radius takes this long (owner brief: 60-90 s). */
export const DISK_PERIOD_SECONDS = 75;

const VERTEX = /* glsl */ `
varying vec2 vQ;
uniform float uAspect;
void main() {
  // Screen-space in "height units": y in [-1, 1], x in [-aspect, aspect].
  vQ = position.xy * vec2(uAspect, 1.0);
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
// Ring glow: gauss(), bloom() and the soft-knee idea are ported from WGSL to
// GLSL from Rune, https://github.com/anomalyco/rune, MIT License,
// Copyright (c) 2026 Anomaly. Source files:
//   crates/rune-fx/src/shaders/common.wgsl (gauss, bloom, knee)
//   crates/rune-fx/src/shaders/glow.wgsl   (variant 0, "soft": outside bloom)
// Full notice in THIRD_PARTY_NOTICES.md.
precision highp float;
varying vec2 vQ;
uniform vec2 uCenter;     // hole centre, height units
uniform float uRadius;    // shadow radius, height units
uniform float uTime;
uniform float uSpin;      // rad/s at mid-radius
uniform float uOpacity;   // scene light level (shadow is always fully black)
uniform float uGlow;      // 1 = soft bloom + disk haze, 0 = off (low tier)
uniform float uDetail;    // 1 = two noise octaves, 0 = one (low quality tier)
uniform vec3 uWhite;
uniform vec3 uAmber;
uniform vec3 uEmber;

const float R_IN = 1.18;   // disk inner edge, in shadow radii
const float R_OUT = 5.4;   // disk outer edge
const float TILT = 0.075;   // disk ellipse minor/major: near edge-on
const float REACH = 0.95;   // how far the lensed image extends above the shadow edge

// From Rune common.wgsl: gaussian falloff, and the two-lobe bloom profile
// (tight core + wide halo) that fades out by reach.
float gauss(float x, float w) { return exp(-(x * x) / max(w * w, 1e-6)); }
float bloom(float d, float r, float reach) {
  float o = max(d, 0.0);
  float w = 1.0 - smoothstep(reach * 0.5, reach, o);
  return (0.65 * gauss(o, r * 0.35) + 0.35 * gauss(o, r * 1.2)) * w;
}

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
// Azimuthal streaks that rotate: high frequency in radius, low in angle.
float streaks(float rr, float ang) {
  vec3 q = vec3(rr * 4.0, cos(ang) * 2.2, sin(ang) * 2.2);
  float n = 0.7 * vnoise(q);
  // The second octave is skipped on the low tier, where its mean
  // contribution stands in so brightness matches across tiers.
  if (uDetail > 0.5) n += 0.3 * vnoise(q * 2.3 + 7.0);
  else n += 0.15;
  return n;
}
// t = 0 at the hot inner edge, 1 at the cold outer edge:
// white-hot -> amber -> ember -> deep ember. Warm only.
vec3 heat(float t) {
  vec3 c = mix(uWhite, uAmber, smoothstep(0.0, 0.16, t));
  c = mix(c, uEmber, smoothstep(0.12, 0.5, t));
  return mix(c, uEmber * 0.3, smoothstep(0.45, 0.95, t));
}
// Left limb approaches: brighter. k sets how lopsided.
float doppler(float side, float k) {
  float b = 1.0 - clamp(side, -1.0, 1.0) * k;
  return b * b;
}

void main() {
  vec2 p = (vQ - uCenter) / uRadius;
  float s = length(p);
  float aa = max(fwidth(s), 1e-4);

  // --- Primary disk (plane coordinates: stretch y by the tilt) ---
  vec2 d = vec2(p.x, p.y / TILT);
  float rd = length(d);
  float omega = uSpin * pow(0.55 / max(rd * 0.25, 0.2), 0.75);
  float inBand = smoothstep(R_IN, R_IN + 0.04, rd) * (1.0 - smoothstep(3.4, R_OUT, rd));
  vec3 disk = vec3(0.0);
  if (inBand > 0.0) {
    float t = clamp((rd - R_IN) / (R_OUT - R_IN), 0.0, 1.0);
    float n = streaks(rd, atan(d.y, d.x) - omega * uTime);
    float bright = pow(1.0 - t, 2.0) * (0.55 + 0.9 * n) * 2.3;
    disk = heat(t) * bright * doppler(d.x / rd, 0.7) * inBand;
  }

  // The shadow hides the far half (screen y > 0); the near half crosses in front.
  float shadow = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, s);
  if (p.y > 0.0) disk *= 1.0 - shadow;

  // --- Lensed image: the far side of the disk bent up over the hole (strong)
  // and a faint copy under it. Thick at the top, tapering toward the sides
  // where it joins the primary disk.
  vec3 lens = vec3(0.0);
  if (s > 1.0 && s < 1.0 + REACH * 1.5) {
    float up = p.y / s;
    float top = smoothstep(-0.3, 0.8, up);
    float bot = smoothstep(0.25, -0.8, up);
    float thick = mix(0.16, 1.0, pow(max(top, 0.0), 1.1));
    float thickB = mix(0.1, 0.5, pow(max(bot, 0.0), 1.1));
    float tl = (s - 1.0) / (REACH * thick);
    float tb = (s - 1.0) / (REACH * thickB);
    float la = atan(p.y, p.x) - uSpin * 1.3 * uTime;
    float ln = streaks(0.9 + tl * 2.0, la);
    float wTop = top * pow(max(1.0 - tl, 0.0), 2.4) * (0.85 + 0.3 * ln);
    float wBot = bot * 0.7 * pow(max(1.0 - tb, 0.0), 2.6) * (0.85 + 0.3 * ln);
    lens = heat(tl * 0.5) * wTop * 2.6 * doppler(p.x / s, 0.55)
         + heat(0.04 + tb * 0.5) * wBot * 2.4 * doppler(p.x / s, 0.55);
  }

  // --- Photon ring: one thin hot line hugging the shadow, plus a faint
  // wider halo of the same light.
  float ring = exp(-pow((s - 1.02) / 0.02, 2.0)) * 5.0;
  float halo = exp(-pow((s - 1.05) / 0.14, 2.0)) * 1.0;
  vec3 photon = (uWhite * ring + uAmber * halo) * doppler(p.x / max(s, 0.001), 0.4) * step(1.0 - aa, s);

  // --- Glow: bloom hugging the shadow edge (Rune glow.wgsl, variant 0) and a
  // faint warm haze along the disk plane. Roll-off below plays the knee.
  vec3 glow = vec3(0.0);
  if (uGlow > 0.5) {
    float bl = bloom(s - 1.0, 0.7, 2.2) * step(1.0, s);
    float haze = exp(-pow(p.y / (0.3 + 0.1 * abs(p.x)), 2.0)) * exp(-abs(p.x) / 3.6) * step(1.0, s);
    glow = (uAmber * bl * 0.16 + uEmber * haze * 0.16) * doppler(p.x / max(s, 0.001), 0.4);
  }

  vec3 E = disk + lens + photon + glow;
  // Gentle highlight roll-off.
  E = 1.0 - exp(-E * 1.1);
  vec3 srgb = pow(E, vec3(0.85));
  gl_FragColor = vec4(srgb * uOpacity, shadow);
}
`;

export function createBlackHoleMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    premultipliedAlpha: true,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uAspect: { value: 1 },
      uCenter: { value: new THREE.Vector2(0, 0) },
      uRadius: { value: 0.25 },
      uTime: { value: 0 },
      uSpin: { value: (Math.PI * 2) / DISK_PERIOD_SECONDS },
      uOpacity: { value: 1 },
      uDetail: { value: 1 },
      uGlow: { value: 1 },
      uWhite: { value: new THREE.Color(HOLE_COLORS.white) },
      uAmber: { value: new THREE.Color(HOLE_COLORS.amber) },
      uEmber: { value: new THREE.Color(HOLE_COLORS.ember) },
    },
  });
}

/** Clip-space quad covering the whole canvas; the shader places the hole. */
export default function BlackHole({
  material,
  meshRef,
}: {
  material: THREE.ShaderMaterial;
  meshRef?: React.Ref<THREE.Mesh>;
}) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  // Drawn after the stars (renderOrder 1) so the shadow hides them.
  return <mesh ref={meshRef} geometry={geometry} material={material} frustumCulled={false} renderOrder={1} />;
}
