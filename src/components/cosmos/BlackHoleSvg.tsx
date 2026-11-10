import { COSMOS_PALETTE as C } from "@/lib/palette";

/**
 * Broken elliptical streaks that circle the disk. Each ring is one dashed
 * ellipse whose dash offset animates (cosmos.css, 60-90 s per turn, inner
 * rings faster), so the plate rotates without any script. pathLength is
 * normalised to 100 and every dash pattern sums to a divisor of 100, so the
 * loop is seamless. The far half sits under the shadow, like the disk.
 */
const STREAKS = [
  { r: 30, dash: "5 3 2 10", cls: "a", opacity: 0.55 },
  { r: 44, dash: "8 4 3 5", cls: "b", opacity: 0.4 },
  { r: 58, dash: "4 11 6 4", cls: "c", opacity: 0.3 },
  { r: 70, dash: "9 6 2 8", cls: "d", opacity: 0.22 },
] as const;

function DiskStreaks({ tilt }: { tilt: number }) {
  return (
    <g fill="none" stroke="#FFD2AE" strokeWidth="0.9" strokeLinecap="round">
      {STREAKS.map((s) => (
        <ellipse
          key={s.cls}
          className={`cosmos-bh-streak cosmos-bh-streak--${s.cls}`}
          rx={s.r}
          ry={s.r * tilt}
          pathLength={100}
          strokeDasharray={s.dash}
          strokeOpacity={s.opacity}
        />
      ))}
    </g>
  );
}

/**
 * Static black hole: shadow, lensed light over and under it, and a tilted
 * accretion disk with brighter approaching limb. Pure SVG in a 200x200 box
 * (disk radius 96), server-rendered, crisp at any DPR. Same composition as
 * the WebGL scene (components/scene/BlackHole.tsx); stands in for it under
 * reduced motion and when WebGL is unavailable or fails.
 */
export default function BlackHoleSvg() {
  const R = 80; // disk outer radius (thin, dim wings; the ring carries the light)
  const TILT = 0.2; // ellipse minor/major
  const SHADOW = 21;
  return (
    <svg
      className="cosmos-svg cosmos-svg--blackhole"
      viewBox="-100 -100 200 200"
      focusable="false"
      aria-hidden="true"
    >
      <defs>
        {/* Disk heat: transparent hole, white-hot rim, ember body, teal dust edge. */}
        <radialGradient id="bh-disk" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.3" stopColor={C.ember} stopOpacity="0" />
          <stop offset="0.34" stopColor="#FFD2AE" stopOpacity="0.95" />
          <stop offset="0.4" stopColor="#FFA060" stopOpacity="0.92" />
          <stop offset="0.52" stopColor={C.ember} stopOpacity="0.8" />
          <stop offset="0.72" stopColor="#B3360A" stopOpacity="0.45" />
          <stop offset="0.9" stopColor={C.teal} stopOpacity="0.2" />
          <stop offset="1" stopColor={C.teal} stopOpacity="0" />
        </radialGradient>
        {/* Doppler beaming: left (approaching) limb brighter than right. */}
        <linearGradient id="bh-doppler" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.42" />
        </linearGradient>
        <mask id="bh-doppler-mask" maskUnits="userSpaceOnUse" x="-100" y="-100" width="200" height="200">
          <rect x="-100" y="-100" width="200" height="200" fill="url(#bh-doppler)" />
        </mask>
        <linearGradient id="bh-lens" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#FFD2A8" />
          <stop offset="0.5" stopColor={C.ember} />
          <stop offset="1" stopColor="#8A2A08" />
        </linearGradient>
        <clipPath id="bh-front">
          <rect x="-100" y="0" width="200" height="100" />
        </clipPath>
        <filter id="bh-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      {/* Survey reticle: the Star Chart motif, hairline only. */}
      <g fill="none" stroke={C.starlight} strokeOpacity="0.1" strokeWidth="0.35">
        <circle r="99" strokeDasharray="1 3" />
        <path d="M-99 0h6M93 0h6M0 -99v6M0 93v6" strokeOpacity="0.22" />
      </g>

      <g mask="url(#bh-doppler-mask)">
        {/* Whole disk first: its far half is hidden by the shadow below. */}
        <ellipse rx={R} ry={R * TILT} fill="url(#bh-disk)" opacity="0.75" />
        <DiskStreaks tilt={TILT} />

        {/* Light bent over the top and under the bottom of the hole. */}
        <g fill="none" strokeLinecap="round">
          <path
            d={`M${-SHADOW * 1.28} 0 A${SHADOW * 1.28} ${SHADOW * 1.28} 0 0 1 ${SHADOW * 1.28} 0`}
            stroke="url(#bh-lens)"
            strokeWidth="3"
            opacity="0.4"
            filter="url(#bh-soft)"
          />
          <path
            d={`M${-SHADOW * 1.16} 0 A${SHADOW * 1.16} ${SHADOW * 1.16} 0 0 1 ${SHADOW * 1.16} 0`}
            stroke="url(#bh-lens)"
            strokeWidth="1.5"
          />
          <path
            d={`M${-SHADOW * 1.12} 0 A${SHADOW * 1.12} ${SHADOW * 1.12} 0 0 0 ${SHADOW * 1.12} 0`}
            stroke="url(#bh-lens)"
            strokeWidth="1.2"
            opacity="0.6"
          />
        </g>
      </g>

      {/* Event-horizon shadow with a thin photon ring. */}
      <circle r={SHADOW} fill="#000" />
      {/* Cheap stand-in for the live scene's soft ring glow: one blurred ring. */}
      <circle r={SHADOW + 4} fill="none" stroke={C.ember} strokeOpacity="0.3" strokeWidth="6" filter="url(#bh-soft)" />
      <circle r={SHADOW + 1.1} fill="none" stroke="#FFC79E" strokeOpacity="0.85" strokeWidth="1.3" />

      {/* Near half of the disk crosses in front of the shadow. */}
      <g clipPath="url(#bh-front)" mask="url(#bh-doppler-mask)">
        <ellipse rx={R} ry={R * TILT} fill="url(#bh-disk)" />
        <DiskStreaks tilt={TILT} />
      </g>
    </svg>
  );
}
