"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import * as THREE from "three";
import { TEAL } from "@/components/scene/survey-lines";

/** Focus furniture: the survey sphere at the origin, the beacon under the
 *  focused body and the sighting line to it. */

/** Particle shell at the orbit origin — the body under survey. */
export function SurveySphere() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const n = 420;
    const arr = new Float32Array(n * 3);
    const R = 2.4;
    for (let i = 0; i < n; i++) {
      // Fibonacci sphere distribution
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = i * 2.39996323;
      arr[i * 3] = R * r * Math.cos(th);
      arr[i * 3 + 1] = R * y;
      arr[i * 3 + 2] = R * r * Math.sin(th);
    }
    return arr;
  }, []);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.12;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={TEAL}
        size={0.075}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </points>
  );
}

/** Spring-damped beacon that sits under the focused marker. */
export function FocusBeacon({ target }: { target: THREE.Vector3 }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      easing.damp3(ref.current.position, target, 0.28, dt);
    }
  });
  return (
    <group ref={ref}>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.9, 1.05, 48]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.25, 1.28, 48]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Sighting line from the origin to the focused body. */
export function SightingLine({ target }: { target: THREE.Vector3 }) {
  const tip = useRef(new THREE.Vector3());
  // damp3 returns false once converged — skip the geometry write at rest.
  const dirty = useRef(true);
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
    return new THREE.Line(
      g,
      new THREE.LineDashedMaterial({
        color: TEAL,
        dashSize: 0.4,
        gapSize: 0.3,
        transparent: true,
        opacity: 0.5,
      })
    );
  }, []);
  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    },
    [line]
  );
  useFrame((_, dt) => {
    const animating = easing.damp3(tip.current, target, 0.28, dt);
    if (!animating && !dirty.current) return;
    dirty.current = animating;
    const position = line.geometry.getAttribute("position") as THREE.BufferAttribute;
    position.setXYZ(1, tip.current.x, tip.current.y, tip.current.z);
    position.needsUpdate = true;
    line.computeLineDistances();
  });
  return <primitive object={line} frustumCulled={false} />;
}

