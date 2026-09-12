"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { seededRandom } from "@/components/scene/random";

const STARLIGHT = new THREE.Color("#E9ECEF");

export default function StarfieldScene() {
  const group = useRef<THREE.Group>(null);

  const { positions, segmentPositions } = useMemo(() => {
    const r = seededRandom(20260911);
    const n = 90;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      pts.push(
        new THREE.Vector3(
          (r() - 0.5) * 90,
          (r() - 0.5) * 50,
          (r() - 0.5) * 30 - 8
        )
      );
    }
    const pos = new Float32Array(n * 3);
    pts.forEach((p, i) => p.toArray(pos, i * 3));

    // Constellation links — each point connects to its nearest neighbor(s),
    // packed into one lineSegments draw call.
    const linked = new Set<string>();
    const seg: number[] = [];
    for (let i = 0; i < n; i++) {
      const dists = pts
        .map((p, j) => ({ j, d: pts[i].distanceToSquared(p) }))
        .filter(({ j }) => j !== i)
        .sort((a, b) => a.d - b.d);
      for (const { j } of dists.slice(0, 2)) {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!linked.has(key)) {
          linked.add(key);
          seg.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
        }
      }
    }
    return { positions: pos, segmentPositions: new Float32Array(seg) };
  }, []);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.z = t * 0.004;
    group.current.position.y = Math.sin(t * 0.05) * 0.8;
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={STARLIGHT}
          size={0.14}
          sizeAttenuation
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[segmentPositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={STARLIGHT}
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
