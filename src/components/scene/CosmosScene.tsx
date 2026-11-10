"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { setUniform } from "@/components/scene/uniforms";
import StarfieldScene, { setLens, type LensUniforms } from "@/components/scene/StarfieldScene";
import BlackHole, { createBlackHoleMaterial } from "@/components/scene/BlackHole";
import {
  bodyOpacity,
  bodyPlacement,
  layoutVariant,
  scrollOffset,
} from "@/lib/cosmos-layout";
import { tierSettings, type CosmosTier } from "@/lib/cosmos-quality";

/** Camera distance (CosmosLive places the camera here); the hole sits at a known depth. */
export const CAMERA_Z = 42;
const HOLE_Z = -3;
/** Shadow radius as a fraction of the hole quad's radius (SH in BlackHole.tsx). */
const SHADOW_FRACTION = 0.21;
/** Dim on purpose: the hole is background, text is drawn over it. */
const HOLE_MAX_OPACITY = 0.5;

/**
 * The whole background in one canvas: a quiet starfield and one small,
 * dim, off-centre black hole placed from the shared layout table. The hole
 * drifts up with the page and is culled once off screen. `tier` is the
 * current rung of the quality ladder (cosmos-quality.ts).
 */
export default function CosmosScene({ tier = "full" }: { tier?: CosmosTier }) {
  const { viewport, camera } = useThree();
  const holeMaterial = useMemo(() => createBlackHoleMaterial(), []);
  const holeGroup = useRef<THREE.Group>(null);
  const ndc = useMemo(() => new THREE.Vector3(), []);
  // Shared with the starfield, which bends star positions around the hole.
  const lens = useMemo<LensUniforms>(
    () => ({ uLens: { value: new THREE.Vector4(0, 0, 0.1, 0) }, uAspect: { value: 1 } }),
    []
  );
  const settings = tierSettings(tier);

  useEffect(() => () => holeMaterial.dispose(), [holeMaterial]);
  useEffect(() => {
    setUniform(holeMaterial, "uDetail", settings.detail);
    setUniform(holeMaterial, "uGlow", settings.glow ? 1 : 0);
  }, [holeMaterial, settings.detail, settings.glow]);

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

    // Lensing inputs: hole centre and shadow radius in NDC, off when the tier
    // has dropped it or the hole has scrolled out of view.
    const cam = camera as THREE.PerspectiveCamera;
    ndc.copy(hole.position).project(cam);
    const shadowWorld = hole.scale.x * SHADOW_FRACTION;
    const shadowNdc = shadowWorld / (Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * (CAMERA_Z - HOLE_Z));
    setLens(lens, ndc.x, ndc.y, shadowNdc, settings.lensing ? opacity : 0, vw / vh);
  });

  return (
    <>
      <StarfieldScene links={settings.links} lens={lens} />
      <group ref={holeGroup}>
        <BlackHole material={holeMaterial} />
      </group>
    </>
  );
}
