import type { CSSProperties, ReactElement } from "react";
import { isCapabilityId, type CapabilityId } from "@/data/capability-meta";
import { seedFromSlug, seededRandom } from "@/lib/showcase";
import { SLUG_MOTIFS } from "./posters";

const W = 320;
const H = 180;

const r1 = (n: number) => Math.round(n * 10) / 10;

type Rand = () => number;
type Motif = (rand: Rand) => ReactElement;

/** Sorted points that trade cost for quality: a frontier with dominated dots under it. */
const evalsMotif: Motif = (rand) => {
  const steps = 6;
  const pts = Array.from({ length: steps }, (_, i) => {
    const x = 36 + (i / (steps - 1)) * 220 + rand() * 6;
    const y = 128 - Math.pow((i + 1) / steps, 0.62) * 84 - rand() * 6;
    return [r1(x), r1(y)] as const;
  });
  const frontier = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  return (
    <g>
      <path d="M36 140 H264 M36 140 V36" className="showcase-art__rule" />
      {Array.from({ length: 11 }, (_, i) => {
        const x = r1(44 + rand() * 212);
        const y = r1(70 + rand() * 66);
        return <circle key={i} cx={x} cy={y} r="1.6" className="showcase-art__dim" />;
      })}
      <path d={frontier} className="showcase-art__line" fill="none" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" className="showcase-art__dot" />
      ))}
    </g>
  );
};

/** A small graph: nodes joined to their nearest neighbours, one ringed. */
const memoryMotif: Motif = (rand) => {
  const nodes = Array.from({ length: 10 }, () => [r1(34 + rand() * 232), r1(30 + rand() * 112)] as const);
  const edges: Array<[number, number]> = [];
  nodes.forEach(([x, y], i) => {
    const near = nodes
      .map(([nx, ny], j) => [j, (nx - x) ** 2 + (ny - y) ** 2] as const)
      .filter(([j]) => j !== i)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 2);
    near.forEach(([j]) => {
      if (!edges.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) edges.push([i, j]);
    });
  });
  const focus = Math.floor(rand() * nodes.length);
  return (
    <g>
      {edges.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} className="showcase-art__rule" />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === focus ? 3.4 : 2.2} className={i === focus ? "showcase-art__dot" : "showcase-art__dim"} />
      ))}
      <circle cx={nodes[focus][0]} cy={nodes[focus][1]} r="9" className="showcase-art__ring" fill="none" />
    </g>
  );
};

/** A window frame with a dotted pointer path ending on a crosshair target. */
const agentsMotif: Motif = (rand) => {
  const tx = r1(190 + rand() * 60);
  const ty = r1(70 + rand() * 40);
  const sx = r1(60 + rand() * 30);
  const sy = r1(44 + rand() * 20);
  const cx = r1((sx + tx) / 2 + (rand() - 0.5) * 40);
  const cy = r1(Math.max(sy, ty) + 22 + rand() * 12);
  return (
    <g>
      <rect x="28" y="28" width="264" height="124" className="showcase-art__rule" fill="none" />
      <path d="M28 44 H292" className="showcase-art__rule" />
      <circle cx="38" cy="36" r="1.6" className="showcase-art__dim" />
      <circle cx="45" cy="36" r="1.6" className="showcase-art__dim" />
      <rect x={r1(70 + rand() * 20)} y="112" width="64" height="22" className="showcase-art__rule" fill="none" />
      <path d={`M${sx} ${sy} Q${cx} ${cy} ${tx} ${ty}`} className="showcase-art__dash" fill="none" />
      <circle cx={tx} cy={ty} r="8" className="showcase-art__ring" fill="none" />
      <path d={`M${tx - 12} ${ty} H${tx - 4} M${tx + 4} ${ty} H${tx + 12} M${tx} ${ty - 12} V${ty - 4} M${tx} ${ty + 4} V${ty + 12}`} className="showcase-art__line" />
      <path d={`M${sx} ${sy} l0 11 l3 -3 l3 6 l2 -1 l-3 -6 l4 0 z`} className="showcase-art__fill" />
    </g>
  );
};

/** Offset screens with text rows: a shipped surface. */
const productsMotif: Motif = (rand) => {
  const lean = r1(6 + rand() * 6);
  return (
    <g>
      {[2, 1, 0].map((i) => {
        const x = r1(54 + i * lean * 2);
        const y = r1(40 + i * lean);
        return (
          <g key={i}>
            <rect x={x} y={y} width="140" height="92" className={i === 0 ? "showcase-art__panel" : "showcase-art__rule"} fill={i === 0 ? undefined : "none"} />
          </g>
        );
      })}
      {Array.from({ length: 4 }, (_, i) => (
        <path key={i} d={`M${r1(54 + 12)} ${r1(40 + 18 + i * 14)} h${r1(40 + rand() * 70)}`} className={i === 0 ? "showcase-art__line" : "showcase-art__dim"} />
      ))}
      <rect x="66" y="108" width="34" height="9" className="showcase-art__fill" />
    </g>
  );
};

/** Orthogonal traces ending in vias: board-level plumbing. */
const toolingMotif: Motif = (rand) => {
  const lanes = 5;
  return (
    <g>
      {Array.from({ length: lanes }, (_, i) => {
        const y = r1(38 + i * 22);
        const jog = r1(90 + rand() * 90);
        const dy = r1((rand() > 0.5 ? 1 : -1) * (10 + rand() * 12));
        const end = r1(220 + rand() * 60);
        return (
          <g key={i}>
            <path d={`M24 ${y} H${jog} V${r1(y + dy)} H${end}`} className={i === 2 ? "showcase-art__line" : "showcase-art__rule"} fill="none" />
            <circle cx="24" cy={y} r="2.2" className="showcase-art__dim" />
            <circle cx={end} cy={r1(y + dy)} r={i === 2 ? 3.4 : 2.4} className={i === 2 ? "showcase-art__dot" : "showcase-art__dim"} />
          </g>
        );
      })}
    </g>
  );
};

/** Concentric survey arcs, for entries without a capability group. */
const arcMotif: Motif = (rand) => {
  const cx = r1(190 + rand() * 40);
  const cy = r1(100 + rand() * 20);
  return (
    <g>
      {[22, 44, 66, 88].map((r) => (
        <circle key={r} cx={cx} cy={cy} r={r} className="showcase-art__rule" fill="none" />
      ))}
      <circle cx={r1(cx + 44)} cy={cy} r="3" className="showcase-art__dot" />
    </g>
  );
};

const MOTIFS: Record<CapabilityId, Motif> = {
  "evals-routing": evalsMotif,
  "retrieval-memory": memoryMotif,
  "agents-computer-use": agentsMotif,
  products: productsMotif,
  "tooling-infra": toolingMotif,
};

/**
 * Deterministic on-brand poster for a project: black ground, hairline survey
 * grid, a small motif for its capability group in that group's colour, and the
 * project name in type. Seeded by slug, so the same project always renders the
 * same poster. Pure SVG and CSS (no imagery, no scripts); colours come from
 * tokens through `--poster-accent`.
 */
export default function ThemedPoster({
  slug,
  name,
  capability,
  accent,
  showName = false,
  className,
}: {
  slug: string;
  name: string;
  capability?: string | null;
  /** The capability colour (capabilityAccent). */
  accent: string;
  /** A tiny mono label. Off by default: the card title already names the project. */
  showName?: boolean;
  className?: string;
}) {
  const rand = seededRandom(seedFromSlug(slug));
  const groupMotif = isCapabilityId(capability) ? MOTIFS[capability] : arcMotif;
  const motif = (SLUG_MOTIFS[slug] ?? groupMotif)(rand);
  const offset = r1(rand() * 16);
  const style = { "--poster-accent": accent } as CSSProperties;
  return (
    <div className={`showcase-art${className ? ` ${className}` : ""}`} style={style} data-poster-slug={slug}>
      <svg className="showcase-art__art" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <g className="showcase-art__grid">
          {Array.from({ length: 11 }, (_, i) => (
            <path key={`v${i}`} d={`M${r1(offset + i * 32)} 0 V${H}`} />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <path key={`h${i}`} d={`M0 ${r1(offset + i * 30)} H${W}`} />
          ))}
        </g>
        {motif}
      </svg>
      {showName && (
        <span className="showcase-art__name" aria-hidden="true">
          {name}
        </span>
      )}
    </div>
  );
}
