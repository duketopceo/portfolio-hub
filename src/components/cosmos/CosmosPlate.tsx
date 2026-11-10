import { bodyPlacement, type BodyId } from "@/lib/cosmos-layout";
import BlackHoleSvg from "./BlackHoleSvg";
import PlanetSvg, { type PlanetKind } from "./PlanetSvg";

/** Box factor: SVG box width as a multiple of the body's own diameter. */
const BOX: Record<BodyId, number> = { blackhole: 1.04, rocky: 2.5, gas: 2.5, ice: 2.5 };

/** Direction from each planet toward the black hole, in SVG space (y down). */
function lightToward(from: { x: number; y: number }, to: { x: number; y: number }, aspect: number): [number, number] {
  const dx = (to.x - from.x) * aspect;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return [dx / len, dy / len];
}

const PLANETS: PlanetKind[] = ["ice", "rocky", "gas"];

/**
 * Server-rendered static background: black hole and three planet types as
 * SVG, positioned from the same layout table as the WebGL scene (wide and
 * tall variants, switched by container aspect ratio in CSS). Visible by
 * default; SiteBackground hides it only while the live scene is rendering.
 */
export default function CosmosPlate() {
  const bodies: BodyId[] = ["blackhole", "ice", "rocky", "gas"];
  return (
    <div className="cosmos-plate" aria-hidden="true">
      {bodies.map((id) => {
        const w = bodyPlacement("wide", id);
        const t = bodyPlacement("tall", id);
        const style = {
          "--xw": w.x,
          "--yw": w.y,
          "--sw": w.size * BOX[id],
          "--xt": t.x,
          "--yt": t.y,
          "--st": t.size * BOX[id],
        } as React.CSSProperties;
        const kind = PLANETS.find((k) => k === id);
        const hole = bodyPlacement("wide", "blackhole");
        const light = kind ? lightToward(w, hole, 16 / 9) : ([0, 0] as [number, number]);
        return (
          <div key={id} className={`cosmos-body cosmos-body--${id}`} style={style}>
            {kind ? <PlanetSvg kind={kind} light={light} /> : <BlackHoleSvg />}
          </div>
        );
      })}
    </div>
  );
}
