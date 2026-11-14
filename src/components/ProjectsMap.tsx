"use client";

import { useSyncExternalStore } from "react";
import ProjectSphere from "@/components/sphere/ProjectSphere";
import GravityMap from "@/components/GravityMap";
import type { SphereProject } from "@/lib/sphere-projects";
import type { GravityInput } from "@/lib/gravity-map";

const subscribe = () => () => {};
const wantsGravity = () => new URLSearchParams(window.location.search).get("map") === "gravity";

/**
 * The map at the top of /projects. The sphere is the default; `?map=gravity`
 * swaps in the gravity map for comparison. The flag is read in the browser so
 * the page stays statically rendered.
 */
export default function ProjectsMap({
  sphere,
  gravity,
}: {
  sphere: readonly SphereProject[];
  gravity: readonly GravityInput[];
}) {
  const useGravity = useSyncExternalStore(subscribe, wantsGravity, () => false);
  return useGravity ? <GravityMap projects={gravity} /> : <ProjectSphere projects={sphere} />;
}
