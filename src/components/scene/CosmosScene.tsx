"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { setUniform } from "@/components/scene/uniforms";
import BlackHole, { createBlackHoleMaterial } from "@/components/scene/BlackHole";
import Starfield from "@/components/scene/Starfield";
import {
  bodyPlacement,
  landingPlacement,
  LANDING_MIN_WIDTH,
  layoutVariant,
  scrollFade,
  shadowRadius,
} from "@/lib/cosmos-layout";
import { starCount, tierSettings, type CosmosTier } from "@/lib/cosmos-quality";

/** Scene light level: dim on purpose, the page's text is drawn over it (see BRAND.md contrast notes). */
export const HOLE_LIGHT = 0.22;

/**
 * The whole background in one canvas: a layered starfield and a single
 * full-screen black hole placed from the shared layout table. Both stay fixed
 * behind the page; the hole fades a little as the page scrolls and the stars
 * shift by depth. `tier` is the current rung of the quality
 * ladder (cosmos-quality.ts).
 */
export default function CosmosScene({
  tier = "full",
  focus = "page",
}: {
  tier?: CosmosTier;
  /** "landing" puts the hole at the home map's centre on a wide desktop viewport. */
  focus?: "page" | "landing";
}) {
  const holeMaterial = useMemo(() => createBlackHoleMaterial(), []);
  const settings = tierSettings(tier);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const stars = starCount(tier, width, height);

  useEffect(() => () => holeMaterial.dispose(), [holeMaterial]);
  useEffect(() => {
    setUniform(holeMaterial, "uDetail", settings.detail);
    setUniform(holeMaterial, "uGlow", settings.glow ? 1 : 0);
    setUniform(holeMaterial, "uLens", settings.lensing ? 1 : 0);
  }, [holeMaterial, settings.detail, settings.glow, settings.lensing]);

  useFrame(({ clock, size }) => {
    const aspect = size.width / size.height;
    const variant = layoutVariant(size.width, size.height);
    const p =
      focus === "landing" && variant === "wide" && size.width >= LANDING_MIN_WIDTH
        ? landingPlacement(size.height)
        : bodyPlacement(variant);
    const sy = typeof window === "undefined" ? 0 : window.scrollY;
    const innerH = typeof window === "undefined" ? 1 : window.innerHeight;
    // Height units: y in [-1, 1], x in [-aspect, aspect].
    (holeMaterial.uniforms.uCenter.value as THREE.Vector2).set((p.x - 0.5) * 2 * aspect, (0.5 - p.y) * 2);
    setUniform(holeMaterial, "uAspect", aspect);
    setUniform(holeMaterial, "uTime", clock.getElapsedTime());
    setUniform(holeMaterial, "uRadius", shadowRadius(aspect, p.size));
    setUniform(holeMaterial, "uOpacity", HOLE_LIGHT * scrollFade(sy, innerH));
  });

  return (
    <>
      <Starfield count={stars} />
      <BlackHole material={holeMaterial} />
    </>
  );
}
