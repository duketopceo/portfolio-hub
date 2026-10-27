"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { moonOffset, type OrbitSlot } from "@/components/scene/orbit-layout";
import { HAIRLINE, TEAL } from "@/components/scene/survey-lines";
import { planetBodyRadius, type ResolvedPlanetVisual } from "@/lib/planet-visual";

/**
 * Every moon of every planet in ONE InstancedMesh (one draw call), lit by the
 * scene's star. A moon is a notable component of its project; a live moon
 * (the deployed URL) is teal. Orbits clear the planet's rings.
 */
export function Moons({
  slots,
  visuals,
  bodyScale = 1,
}: {
  slots: OrbitSlot[];
  visuals: ResolvedPlanetVisual[];
  bodyScale?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const moons = useMemo(() => {
    const list: {
      planet: number;
      index: number;
      count: number;
      radius: number;
      size: number;
      color: THREE.Color;
    }[] = [];
    visuals.forEach((v, planet) => {
      const r = planetBodyRadius(v.size) * bodyScale;
      const clear = Math.max(1.9, ...v.rings.map((ring) => ring.outer + 0.4));
      v.moons.forEach((m, index) => {
        list.push({
          planet,
          index,
          count: v.moons.length,
          radius: r * (clear + index * 0.32),
          size: r * (0.11 + (m.kind === "live" ? 0.03 : 0)),
          color: m.kind === "live" ? TEAL : new THREE.Color(v.color).lerp(HAIRLINE, 0.4),
        });
      });
    });
    return list;
  }, [visuals, bodyScale]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    moons.forEach((m, i) => mesh.setColorAt(i, m.color));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [moons]);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    moons.forEach((m, i) => {
      const slot = slots[m.planet];
      if (!slot) return;
      const [ox, oy, oz] = moonOffset(m.index, m.count, t, m.radius);
      dummy.position.set(slot.x + ox, oy, slot.z + oz);
      dummy.scale.setScalar(m.size);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  if (moons.length === 0) return null;
  return (
    <instancedMesh
      key={moons.length}
      ref={ref}
      args={[undefined, undefined, moons.length]}
      frustumCulled={false}
    >
      <icosahedronGeometry args={[1, 2]} />
      <meshLambertMaterial toneMapped={false} />
    </instancedMesh>
  );
}
