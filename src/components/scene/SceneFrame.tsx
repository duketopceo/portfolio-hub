"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, type CameraProps } from "@react-three/fiber";

interface SceneFrameProps {
  children: ReactNode;
  /** Static DOM rendered instead of the canvas under reduced motion. */
  fallback?: ReactNode;
  className?: string;
  camera?: CameraProps;
  dpr?: [number, number];
}

/**
 * Shared mount contract for every R3F surface:
 * - prefers-reduced-motion → static fallback, no WebGL context
 * - IntersectionObserver → canvas mounts only in view, frameloop pauses off-screen
 * - pointer-events: none — DOM overlay owns interaction
 */
export default function SceneFrame({
  children,
  fallback = null,
  className,
  camera,
  dpr = [1, 2],
}: SceneFrameProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [motionOK, setMotionOK] = useState(false);
  // Optimistic: run the frame loop immediately. IO only ever downgrades to
  // paused when the surface scrolls out — browsers throttle rAF on hidden
  // tabs regardless.
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setMotionOK(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || !motionOK) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "10%" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [motionOK]);

  if (!motionOK) return <>{fallback}</>;

  return (
    <div ref={hostRef} className={className} aria-hidden="true" data-scene-state={inView ? "live" : "idle"}>
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={dpr}
        camera={camera}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        style={{ pointerEvents: "none" }}
      >
        {children}
      </Canvas>
    </div>
  );
}
