import { COSMOS_PALETTE as C } from "@/lib/palette";

export type PlanetKind = "rocky" | "gas" | "ice";

/**
 * Static planets, one per world type, in a 200x200 box with the body at
 * radius 40 (room for the ice world's ring). Lit from the direction of the
 * black hole (`light`, unit vector in SVG space) with a hard terminator and a
 * 1px survey limb. Palette: teal, ember, ultraviolet and neutrals only.
 * Server-rendered; the WebGL scene draws the same three worlds.
 */
const BODY = 40;

function Sphere({ id, light, lit, mid, night }: { id: string; light: [number, number]; lit: string; mid: string; night: string }) {
  const fx = 50 + light[0] * 30;
  const fy = 50 + light[1] * 30;
  return (
    <>
      <defs>
        <radialGradient id={`${id}-sphere`} cx="50%" cy="50%" r="72%" fx={`${fx}%`} fy={`${fy}%`}>
          <stop offset="0" stopColor={lit} />
          <stop offset="0.42" stopColor={mid} />
          <stop offset="0.66" stopColor={night} />
          <stop offset="1" stopColor={C.night} />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle r={BODY} />
        </clipPath>
      </defs>
      <circle r={BODY} fill={`url(#${id}-sphere)`} />
    </>
  );
}

/** Dark side: a crisp shadow over the part facing away from the light. */
function Terminator({ id, light }: { id: string; light: [number, number] }) {
  const gx = 50 - light[0] * 50;
  const gy = 50 - light[1] * 50;
  return (
    <>
      <defs>
        <linearGradient id={`${id}-term`} x1={`${50 + light[0] * 50}%`} y1={`${50 + light[1] * 50}%`} x2={`${gx}%`} y2={`${gy}%`}>
          <stop offset="0.5" stopColor={C.night} stopOpacity="0" />
          <stop offset="0.66" stopColor={C.night} stopOpacity="0.86" />
          <stop offset="1" stopColor={C.night} stopOpacity="0.96" />
        </linearGradient>
      </defs>
      <circle r={BODY} fill={`url(#${id}-term)`} />
    </>
  );
}

function Limb({ rim }: { rim?: string }) {
  return (
    <>
      <circle r={BODY + 1.2} fill="none" stroke={C.starlight} strokeOpacity="0.16" strokeWidth="0.6" />
      {rim ? <circle r={BODY - 0.4} fill="none" stroke={rim} strokeOpacity="0.5" strokeWidth="0.9" strokeDasharray="38 400" strokeDashoffset="-30" /> : null}
    </>
  );
}

const CRATERS: [number, number, number][] = [
  [-14, -14, 9],
  [10, -20, 6],
  [18, 2, 11],
  [-22, 10, 7],
  [-4, 18, 8],
  [8, 28, 4.5],
  [-26, -2, 4],
];

function Rocky({ light }: { light: [number, number] }) {
  return (
    <g>
      <Sphere id="pl-rocky" light={light} lit="#E0C6B2" mid="#8A6E5E" night="#2A201B" />
      <g clipPath="url(#pl-rocky-clip)">
        {CRATERS.map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill="#1B1511" fillOpacity="0.55" />
            {/* Lit rim on the side facing the light. */}
            <circle
              cx={x}
              cy={y}
              r={r}
              fill="none"
              stroke="#F3DFCF"
              strokeOpacity="0.5"
              strokeWidth="0.9"
              strokeDasharray={`${r * 2.2} ${r * 8}`}
              strokeDashoffset={-r * 2.4}
              transform={`rotate(${Math.round((Math.atan2(light[1], light[0]) * 180) / Math.PI) + 90} ${x} ${y})`}
            />
          </g>
        ))}
      </g>
      <Terminator id="pl-rocky" light={light} />
      <Limb />
    </g>
  );
}

const BANDS: [number, number, string][] = [
  [-40, 11, "#BFF3EC"],
  [-29, 7, "#2DD4BF"],
  [-22, 13, "#7FE7DA"],
  [-9, 6, "#1B8F82"],
  [-3, 12, "#BFF3EC"],
  [9, 8, "#2DD4BF"],
  [17, 10, "#0F5A52"],
  [27, 14, "#7FE7DA"],
];

function Gas({ light }: { light: [number, number] }) {
  return (
    <g>
      <Sphere id="pl-gas" light={light} lit="#BFF3EC" mid="#2DD4BF" night="#0C4A44" />
      <g clipPath="url(#pl-gas-clip)">
        <g transform="rotate(-12)">
          {BANDS.map(([y, h, fill], i) => (
            <rect key={i} x={-60} y={y} width={120} height={h} fill={fill} fillOpacity="0.42" />
          ))}
          {/* One storm, ember, the single warm accent on the planet. */}
          <ellipse cx={14} cy={12} rx={9} ry={4.2} fill={C.ember} fillOpacity="0.8" />
          <ellipse cx={14} cy={12} rx={5} ry={2} fill="#FFB27A" fillOpacity="0.6" />
        </g>
      </g>
      <Terminator id="pl-gas" light={light} />
      <Limb />
    </g>
  );
}

function Ice({ light }: { light: [number, number] }) {
  const ringRx = 82;
  const ringRy = 20;
  const ringTilt = -17;
  return (
    <g>
      {/* Ring, far half (behind the body). */}
      <g transform={`rotate(${ringTilt})`} fill="none">
        <ellipse rx={ringRx} ry={ringRy} stroke="#CFEFEA" strokeOpacity="0.28" strokeWidth="6" />
        <ellipse rx={ringRx - 9} ry={ringRy - 2.4} stroke="#9AA3AC" strokeOpacity="0.32" strokeWidth="2.4" />
        <ellipse rx={ringRx + 6} ry={ringRy + 1.6} stroke={C.pop} strokeOpacity="0.22" strokeWidth="1.2" />
      </g>
      <Sphere id="pl-ice" light={light} lit="#F2FBFA" mid="#9FDDD6" night="#2C5E5A" />
      <g clipPath="url(#pl-ice-clip)" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.5">
        <path d="M-30 -12 L-8 -4 L10 -14 L30 -6" />
        <path d="M-26 14 L-6 6 L8 18 L28 10" />
        <path d="M-4 -34 L2 -10 L-6 12 L4 34" strokeOpacity="0.25" />
      </g>
      <Terminator id="pl-ice" light={light} />
      <Limb rim={C.pop} />
      {/* Ring, near half (in front, below the equator line). */}
      <g transform={`rotate(${ringTilt})`} fill="none">
        <clipPath id="pl-ice-front">
          <rect x="-120" y="0" width="240" height="60" />
        </clipPath>
        <g clipPath="url(#pl-ice-front)">
          <ellipse rx={ringRx} ry={ringRy} stroke="#CFEFEA" strokeOpacity="0.55" strokeWidth="6" />
          <ellipse rx={ringRx - 9} ry={ringRy - 2.4} stroke="#9AA3AC" strokeOpacity="0.5" strokeWidth="2.4" />
          <ellipse rx={ringRx + 6} ry={ringRy + 1.6} stroke={C.pop} strokeOpacity="0.4" strokeWidth="1.2" />
        </g>
      </g>
    </g>
  );
}

export default function PlanetSvg({ kind, light }: { kind: PlanetKind; light: [number, number] }) {
  return (
    <svg
      className={`cosmos-svg cosmos-svg--${kind}`}
      viewBox="-100 -100 200 200"
      focusable="false"
      aria-hidden="true"
    >
      {kind === "rocky" ? <Rocky light={light} /> : kind === "gas" ? <Gas light={light} /> : <Ice light={light} />}
    </svg>
  );
}
