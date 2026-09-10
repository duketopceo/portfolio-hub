"use client";

import { useRef, useState, useMemo, useEffect, Suspense, type CSSProperties } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Html, OrbitControls, useTexture } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { DoubleSide, Group, type Mesh } from "three";
import { resolvePlanetVisual, planetSizeScale } from "@/lib/planet-visual";
import type { EnrichedProject } from "@/lib/types";

interface SolarSystemSceneProps {
  projects: EnrichedProject[];
  className?: string;
  style?: CSSProperties;
}

function ellipticalPosition(
  index: number,
  count: number,
  a: number,
  b: number,
  offset = 0
): [number, number, number] {
  const angle = (index / count) * Math.PI * 2 + offset;
  return [a * Math.cos(angle), 0, b * Math.sin(angle)];
}

function GiantPlanet() {
  const texture = useTexture("/textures/jupiter.jpg");
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0003;
    }
  });

  return (
    <group position={[-30, -20, -70]}>
      <mesh ref={meshRef} scale={32}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshStandardMaterial
          map={texture}
          emissive="#2a1a0f"
          emissiveIntensity={0.12}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}

function AsteroidBelt({
  count = 200,
  innerRadius = 12,
  outerRadius = 16,
}: {
  count?: number;
  innerRadius?: number;
  outerRadius?: number;
}) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const fract = (x: number) => x - Math.floor(x);
    const hash = (n: number) => fract(Math.sin(n * 12.9898) * 43758.5453);

    for (let i = 0; i < count; i++) {
      const angle = hash(i) * Math.PI * 2;
      const r = innerRadius + hash(i + 100) * (outerRadius - innerRadius);
      const y = (hash(i + 200) - 0.5) * 0.6;
      pos[i * 3] = r * Math.cos(angle);
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = r * Math.sin(angle);
    }
    return pos;
  }, [count, innerRadius, outerRadius]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#9ca3af"
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.45}
      />
    </points>
  );
}

function SunGlow() {
  return (
    <mesh scale={1.7}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        color="#F59E0B"
        transparent
        opacity={0.18}
      />
    </mesh>
  );
}

function Planet({
  project,
  position,
}: {
  project: EnrichedProject;
  position: [number, number, number];
}) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const visual = useMemo(
    () => resolvePlanetVisual(project, "primary"),
    [project]
  );
  const color = visual.color;
  const baseScale = planetSizeScale(visual.size) * 0.45;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
    }
  });

  const handleClick = () => {
    router.push(`/projects/${project.slug}`);
  };

  return (
    <group
      position={position}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh
        ref={meshRef}
        scale={
          hovered ? [baseScale * 1.2, baseScale * 1.2, baseScale * 1.2] : baseScale
        }
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.25}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {visual.rings.map((ring, i) => (
        <mesh
          key={i}
          rotation={[Math.PI / 2.2, 0, (ring.tilt ?? 0) * (Math.PI / 180)]}
          scale={[baseScale, baseScale, baseScale]}
        >
          <ringGeometry args={[1.35, 1.9, 64]} />
          <meshBasicMaterial
            color={ring.color ?? color}
            transparent
            opacity={ring.opacity ?? 0.3}
            side={DoubleSide}
          />
        </mesh>
      ))}

      {hovered && (
        <Html distanceFactor={12}>
          <div
            style={{
              color: "#fff",
              background: "rgba(8, 12, 20, 0.85)",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: `1px solid ${color}`,
              fontSize: "0.75rem",
              maxWidth: "14rem",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ fontWeight: 600 }}>{project.displayName}</div>
            <div style={{ color: "var(--color-text-muted)", marginTop: 2 }}>
              {project.tagline}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function System({ projects }: { projects: EnrichedProject[] }) {
  const groupRef = useRef<Group>(null);
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  useFrame(() => {
    if (groupRef.current && !reducedMotion) {
      groupRef.current.rotation.y += 0.0008;
    }
  });

  const a = 9;
  const b = 5.5;
  const count = projects.length || 1;
  const offset = Math.PI / 6;

  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#FBBF24" />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#14B8A6" />
      <Suspense fallback={null}>
        <GiantPlanet />
      </Suspense>
      <Stars radius={120} depth={60} count={6000} factor={5} saturation={0} fade speed={0.8} />

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 48, 48]} />
        <meshStandardMaterial
          color="#FBBF24"
          emissive="#F59E0B"
          emissiveIntensity={1.2}
          roughness={0.5}
        />
      </mesh>
      <SunGlow />

      <group ref={groupRef}>
        {projects.map((project, i) => (
          <Planet
            key={project.slug}
            project={project}
            position={ellipticalPosition(i, count, a, b, offset)}
          />
        ))}
      </group>

      <AsteroidBelt count={240} innerRadius={13} outerRadius={19} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.2}
        enableDamping
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.6}
      />
    </>
  );
}

export default function SolarSystemScene({
  projects,
  className,
  style,
}: SolarSystemSceneProps) {
  return (
    <div
      className={className ?? "solar-system-scene"}
      style={style}
    >
      <Canvas camera={{ position: [0, 4, 22], fov: 45 }} dpr={[1, 2]}>
        <System projects={projects} />
      </Canvas>
    </div>
  );
}
