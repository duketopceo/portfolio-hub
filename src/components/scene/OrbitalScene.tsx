"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { EnrichedProject } from "@/lib/types";
import { useSceneOverlay } from "@/components/scene/SceneFrame";
import { orbitLayout, ringScale } from "@/components/scene/orbit-layout";
import { CameraDrift, FitScale, Star } from "@/components/scene/scene-rig";
import {
  BodyLines,
  HAIRLINE,
  StaticLines,
  ellipsePoints,
  type BodyInfo,
} from "@/components/scene/survey-lines";
import { FocusBeacon, SightingLine, SurveySphere } from "@/components/scene/survey-markers";
import { Moons, Planet, type PlanetQuality } from "@/components/scene/planets";
import {
  isFocalSlug,
  limbPoints,
  meridianCount,
  planetBodyRadius,
  resolvePlanetVisual,
} from "@/lib/planet-visual";
import { readRendererString, shouldUseShader } from "@/lib/render-capability";
import plate from "@/components/planet/survey-plate.module.css";

interface OrbitalSceneProps {
  projects: EnrichedProject[];
  focusIndex: number;
  /** rx / rz orbit radii in scene units (≈ rem). */
  rx: number;
  rz: number;
  /** "lite" trims segment counts and the ring shadow (phones, low memory). */
  quality?: PlanetQuality;
  /** Body size multiplier for narrow stages (see bodyScaleFor). */
  bodyScale?: number;
  /** Renders the DOM marker for project i — anchored at its orbit point. */
  renderMarker: (project: EnrichedProject, index: number) => ReactNode;
}

const ORIGIN = new THREE.Vector3();
const Z_INDEX_RANGE: [number, number] = [12, 4];

/**
 * The orbit system: a star at the origin, one Planet per project placed by
 * orbitLayout, the survey linework and the focus furniture. All per-planet
 * data comes from `resolvePlanetVisual(project)`, itself driven by the
 * project's catalog `planetVisual` spec. The DOM markers (rendered by the
 * caller) are the accessible, interactive layer; this is presentation.
 *
 * On software GL (llvmpipe, SwiftShader) the lit bodies are skipped and the
 * scene keeps its line-art limbs and meridians.
 */
export default function OrbitalScene({
  projects,
  focusIndex,
  rx,
  rz,
  quality = "full",
  bodyScale = 1,
  renderMarker,
}: OrbitalSceneProps) {
  const overlay = useSceneOverlay();
  const gl = useThree((state) => state.gl);
  const bodiesLit = useMemo(
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

  // One unit sphere shared by every planet.
  const sphere = useMemo(
    () =>
      new THREE.SphereGeometry(1, quality === "full" ? 96 : 56, quality === "full" ? 64 : 36),
    [quality]
  );
  useEffect(() => () => sphere.dispose(), [sphere]);

  const bodies = useMemo<BodyInfo[]>(
    () =>
      projects.map((p, i) => {
        const visual = visuals[i];
        const radius = planetBodyRadius(visual.size) * bodyScale;
        return {
          slot: slots[i],
          radius,
          tint: new THREE.Color(visual.color).lerp(HAIRLINE, 0.55),
          limb: limbPoints(bodiesLit ? "sphere" : visual.shape, radius),
          rings: visual.rings.map((ring) => ({
            tilt: ring.tilt,
            opacity: ring.opacity,
          })),
          isPrivate: !!p.private,
          meridians: meridianCount(isFocalSlug(p.slug), bodiesLit),
          limbScale: bodiesLit ? 1.035 : 1,
        };
      }),
    [projects, visuals, slots, bodiesLit, bodyScale]
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
        <Star>
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
            drawRings={!bodiesLit}
          />
          {/* Limbs, private marks and (line-art path) meridians. The lit
              bodies below are decorative; the PlanetNode markers further
              down are the interactive layer at the same slots. */}
          <BodyLines bodies={bodies} focusIndex={focusIndex} />
          {bodiesLit &&
            projects.map((p, i) => (
              <Planet
                key={p.slug}
                slot={slots[i]}
                visual={visuals[i]}
                radius={bodies[i].radius}
                sphere={sphere}
                quality={quality}
              />
            ))}
          <Moons slots={slots} visuals={visuals} bodyScale={bodyScale} />
        </Star>

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
