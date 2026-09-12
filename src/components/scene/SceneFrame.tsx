"use client";

import {
  Component,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Canvas, type CameraProps, type RootState } from "@react-three/fiber";
import { useMediaQuery } from "@/lib/use-media-query";

/**
 * Sibling overlay that drei <Html> markers portal into — outside the
 * aria-hidden canvas element and outside the R3F container's pointer-inert
 * subtree semantics. Null until mounted.
 */
const SceneOverlayContext = createContext<HTMLElement | null>(null);

export function useSceneOverlay() {
  return useContext(SceneOverlayContext);
}

interface SceneFrameProps {
  children: ReactNode;
  /**
   * Static DOM plate rendered instead of the canvas — reduced motion,
   * WebGL context failure, or a scene render error.
   */
  fallback?: ReactNode;
  className?: string;
  camera?: CameraProps;
  dpr?: [number, number];
}

class SceneBoundary extends Component<
  { plate: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.plate : this.props.children;
  }
}

/**
 * Shared mount contract for every R3F surface:
 * - prefers-reduced-motion → static plate, no WebGL context
 * - IntersectionObserver → frameloop pauses when scrolled out
 * - aria-hidden scoped to the <canvas> element only — drei <Html> markers
 *   portal into the (visible) R3F container and must stay in the a11y tree
 * - pointer-events: none on the R3F container; markers re-enable themselves.
 *   eventSource points at the host so camera parallax observes the stage
 *   without the canvas taking hit-testing away from DOM links.
 * - context-creation failure → Canvas fallback; render error or context
 *   loss → static plate
 */
export default function SceneFrame({
  children,
  fallback = null,
  className,
  camera,
  dpr = [1, 2],
}: SceneFrameProps) {
  const [hostEl, setHostEl] = useState<HTMLDivElement | null>(null);
  const [overlayEl, setOverlayEl] = useState<HTMLDivElement | null>(null);
  const motionOK = !useMediaQuery("(prefers-reduced-motion: reduce)", true);
  // Optimistic: run the frame loop immediately. IO only ever downgrades to
  // paused when the surface scrolls out — hidden tabs throttle rAF anyway.
  const [inView, setInView] = useState(true);
  const [ctxLost, setCtxLost] = useState(false);

  useEffect(() => {
    if (!hostEl || !motionOK) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "10%" }
    );
    io.observe(hostEl);
    return () => io.disconnect();
  }, [hostEl, motionOK]);

  useEffect(() => {
    if (!hostEl) return;
    const onCtxFail = (e: Event) => {
      e.preventDefault();
      setCtxLost(true);
    };
    hostEl.addEventListener("webglcontextcreationerror", onCtxFail, true);
    hostEl.addEventListener("webglcontextlost", onCtxFail, true);
    return () => {
      hostEl.removeEventListener("webglcontextcreationerror", onCtxFail, true);
      hostEl.removeEventListener("webglcontextlost", onCtxFail, true);
    };
  }, [hostEl]);

  const onCreated = useCallback((state: RootState) => {
    // Only the canvas is decorative-hidden — DOM markers portal to the
    // sibling overlay and must stay in the accessibility tree.
    state.gl.domElement.setAttribute("aria-hidden", "true");
  }, []);

  const live = motionOK && !ctxLost;

  return (
    <div ref={setHostEl} className={className}>
      {live ? (
        <SceneOverlayContext.Provider value={overlayEl}>
          <SceneBoundary plate={fallback}>
            <Canvas
              frameloop={inView ? "always" : "never"}
              dpr={dpr}
              camera={camera}
              gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
              style={{ pointerEvents: "none" }}
              eventSource={hostEl ?? undefined}
              onCreated={onCreated}
            >
              {overlayEl ? children : null}
            </Canvas>
          </SceneBoundary>
          <div ref={setOverlayEl} className="scene-overlay" />
        </SceneOverlayContext.Provider>
      ) : (
        fallback
      )}
    </div>
  );
}
