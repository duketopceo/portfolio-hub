import type { ReactElement } from "react";
import { seededRandom } from "@/lib/showcase";

/**
 * Project-specific poster motifs: a small abstract diagram of what each
 * project does, drawn in the shared language (thin lines, one accent from the
 * capability group, tokens through classes). Deterministic: the only
 * randomness is a slug-seeded jitter. Projects without an entry fall back to
 * their capability group's motif in ThemedPoster.
 */
export type Rand = ReturnType<typeof seededRandom>;
export type Motif = (rand: Rand) => ReactElement;

const A = "showcase-art__";
const r1 = (n: number) => Math.round(n * 10) / 10;

const path = (d: string, cls = "rule", key?: string | number) => (
  <path key={key} d={d} className={A + cls} fill="none" />
);
const dot = (x: number, y: number, r = 2.4, cls = "dim", key?: string | number) => (
  <circle key={key} cx={x} cy={y} r={r} className={A + cls} />
);
const ring = (x: number, y: number, r: number, cls = "rule", key?: string | number) => (
  <circle key={key} cx={x} cy={y} r={r} className={A + cls} fill="none" />
);
const box = (x: number, y: number, w: number, h: number, cls = "rule", key?: string | number) => (
  <rect
    key={key}
    x={x}
    y={y}
    width={w}
    height={h}
    className={A + cls}
    fill={cls === "panel" || cls === "fill" ? undefined : "none"}
  />
);
const arrow = (x1: number, y: number, x2: number, cls = "rule") =>
  path(`M${x1} ${y} H${x2} M${x2 - 4} ${y - 3} L${x2} ${y} L${x2 - 4} ${y + 3}`, cls);

const orchestral: Motif = () => (
  <g>
    {[40, 65, 90, 115, 140].map((y, i) =>
      path(`M72 90 C130 90 150 ${y} 218 ${y}`, i === 2 ? "line" : "rule", `l${i}`),
    )}
    {[40, 65, 90, 115, 140].map((y, i) => dot(224, y, i === 2 ? 4 : 3, i === 2 ? "dot" : "dim", `w${i}`))}
    {dot(64, 90, 8, "dot")}
    {ring(64, 90, 15)}
    {path("M232 90 H282", "rule")}
    {path("M274 84 l8 6 l-8 6", "line")}
  </g>
);

const argus: Motif = () => (
  <g>
    {box(36, 28, 248, 118)}
    {[44, 56, 68, 80, 92, 104, 116, 128].map((y, i) =>
      path(`M50 ${y} h${[96, 140, 70, 118, 150, 84, 126, 60][i]}`, "rule", `c${i}`),
    )}
    {box(46, 76, 160, 14, "line")}
    {path("M42 72 v-6 h6 M210 72 v-6 h-6 M42 94 v6 h6 M210 94 v6 h-6", "line")}
    {path("M236 100 l8 9 l18 -22", "line")}
    {ring(246, 100, 18, "rule")}
  </g>
);

const kurultai: Motif = (rand) => {
  const cx = 160;
  const cy = 90;
  const rings = [22, 44, 66];
  const pts: Array<[number, number]> = [];
  rings.forEach((r, ri) => {
    const n = 4 + ri * 2;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ri * 0.5 + rand() * 0.2;
      pts.push([r1(cx + Math.cos(a) * r * 1.5), r1(cy + Math.sin(a) * r)]);
    }
  });
  return (
    <g>
      {rings.map((r) => (
        <ellipse key={r} cx={cx} cy={cy} rx={r * 1.5} ry={r} className={A + "rule"} fill="none" />
      ))}
      {pts.map(([x, y], i) => path(`M${cx} ${cy} L${x} ${y}`, "rule", `s${i}`))}
      {pts.map(([x, y], i) => dot(x, y, 2.2, "dim", `p${i}`))}
      {dot(cx, cy, 5, "dot")}
      {ring(cx, cy, 11, "ring")}
    </g>
  );
};

const tallyline: Motif = () => {
  const xs = [32, 100, 168, 236];
  return (
    <g>
      {xs.map((x, i) => box(x, 70, 52, 30, i === 1 ? "line" : "rule", `b${i}`))}
      {xs.slice(0, 3).map((x, i) => arrow(x + 52, 85, xs[i + 1], "rule"))}
      {path("M262 70 C262 38 126 38 126 70", "dash")}
      {box(40, 78, 20, 6, "fill")}
      {box(108, 78, 24, 6, "fill")}
      {[44, 112, 180, 248].map((x, i) => path(`M${x} ${92} h${[16, 20, 12, 18][i]}`, "rule", `t${i}`))}
      {box(176, 112, 40, 20, "rule")}
      {path("M184 122 h24", "rule")}
    </g>
  );
};

const wordink: Motif = () => (
  <g>
    {Array.from({ length: 48 }, (_, i) => {
      const x = 32 + i * 5.5;
      const env = Math.sin((i / 47) * Math.PI);
      const h = r1(4 + env * 38 * Math.abs(Math.sin(i * 1.7) * 0.6 + Math.cos(i * 0.5) * 0.4));
      const hot = i > 14 && i < 33;
      return path(`M${r1(x)} ${r1(80 - h)} V${r1(80 + h)}`, hot ? "line" : "rule", `w${i}`);
    })}
    {path("M32 124 h120 M32 134 h84", "rule")}
    {path("M160 118 v18", "line")}
  </g>
);

const militaryDb: Motif = () => (
  <g>
    {box(34, 32, 252, 112)}
    {box(34, 32, 252, 20, "panel")}
    {[100, 160, 220].map((x) => path(`M${x} 32 V144`, "rule", `v${x}`))}
    {[72, 92, 112, 132].map((y) => path(`M34 ${y} H286`, "rule", `h${y}`))}
    {box(34, 92, 252, 20, "line")}
    {[0, 1, 2, 3].map((i) => path(`M44 ${62 + i * 20} h${[34, 28, 40, 24][i]}`, "rule", `n${i}`))}
    {[0, 1, 2, 3].map((i) => dot(250, 62 + i * 20, 2.6, i === 2 ? "dot" : "dim", `d${i}`))}
  </g>
);

const reactorSim: Motif = () => (
  <g>
    {ring(100, 90, 40)}
    {[-18, -6, 6, 18].map((dx, i) => path(`M${100 + dx} ${i === 1 ? 56 : 74} V${112}`, i === 1 ? "line" : "rule", `r${i}`))}
    {path("M140 78 H210 V50 H258 V130 H210 V102 H140", "rule")}
    {ring(234, 90, 14)}
    {path("M226 90 h16", "line")}
    {path("M100 50 V38 H62 V90", "dash")}
    {path("M40 140 C80 140 90 120 130 126 S200 150 280 138", "rule")}
  </g>
);

const dayflow: Motif = () => (
  <g>
    {path("M32 118 H288", "rule")}
    {Array.from({ length: 17 }, (_, i) => path(`M${32 + i * 16} 118 v${i % 4 === 0 ? 8 : 4}`, "rule", `t${i}`))}
    {[
      [32, 52, 60],
      [92, 40, 74],
      [132, 70, 52],
      [188, 30, 44],
      [234, 56, 38],
    ].map(([x, w, y], i) => box(x, y, w, 18, i === 1 ? "line" : "rule", `a${i}`))}
    {[
      [44, 42],
      [100, 50],
      [160, 30],
      [214, 44],
    ].map(([x, w], i) => box(x, 92, w, 12, "rule", `b${i}`))}
    {box(100, 92, 50, 12, "fill")}
  </g>
);

const kate: Motif = () => (
  <g>
    {box(54, 24, 88, 128)}
    {box(62, 36, 72, 22, "line")}
    {box(62, 64, 72, 22)}
    {box(62, 92, 72, 22)}
    {path("M68 44 h40 M68 72 h52 M68 100 h30", "rule")}
    {[200, 240, 276].map((x, i) => (
      <g key={x}>
        {ring(x, 60 + (i % 2) * 40, 10, i === 0 ? "line" : "rule")}
        {path(`M${x - 10} ${60 + (i % 2) * 40} C${x - 40} ${60 + (i % 2) * 40} 170 ${48 + i * 22} 142 ${48 + i * 22}`, "dash")}
      </g>
    ))}
    {dot(200, 60, 3, "dot")}
  </g>
);

const paceServer: Motif = () => (
  <g>
    {[34, 82, 130].map((y, i) => (
      <g key={y}>
        {box(40, y, 240, 30, i === 0 ? "line" : "rule")}
        {path(`M52 ${y + 15} h${[70, 96, 54][i]}`, i === 0 ? "line" : "rule")}
        {[0, 1, 2].map((j) => dot(236 + j * 12, y + 15, 2.2, "dim", `d${i}${j}`))}
      </g>
    ))}
    {path("M160 64 V82 M160 112 V130", "rule")}
    {path("M156 74 l4 6 l4 -6 M156 122 l4 6 l4 -6", "line")}
  </g>
);

const khan: Motif = () => (
  <g>
    {[40, 100, 160, 220].map((x, i) => (
      <g key={x}>
        {ring(x, 100, 11, i === 2 ? "line" : "rule")}
        {i < 3 && arrow(x + 11, 100, [100, 160, 220][i] - 11)}
      </g>
    ))}
    {dot(160, 100, 3.4, "dot")}
    {path("M160 89 C160 56 100 56 100 89", "dash")}
    {box(254, 84, 30, 32)}
    {ring(269, 94, 6)}
    {path("M269 100 v8", "line")}
    {path("M40 140 H220", "rule")}
    {path("M40 140 h60", "line")}
  </g>
);

const openComputer: Motif = () => (
  <g>
    {box(112, 34, 164, 112, "dash")}
    {[150, 190, 236].map((x, i) => box(x - 14, 60 + (i % 2) * 36, 28, 22, i === 1 ? "line" : "rule", `u${i}`))}
    {arrow(30, 90, 112)}
    {path("M112 70 v-12 M112 122 v12", "line")}
    {path("M104 90 h16", "line")}
    {path("M40 154 H280", "rule")}
    {box(40, 150, 110, 8, "fill")}
    {path("M240 146 v14", "line")}
  </g>
);

const wisp: Motif = () => (
  <g>
    {box(36, 30, 190, 114)}
    {path("M36 46 H226", "rule")}
    {path("M52 66 h96 M52 80 h130 M52 94 h70", "rule")}
    {path("M92 112 l0 12 l3 -3 l3 6 l2 -1 l-3 -6 l5 0 z", "fill")}
    {ring(120, 100, 14, "line")}
    {dot(262, 60, 5, "dot")}
    {[14, 26, 38].map((r) => path(`M${262 + r * 0.7} ${60 - r * 0.7} A${r} ${r} 0 0 1 ${262 + r * 0.7} ${60 + r * 0.7}`, r === 14 ? "line" : "rule", `a${r}`))}
    {path("M262 66 V110", "rule")}
  </g>
);

const openrouter: Motif = () => (
  <g>
    {dot(40, 90, 5, "dot")}
    <path d="M70 90 l14 -14 l14 14 l-14 14 z" className={A + "line"} fill="none" />
    {path("M45 90 H70", "rule")}
    {[44, 74, 106, 136].map((y, i) => (
      <g key={y}>
        {path(`M98 90 C130 90 130 ${y} 156 ${y}`, "rule")}
        {box(156, y - 6, [120, 84, 100, 56][i], 12, i === 3 ? "line" : "rule")}
        {box(156, y - 6, [120, 84, 100, 56][i] * 0.5, 12, i === 3 ? "fill" : "panel")}
      </g>
    ))}
  </g>
);

const portfolio: Motif = () => (
  <g>
    {box(34, 30, 120, 70, "line")}
    {path("M44 44 h60 M44 56 h84", "rule")}
    {[0, 1, 2].map((i) => box(166 + (i % 2) * 62, 30 + Math.floor(i / 2) * 38, 54, 30, "rule", `c${i}`))}
    {[0, 1, 2, 3].map((i) => box(34 + i * 62, 112, 54, 32, "rule", `g${i}`))}
    {ring(262, 100, 14)}
    {dot(262, 100, 3, "dot")}
  </g>
);

const agentflow: Motif = () => (
  <g>
    {dot(50, 90, 5, "dot")}
    {[50, 130].map((y, i) => (
      <g key={y}>
        {path(`M55 90 C90 90 90 ${y} 120 ${y}`, "rule")}
        {box(120, y - 10, 40, 20, i === 0 ? "line" : "rule")}
        {path(`M160 ${y} C190 ${y} 190 90 220 90`, "rule")}
      </g>
    ))}
    {box(120, 80, 40, 20)}
    {path("M160 90 H220", "rule")}
    {box(220, 78, 50, 24, "line")}
    {path("M230 90 h30", "line")}
  </g>
);

const omaseal: Motif = () => (
  <g>
    {ring(110, 90, 26, "line")}
    {ring(110, 90, 8)}
    {path("M136 90 H236 M214 90 v16 M230 90 v12", "line")}
    {[0, 1, 2, 3, 4, 5].map((i) => dot(60 + i * 26, 136, 3.2, i < 4 ? "dot" : "dim", `m${i}`))}
  </g>
);

const dixi: Motif = () => (
  <g>
    {box(36, 28, 248, 124, "dash")}
    {ring(160, 112, 14)}
    {[
      [-52, -40],
      [-26, -62],
      [0, -68],
      [26, -62],
      [50, -34],
    ].map(([dx, dy], i) => (
      <g key={i}>
        {path(`M160 ${112 - 14} L${160 + dx * 0.5} ${112 + dy * 0.5} L${160 + dx} ${112 + dy}`, i === 2 ? "line" : "rule")}
        {dot(160 + dx, 112 + dy, 2.6, i === 2 ? "dot" : "dim")}
      </g>
    ))}
  </g>
);

const cairn: Motif = () => (
  <g>
    {box(60, 40, 170, 100)}
    {box(76, 26, 170, 100, "line")}
    {path("M92 46 h110", "line")}
    {[62, 80, 98, 116].map((y, i) => (
      <g key={y}>
        {box(92, y - 6, 130, 12, i === 1 ? "line" : "rule")}
      </g>
    ))}
    {box(92, 74, 40, 12, "fill")}
  </g>
);

const jev: Motif = () => (
  <g>
    {Array.from({ length: 22 }, (_, i) => {
      const x = 34 + i * 11;
      const kept = i % 5 === 0 || i > 17;
      return kept
        ? path(`M${x} 50 V130`, "line", `k${i}`)
        : dot(x, 90, 1.8, "dim", `t${i}`);
    })}
    {path("M34 140 H286", "rule")}
    {path("M34 40 H286", "rule")}
  </g>
);

const tierBars: Motif = () => (
  <g>
    {Array.from({ length: 9 }, (_, i) => box(36 + i * 28, 140 - [30, 50, 36, 70, 56, 90, 64, 100, 80][i], 18, [30, 50, 36, 70, 56, 90, 64, 100, 80][i], i === 7 ? "line" : "rule", `b${i}`))}
    {path("M30 70 H290", "dash")}
  </g>
);


const keysRow = (n: number, y: number, x0: number, w: number, hot: number, keyBase: string) =>
  Array.from({ length: n }, (_, i) => box(x0 + i * (w + 8), y, w, w, i === hot ? "line" : "rule", `${keyBase}${i}`));

const fivebyfive: Motif = () => (
  <g>
    {keysRow(5, 100, 40, 40, 2, "k")}
    {[0, 1, 2, 3, 4].map((i) => ring(60 + i * 48, 62, 14, i === 3 ? "line" : "rule", `n${i}`))}
    {[0, 1, 2, 3, 4].map((i) => path(`M${60 + i * 48} 62 v-9`, i === 3 ? "line" : "rule", `h${i}`))}
  </g>
);

const helm: Motif = () => (
  <g>
    {keysRow(3, 40, 50, 36, 1, "a")}
    {keysRow(3, 92, 50, 36, 4, "b")}
    {ring(236, 90, 38, "line")}
    {ring(236, 90, 26)}
    {path("M236 90 L252 66", "line")}
  </g>
);

const snapdex: Motif = () => (
  <g>
    {box(34, 40, 110, 76)}
    {path("M34 56 H144 M44 74 h60 M44 88 h80", "rule")}
    {arrow(152, 78, 190)}
    {box(198, 56, 88, 10, "fill")}
    {path("M198 80 h88 M198 94 h60", "rule")}
    {path("M34 140 H286", "rule")}
  </g>
);

const keytypist: Motif = () => (
  <g>
    {keysRow(8, 104, 32, 24, 4, "k")}
    {[0.2, 0.35, 0.9, 0.5, 0.15].map((v, i) => box(88 + i * 32, r1(96 - v * 56), 20, r1(v * 56), i === 2 ? "fill" : "rule", `p${i}`))}
    {path("M32 56 h40", "line")}
  </g>
);

const pluginsBar: Motif = () => (
  <g>
    {box(30, 64, 260, 34, "rule")}
    {[0, 1, 2, 3, 4, 5].map((i) => box(40 + i * 38, 72, 30, 18, i === 2 ? "line" : "rule", `m${i}`))}
    {box(40 + 76, 72, 30, 18, "fill")}
    {box(80, 112, 160, 34, "dash")}
    {path("M96 124 h60 M96 134 h90", "rule")}
  </g>
);

const a0plugins: Motif = () => (
  <g>
    {box(120, 70, 80, 40, "line")}
    {[0, 1, 2, 3, 4, 5, 6].map((i) => {
      const x = 42 + i * 38;
      return (
        <g key={i}>
          {box(x - 10, 140, 20, 14, i === 3 ? "line" : "rule")}
          {path(`M${x} 140 V${i < 3 ? 120 : 116} H${i < 3 ? 120 : 200}`, "rule")}
        </g>
      );
    })}
    {path("M130 80 h60 M130 94 h40", "rule")}
  </g>
);

const harbor: Motif = () => (
  <g>
    {box(60, 30, 200, 120)}
    {box(76, 44, 110, 22, "rule")}
    {box(134, 76, 110, 22, "line")}
    {box(76, 108, 90, 22, "rule")}
    {path("M84 55 h70 M142 87 h80 M84 119 h50", "rule")}
    {box(76, 134, 168, 8, "fill")}
  </g>
);

const paceGallery: Motif = () => (
  <g>
    {Array.from({ length: 8 }, (_, i) => box(34 + (i % 4) * 64, 34 + Math.floor(i / 4) * 58, 56, 48, i === 5 ? "line" : "rule", `c${i}`))}
    {ring(206, 124, 12, "ring")}
    {path("M42 120 h38 M42 130 h24", "rule")}
  </g>
);

const scooter: Motif = () => (
  <g>
    {box(40, 36, 76, 120)}
    {dot(78, 138, 3, "dim")}
    {[16, 28, 40].map((r) => path(`M${180 + r * 0.7} ${90 - r * 0.7} A${r} ${r} 0 0 1 ${180 + r * 0.7} ${90 + r * 0.7}`, r === 16 ? "line" : "rule", `a${r}`))}
    {dot(180, 90, 4, "dot")}
    {path("M210 140 A40 40 0 0 1 290 140", "rule")}
    {path("M250 140 L270 112", "line")}
  </g>
);

const rts: Motif = () => (
  <g>
    {box(60, 50, 120, 70, "dash")}
    {[[80, 70], [110, 90], [140, 70], [160, 104], [90, 108]].map(([x, y], i) => dot(x, y, 4, i < 4 ? "dot" : "dim", `u${i}`))}
    {arrow(190, 90, 270, "line")}
    {ring(278, 90, 10)}
    {path("M40 140 H280", "rule")}
  </g>
);

const homelab: Motif = () => (
  <g>
    {[[160, 40], [70, 120], [250, 120]].map(([x, y], i) => (
      <g key={i}>
        {box(x - 30, y - 16, 60, 32, i === 0 ? "line" : "rule")}
        {path(`M${x - 20} ${y - 4} h30 M${x - 20} ${y + 6} h20`, "rule")}
      </g>
    ))}
    {path("M130 56 L86 106 M190 56 L234 106 M100 120 H220", "dash")}
  </g>
);

const lukeAgents: Motif = () => (
  <g>
    {box(130, 28, 60, 22, "line")}
    {[70, 250].map((x) => (
      <g key={x}>
        {path(`M160 50 V66 H${x} V84`, "rule")}
        {box(x - 30, 84, 60, 22)}
        {path(`M${x} 106 V122`, "rule")}
        {box(x - 22, 122, 44, 18, "rule")}
      </g>
    ))}
    {path("M160 50 V84", "rule")}
    {box(130, 84, 60, 22)}
  </g>
);

const blog: Motif = () => (
  <g>
    {box(70, 26, 180, 128)}
    {box(86, 40, 70, 8, "fill")}
    {[62, 74, 86, 98, 110, 122].map((y, i) => path(`M86 ${y} h${[140, 120, 132, 100, 128, 70][i]}`, "rule", `l${i}`))}
  </g>
);

const pinetree: Motif = () => (
  <g>
    {box(34, 34, 100, 112)}
    {path("M44 52 h60 M44 66 h80 M44 80 h50", "rule")}
    {box(44, 94, 80, 10, "line")}
    {arrow(142, 90, 178)}
    {box(186, 50, 100, 80)}
    {[70, 90, 110].map((y) => path(`M186 ${y} H286`, "rule", `h${y}`))}
    {path("M222 50 V130", "rule")}
    {box(186, 50, 100, 20, "panel")}
  </g>
);

export const SLUG_MOTIFS: Record<string, Motif> = {
  orchestral,
  argus,
  kurultai,
  tallyline,
  wordink,
  "military-hardware-db": militaryDb,
  "reactor-sim": reactorSim,
  "dayflow-linux": dayflow,
  kate,
  "pace-server": paceServer,
  khan,
  "open-computer": openComputer,
  wisp,
  openrouter,
  "portfolio-hub": portfolio,
  agentflow,
  omaseal,
  dixi,
  cairn,
  "jev-compact": jev,
  "openrouter-usage": tierBars,
  fivebyfive,
  "helm-qmk-macropad": helm,
  snapdex,
  keytypist,
  "omarchy-plugins": pluginsBar,
  "agent-zero-plugins": a0plugins,
  "harbor-openrouter-ios-client": harbor,
  "pace-gallery": paceGallery,
  "scooter-ios": scooter,
  "rts-skyrim": rts,
  homelab,
  "luke-agents": lukeAgents,
  "personal-blog": blog,
  "pinetree-solari-demo": pinetree,
};
