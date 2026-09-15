"use client";

import {
  Component,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame, type CameraProps, type RootState } from "@react-three/fiber";
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
  /**
   * Called once with `true` on the first rendered frame after the scene's
   * children (overlay markers included) have mounted, and with `false` if
   * the live scene is later lost (context loss or render error). Used by
   * surfaces whose static plate is server-rendered as a sibling so they
   * can swap visibility — never latch; re-shows on failure.
   */
  onReadyChange?: (ready: boolean) => void;
}

class SceneBoundary extends Component<
  { plate: ReactNode; children: ReactNode; onError?: (error: Error) => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }
  render() {
    return this.state.failed ? this.props.plate : this.props.children;
  }
}

/** Fires once on the first frame after this component's siblings mount. */
function FirstFrameSignal({ onFirstFrame }: { onFirstFrame: () => void }) {
  const fired = useRef(false);
  useFrame(() => {
    if (!fired.current) {
      fired.current = true;
      onFirstFrame();
    }
  });
  return null;
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
  onReadyChange,
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

  // A live scene that dies (context loss, boundary error) must hand the
  // stage back to the SSR plate — report the drop so the host un-hides it.
  useEffect(() => {
    if (!live) onReadyChange?.(false);
  }, [live, onReadyChange]);

  const onFirstFrame = useCallback(() => onReadyChange?.(true), [onReadyChange]);
  const onSceneError = useCallback(() => onReadyChange?.(false), [onReadyChange]);

  return (
    <div ref={setHostEl} className={className}>
      {live ? (
        <SceneOverlayContext.Provider value={overlayEl}>
          <SceneBoundary plate={fallback} onError={onSceneError}>
            <Canvas
              frameloop={inView ? "always" : "never"}
              dpr={dpr}
              camera={camera}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: "low-power",
                preserveDrawingBuffer: true,
              }}
              style={{ pointerEvents: "none" }}
              eventSource={hostEl ?? undefined}
              onCreated={onCreated}
            >
              {overlayEl ? (
                <>
                  {children}
                  <FirstFrameSignal onFirstFrame={onFirstFrame} />
                </>
              ) : null}
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
