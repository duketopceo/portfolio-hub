"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";
import type { EnrichedProject } from "@/lib/types";
import { useSceneOverlay } from "@/components/scene/SceneFrame";
import {
  moonOffset,
  orbitLayout,
  ringScale,
  type OrbitSlot,
} from "@/components/scene/orbit-layout";
import { createContourMaterial, setUniform } from "@/components/scene/contour-shader";
import {
  isFocalSlug,
  limbPoints,
  meridianCount,
  planetBodyRadius,
  resolvePlanetVisual,
  type ResolvedPlanetVisual,
} from "@/lib/planet-visual";
import { readRendererString, shouldUseShader } from "@/lib/render-capability";
import plate from "@/components/planet/survey-plate.module.css";

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
const ORIGIN = new THREE.Vector3();
const SIGHTING_POINTS: [number, number, number][] = [
  [0, 0, 0],
  [0, 0, 0],
];
const Z_INDEX_RANGE: [number, number] = [12, 4];

function ellipsePoints(rx: number, rz: number, segments = 128) {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    pts.push([rx * Math.cos(t), 0, rz * Math.sin(t)]);
  }
  return pts;
}


const SIGNAL = new THREE.Color("#FF5C1A");

/** Great circle in the XY plane, used as a meridian once the group spins. */
function circlePoints(radius: number, segments = 48) {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    pts.push([radius * Math.cos(t), radius * Math.sin(t), 0]);
  }
  return pts;
}

function ringLoop(radius: number, tiltDeg: number) {
  const tilt = THREE.MathUtils.degToRad(tiltDeg);
  const c = Math.cos(tilt);
  const s = Math.sin(tilt);
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= 64; i++) {
    const t = (i / 64) * Math.PI * 2;
    const x = radius * Math.cos(t);
    const z = radius * 0.38 * Math.sin(t);
    pts.push([x * c, x * s, z]);
  }
  return pts;
}

interface SurveyBodyProps {
  visual: ResolvedPlanetVisual;
  slot: OrbitSlot;
  focused: boolean;
  focal: boolean;
  isPrivate: boolean;
  shader: boolean;
  seed: number;
}

/**
 * Decorative survey-plate body: limb, meridians, rings, optional contour fill.
 * PlanetNode (DOM) stays the interactive layer at the same slot.
 */
function SurveyBody({
  visual,
  slot,
  focused,
  focal,
  isPrivate,
  shader,
  seed,
}: SurveyBodyProps) {
  const billboard = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const radius = planetBodyRadius(visual.size);
  const tint = useMemo(
    () => new THREE.Color(visual.color).lerp(HAIRLINE, 0.55),
    [visual.color]
  );
  const limb = useMemo(
    () => limbPoints(visual.shape, radius),
    [visual.shape, radius]
  );
  const meridian = useMemo(() => circlePoints(radius), [radius]);
  const meridians = meridianCount(focal, shader);
  const contour = useMemo(
    () => (focal && shader ? createContourMaterial(TEAL.clone(), seed) : null),
    [focal, shader, seed]
  );
  useEffect(() => () => contour?.dispose(), [contour]);

  useFrame((state, dt) => {
    billboard.current?.quaternion.copy(state.camera.quaternion);
    if (spin.current) spin.current.rotation.y += dt * 0.35;
    if (contour) setUniform(contour, "uTime", state.clock.elapsedTime);
  });

  const color = focused ? TEAL : tint;
  const width = focused ? 2 : 1;

  return (
    <group position={[slot.x, 0, slot.z]}>
      {contour && (
        <mesh material={contour} scale={0.96}>
          <icosahedronGeometry args={[radius, 4]} />
        </mesh>
      )}
      <group ref={billboard}>
        <Line points={limb} color={color} lineWidth={width} transparent opacity={0.95} />
        {isPrivate && (
          <Line
            points={[
              [radius * 1.35, radius * 0.9, 0],
              [radius * 1.35, radius * 1.35, 0],
              [radius * 1.8, radius * 1.35, 0],
            ]}
            color={SIGNAL}
            lineWidth={1}
          />
        )}
      </group>
      <group ref={spin}>
        {Array.from({ length: meridians }, (_, k) => (
          <group key={k} rotation-y={(k * Math.PI) / meridians}>
            <Line
              points={meridian}
              color={color}
              lineWidth={1}
              transparent
              opacity={focused ? 0.7 : 0.4}
            />
          </group>
        ))}
      </group>
      {visual.rings.map((ring, i) => (
        <Line
          key={i}
          points={ringLoop(radius * (1.75 + i * 0.3), ring.tilt ?? 0)}
          color={tint}
          lineWidth={1}
          transparent
          opacity={(ring.opacity ?? 0.3) * (focused ? 1.6 : 1.1)}
        />
      ))}
    </group>
  );
}

/** Highlight arc on the focused body's orbit. */
function OrbitArc({
  slot,
  rx,
  rz,
}: {
  slot: OrbitSlot;
  rx: number;
  rz: number;
}) {
  const k = ringScale(slot.ring);
  const pts = useMemo(() => {
    const out: [number, number, number][] = [];
    const span = 0.38;
    for (let i = 0; i <= 24; i++) {
      const a = slot.angle - span + (2 * span * i) / 24;
      out.push([rx * k * Math.cos(a), 0, rz * k * Math.sin(a)]);
    }
    return out;
  }, [slot.angle, k, rx, rz]);
  return <Line points={pts} color={TEAL} lineWidth={2} transparent opacity={0.85} />;
}

/** One InstancedMesh for every moon across all planets. */
function Moons({
  slots,
  visuals,
}: {
  slots: OrbitSlot[];
  visuals: ResolvedPlanetVisual[];
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
      const r = planetBodyRadius(v.size);
      v.moons.forEach((m, index) => {
        list.push({
          planet,
          index,
          count: v.moons.length,
          radius: r * 1.9 + index * 0.3,
          size: 0.1 + (m.kind === "live" ? 0.03 : 0),
          color: m.kind === "live" ? TEAL : new THREE.Color(v.color).lerp(HAIRLINE, 0.4),
        });
      });
    });
    return list;
  }, [visuals]);
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
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial />
    </instancedMesh>
  );
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
function SightingLine({ target }: { target: THREE.Vector3 }) {
  const lineRef = useRef<ComponentRef<typeof Line>>(null);
  const tip = useRef(new THREE.Vector3());
  const pos = useRef(new Float32Array(6));
  // damp3 returns false once converged — skip the geometry write at rest.
  const dirty = useRef(true);
  useFrame((_, dt) => {
    const animating = easing.damp3(tip.current, target, 0.28, dt);
    if (!animating && !dirty.current) return;
    dirty.current = animating;
    const line = lineRef.current;
    if (!line) return;
    pos.current[3] = tip.current.x;
    pos.current[4] = tip.current.y;
    pos.current[5] = tip.current.z;
    line.geometry.setPositions(pos.current);
    line.computeLineDistances();
  });
  return (
    <Line
      ref={lineRef}
      points={SIGHTING_POINTS}
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
 *
 * The margin is measured, not guessed: labels are absolutely positioned
 * and can extend well past the wrap's own box, so a fixed reserve
 * under-fits edge markers (#46). Re-measure periodically — markers mount
 * asynchronously through the Html portal.
 */
function FitScale({
  rx,
  overlay,
  children,
}: {
  rx: number;
  overlay: HTMLElement | null;
  children: ReactNode;
}) {
  const { viewport, size } = useThree();
  const [marginPx, setMarginPx] = useState(48);
  const tick = useRef(0);
  useFrame(() => {
    if (!overlay || tick.current++ % 30 !== 0) return;
    let half = 48;
    overlay
      .querySelectorAll(".planet-node__label, .planet-node__body")
      .forEach((el) => {
        half = Math.max(half, (el as HTMLElement).offsetWidth / 2 + 8);
      });
    if (Math.abs(half - marginPx) > 2) setMarginPx(half);
  });
  const marginWorld = marginPx * (viewport.width / Math.max(size.width, 1));
  const s = Math.min(1, (viewport.width / 2 - marginWorld) / rx);
  return <group scale={THREE.MathUtils.clamp(s, 0.2, 1)}>{children}</group>;
}

/** Subtle pointer parallax on the camera. */
function CameraDrift() {
  const target = useRef(new THREE.Vector3()).current;
  useFrame((state, dt) => {
    target.set(state.pointer.x * 2.2, 16 + state.pointer.y * 1.4, 30);
    easing.damp3(state.camera.position, target, 0.4, dt);
    state.camera.lookAt(0, -1.5, 0);
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
  const gl = useThree((state) => state.gl);
  const shader = useMemo(
    () => shouldUseShader(readRendererString(gl.getContext())),
    [gl]
  );
  const slots = useMemo(
    () => orbitLayout(projects.length, rx, rz),
    [projects.length, rx, rz]
  );
  const visuals = useMemo(
    () => projects.map((p) => resolvePlanetVisual(p, "primary")),
    [projects]
  );

  const ringScales = useMemo(
    () => Array.from(new Set(slots.map((s) => s.ring))).sort(),
    [slots]
  );
  const ringMain = useMemo(
    () =>
      ringScales.map((r) =>
        ellipsePoints(rx * ringScale(r), rz * ringScale(r))
      ),
    [ringScales, rx, rz]
  );
  const ringOuter = useMemo(() => ellipsePoints(rx + 2.5, rz + 1.4), [rx, rz]);
  const ringInner = useMemo(
    () =>
      ellipsePoints(
        rx * ringScale(Math.max(...ringScales, 0)) - 4.5,
        rz * ringScale(Math.max(...ringScales, 0)) - 2.6
      ),
    [rx, rz, ringScales]
  );
  const portal = useMemo(
    () => (overlay ? { current: overlay } : undefined),
    [overlay]
  );

  const focusSlot = slots[focusIndex];
  const focused = focusSlot
    ? new THREE.Vector3(focusSlot.x, 0, focusSlot.z)
    : ORIGIN;
  const focusedVec = useMemo(
    () => focused.clone(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusSlot?.x, focusSlot?.z]
  );

  return (
    <>
      <CameraDrift />
      <FitScale rx={rx} overlay={overlay}>
        <SurveySphere />
        <FocusBeacon target={focusedVec} />
        <SightingLine target={focusedVec} />

        {/* Orbit hairlines — outer survey path, one per body ring, inner ring */}
        <Line points={ringOuter} color={HAIRLINE} transparent opacity={0.14} lineWidth={1} />
        {ringMain.map((pts, i) => (
          <Line
            key={i}
            points={pts}
            color={HAIRLINE}
            transparent
            opacity={0.3}
            lineWidth={1}
            dashed
            dashSize={0.5}
            gapSize={0.55}
          />
        ))}
        <Line points={ringInner} color={HAIRLINE} transparent opacity={0.08} lineWidth={1} dashed dashSize={1.2} gapSize={0.8} />
        {focusSlot && <OrbitArc slot={focusSlot} rx={rx} rz={rz} />}

        {/* Decorative survey-plate bodies — PlanetNode markers below are the
            interactive layer at the same slots. */}
        {projects.map((p, i) => (
          <SurveyBody
            key={p.slug}
            visual={visuals[i]}
            slot={slots[i]}
            focused={i === focusIndex}
            focal={isFocalSlug(p.slug)}
            isPrivate={!!p.private}
            shader={shader}
            seed={i * 3.7 + 1.3}
          />
        ))}
        <Moons slots={slots} visuals={visuals} />

        {/* Orbit markers — DOM anchors portaled to the scene overlay */}
        {projects.map((p, i) => (
          <Html
            key={p.slug}
            position={[slots[i].x, 0, slots[i].z]}
            center
            portal={portal}
            zIndexRange={Z_INDEX_RANGE}
          >
            <div
              className={plate.live}
              data-label-above={slots[i].labelAbove ? "true" : undefined}
            >
              {renderMarker(p, i)}
            </div>
          </Html>
        ))}
      </FitScale>
    </>
  );
}
