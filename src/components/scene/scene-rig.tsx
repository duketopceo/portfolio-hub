"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import * as THREE from "three";

/** Camera + lighting rig: stage fit, pointer parallax and the star. */

/** Star position in the orbit group's frame: above the map's centre and a
 *  little toward the camera, so near-side bodies are not fully backlit. */
export const STAR_POSITION = new THREE.Vector3(0, 8, 2);

const StarContext = createContext<{ current: THREE.Object3D | null } | null>(null);

/** Ref to the Object3D that marks the star (read its world position). */
export function useStar() {
  return useContext(StarContext);
}

/**
 * The one key light. Custom planet shaders read its world position from the
 * ref; the point light (no falloff) and a soft ambient light the standard
 * materials in the scene (moons) from the same place.
 */
export function Star({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Object3D | null>(null);
  return (
    <StarContext.Provider value={ref}>
      <group ref={ref} position={STAR_POSITION} />
      <pointLight position={STAR_POSITION} intensity={3.2} decay={0} color="#F4F7FA" />
      <ambientLight intensity={0.35} color="#C7D2DC" />
      {children}
    </StarContext.Provider>
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
export function FitScale({
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
export function CameraDrift() {
  const target = useRef(new THREE.Vector3()).current;
  useFrame((state, dt) => {
    target.set(state.pointer.x * 2.2, 18 + state.pointer.y * 1.4, 26);
    easing.damp3(state.camera.position, target, 0.4, dt);
    state.camera.lookAt(0, -1.5, 0);
  });
  return null;
}

