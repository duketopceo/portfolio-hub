"use client";

import { useEffect, useState } from "react";
import { OrbitalSphereBackground } from "@designcodeio/threeui/components/OrbitalSphereBackground";

/**
 * Rotating particle sphere at the center of the primary orbit —
 * the body currently under survey. Static under reduced motion.
 */
export default function OrbitalBody() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setEnabled(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (!enabled) return null;

  return (
    <div className="solar-body" aria-hidden="true">
      <OrbitalSphereBackground
        speed={0.5}
        scale={0.55}
        particleSize={1.6}
        particleOpacity={0.4}
        orbitOpacity={0.28}
        haloOpacity={0.12}
        hue={175}
      />
    </div>
  );
}
