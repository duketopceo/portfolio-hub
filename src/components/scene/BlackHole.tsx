"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { COSMOS_PALETTE as C } from "@/lib/palette";

/**
 * Black hole with an accretion disk, drawn analytically on one quad (no ray
 * marching): an event-horizon shadow, a tilted disk with differential
 * rotation and Doppler beaming, and light bent over and under the shadow.
 * Style: dark core, thin bright accretion ring, slow rotation. Original design, same composition as the static plate (BlackHoleSvg).
 * Cost: two noise octaves (one on the low quality tier), see cosmos-quality.ts.
 *
 * Compositing is "emission + occlusion": the output is premultiplied, with
 * rgb = emitted light and alpha = how much of the background the shadow
 * blocks, so the disk adds light and the hole stays black over the stars.
 */

/** One disk revolution at mid-radius takes this long (owner brief: 60-90 s). */
export const DISK_PERIOD_SECONDS = 75;

const VERTEX = /* glsl */ `
varying vec2 vP;
void main() {
  vP = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;
varying vec2 vP;
uniform float uTime;
uniform float uSpin;      // rad/s at mid-radius
uniform float uOpacity;
uniform float uDetail;    // 1 = two noise octaves, 0 = one (low quality tier)
uniform vec3 uWhite;
uniform vec3 uEmber;
uniform vec3 uTeal;

const float R_IN = 0.27;
const float R_OUT = 0.8;
const float SH = 0.21;
const float TILT = 0.2;   // disk ellipse minor/major as seen from the camera

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
float streaks(float rr, float ang) {
  // Frequency high in radius, low in angle: azimuthal streaks that rotate.
  vec3 q = vec3(rr * 15.0, cos(ang) * 2.4, sin(ang) * 2.4);
  // Two octaves (was three); the second is skipped entirely on the low tier.
  float n = 0.7 * vnoise(q);
  if (uDetail > 0.5) n += 0.3 * vnoise(q * 2.1 + 7.0);
  else n += 0.15;
  return n;
}
vec3 heat(float t) {
  // white-hot rim -> ember body -> dark ember -> teal dust at the edge
  vec3 hot = mix(uWhite, vec3(1.0, 0.62, 0.36), smoothstep(0.0, 0.12, t));
  vec3 c = mix(hot, uEmber, smoothstep(0.06, 0.34, t));
  c = mix(c, uEmber * 0.35, smoothstep(0.3, 0.7, t));
  return mix(c, uTeal * 0.5, smoothstep(0.62, 1.0, t));
}
float doppler(float x, float r) {
  // Left limb approaches: brighter. Strongest where the disk moves fastest.
  float b = 1.0 - clamp(x / max(r, 0.001), -1.0, 1.0) * 0.55;
  return b * b;
}

void main() {
  vec2 p = vP;
  float s = length(p);
  if (s > 1.0) discard;

  // --- Disk (plane coordinates: stretch y by the tilt) ---
  vec2 d = vec2(p.x, p.y / TILT);
  float rd = length(d);
  float ang = atan(d.y, d.x);
  float omega = uSpin * pow(0.55 / max(rd, 0.2), 0.75);
  float a = ang - omega * uTime;
  float t = clamp((rd - R_IN) / (R_OUT - R_IN), 0.0, 1.0);
  float inBand = smoothstep(R_IN, R_IN + 0.012, rd) * (1.0 - smoothstep(0.55, R_OUT, rd));
  float n = streaks(rd, a);
  float bright = pow(1.0 - t, 1.9) * (0.5 + 1.0 * n) * 1.5;
  vec3 disk = heat(t) * bright * doppler(d.x, rd) * inBand;

  // Far half of the disk is hidden by the shadow; the near half (screen
  // y < 0) crosses in front of it.
  float shadow = 1.0 - smoothstep(SH - fwidth(s), SH + fwidth(s), s);
  if (p.y > 0.0) disk *= 1.0 - shadow;

  // --- Light bent around the hole: top arc strong, bottom arc faint ---
  float lens_t = clamp((s - SH) / 0.34, 0.0, 1.0);
  float lensBand = exp(-(s - SH) / 0.035) * step(SH, s);
  float side = p.y / max(s, 0.001);
  float lensW = mix(0.6, 1.0, smoothstep(-0.3, 0.9, side));
  float la = atan(p.y, p.x) - uSpin * 1.5 * uTime;
  float ln = streaks(0.3 + lens_t * 0.5, la);
  vec3 lens = heat(0.08 + lens_t * 0.5) * lensBand * lensW * (0.55 + 0.9 * ln) * 1.9 * doppler(p.x, s);

  // Photon ring: one thin hot line hugging the shadow.
  float ring = exp(-pow((s - SH * 1.07) / 0.011, 2.0)) * 1.9;
  vec3 photon = uWhite * ring * doppler(p.x, s) * 0.8;

  vec3 E = disk + lens + photon;
  E = 1.0 - exp(-E * 1.15);              // gentle highlight roll-off
  vec3 srgb = pow(E, vec3(1.0 / 2.2));
  float occ = shadow;
  gl_FragColor = vec4(srgb * uOpacity, occ * uOpacity);
}
`;

export function createBlackHoleMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    premultipliedAlpha: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uSpin: { value: (Math.PI * 2) / DISK_PERIOD_SECONDS },
      uOpacity: { value: 1 },
      uDetail: { value: 1 },
      uWhite: { value: new THREE.Color("#FFD2AE") },
      uEmber: { value: new THREE.Color(C.ember) },
      uTeal: { value: new THREE.Color(C.teal) },
    },
  });
}

/** Unit quad (radius 1 = the disk's outer edge); the parent group scales it. */
export default function BlackHole({ material }: { material: THREE.ShaderMaterial }) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} material={material} frustumCulled={false} renderOrder={-1} />;
}
