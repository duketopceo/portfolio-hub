"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ringScale, type OrbitSlot } from "@/components/scene/orbit-layout";

/** Survey linework: orbit hairlines, focus arc, limbs, meridians, line-art
 *  rings. Everything shares one or two LineSegments draw calls. */

export const TEAL = new THREE.Color("#2DD4BF");
export const HAIRLINE = new THREE.Color("#E9ECEF");
const SIGNAL = new THREE.Color("#FF5C1A");

export type Vec3 = [number, number, number];

export function ellipsePoints(rx: number, rz: number, segments = 128) {
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

function scaleLimb(limb: Vec3[], k: number): Vec3[] {
  return limb.map(([x, y, z]) => [x * k, y * k, z] as Vec3);
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

export interface BodyInfo {
  slot: OrbitSlot;
  radius: number;
  tint: THREE.Color;
  limb: Vec3[];
  rings: { tilt: number; opacity: number }[];
  isPrivate: boolean;
  meridians: number;
  /** Limb outline scale: 1 on the line-art path, just outside the lit disc
   *  when a real 3D body is drawn (avoids z-fighting at the silhouette). */
  limbScale: number;
}

/** Static survey lines: orbit hairlines, focus arc and planet rings. */
export function StaticLines({
  bodies,
  ringMain,
  ringOuter,
  ringInner,
  focusSlot,
  focusIndex,
  rx,
  rz,
  drawRings,
}: {
  /** Line-art ring loops; off when real 3D rings are drawn. */
  drawRings: boolean;
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
      if (!drawRings) return;
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
  }, [bodies, ringMain, ringOuter, ringInner, focusSlot, focusIndex, rx, rz, drawRings]);
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
export function BodyLines({ bodies, focusIndex }: { bodies: BodyInfo[]; focusIndex: number }) {
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
      addBillboard(() =>
        b.line(scaleLimb(body.limb, body.limbScale), color, focused ? 0.95 : body.limbScale > 1 ? 0.5 : 0.95)
      );
      // 1px lines only: the focused limb is doubled outward to read heavier.
      if (focused) {
        addBillboard(() =>
          b.line(scaleLimb(body.limb, body.limbScale * 1.05), color, 0.95)
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

