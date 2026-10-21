"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { setUniform } from "@/components/scene/contour-shader";
import { buildStarfield } from "@/components/scene/starfield-data";

const STARLIGHT = new THREE.Color("#E9ECEF");

// Parallax happens in the vertex shader from a per-vertex depth layer, so the
// stars (one Points) and their constellation links (one LineSegments) move
// together with zero per-frame CPU geometry work.
const VERTEX = /* glsl */ `
attribute float aDepth;
uniform vec2 uPointer;
uniform float uTime;
uniform float uSize;
varying float vDepth;
void main() {
  vDepth = aDepth;
  vec3 p = position;
  p.xy += uPointer * (0.5 + aDepth * 2.5);
  p.y += sin(uTime * 0.05) * 0.8 * (0.4 + aDepth);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
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

type SharedUniforms = {
  uPointer: { value: THREE.Vector2 };
  uTime: { value: number };
};

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
      uSize: { value: size },
      uColor: { value: STARLIGHT },
      uOpacity: { value: opacity },
    },
  });
}

export default function StarfieldScene() {
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
      };
      return {
        pointsGeometry: pg,
        linesGeometry: lg,
        pointsMaterial: makeMaterial(0.8, 2.4, shared),
        linesMaterial: makeMaterial(0.1, 1, shared),
        shared,
      };
    }, []);

  useEffect(() => {
    setUniform(pointsMaterial, "uSize", 2.4 * pixelRatio);
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
      <lineSegments geometry={linesGeometry} material={linesMaterial} />
    </group>
  );
}
