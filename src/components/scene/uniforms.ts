import type * as THREE from "three";

/** Update a numeric uniform in place (called from frame loops). */
export function setUniform(
  material: THREE.ShaderMaterial,
  name: string,
  value: number
) {
  material.uniforms[name].value = value;
}
