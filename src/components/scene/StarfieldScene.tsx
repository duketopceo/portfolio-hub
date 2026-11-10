"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { setUniform } from "@/components/scene/uniforms";
import { buildStarfield } from "@/components/scene/starfield-data";

const STARLIGHT = new THREE.Color("#E9ECEF");

// Parallax happens in the vertex shader from a per-vertex depth layer, so the
// stars (one Points) and their constellation links (one LineSegments) move
// together with zero per-frame CPU geometry work.
const VERTEX = /* glsl */ `
// Lensing: the radial displacement profile f(x) = x * exp(-x * x) * 2.33 is
// ported from WGSL to GLSL from Rune, https://github.com/anomalyco/rune, MIT
// License, Copyright (c) 2026 Anomaly. Source file:
//   crates/rune-fx/src/shaders/distort.wgsl (shockwave variant)
// Rune applies it to a sampled backdrop; here it displaces star vertices in
// screen space around the hole, so no extra render pass is needed.
// Full notice in THIRD_PARTY_NOTICES.md.
attribute float aDepth;
uniform vec2 uPointer;
uniform vec4 uLens;     // x, y: hole centre (NDC); z: shadow radius (NDC y); w: strength, 0 = off
uniform float uAspect;  // viewport width / height
uniform float uTime;
uniform float uSize;
varying float vDepth;
void main() {
  vDepth = aDepth;
  vec3 p = position;
  p.xy += uPointer * (0.5 + aDepth * 2.5);
  p.y += sin(uTime * 0.05) * 0.8 * (0.4 + aDepth);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  if (uLens.w > 0.0) {
    vec2 ndc = gl_Position.xy / gl_Position.w;
    vec2 rel = (ndc - uLens.xy) * vec2(uAspect, 1.0);
    float r = length(rel);
    float x = (r - uLens.z * 1.6) / (uLens.z * 1.1);
    float f = x * exp(-x * x) * 2.33;   // Rune shockwave profile
    ndc += (rel / max(r, 1e-4)) * f * uLens.z * 0.55 * uLens.w / vec2(uAspect, 1.0);
    gl_Position.xy = ndc * gl_Position.w;
  }
  gl_PointSize = uSize * (0.75 + aDepth * 0.75);
}
`;

const FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vDepth;
void main() {
  gl_FragColor = vec4(uColor, uOpacity * (0.45 + vDepth * 0.55));
}
`;

/** Uniforms shared by the star points and their links (and with the hole). */
export interface LensUniforms {
  uLens: { value: THREE.Vector4 };
  uAspect: { value: number };
}

/** Update the lensing uniforms in place (called from frame loops). */
export function setLens(lens: LensUniforms, x: number, y: number, radius: number, strength: number, aspect: number) {
  lens.uLens.value.set(x, y, radius, strength);
  lens.uAspect.value = aspect;
}

type SharedUniforms = {
  uPointer: { value: THREE.Vector2 };
  uTime: { value: number };
} & LensUniforms;

function setSharedTime(shared: SharedUniforms, t: number) {
  shared.uTime.value = t;
}

function makeMaterial(opacity: number, size: number, shared: SharedUniforms) {
  return new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uPointer: shared.uPointer,
      uTime: shared.uTime,
      uLens: shared.uLens,
      uAspect: shared.uAspect,
      uSize: { value: size },
      uColor: { value: STARLIGHT },
      uOpacity: { value: opacity },
    },
  });
}

export default function StarfieldScene({
  links = true,
  lens,
}: {
  links?: boolean;
  /** Lensing uniforms driven by CosmosScene; omitted = no lensing. */
  lens?: LensUniforms;
}) {
  const group = useRef<THREE.Group>(null);
  const pointerTarget = useRef(new THREE.Vector2());
  const pixelRatio = useThree((s) => s.gl.getPixelRatio());

  const { pointsGeometry, linesGeometry, pointsMaterial, linesMaterial, shared } =
    useMemo(() => {
      const data = buildStarfield(20260911);
      const pg = new THREE.BufferGeometry();
      pg.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
      pg.setAttribute("aDepth", new THREE.BufferAttribute(data.depths, 1));
      const lg = new THREE.BufferGeometry();
      lg.setAttribute(
        "position",
        new THREE.BufferAttribute(data.segmentPositions, 3)
      );
      lg.setAttribute(
        "aDepth",
        new THREE.BufferAttribute(data.segmentDepths, 1)
      );
      // One pointer/time uniform pair drives both materials.
      const shared: SharedUniforms = {
        uPointer: { value: new THREE.Vector2() },
        uTime: { value: 0 },
        uLens: lens?.uLens ?? { value: new THREE.Vector4(0, 0, 1, 0) },
        uAspect: lens?.uAspect ?? { value: 1 },
      };
      return {
        pointsGeometry: pg,
        linesGeometry: lg,
        pointsMaterial: makeMaterial(0.62, 2.2, shared),
        linesMaterial: makeMaterial(0.06, 1, shared),
        shared,
      };
    }, [lens]);

  useEffect(() => {
    setUniform(pointsMaterial, "uSize", 2.2 * pixelRatio);
  }, [pointsMaterial, pixelRatio]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointerTarget.current.set(
        (e.clientX / window.innerWidth - 0.5) * 2,
        -(e.clientY / window.innerHeight - 0.5) * 2
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(
    () => () => {
      pointsGeometry.dispose();
      linesGeometry.dispose();
      pointsMaterial.dispose();
      linesMaterial.dispose();
    },
    [pointsGeometry, linesGeometry, pointsMaterial, linesMaterial]
  );

  useFrame(({ clock }, dt) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.z = t * 0.004;
    setSharedTime(shared, t);
    shared.uPointer.value.lerp(pointerTarget.current, Math.min(1, dt * 2));
  });

  return (
    <group ref={group}>
      <points geometry={pointsGeometry} material={pointsMaterial} />
      {links && <lineSegments geometry={linesGeometry} material={linesMaterial} />}
    </group>
  );
}
