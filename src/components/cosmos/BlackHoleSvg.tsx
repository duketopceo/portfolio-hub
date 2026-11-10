import { HOLE_COLORS as C } from "@/lib/cosmos-colors";

/**
 * Geometry shared with the WebGL shader (components/scene/BlackHole.tsx), in
 * SVG units where the shadow radius is SH. R_IN, R_OUT and TILT are the same
 * numbers the shader uses, in shadow radii.
 */
const SH = 20;
const R_IN = 1.18;
const R_OUT = 5.4;
const TILT = 0.11;
const REACH = 0.9;
/** viewBox: 5.5 shadow diameters wide, so the box is width = size * 5.5 * min(vw, vh). */
export const BOX_PER_SHADOW = 5.5;
const W = BOX_PER_SHADOW * SH * 2; // 220
const H = 124;

/**
 * Broken elliptical streaks that circle the disk. Each ring is one dashed
 * ellipse whose dash offset animates (cosmos.css, 60-90 s per turn, inner
 * rings faster), so the plate rotates without any script. pathLength is
 * normalised to 100 and every dash pattern sums to a divisor of 100, so the
 * loop is seamless. The far half sits under the shadow, like the disk.
 */
const STREAKS = [
  { r: 1.6, dash: "5 3 2 10", cls: "a", opacity: 0.32 },
  { r: 2.4, dash: "8 4 3 5", cls: "b", opacity: 0.24 },
  { r: 3.3, dash: "4 11 6 4", cls: "c", opacity: 0.18 },
  { r: 4.2, dash: "9 6 2 8", cls: "d", opacity: 0.12 },
] as const;

function DiskStreaks() {
  return (
    <g fill="none" stroke={C.white} strokeWidth="0.9" strokeLinecap="round">
      {STREAKS.map((s) => (
        <ellipse
          key={s.cls}
          className={`cosmos-bh-streak cosmos-bh-streak--${s.cls}`}
          rx={s.r * SH}
          ry={s.r * SH * TILT}
          pathLength={100}
          strokeDasharray={s.dash}
          strokeOpacity={s.opacity}
        />
      ))}
    </g>
  );
}

/** Half-disc (top or bottom) of the lensed image, radius `r`. */
const halfDisc = (r: number, top: boolean) => `M${-r} 0A${r} ${r} 0 0 ${top ? 1 : 0} ${r} 0Z`;

/**
 * Static black hole, full-screen: a black shadow, a thin photon ring, a hot
 * disk seen near edge-on, and the disk's far side lensed up over and under
 * the hole, brighter on the approaching (left) side. Pure SVG, server
 * rendered, crisp at any DPR. Same composition and constants as the WebGL
 * scene; stands in for it under reduced motion and when WebGL is unavailable,
 * failed or too slow. Warm white, amber and ember only.
 */
export default function BlackHoleSvg() {
  const top = SH * (1 + REACH);
  const o = (rd: number) => (rd / R_OUT).toFixed(3); // radius to gradient offset
  return (
    <svg
      className="cosmos-svg cosmos-svg--blackhole"
      viewBox={`${-W / 2} ${-H / 2} ${W} ${H}`}
      focusable="false"
      aria-hidden="true"
    >
      <defs>
        {/* Disk heat: transparent hole, white-hot rim, amber, ember, deep ember. */}
        <radialGradient id="bh-disk" cx="0.5" cy="0.5" r="0.5">
          <stop offset={o(R_IN - 0.02)} stopColor={C.white} stopOpacity="0" />
          <stop offset={o(R_IN + 0.05)} stopColor={C.white} stopOpacity="1" />
          <stop offset={o(1.6)} stopColor={C.amber} stopOpacity="1" />
          <stop offset={o(2.4)} stopColor={C.ember} stopOpacity="0.9" />
          <stop offset={o(3.4)} stopColor={C.deep} stopOpacity="0.55" />
          <stop offset="1" stopColor={C.deep} stopOpacity="0" />
        </radialGradient>
        {/* Lensed light: hot at the shadow edge, fading outward. */}
        <radialGradient id="bh-lens" gradientUnits="userSpaceOnUse" cx="0" cy="0" r={top}>
          <stop offset={(SH / top).toFixed(3)} stopColor={C.white} stopOpacity="1" />
          <stop offset={((SH * 1.12) / top).toFixed(3)} stopColor={C.amber} stopOpacity="0.8" />
          <stop offset={((SH * 1.35) / top).toFixed(3)} stopColor={C.ember} stopOpacity="0.3" />
          <stop offset="1" stopColor={C.ember} stopOpacity="0" />
        </radialGradient>
        {/* Doppler beaming: the left (approaching) limb is brighter. */}
        <linearGradient id="bh-doppler" gradientUnits="userSpaceOnUse" x1={-W / 2} x2={W / 2} y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.72" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.3" />
        </linearGradient>
        <mask id="bh-doppler-mask" maskUnits="userSpaceOnUse" x={-W / 2} y={-H / 2} width={W} height={H}>
          <rect x={-W / 2} y={-H / 2} width={W} height={H} fill="url(#bh-doppler)" />
        </mask>
        {/* The lensed image tapers toward the sides, where it joins the disk. */}
        <linearGradient id="bh-taper" gradientUnits="userSpaceOnUse" x1={-top} x2={top} y1="0" y2="0">
          <stop offset="0" stopColor="#000" />
          <stop offset="0.22" stopColor="#888" />
          <stop offset="0.5" stopColor="#fff" />
          <stop offset="0.78" stopColor="#888" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id="bh-taper-mask" maskUnits="userSpaceOnUse" x={-top} y={-top} width={top * 2} height={top * 2}>
          <rect x={-top} y={-top} width={top * 2} height={top * 2} fill="url(#bh-taper)" />
        </mask>
        <radialGradient id="bh-haze" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={C.ember} stopOpacity="0.3" />
          <stop offset="0.5" stopColor={C.ember} stopOpacity="0.1" />
          <stop offset="1" stopColor={C.ember} stopOpacity="0" />
        </radialGradient>
        <clipPath id="bh-front">
          <rect x={-W / 2} y="0" width={W} height={H / 2} />
        </clipPath>
        <filter id="bh-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <filter id="bh-haze-blur" x="-10%" y="-100%" width="120%" height="300%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* Warm haze along the disk plane. */}
      <ellipse rx={R_OUT * SH} ry={SH * 1.1} fill="url(#bh-haze)" filter="url(#bh-haze-blur)" />

      <g mask="url(#bh-doppler-mask)">
        {/* Whole disk first: its far half is hidden by the shadow below. */}
        <ellipse rx={R_OUT * SH} ry={R_OUT * SH * TILT} fill="url(#bh-disk)" />
        <DiskStreaks />
        {/* The far side of the disk bent over the top (strong) and under (faint). */}
        <g mask="url(#bh-taper-mask)">
          <path d={halfDisc(top, true)} fill="url(#bh-lens)" />
          <path d={halfDisc(top * 0.6, false)} fill="url(#bh-lens)" opacity="0.35" />
        </g>
      </g>

      {/* Event-horizon shadow, soft halo and thin photon ring. */}
      <circle r={SH} fill="#000" />
      <circle r={SH * 1.05} fill="none" stroke={C.ember} strokeOpacity="0.5" strokeWidth="5" filter="url(#bh-soft)" />
      <circle r={SH * 1.02} fill="none" stroke={C.white} strokeOpacity="0.8" strokeWidth="0.45" />

      {/* Near half of the disk crosses in front of the shadow. */}
      <g clipPath="url(#bh-front)" mask="url(#bh-doppler-mask)">
        <ellipse rx={R_OUT * SH} ry={R_OUT * SH * TILT} fill="url(#bh-disk)" />
        <DiskStreaks />
      </g>
    </svg>
  );
}
