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
import { Canvas, useFrame, useThree, type CameraProps, type RootState } from "@react-three/fiber";
import { useMediaQuery } from "@/lib/use-media-query";
import { framePolicy, readRendererString, shouldUseShader } from "@/lib/render-capability";

/** Frame-rate cap while a software rasteriser is drawing the scene. */
const SOFTWARE_FPS = 10;

let softwareRenderer: boolean | undefined;

/**
 * True when WebGL here is a software rasteriser (llvmpipe, SwiftShader).
 * Probed once on a throwaway context so antialias / DPR / frame rate can be
 * chosen before the real context exists. Unknown renderers count as software.
 */
function isSoftwareRenderer(): boolean {
  if (softwareRenderer !== undefined) return softwareRenderer;
  if (typeof document === "undefined") return false;
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = document.createElement("canvas").getContext("webgl");
    softwareRenderer = !shouldUseShader(readRendererString(gl));
  } catch {
    softwareRenderer = true;
  }
  gl?.getExtension("WEBGL_lose_context")?.loseContext();
  return softwareRenderer;
}

/**
 * Software GL only: the Canvas runs frameloop "demand" and this drives a
 * throttled invalidate loop, so animation stays time-based but the CPU
 * rasteriser draws ~SOFTWARE_FPS frames per second instead of every rAF.
 */
function SoftwareThrottle() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const id = window.setInterval(() => invalidate(), 1000 / SOFTWARE_FPS);
    return () => window.clearInterval(id);
  }, [invalidate]);
  return null;
}

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
  dpr = [1, 1.5],
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
  const software = live && isSoftwareRenderer();

  // A live scene that dies (context loss, boundary error) must hand the
  // stage back to the SSR plate — report the drop so the host un-hides it.
  useEffect(() => {
    if (!live) onReadyChange?.(false);
  }, [live, onReadyChange]);

  const onFirstFrame = useCallback(() => onReadyChange?.(true), [onReadyChange]);
  const onSceneError = useCallback(() => onReadyChange?.(false), [onReadyChange]);

  const policy = framePolicy({ inView, software, dpr });

  return (
    <div ref={setHostEl} className={className}>
      {live ? (
        <SceneOverlayContext.Provider value={overlayEl}>
          <SceneBoundary plate={fallback} onError={onSceneError}>
            <Canvas
              frameloop={policy.frameloop}
              dpr={policy.dpr}
              camera={camera}
              gl={{
                antialias: policy.antialias,
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
                  {policy.throttle && <SoftwareThrottle />}
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
