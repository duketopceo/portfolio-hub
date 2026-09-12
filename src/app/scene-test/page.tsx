"use client";

import { Canvas } from "@react-three/fiber";

export default function SceneTest() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#111" }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshBasicMaterial color="tomato" />
        </mesh>
      </Canvas>
    </div>
  );
}
