"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { seededRandom } from "@/components/scene/random";

const BELT_R = 22; // follows the outer catalog ring

/** Fit the belt to the stage width regardless of viewport size. */
function BeltFit({ children }: { children: ReactNode }) {
  const { viewport } = useThree();
  const s = Math.min(1, viewport.width / 56);
  return <group scale={THREE.MathUtils.clamp(s, 0.25, 1)}>{children}</group>;
}

/**
 * FIG. 02 belt — a drifting dust annulus behind the DOM registry rings.
 * Decorative only: the catalog markers remain the authoritative layer.
 */
export default function BeltScene() {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const r = seededRandom(20260214);
    const n = 900;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const t = r() * Math.PI * 2;
      const rad = BELT_R + (r() - 0.5) * 5;
      arr[i * 3] = rad * Math.cos(t);
      arr[i * 3 + 1] = (r() - 0.5) * 0.9;
      arr[i * 3 + 2] = rad * 0.5 * Math.sin(t);
    }
    return arr;
  }, []);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });

  return (
    <BeltFit>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#2DD4BF"
          size={0.06}
          sizeAttenuation
          transparent
          opacity={0.32}
          depthWrite={false}
        />
      </points>
    </BeltFit>
  );
}
