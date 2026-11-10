"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
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

/** Camera distance (CosmosLive places the camera here); only the stars use the camera. */
export const CAMERA_Z = 42;
/** Scene light level: the hole is background, the page text is drawn over it. */
const HOLE_LIGHT = 1;
/** How far the lowest light (faint lensed image under the hole) reaches below its centre, in shadow radii. */
const BELOW = 1.5;

/**
 * The whole background in one canvas: a quiet starfield and one full-screen
 * black hole placed from the shared layout table. The hole drifts up with
 * the page and fades out as it leaves. `tier` is the current rung of the
 * quality ladder (cosmos-quality.ts).
 */
export default function CosmosScene({ tier = "full" }: { tier?: CosmosTier }) {
  const holeMaterial = useMemo(() => createBlackHoleMaterial(), []);
  const holeMesh = useRef<THREE.Mesh>(null);
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

  useFrame(({ clock, size }) => {
    const aspect = size.width / size.height;
    const variant = layoutVariant(size.width, size.height);
    const sy = typeof window === "undefined" ? 0 : window.scrollY;
    const innerH = typeof window === "undefined" ? 1 : window.innerHeight;

    const p = bodyPlacement(variant, "blackhole");
    const off = scrollOffset(sy, innerH, p.parallax);
    // Height units: y in [-1, 1], x in [-aspect, aspect]. `size` is the shadow
    // diameter as a fraction of the smaller viewport side.
    const radius = p.size * Math.min(aspect, 1);
    const cx = (p.x - 0.5) * 2 * aspect;
    const cy = (0.5 - (p.y + off)) * 2;
    // Gone once the lowest light has left through the top.
    const opacity = bodyOpacity(p.y + off + (radius * BELOW) / 2);
    if (holeMesh.current) holeMesh.current.visible = opacity > 0.01;
    setUniform(holeMaterial, "uAspect", aspect);
    setUniform(holeMaterial, "uTime", clock.getElapsedTime());
    setUniform(holeMaterial, "uRadius", radius);
    setUniform(holeMaterial, "uOpacity", opacity * HOLE_LIGHT);
    (holeMaterial.uniforms.uCenter.value as THREE.Vector2).set(cx, cy);

    // Lensing inputs for the stars: hole centre and shadow radius in NDC
    // (the same height units), off when the tier drops it or the hole is gone.
    setLens(lens, cx / aspect, cy, radius, settings.lensing ? opacity : 0, aspect);
  });

  return (
    <>
      <StarfieldScene links={settings.links} lens={lens} />
      <BlackHole material={holeMaterial} meshRef={holeMesh} />
    </>
  );
}
