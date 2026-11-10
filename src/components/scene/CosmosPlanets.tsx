"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Ring } from "@/components/scene/planets/Rings";
import {
  createPlanetMaterial,
  createRingMaterial,
  setLightingUniforms,
} from "@/components/scene/planets/planet-material";
import type { PlanetPalette, PlanetSurface, ResolvedRing } from "@/lib/planet-spec";
import { COSMOS_PALETTE as C } from "@/lib/palette";
import type { PlanetKind } from "@/components/cosmos/PlanetSvg";

export interface CosmosPlanetSpec {
  kind: PlanetKind;
  surface: PlanetSurface;
  palette: PlanetPalette;
  seed: number;
  /** Axial tilt, degrees, counter-clockwise on screen. */
  tilt: number;
  spin: number;
  atmosphere: { strength: number; color: string };
  ring?: ResolvedRing;
}

/** The three worlds. Colours mirror PlanetSvg so both renditions match. */
export const COSMOS_PLANETS: CosmosPlanetSpec[] = [
  {
    kind: "ice",
    surface: "ice",
    palette: ["#2C5E5A", "#9FDDD6", "#F2FBFA"],
    seed: 41,
    tilt: 17,
    spin: 0.05,
    atmosphere: { strength: 0.3, color: C.pop },
    ring: { color: "#CFEFEA", opacity: 0.3, tilt: 16, inner: 1.55, outer: 2.05, bands: 3 },
  },
  {
    kind: "rocky",
    surface: "cratered",
    palette: ["#2A201B", "#8A6E5E", "#E0C6B2"],
    seed: 7,
    tilt: -8,
    spin: 0.04,
    atmosphere: { strength: 0, color: C.slate },
  },
  {
    kind: "gas",
    surface: "gas",
    palette: ["#0C4A44", "#2DD4BF", "#BFF3EC"],
    seed: 19,
    tilt: 12,
    spin: 0.07,
    atmosphere: { strength: 0.22, color: "#BFF3EC" },
  },
];

const UP = new THREE.Vector3(0, 1, 0);
const tmpCenter = new THREE.Vector3();
const tmpNormal = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const tmpScale = new THREE.Vector3();

/**
 * One planet: lit sphere with a procedural surface (the same shaders as the
 * home map), optional ring, spinning slowly. The black hole is the key light.
 * `placeRef` is positioned and scaled by CosmosScene every frame.
 */
export function CosmosPlanet({
  spec,
  sphere,
  starRef,
  placeRef,
}: {
  spec: CosmosPlanetSpec;
  sphere: THREE.BufferGeometry;
  starRef: { current: THREE.Object3D | null };
  placeRef: (g: THREE.Group | null) => void;
}) {
  const tiltRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Mesh>(null);
  const ringGroup = useRef<THREE.Group | null>(null);
  const star = useMemo(() => new THREE.Vector3(), []);

  const material = useMemo(
    () =>
      createPlanetMaterial({
        surface: spec.surface,
        palette: spec.palette,
        seed: spec.seed,
        atmosphere: spec.atmosphere,
        ring: spec.ring,
      }),
    [spec]
  );
  const ringMaterial = useMemo(
    () =>
      spec.ring
        ? createRingMaterial({
            color: spec.ring.color,
            inner: spec.ring.inner,
            outer: spec.ring.outer,
            opacity: spec.ring.opacity,
            bands: spec.ring.bands,
            seed: spec.seed + spec.ring.bands,
            highlight: spec.palette[2],
          })
        : null,
    [spec]
  );
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => () => ringMaterial?.dispose(), [ringMaterial]);

  useFrame((_, dt) => {
    const spin = spinRef.current;
    const tilt = tiltRef.current;
    if (!spin || !tilt) return;
    spin.rotation.y += spec.spin * Math.min(dt, 0.1);
    starRef.current?.getWorldPosition(star);
    tilt.getWorldPosition(tmpCenter);
    tilt.getWorldScale(tmpScale);
    const worldRadius = tmpScale.x;
    const g = ringGroup.current ?? tilt;
    tmpNormal.copy(UP).applyQuaternion(g.getWorldQuaternion(tmpQuat));
    setLightingUniforms(material, star, tmpCenter, worldRadius, tmpNormal);
    if (ringMaterial) setLightingUniforms(ringMaterial, star, tmpCenter, worldRadius, tmpNormal);
  });

  return (
    <group ref={placeRef} visible={false}>
      <group ref={tiltRef} rotation-z={THREE.MathUtils.degToRad(spec.tilt)}>
        <mesh ref={spinRef} geometry={sphere} material={material} frustumCulled={false} />
        {spec.ring && ringMaterial ? (
          <Ring
            ring={spec.ring}
            material={ringMaterial}
            radius={1}
            segments={96}
            groupRef={(g) => {
              ringGroup.current = g;
            }}
          />
        ) : null}
      </group>
    </group>
  );
}
