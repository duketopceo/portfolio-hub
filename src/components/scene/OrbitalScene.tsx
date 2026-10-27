"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
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
  planetSurfaceParams,
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
const Z_INDEX_RANGE: [number, number] = [12, 4];
const SIGNAL = new THREE.Color("#FF5C1A");
const LIGHT_LIFT = new THREE.Vector3(0, 0.45, 0.8);

type Vec3 = [number, number, number];

function ellipsePoints(rx: number, rz: number, segments = 128) {
  const pts: Vec3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    pts.push([rx * Math.cos(t), 0, rz * Math.sin(t)]);
  }
  return pts;
}

/** Great circle in the XY plane, used as a meridian once the group spins. */
function circlePoints(radius: number, segments = 48) {
  const pts: Vec3[] = [];
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
  const pts: Vec3[] = [];
  for (let i = 0; i <= 64; i++) {
    const t = (i / 64) * Math.PI * 2;
    const x = radius * Math.cos(t);
    const z = radius * 0.38 * Math.sin(t);
    pts.push([x * c, x * s, z]);
  }
  return pts;
}

/** Highlight arc on the focused body's orbit. */
function orbitArcPoints(slot: OrbitSlot, rx: number, rz: number, grow = 1) {
  const k = ringScale(slot.ring) * grow;
  const out: Vec3[] = [];
  const span = 0.38;
  for (let i = 0; i <= 24; i++) {
    const a = slot.angle - span + (2 * span * i) / 24;
    out.push([rx * k * Math.cos(a), 0, rz * k * Math.sin(a)]);
  }
  return out;
}

/**
 * Accumulates polylines as GL_LINES segment pairs with per-vertex RGBA, so
 * every survey line in the scene shares one LineSegments (one draw call).
 * Plain 1px lines — Line2/fat lines cost a draw call and a quad strip per
 * polyline, which a CPU rasteriser pays for on every frame.
 */
class SegmentBatch {
  pos: number[] = [];
  col: number[] = [];

  line(pts: Vec3[], color: THREE.Color, alpha: number, offset: Vec3 = [0, 0, 0]) {
    for (let i = 0; i < pts.length - 1; i++) {
      this.segment(pts[i], pts[i + 1], color, alpha, offset);
    }
  }

  /** Dash pattern walked along the polyline from its first point. */
  dashed(pts: Vec3[], dash: number, gap: number, color: THREE.Color, alpha: number) {
    const period = dash + gap;
    let travelled = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay, az] = pts[i];
      const [bx, by, bz] = pts[i + 1];
      const len = Math.hypot(bx - ax, by - ay, bz - az);
      if (len === 0) continue;
      let d = 0;
      while (d < len) {
        const phase = (travelled + d) % period;
        const step = Math.min(phase < dash ? dash - phase : period - phase, len - d);
        if (phase < dash) {
          const t0 = d / len;
          const t1 = (d + step) / len;
          this.segment(
            [ax + (bx - ax) * t0, ay + (by - ay) * t0, az + (bz - az) * t0],
            [ax + (bx - ax) * t1, ay + (by - ay) * t1, az + (bz - az) * t1],
            color,
            alpha
          );
        }
        d += step;
      }
      travelled += len;
    }
  }

  private segment(a: Vec3, b: Vec3, color: THREE.Color, alpha: number, o: Vec3 = [0, 0, 0]) {
    this.pos.push(a[0] + o[0], a[1] + o[1], a[2] + o[2], b[0] + o[0], b[1] + o[1], b[2] + o[2]);
    this.col.push(color.r, color.g, color.b, alpha, color.r, color.g, color.b, alpha);
  }
}

function useBatchGeometry(batch: SegmentBatch, dynamic: boolean) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const position = new THREE.BufferAttribute(new Float32Array(batch.pos), 3);
    if (dynamic) position.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute("position", position);
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(batch.col), 4));
    return g;
  }, [batch, dynamic]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

const LINE_MATERIAL_PROPS = {
  vertexColors: true,
  transparent: true,
  depthWrite: false,
} as const;

interface BodyInfo {
  slot: OrbitSlot;
  radius: number;
  tint: THREE.Color;
  limb: Vec3[];
  rings: { tilt: number; opacity: number }[];
  isPrivate: boolean;
  meridians: number;
}

/** Static survey lines: orbit hairlines, focus arc and planet rings. */
function StaticLines({
  bodies,
  ringMain,
  ringOuter,
  ringInner,
  focusSlot,
  focusIndex,
  rx,
  rz,
}: {
  bodies: BodyInfo[];
  ringMain: Vec3[][];
  ringOuter: Vec3[];
  ringInner: Vec3[];
  focusSlot: OrbitSlot | undefined;
  focusIndex: number;
  rx: number;
  rz: number;
}) {
  const batch = useMemo(() => {
    const b = new SegmentBatch();
    b.line(ringOuter, HAIRLINE, 0.14);
    ringMain.forEach((pts) => b.dashed(pts, 0.5, 0.55, HAIRLINE, 0.3));
    b.dashed(ringInner, 1.2, 0.8, HAIRLINE, 0.08);
    if (focusSlot) {
      // 1px lines only: the focus arc is doubled radially to read heavier.
      b.line(orbitArcPoints(focusSlot, rx, rz), TEAL, 0.85);
      b.line(orbitArcPoints(focusSlot, rx, rz, 1.012), TEAL, 0.85);
    }
    bodies.forEach((body, bi) => {
      body.rings.forEach((ring, i) => {
        b.line(
          ringLoop(body.radius * (1.75 + i * 0.3), ring.tilt),
          body.tint,
          Math.min(1, ring.opacity * (bi === focusIndex ? 1.6 : 1.1)),
          [body.slot.x, 0, body.slot.z]
        );
      });
    });
    return b;
  }, [bodies, ringMain, ringOuter, ringInner, focusSlot, focusIndex, rx, rz]);
  const geometry = useBatchGeometry(batch, false);
  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial {...LINE_MATERIAL_PROPS} />
    </lineSegments>
  );
}

/**
 * Per-frame survey lines: billboarded limbs (face the camera) and spinning
 * meridians. One LineSegments; positions are rewritten from templates each
 * frame, which is trivial CPU next to a draw call per body.
 */
function BodyLines({ bodies, focusIndex }: { bodies: BodyInfo[]; focusIndex: number }) {
  const { batch, billboard, meridian } = useMemo(() => {
    const b = new SegmentBatch();
    const bb: { start: number; local: number[]; cx: number; cz: number }[] = [];
    const mer: { start: number; local: number[]; cx: number; cz: number; phase: number }[] = [];
    const take = (fn: () => void) => {
      const start = b.pos.length;
      fn();
      return { start, local: b.pos.slice(start) };
    };
    bodies.forEach((body, bi) => {
      const focused = bi === focusIndex;
      const color = focused ? TEAL : body.tint;
      const { slot, radius } = body;
      const addBillboard = (fn: () => void) => bb.push({ ...take(fn), cx: slot.x, cz: slot.z });
      addBillboard(() => b.line(body.limb, color, 0.95));
      // 1px lines only: the focused limb is doubled outward to read heavier.
      if (focused) {
        addBillboard(() =>
          b.line(body.limb.map(([x, y, z]) => [x * 1.05, y * 1.05, z] as Vec3), color, 0.95)
        );
      }
      if (body.isPrivate) {
        addBillboard(() =>
          b.line(
            [
              [radius * 1.35, radius * 0.9, 0],
              [radius * 1.35, radius * 1.35, 0],
              [radius * 1.8, radius * 1.35, 0],
            ],
            SIGNAL,
            1
          )
        );
      }
      const circle = circlePoints(radius);
      for (let k = 0; k < body.meridians; k++) {
        mer.push({
          ...take(() => b.line(circle, color, focused ? 0.7 : 0.4)),
          cx: slot.x,
          cz: slot.z,
          phase: (k * Math.PI) / body.meridians,
        });
      }
    });
    return { batch: b, billboard: bb, meridian: mer };
  }, [bodies, focusIndex]);
  const geometry = useBatchGeometry(batch, true);
  const spin = useRef(0);
  const lastQuat = useRef(new THREE.Quaternion(0, 0, 0, 0));
  const v = useMemo(() => new THREE.Vector3(), []);
  // A rebuilt geometry has stale limb positions; force the billboard pass.
  useEffect(() => {
    lastQuat.current.set(0, 0, 0, 0);
  }, [geometry]);

  useFrame((state, dt) => {
    spin.current += dt * 0.35;
    const position = geometry.getAttribute("position") as THREE.BufferAttribute;
    const out = position.array as Float32Array;
    const q = state.camera.quaternion;
    if (!q.equals(lastQuat.current)) {
      lastQuat.current.copy(q);
      for (const item of billboard) {
        for (let i = 0; i < item.local.length; i += 3) {
          v.set(item.local[i], item.local[i + 1], item.local[i + 2]).applyQuaternion(q);
          out[item.start + i] = v.x + item.cx;
          out[item.start + i + 1] = v.y;
          out[item.start + i + 2] = v.z + item.cz;
        }
      }
    }
    for (const item of meridian) {
      const a = spin.current + item.phase;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      for (let i = 0; i < item.local.length; i += 3) {
        // Rotation about Y of a circle drawn in the XY plane.
        const x = item.local[i];
        out[item.start + i] = x * cos + item.cx;
        out[item.start + i + 1] = item.local[i + 1];
        out[item.start + i + 2] = -x * sin + item.cz;
      }
    }
    position.needsUpdate = true;
  });

  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial {...LINE_MATERIAL_PROPS} />
    </lineSegments>
  );
}

/** Lit survey-contour surface for one body (real GPUs only). The light sits
 *  at the map's centre, lifted toward the camera so far-side bodies are not
 *  fully backlit. No glow: the terminator is a hard step in the shader. */
function ContourBody({
  slot,
  radius,
  slug,
  color,
}: {
  slot: OrbitSlot;
  radius: number;
  slug: string;
  color: THREE.Color;
}) {
  // Material depends on the body's identity only; the light is a uniform
  // updated in place so a stage resize never recompiles the shader.
  const hex = color.getHex();
  const contour = useMemo(() => {
    const surface = planetSurfaceParams(slug);
    return createContourMaterial({
      line: new THREE.Color(hex),
      seed: surface.seed,
      bands: surface.bands,
      spin: surface.spin,
    });
  }, [slug, hex]);
  useEffect(() => {
    const light = contour.uniforms.uLight.value as THREE.Vector3;
    light
      .set(-slot.x, 0, -slot.z)
      .normalize()
      .multiplyScalar(0.85)
      .add(LIGHT_LIFT)
      .normalize();
  }, [contour, slot.x, slot.z]);
  useEffect(() => () => contour.dispose(), [contour]);
  useFrame((state) => setUniform(contour, "uTime", state.clock.elapsedTime));
  return (
    <mesh material={contour} position={[slot.x, 0, slot.z]} scale={0.96}>
      <icosahedronGeometry args={[radius, 4]} />
    </mesh>
  );
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
  const [marginPx, setMarginPx] = useState(size.width > 560 ? 72 : 44);
  const tick = useRef(0);
  useFrame(() => {
    if (!overlay || tick.current++ % 30 !== 0) return;
    let half = size.width > 560 ? 72 : 44;
    overlay
      .querySelectorAll(".planet-node__label, .planet-node__body")
      .forEach((el) => {
        half = Math.max(half, (el as HTMLElement).offsetWidth / 2 + 8);
      });
    if (Math.abs(half - marginPx) > 2) setMarginPx(half);
  });
  const marginWorld = marginPx * (viewport.width / Math.max(size.width, 1));
  // Fit the outer orbit hairline (rx + 2.5), not just the body ring.
  const s = Math.min(1, (viewport.width / 2 - marginWorld) / (rx + 2.5));
  return <group scale={THREE.MathUtils.clamp(s, 0.2, 1)}>{children}</group>;
}

/** Subtle pointer parallax on the camera. */
function CameraDrift() {
  const target = useRef(new THREE.Vector3()).current;
  useFrame((state, dt) => {
    target.set(state.pointer.x * 2.2, 18 + state.pointer.y * 1.4, 26);
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

  const bodies = useMemo<BodyInfo[]>(
    () =>
      projects.map((p, i) => {
        const visual = visuals[i];
        const radius = planetBodyRadius(visual.size);
        return {
          slot: slots[i],
          radius,
          tint: new THREE.Color(visual.color).lerp(HAIRLINE, 0.55),
          limb: limbPoints(visual.shape, radius),
          rings: visual.rings.map((ring) => ({
            tilt: ring.tilt ?? 0,
            opacity: ring.opacity ?? 0.3,
          })),
          isPrivate: !!p.private,
          meridians: meridianCount(isFocalSlug(p.slug), shader),
        };
      }),
    [projects, visuals, slots, shader]
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
  const focusX = focusSlot?.x;
  const focusZ = focusSlot?.z;
  const focusedVec = useMemo(
    () =>
      focusX === undefined || focusZ === undefined
        ? ORIGIN.clone()
        : new THREE.Vector3(focusX, 0, focusZ),
    [focusX, focusZ]
  );

  return (
    <>
      <CameraDrift />
      <FitScale rx={rx} overlay={overlay}>
        <SurveySphere />
        <FocusBeacon target={focusedVec} />
        <SightingLine target={focusedVec} />

        <StaticLines
          bodies={bodies}
          ringMain={ringMain}
          ringOuter={ringOuter}
          ringInner={ringInner}
          focusSlot={focusSlot}
          focusIndex={focusIndex}
          rx={rx}
          rz={rz}
        />
        {/* Decorative survey-plate bodies — PlanetNode markers below are the
            interactive layer at the same slots. */}
        <BodyLines bodies={bodies} focusIndex={focusIndex} />
        {shader &&
          projects.map((p, i) => (
            <ContourBody
              key={p.slug}
              slot={slots[i]}
              radius={bodies[i].radius}
              slug={p.slug}
              color={bodies[i].tint}
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
