import { bodyPlacement } from "@/lib/cosmos-layout";
import BlackHoleSvg, { BOX_PER_SHADOW } from "./BlackHoleSvg";

/**
 * Server-rendered static background: the black hole as a full-screen SVG
 * still, positioned and sized from the same layout table and span rule as
 * the WebGL scene (wide and tall variants, switched by container aspect
 * ratio in CSS). Visible by default; SiteBackground hides it only while the
 * live scene is rendering. Nothing animates.
 */
export default function CosmosPlate() {
  const w = bodyPlacement("wide");
  const t = bodyPlacement("tall");
  const style = {
    "--xw": w.x,
    "--yw": w.y,
    "--sw": w.size * BOX_PER_SHADOW,
    "--xt": t.x,
    "--yt": t.y,
    "--st": t.size * BOX_PER_SHADOW,
  } as React.CSSProperties;
  return (
    <div className="cosmos-plate" aria-hidden="true">
      <div className="cosmos-body cosmos-body--blackhole" style={style}>
        <BlackHoleSvg />
      </div>
    </div>
  );
}
