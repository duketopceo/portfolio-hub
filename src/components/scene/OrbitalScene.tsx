"use client";

import {
  useMemo,
  useRef,
  type ComponentRef,
  type ReactNode,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";
import type { EnrichedProject } from "@/lib/types";
import { useSceneOverlay } from "@/components/scene/SceneFrame";

interface OrbitalSceneProps {
  projects: EnrichedProject[];
  focusIndex: number;
  /** rx / rz orbit radii in scene units (≈ rem). */
  rx: number;
  rz: number;
  /** Renders the DOM marker for project i — anchored at its orbit point. */
  renderMarker: (project: EnrichedProject, index: number) => ReactNode;
}

const TEAL = new THREE.Color("#2DD4BF");
const HAIRLINE = new THREE.Color("#E9ECEF");

function ellipsePoints(rx: number, rz: number, segments = 128) {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    pts.push([rx * Math.cos(t), 0, rz * Math.sin(t)]);
  }
  return pts;
}

/** Particle shell at the orbit origin — the body under survey. */
function SurveySphere() {
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
function FocusBeacon({ target }: { target: THREE.Vector3 }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      easing.damp3(ref.current.position, target, 0.28, dt);
    }
  });
  return (
    <group ref={ref} position={target.toArray()}>
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
function SightingLine({ target }: { target: THREE.Vector3 }) {
  const lineRef = useRef<ComponentRef<typeof Line>>(null);
  const tip = useRef(new THREE.Vector3());
  useFrame((_, dt) => {
    easing.damp3(tip.current, target, 0.28, dt);
    const line = lineRef.current;
    if (!line) return;
    line.geometry.setPositions([0, 0, 0, tip.current.x, tip.current.y, tip.current.z]);
    line.computeLineDistances();
  });
  return (
    <Line
      ref={lineRef}
      points={[
        [0, 0, 0],
        [0, 0, 0],
      ]}
      color={TEAL}
      lineWidth={1}
      dashed
      dashSize={0.4}
      gapSize={0.3}
      transparent
      opacity={0.5}
    />
  );
}

/**
 * Scales the orbit group to fit the stage — at narrow viewports the fixed
 * rem radii would push focusable markers off-screen. Shrink the whole
 * composition instead: DOM markers stay in-frame and reachable.
 */
function FitScale({ rx, children }: { rx: number; children: ReactNode }) {
  const { viewport, size } = useThree();
  // Marker labels are DOM px regardless of scene scale — reserve their
  // half-width (plus breathing room) as world units before fitting.
  const marginPx = 48;
  const marginWorld = marginPx * (viewport.width / Math.max(size.width, 1));
  const s = Math.min(1, (viewport.width / 2 - marginWorld) / rx);
  return <group scale={Math.max(s, 0.2)}>{children}</group>;
}

/** Subtle pointer parallax on the camera. */
function CameraDrift() {
  const { camera, pointer } = useThree();
  useFrame((_, dt) => {
    easing.damp3(
      camera.position,
      [pointer.x * 2.2, 16 + pointer.y * 1.4, 30],
      0.4,
      dt
    );
    camera.lookAt(0, -1.5, 0);
  });
  return null;
}

export default function OrbitalScene({
  projects,
  focusIndex,
  rx,
  rz,
  renderMarker,
}: OrbitalSceneProps) {
  const overlay = useSceneOverlay();
  const positions = useMemo(() => {
    const n = projects.length;
    return projects.map((_, i) => {
      const theta = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(n, 1);
      return new THREE.Vector3(rx * Math.cos(theta), 0, rz * Math.sin(theta));
    });
  }, [projects, rx, rz]);

  const focused = positions[focusIndex] ?? new THREE.Vector3();

  return (
    <>
      <CameraDrift />
      <FitScale rx={rx}>
        <SurveySphere />
        <FocusBeacon target={focused} />
        <SightingLine target={focused} />

        {/* Orbit rings — outer survey path, dashed telemetry path, inner ring */}
        <Line points={ellipsePoints(rx + 2.5, rz + 1.4)} color={HAIRLINE} transparent opacity={0.14} lineWidth={1} />
        <Line points={ellipsePoints(rx, rz)} color={TEAL} transparent opacity={0.3} lineWidth={1} dashed dashSize={0.5} gapSize={0.55} />
        <Line points={ellipsePoints(rx - 4.5, rz - 2.6)} color={HAIRLINE} transparent opacity={0.08} lineWidth={1} dashed dashSize={1.2} gapSize={0.8} />

        {/* Bodies — real DOM markers anchored to orbit points */}
        {projects.map((p, i) => (
          <Html
            key={p.slug}
            position={positions[i].toArray()}
            center
            portal={overlay ? { current: overlay } : undefined}
            zIndexRange={[12, 4]}
          >
            {renderMarker(p, i)}
          </Html>
        ))}
      </FitScale>
    </>
  );
}
