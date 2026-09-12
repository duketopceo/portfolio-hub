"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

function Starfield() {
  useFrame((state) => {
    state.camera.rotation.y += 0.0001;
    state.camera.rotation.x += 0.00005;
  });

  return (
    <>
      <Stars
        radius={160}
        depth={60}
        count={6000}
        factor={5}
        saturation={0}
        fade
        speed={0.2}
      />
    </>
  );
}

export default function SubtleStarfield({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{ background: "var(--background)" }}
    >
      <Canvas
        camera={{ position: [0, 0, 1], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false }}
        style={{ width: "100%", height: "100%" }}
      >
        <Starfield />
      </Canvas>
    </div>
  );
}
