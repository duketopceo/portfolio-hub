"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { setUniform } from "@/components/scene/uniforms";
import StarfieldScene from "@/components/scene/StarfieldScene";
import BlackHole, { createBlackHoleMaterial } from "@/components/scene/BlackHole";
import {
  bodyOpacity,
  bodyPlacement,
  layoutVariant,
  scrollOffset,
} from "@/lib/cosmos-layout";
import { tierSettings, type CosmosTier } from "@/lib/cosmos-quality";

/** Camera distance used by SiteBackground; the hole sits at a known depth. */
const CAMERA_Z = 42;
const HOLE_Z = -3;
/** Dim on purpose: the hole is background, text is drawn over it. */
const HOLE_MAX_OPACITY = 0.5;

/**
 * The whole background in one canvas: a quiet starfield and one small,
 * dim, off-centre black hole placed from the shared layout table. The hole
 * drifts up with the page and is culled once off screen. `tier` is the
 * current rung of the quality ladder (cosmos-quality.ts).
 */
export default function CosmosScene({ tier = "high" }: { tier?: CosmosTier }) {
  const { viewport } = useThree();
  const holeMaterial = useMemo(() => createBlackHoleMaterial(), []);
  const holeGroup = useRef<THREE.Group>(null);
  const settings = tierSettings(tier);

  useEffect(() => () => holeMaterial.dispose(), [holeMaterial]);
  useEffect(() => {
    setUniform(holeMaterial, "uDetail", settings.detail);
  }, [holeMaterial, settings.detail]);

  useFrame(({ clock }) => {
    const vw = viewport.width;
    const vh = viewport.height;
    const variant = layoutVariant(vw / vh, 1);
    const minDim = Math.min(vw, vh);
    const sy = typeof window === "undefined" ? 0 : window.scrollY;
    const innerH = typeof window === "undefined" ? 1 : window.innerHeight;

    const hole = holeGroup.current;
    if (!hole) return;
    const p = bodyPlacement(variant, "blackhole");
    // Behind the focal plane the hole is smaller on screen; compensate so
    // layout fractions mean the same thing at this depth.
    const k = (CAMERA_Z - HOLE_Z) / CAMERA_Z;
    const off = scrollOffset(sy, innerH, p.parallax);
    hole.position.set((p.x - 0.5) * vw * k, (0.5 - (p.y + off)) * vh * k, HOLE_Z);
    hole.scale.setScalar((p.size * minDim * k) / 2);
    const opacity = bodyOpacity(p.y + off + (p.size * minDim) / 2 / vh);
    hole.visible = opacity > 0.01;
    setUniform(holeMaterial, "uTime", clock.getElapsedTime());
    setUniform(holeMaterial, "uOpacity", opacity * HOLE_MAX_OPACITY);
  });

  return (
    <>
      <StarfieldScene links={settings.links} />
      <group ref={holeGroup}>
        <BlackHole material={holeMaterial} />
      </group>
    </>
  );
}
