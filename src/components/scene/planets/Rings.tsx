"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { ResolvedRing } from "@/lib/planet-spec";

/**
 * One real ring: a flat annulus in the planet's equatorial plane, inclined by
 * the ring's own tilt, drawn with the alpha-banded ring material (see
 * planet-material.ts). The geometry is in planet radii; the mesh is scaled to
 * the planet. `material` is owned (and disposed) by the Planet.
 */
export function Ring({
  ring,
  material,
  radius,
  segments,
  groupRef,
}: {
  ring: ResolvedRing;
  material: THREE.ShaderMaterial;
  radius: number;
  segments: number;
  /** Receives the inclined group so the Planet can read the ring normal. */
  groupRef: (g: THREE.Group | null) => void;
}) {
  const geometry = useMemo(
    () => new THREE.RingGeometry(ring.inner, ring.outer, segments, 1),
    [ring.inner, ring.outer, segments]
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <group ref={groupRef} rotation-x={THREE.MathUtils.degToRad(ring.tilt)}>
      <mesh
        geometry={geometry}
        material={material}
        rotation-x={-Math.PI / 2}
        scale={radius}
        frustumCulled={false}
        renderOrder={2}
      />
    </group>
  );
}
