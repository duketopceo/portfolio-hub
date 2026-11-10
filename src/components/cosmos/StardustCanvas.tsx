"use client";

import { useEffect, useRef } from "react";
import { seededRandom } from "@/components/scene/random";
import {
  STARDUST_COLORS,
  dustProgress,
  moteX,
  seedMotes,
  spawnMote,
  stepMote,
  twinkle,
  type Mote,
} from "@/lib/stardust";

const MAX_DPR = 1.5;
/** Sprite radius in px at 1x; scaled per mote. */
const SPRITE = 16;

/** Pre-render one soft round sprite per colour so each frame is drawImage only. */
function makeSprites(): HTMLCanvasElement[] {
  return STARDUST_COLORS.map((color) => {
    const c = document.createElement("canvas");
    c.width = c.height = SPRITE * 2;
    const g = c.getContext("2d");
    if (g) {
      const grad = g.createRadialGradient(SPRITE, SPRITE, 0, SPRITE, SPRITE, SPRITE);
      grad.addColorStop(0, color);
      grad.addColorStop(0.18, color);
      grad.addColorStop(0.55, `${color}33`);
      grad.addColorStop(1, `${color}00`);
      g.fillStyle = grad;
      g.fillRect(0, 0, SPRITE * 2, SPRITE * 2);
    }
    return c;
  });
}

/**
 * Falling starlight: sparse motes drifting down as the page scrolls. 2D
 * canvas, no WebGL context. Idle (no frames at all) while the visitor is at
 * the top of the page, in a hidden tab, or under reduced motion; the parent
 * only mounts this when the live rendition is chosen.
 */
export default function StardustCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rand = seededRandom(20261110);
    const sprites = makeSprites();
    let motes: Mote[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let lastScroll = window.scrollY;
    let progress = dustProgress(window.scrollY, window.innerHeight);
    let tabVisible = document.visibilityState !== "hidden";

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      motes = seedMotes(rand, w, h);
    };

    const draw = (now: number) => {
      raf = 0;
      const dt = Math.min((now - last) / 1000 || 0.016, 0.05);
      last = now;
      const sy = window.scrollY;
      const scrollDelta = sy - lastScroll;
      lastScroll = sy;
      progress = dustProgress(sy, h);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        if (stepMote(m, dt, h, scrollDelta)) motes[i] = spawnMote(rand, w, h, true);
        const a = m.alpha * twinkle(m, t) * progress;
        if (a < 0.01) continue;
        const size = m.r * 6;
        ctx.globalAlpha = a;
        ctx.drawImage(sprites[m.color], moteX(m) - size / 2, m.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      schedule();
    };

    const running = () => tabVisible && progress > 0.01;
    const schedule = () => {
      if (!raf && running()) raf = requestAnimationFrame(draw);
    };
    const onScroll = () => {
      progress = dustProgress(window.scrollY, h);
      if (!running() && raf === 0) ctx.clearRect(0, 0, w, h);
      last = performance.now();
      schedule();
    };
    const onVisibility = () => {
      tabVisible = document.visibilityState !== "hidden";
      if (tabVisible) {
        last = performance.now();
        schedule();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    last = performance.now();
    schedule();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="cosmos-dust-canvas" aria-hidden="true" />;
}
