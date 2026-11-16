"use client";

import Starfield from "@/components/scene/Starfield";
import { starCount, type CosmosTier } from "@/lib/cosmos-quality";
import { useThree } from "@react-three/fiber";

/**
 * The whole background in one canvas: a layered starfield on deep black, fixed
 * behind the page, the stars shifting by depth as the page scrolls. `tier` is
 * the current rung of the quality ladder (cosmos-quality.ts), which sets the
 * star count.
 */
export default function CosmosScene({ tier = "full", touch = false }: { tier?: CosmosTier; touch?: boolean }) {
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  return <Starfield count={starCount(tier, width, height, touch)} />;
}
