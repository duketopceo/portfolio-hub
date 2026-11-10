/**
 * Pure layout and projection for the project sphere (KTD3, KTD5). No DOM and
 * no catalog import, so it runs on the server, in the browser and in tests.
 *
 * Longitude is split into one wedge per capability group. Inside a wedge the
 * projects follow a golden-angle spiral from the wedge centre on the equator
 * outward, so stronger projects sit nearer the front equator.
 */

export interface SphereInput {
  slug: string;
  name: string;
  /** Capability id; decides the wedge. */
  capability: string;
  /** Position in the global ranking, zero-based; lower is stronger. */
  rank: number;
  lead: boolean;
}

export interface SphereDot extends SphereInput {
  /** Latitude and longitude in radians. */
  lat: number;
  lon: number;
  /** Unit vector before rotation: x right, y up, z toward the viewer at lon 0. */
  x: number;
  y: number;
  z: number;
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
/** Gap kept free at each wedge edge so neighbouring groups never touch. */
const WEDGE_MARGIN = (7 * Math.PI) / 180;
/** Widest latitude a dot may reach. */
const MAX_LAT = (58 * Math.PI) / 180;

export function layoutSphere(
  inputs: readonly SphereInput[],
  groups: readonly string[]
): SphereDot[] {
  const wedge = (2 * Math.PI) / groups.length;
  const out: SphereDot[] = [];
  groups.forEach((group, gi) => {
    const members = inputs
      .filter((p) => p.capability === group)
      .sort((a, b) => a.rank - b.rank || a.slug.localeCompare(b.slug));
    const centre = gi * wedge + wedge / 2;
    const half = wedge / 2 - WEDGE_MARGIN;
    members.forEach((p, k) => {
      const r = Math.sqrt((k + 0.5) / members.length);
      const theta = k * GOLDEN_ANGLE;
      const lat = MAX_LAT * r * Math.sin(theta);
      // Widen the longitude offset toward the poles so spacing stays even.
      const lon = centre + (half * r * Math.cos(theta)) / Math.max(Math.cos(lat), 0.5);
      out.push({
        ...p,
        lat,
        lon,
        x: Math.cos(lat) * Math.sin(lon),
        y: Math.sin(lat),
        z: Math.cos(lat) * Math.cos(lon),
      });
    });
  });
  return out;
}

export interface Projected {
  /** Screen position in unit-circle space: x right, y down. */
  x: number;
  y: number;
  /** Depth: positive faces the viewer. */
  z: number;
}

/** Fixed forward tilt of the sphere's axis, radians. */
export const SPHERE_TILT = (-16 * Math.PI) / 180;

/** Rotate a unit vector about the vertical axis by `phi`, tilt it, project orthographically. */
export function projectPoint(
  p: { x: number; y: number; z: number },
  phi: number,
  tilt: number = SPHERE_TILT
): Projected {
  const x1 = p.x * Math.cos(phi) + p.z * Math.sin(phi);
  const z1 = -p.x * Math.sin(phi) + p.z * Math.cos(phi);
  const y2 = p.y * Math.cos(tilt) - z1 * Math.sin(tilt);
  const z2 = p.y * Math.sin(tilt) + z1 * Math.cos(tilt);
  return { x: x1, y: -y2, z: z2 };
}

/** Points along a latitude circle (radians), for the wireframe. */
export function latitudeLine(lat: number, steps = 72): { x: number; y: number; z: number }[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const lon = (i / steps) * 2 * Math.PI;
    return { x: Math.cos(lat) * Math.sin(lon), y: Math.sin(lat), z: Math.cos(lat) * Math.cos(lon) };
  });
}

/** Points along a meridian (radians), pole to pole. */
export function meridianLine(lon: number, steps = 48): { x: number; y: number; z: number }[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const lat = -Math.PI / 2 + (i / steps) * Math.PI;
    return { x: Math.cos(lat) * Math.sin(lon), y: Math.sin(lat), z: Math.cos(lat) * Math.cos(lon) };
  });
}

/**
 * SVG path data for a 3D polyline, split into the parts facing the viewer and
 * the parts behind. `radius` and `cx`/`cy` place it in the SVG viewBox.
 */
export function wirePaths(
  points: readonly { x: number; y: number; z: number }[],
  phi: number,
  radius: number,
  cx: number,
  cy: number
): { front: string; back: string } {
  let front = "";
  let back = "";
  let prev: Projected | null = null;
  for (const pt of points) {
    const q = projectPoint(pt, phi);
    const sx = (cx + radius * q.x).toFixed(1);
    const sy = (cy + radius * q.y).toFixed(1);
    if (prev) {
      const isFront = (prev.z + q.z) / 2 >= 0;
      const px = (cx + radius * prev.x).toFixed(1);
      const py = (cy + radius * prev.y).toFixed(1);
      const seg = `M${px} ${py}L${sx} ${sy}`;
      if (isFront) front += seg;
      else back += seg;
    }
    prev = q;
  }
  return { front, back };
}
