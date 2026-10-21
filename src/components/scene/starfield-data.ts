import { seededRandom } from "@/components/scene/random";

/** Depth layers: 0 = far (barely moves), 1 = near (moves most). */
export const STAR_LAYERS = 3;
const STARS_PER_LAYER = 60;

export interface StarfieldData {
  positions: Float32Array;
  /** 0, 0.5 or 1 per star. */
  depths: Float32Array;
  segmentPositions: Float32Array;
  segmentDepths: Float32Array;
}

export function buildStarfield(seed: number): StarfieldData {
  const r = seededRandom(seed);
  const n = STAR_LAYERS * STARS_PER_LAYER;
  const pts: { x: number; y: number; z: number; d: number }[] = [];
  for (let i = 0; i < n; i++) {
    const layer = i % STAR_LAYERS;
    pts.push({
      x: (r() - 0.5) * 90,
      y: (r() - 0.5) * 50,
      z: -22 + layer * 8 + r() * 6,
      d: layer / (STAR_LAYERS - 1),
    });
  }
  const positions = new Float32Array(n * 3);
  const depths = new Float32Array(n);
  pts.forEach((p, i) => {
    positions.set([p.x, p.y, p.z], i * 3);
    depths[i] = p.d;
  });

  // Constellation links: each star joins its nearest same-layer neighbours so
  // linked ends share a parallax rate. One lineSegments draw call.
  const linked = new Set<string>();
  const seg: number[] = [];
  const segD: number[] = [];
  for (let i = 0; i < n; i++) {
    const near = pts
      .map((p, j) => ({
        j,
        d: (pts[i].x - p.x) ** 2 + (pts[i].y - p.y) ** 2,
      }))
      .filter(({ j }) => j !== i && pts[j].d === pts[i].d)
      .sort((a, b) => a.d - b.d)
      .slice(0, 1);
    for (const { j } of near) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (linked.has(key)) continue;
      linked.add(key);
      seg.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
      segD.push(pts[i].d, pts[j].d);
    }
  }
  return {
    positions,
    depths,
    segmentPositions: new Float32Array(seg),
    segmentDepths: new Float32Array(segD),
  };
}
