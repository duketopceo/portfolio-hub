"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { STAR_COLORS } from "@/lib/cosmos-colors";
import { generateStars } from "@/lib/starfield";
import { setUniform } from "@/components/scene/uniforms";

/** Overall star light level: stars stay below the page's text in brightness (BRAND.md contrast notes). */
export const STAR_LIGHT = 1;
/** Drift: fractions of the viewport width per second at full depth (a far star moves a fifth of that). */
const DRIFT = 0.0016;
/** Parallax: fractions of the viewport height a full-depth star shifts per viewport of page scroll. */
const PARALLAX = 0.1;

const VERTEX = /* glsl */ `
attribute float aSize;
attribute float aBright;
attribute float aPhase;
attribute float aTwinkle;
attribute float aWarmth;
uniform float uTime;
uniform float uScroll;
uniform float uPx;
varying float vBright;
varying float vWarmth;
void main() {
  float depth = position.z;
  vec2 p = position.xy;
  p.x += uTime * ${DRIFT.toFixed(5)} * depth;
  p.y += uScroll * ${PARALLAX.toFixed(3)} * depth;
  p = fract(p);
  gl_Position = vec4(p.x * 2.0 - 1.0, 1.0 - p.y * 2.0, 0.0, 1.0);
  float tw = 1.0 + aTwinkle * sin(uTime * (0.5 + aPhase * 0.12) + aPhase * 9.0);
  float px = aSize * uPx;
  gl_PointSize = max(px, 1.0);
  // A star thinner than one device pixel is drawn one pixel wide and dimmer.
  vBright = aBright * tw * min(px, 1.0);
  vWarmth = aWarmth;
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;
uniform vec3 uWhite;
uniform vec3 uWarm;
uniform vec3 uAmber;
uniform float uLight;
varying float vBright;
varying float vWarmth;
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float a = 1.0 - smoothstep(0.0, 1.0, r);
  a *= a;
  vec3 c = mix(uWhite, uWarm, smoothstep(0.0, 0.5, vWarmth));
  c = mix(c, uAmber, smoothstep(0.85, 1.0, vWarmth));
  float v = a * vBright * uLight;
  gl_FragColor = vec4(c * v, v);
}
`;

function createStarMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    premultipliedAlpha: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPx: { value: 1 },
      uLight: { value: STAR_LIGHT },
      uWhite: { value: new THREE.Color(STAR_COLORS.white) },
      uWarm: { value: new THREE.Color(STAR_COLORS.warm) },
      uAmber: { value: new THREE.Color(STAR_COLORS.amber) },
    },
  });
}

function createStarGeometry(count: number): THREE.BufferGeometry {
  const stars = generateStars(count);
  const position = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const bright = new Float32Array(count);
  const phase = new Float32Array(count);
  const twinkle = new Float32Array(count);
  const warmth = new Float32Array(count);
  stars.forEach((s, i) => {
    position.set([s.x, s.y, s.depth], i * 3);
    size[i] = s.size;
    bright[i] = s.brightness;
    phase[i] = s.phase;
    twinkle[i] = s.twinkle;
    warmth[i] = s.warmth;
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(position, 3));
  g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  g.setAttribute("aBright", new THREE.BufferAttribute(bright, 1));
  g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
  g.setAttribute("aTwinkle", new THREE.BufferAttribute(twinkle, 1));
  g.setAttribute("aWarmth", new THREE.BufferAttribute(warmth, 1));
  return g;
}

/**
 * The whole background scene (one WebGL context): a
 * few thousand round points in three parallax layers, a slow sideways drift,
 * a very subtle twinkle on some, and a small scroll parallax. Warm white only
 * (`STAR_COLORS`). `count` is the quality tier's figure (cosmos-quality.ts).
 */
export default function Starfield({ count }: { count: number }) {
  const material = useMemo(() => createStarMaterial(), []);
  const geometry = useMemo(() => createStarGeometry(count), [count]);
  const pixelRatio = useThree((s) => s.gl.getPixelRatio());

  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    setUniform(material, "uPx", pixelRatio);
  }, [material, pixelRatio]);

  useFrame(({ clock }) => {
    const sy = typeof window === "undefined" ? 0 : window.scrollY;
    const innerH = typeof window === "undefined" ? 1 : Math.max(window.innerHeight, 1);
    setUniform(material, "uTime", clock.getElapsedTime());
    setUniform(material, "uScroll", sy / innerH);
  });

  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={-1} />;
}
