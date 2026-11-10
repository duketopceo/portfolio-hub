import { bodyPlacement } from "@/lib/cosmos-layout";
import BlackHoleSvg from "./BlackHoleSvg";

/** SVG box width as a multiple of the hole's own diameter (room for the reticle). */
const BOX = 1.04;

/**
 * Server-rendered static background: the black hole as SVG, positioned from
 * the same layout table as the WebGL scene (wide and tall variants, switched
 * by container aspect ratio in CSS). Visible by default; SiteBackground hides
 * it only while the live scene is rendering. The disk streaks turn slowly in
 * CSS (cosmos.css) unless the visitor asks for reduced motion.
 */
export default function CosmosPlate() {
  const w = bodyPlacement("wide", "blackhole");
  const t = bodyPlacement("tall", "blackhole");
  const style = {
    "--xw": w.x,
    "--yw": w.y,
    "--sw": w.size * BOX,
    "--xt": t.x,
    "--yt": t.y,
    "--st": t.size * BOX,
  } as React.CSSProperties;
  return (
    <div className="cosmos-plate" aria-hidden="true">
      <div className="cosmos-body cosmos-body--blackhole" style={style}>
        <BlackHoleSvg />
      </div>
    </div>
  );
}
