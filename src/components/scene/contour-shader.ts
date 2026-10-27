import * as THREE from "three";

/*
 * Simplex noise: Ashima webgl-noise (3D), inlined from
 * https://github.com/ashima/webgl-noise
 *
 * Description : Array and textureless GLSL 2D/3D/4D simplex noise functions.
 *      Author : Ian McEwan, Ashima Arts.
 *  Maintainer : stegu
 *     Lastmod : 20201014 (stegu)
 *     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
 *               Distributed under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions: The above copyright
 * notice and this permission notice shall be included in all copies or
 * substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS",
 * WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
 * THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
const ASHIMA_SNOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const VERTEX = /* glsl */ `
varying vec3 vObj;
void main() {
  vObj = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Iso-lines of 3-octave FBM on the object-space direction over a lit/unlit
// split. The terminator is a hard step (no glow, no atmosphere): the lit side
// carries a faint tint of the survey colour, the night side is near-black with
// dimmed lines. The contour field rotates slowly about Y.
const FRAGMENT = /* glsl */ `
precision highp float;
uniform vec3 uLine;
uniform vec3 uFill;
uniform vec3 uLit;
uniform vec3 uLight;
uniform float uSeed;
uniform float uBands;
uniform float uSpin;
uniform float uTime;
varying vec3 vObj;
${ASHIMA_SNOISE}
float fbm(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 3; i++) {
    s += a * snoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return s;
}
void main() {
  float ang = uTime * uSpin;
  float c = cos(ang);
  float sn = sin(ang);
  vec3 q = vec3(c * vObj.x + sn * vObj.z, vObj.y, -sn * vObj.x + c * vObj.z);
  float h = fbm(q * 1.35 + vec3(uSeed, uSeed * 0.37, uSeed * 0.11)) * 0.5 + 0.5;
  float bands = h * uBands;
  float d = abs(fract(bands) - 0.5) / max(fwidth(bands), 0.0001);
  float line = 1.0 - smoothstep(0.0, 1.1, d);
  float lit = smoothstep(-0.04, 0.06, dot(normalize(vObj), uLight));
  vec3 base = mix(uFill, uLit, lit);
  vec3 col = mix(base, uLine, line * mix(0.22, 0.9, lit));
  gl_FragColor = vec4(col, 1.0);
}
`;

export interface ContourOptions {
  line: THREE.Color;
  seed: number;
  bands?: number;
  spin?: number;
  /** Unit vector from the body toward the light, in world space. */
  light?: THREE.Vector3;
}

export function createContourMaterial(
  opts: ContourOptions
): THREE.ShaderMaterial {
  const fill = new THREE.Color("#070A0D");
  const lit = fill.clone().lerp(opts.line, 0.3);
  return new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms: {
      uLine: { value: opts.line },
      uFill: { value: fill },
      uLit: { value: lit },
      uLight: { value: (opts.light ?? new THREE.Vector3(0, 0.3, 1)).clone().normalize() },
      uSeed: { value: opts.seed },
      uBands: { value: opts.bands ?? 9 },
      uSpin: { value: opts.spin ?? 0.04 },
      uTime: { value: 0 },
    },
  });
}

/** Update a numeric uniform in place (called from frame loops). */
export function setUniform(
  material: THREE.ShaderMaterial,
  name: string,
  value: number
) {
  material.uniforms[name].value = value;
}
