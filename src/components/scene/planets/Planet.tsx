"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ResolvedPlanetVisual } from "@/lib/planet-visual";
import type { OrbitSlot } from "@/components/scene/orbit-layout";
import { useStar } from "@/components/scene/scene-rig";
import {
  createPlanetMaterial,
  createRingMaterial,
  setLightingUniforms,
} from "./planet-material";
import { Ring } from "./Rings";

export type PlanetQuality = "lite" | "full";

const UP = new THREE.Vector3(0, 1, 0);
const tmpStar = new THREE.Vector3();
const tmpCenter = new THREE.Vector3();
const tmpScale = new THREE.Vector3();
const tmpNormal = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();

/**
 * One planet: a lit sphere with a procedural surface, axial tilt and spin,
 * optional rings (real geometry, alpha bands, shadow both ways) and an
 * inside-the-limb atmosphere. Everything is driven by the resolved PlanetSpec;
 * this component holds no per-planet constants.
 */
export function Planet({
  slot,
  visual,
  radius,
  sphere,
  quality,
}: {
  slot: OrbitSlot;
  visual: ResolvedPlanetVisual;
  radius: number;
  /** Unit sphere shared by every planet. */
  sphere: THREE.BufferGeometry;
  quality: PlanetQuality;
}) {
  const star = useStar();
  const tiltRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Mesh>(null);
  const ringGroups = useRef<(THREE.Group | null)[]>([]);

  const material = useMemo(
    () =>
      createPlanetMaterial({
        surface: visual.surface,
        palette: visual.palette,
        seed: visual.seed,
        atmosphere: visual.atmosphere,
        // Quality "lite" skips the ring shadow on the planet.
        ring: quality === "full" ? visual.rings[0] : undefined,
      }),
    [visual, quality]
  );
  const ringMaterials = useMemo(
    () =>
      visual.rings.map((ring) =>
        createRingMaterial({
          color: ring.color,
          inner: ring.inner,
          outer: ring.outer,
          opacity: ring.opacity,
          bands: ring.bands,
          seed: visual.seed + ring.bands,
          highlight: visual.palette[2],
        })
      ),
    [visual]
  );
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => () => ringMaterials.forEach((m) => m.dispose()), [ringMaterials]);

  useFrame((_, dt) => {
    const spin = spinRef.current;
    const tilt = tiltRef.current;
    if (!spin || !tilt) return;
    spin.rotation.y += visual.rotationSpeed * Math.min(dt, 0.1);

    // World-space inputs for the shaders: robust to the orbit group's fit
    // scale. Cheap (a handful of vector ops per planet).
    star?.current?.getWorldPosition(tmpStar);
    tilt.getWorldPosition(tmpCenter);
    tilt.getWorldScale(tmpScale);
    const worldRadius = radius * tmpScale.x;
    // The planet shader shadows with its first ring's plane; each ring
    // material carries its own plane.
    ringMaterials.forEach((m, i) => {
      const g = ringGroups.current[i] ?? tilt;
      tmpNormal.copy(UP).applyQuaternion(g.getWorldQuaternion(tmpQuat));
      setLightingUniforms(m, tmpStar, tmpCenter, worldRadius, tmpNormal);
      if (i === 0) setLightingUniforms(material, tmpStar, tmpCenter, worldRadius, tmpNormal);
    });
    if (ringMaterials.length === 0) {
      setLightingUniforms(material, tmpStar, tmpCenter, worldRadius, UP);
    }
  });

  const segments = quality === "full" ? 96 : 48;
  return (
    <group position={[slot.x, 0, slot.z]}>
      <group ref={tiltRef} rotation-z={THREE.MathUtils.degToRad(-visual.tilt)}>
        <mesh
          ref={spinRef}
          geometry={sphere}
          material={material}
          scale={radius}
          frustumCulled={false}
        />
        {visual.rings.map((ring, i) => (
          <Ring
            key={i}
            ring={ring}
            material={ringMaterials[i]}
            radius={radius}
            segments={segments}
            groupRef={(g) => {
              ringGroups.current[i] = g;
            }}
          />
        ))}
      </group>
    </group>
  );
}
