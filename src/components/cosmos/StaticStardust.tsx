import { HOLE_COLORS } from "@/lib/cosmos-colors";
import { STARDUST_COLORS, staticDust } from "@/lib/stardust";

const TILE_W = 560;
const TILE_H = 720;
const POINTS = staticDust(20261110, 34);

/**
 * Static stardust for reduced motion and no-WebGL: a sparse tiled field of
 * dots (and a few four-point sparkles in amber), frozen where the
 * canvas rendition would drift. Server-rendered SVG pattern, fixed behind the
 * page; fades in with scroll where scroll-driven animation is supported.
 */
export default function StaticStardust() {
  return (
    <svg className="cosmos-dust-static" width="100%" height="100%" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="cosmos-dust-tile" width={TILE_W} height={TILE_H} patternUnits="userSpaceOnUse">
          {POINTS.map((p, i) => {
            const x = Math.round(p.x * TILE_W * 10) / 10;
            const y = Math.round(p.y * TILE_H * 10) / 10;
            const fill = STARDUST_COLORS[p.color];
            const isSparkle = fill === HOLE_COLORS.amber;
            return isSparkle ? (
              <path
                key={i}
                d={`M${x - 4.5} ${y}H${x + 4.5}M${x} ${y - 4.5}V${y + 4.5}`}
                stroke={fill}
                strokeOpacity={p.alpha}
                strokeWidth="0.8"
                strokeLinecap="round"
              />
            ) : (
              <circle key={i} cx={x} cy={y} r={p.r} fill={fill} fillOpacity={p.alpha} />
            );
          })}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cosmos-dust-tile)" />
    </svg>
  );
}
