"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { setUniform } from "@/components/scene/uniforms";
import StarfieldScene from "@/components/scene/StarfieldScene";
import BlackHole, { createBlackHoleMaterial } from "@/components/scene/BlackHole";
import { COSMOS_PLANETS, CosmosPlanet } from "@/components/scene/CosmosPlanets";
import {
  bodyOpacity,
  bodyPlacement,
  layoutVariant,
  scrollOffset,
  type BodyId,
} from "@/lib/cosmos-layout";

/** Camera distance used by SiteBackground; bodies sit at known depths. */
const CAMERA_Z = 42;
const HOLE_Z = -3;
const PLANET_Z = 0;
/** Keep the ring from fighting text drawn over it. */
const HOLE_MAX_OPACITY = 0.82;
const LIGHT_LIFT = new THREE.Vector3(0, 0, 8);

/**
 * The whole background in one canvas: stars, the black hole (hero), and
 * three planet types placed from the shared layout table. Bodies drift up
 * with the page at different rates and are culled once off screen.
 */
export default function CosmosScene({ planets = true }: { planets?: boolean }) {
  const { viewport } = useThree();
  const holeMaterial = useMemo(() => createBlackHoleMaterial(), []);
  const holeGroup = useRef<THREE.Group>(null);
  const starRef = useRef<THREE.Object3D | null>(null);
  const planetGroups = useRef<Record<string, THREE.Group | null>>({});
  const sphere = useMemo(() => new THREE.SphereGeometry(1, 96, 64), []);

  useEffect(
    () => () => {
      holeMaterial.dispose();
      sphere.dispose();
    },
    [holeMaterial, sphere]
  );

  useFrame(({ clock }) => {
    const vw = viewport.width;
    const vh = viewport.height;
    const aspect = vw / vh;
    const variant = layoutVariant(aspect, 1);
    const minDim = Math.min(vw, vh);
    const sy = typeof window === "undefined" ? 0 : window.scrollY;
    const innerH = typeof window === "undefined" ? 1 : window.innerHeight;

    const place = (id: BodyId, z: number, group: THREE.Group | null) => {
      if (!group) return 0;
      const p = bodyPlacement(variant, id);
      // Bodies behind the focal plane are smaller on screen; compensate so
      // layout fractions mean the same thing at every depth.
      const k = (CAMERA_Z - z) / CAMERA_Z;
      const off = scrollOffset(sy, innerH, p.parallax);
      const cx = (p.x - 0.5) * vw * k;
      const cy = (0.5 - (p.y + off)) * vh * k;
      const radius = (p.size * minDim * k) / 2;
      group.position.set(cx, cy, z);
      group.scale.setScalar(radius);
      const bottomEdge = p.y + off + (p.size * minDim) / 2 / vh;
      return bodyOpacity(bottomEdge);
    };

    const hole = holeGroup.current;
    const holeOpacity = place("blackhole", HOLE_Z, hole);
    if (hole) hole.visible = holeOpacity > 0.01;
    setUniform(holeMaterial, "uTime", clock.getElapsedTime());
    setUniform(holeMaterial, "uOpacity", holeOpacity * HOLE_MAX_OPACITY);
    if (starRef.current && hole) {
      // Key light: at the hole, nudged toward the camera so planets read lit.
      starRef.current.position.copy(hole.position).add(LIGHT_LIFT);
    }

    for (const spec of COSMOS_PLANETS) {
      const g = planetGroups.current[spec.kind] ?? null;
      const o = place(spec.kind, PLANET_Z, g);
      if (g) g.visible = o > 0.01;
    }
  });

  return (
    <>
      <StarfieldScene />
      <group ref={holeGroup}>
        <BlackHole material={holeMaterial} />
      </group>
      <object3D ref={starRef} />
      {(planets ? COSMOS_PLANETS : []).map((spec) => (
        <CosmosPlanet
          key={spec.kind}
          spec={spec}
          sphere={sphere}
          starRef={starRef}
          placeRef={(g) => {
            planetGroups.current[spec.kind] = g;
          }}
        />
      ))}
    </>
  );
}
