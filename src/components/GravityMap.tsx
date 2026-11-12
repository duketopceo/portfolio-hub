"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { GravityMapData, MapRepo } from "@/lib/gravity-map";
import styles from "./gravity-map.module.css";

/**
 * Gravity map — categories as fields of mass, repos as orbiting bodies, and
 * finished products on their own ring at the centre.
 *
 * Two layers by design:
 *  - a canvas for the field itself (cheap: batched fills, ~2D, deterministic)
 *  - DOM for the hover card, so text is selectable, links are real links, and
 *    the card is reachable by keyboard
 *
 * The canvas is decorative and hidden from assistive tech. Every repo is also
 * in the DOM as an anchor inside a visually-hidden list, so the map adds a
 * view without removing the navigable catalog.
 */

const SQUASH = 0.42;
const RINGS = [0.36, 0.74, 1.14];
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const HERO_ORBIT = 240;
const HOVER_MS = 380;
const REPULSION_PX = 120;
const BODY_MIN_R = 44;
const MAX_DPR = 2;

interface Particle {
  repo: MapRepo;
  field: string;
  tone: number;
  theta: number;
  /** Ring multiplier; the radius is resolved per viewport at draw time. */
  ringMult: number;
  jitter: number;
  size: number;
  lum: number;
  x: number;
  y: number;
}

interface Body {
  key: string;
  label: string;
  /** Luminance 0..1. Monochrome by contract — see gravity-map.ts. */
  tone: number;
  count: number;
  /** Radius at the reference width; see rAt() for the viewport-scaled value. */
  r: number;
  x: number;
  y: number;
  phase: number;
  spin: number;
}

interface Hero {
  repo: MapRepo;
  theta: number;
  x: number;
  y: number;
}

function prng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => (s = (16807 * s) % 0x7fffffff) / 0x7fffffff;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/**
 * Relaxation solve for category positions.
 *
 * Goal, in priority order: no two gravity fields overlap, nothing sits dead
 * centre, and every field stays outside the hero ring. Seeded from a
 * phyllotaxis spiral so the result is identical on every load.
 *
 * Pure and position-only: it writes body.x / body.y and never touches radii, so
 * callers can pass any radius resolver (the viewport-scaled one at runtime).
 */
function layoutBodies(
  bodies: Body[],
  w: number,
  h: number,
  radiusOf: (b: Body) => number,
): void {
  /*
   * Usable half-extents. The 150/170 margins keep labels and the hero ring off
   * the edge on a desktop canvas, but they exceed a phone's half-width, so the
   * floor is derived from the viewport instead of hard-coded: a small canvas
   * gets a proportional margin, never one larger than the space it has.
   */
  const marginX = Math.min(150, w * 0.24);
  const marginY = Math.min(170, h * 0.28);
  const hx = Math.max(70, w / 2 - marginX);
  const hy = Math.max(60, h / 2 - marginY);
  const n = bodies.length || 1;
  const fieldMult = 1.45;
  const keepOut = Math.min(hx, hy) * 0.62;

  const bx = bodies.map((_, i) => {
    const a = GOLDEN * i;
    const rr = Math.sqrt((i + 0.6) / n);
    return { x: Math.cos(a) * rr, y: Math.sin(a) * rr * (hy / hx) };
  });

  for (let iter = 0; iter < 260; iter++) {
    let moved = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = bodies[i];
        const b = bodies[j];
        let dx = bx[j].x - bx[i].x;
        let dy = (bx[j].y - bx[i].y) * (hx / hy);
        let d = Math.hypot(dx, dy);
        const want = ((radiusOf(a) + radiusOf(b)) * fieldMult) / hx;
        if (d < 1e-6) {
          dx = 0.5;
          dy = 0.5;
          d = 0.001;
        }
        if (d < want) {
          const push = (want - d) / d / 2;
          const total = a.count + b.count || 1;
          const wa = b.count / total;
          const wb = a.count / total;
          bx[i].x -= dx * push * wa;
          bx[i].y -= dy * push * wa * (hx / hy);
          bx[j].x += dx * push * wb;
          bx[j].y += dy * push * wb * (hx / hy);
          moved++;
        }
      }
    }
    // Keep every field outside the hero ring at the scene centre.
    for (let i = 0; i < n; i++) {
      const d = Math.hypot(bx[i].x * hx, bx[i].y * hy);
      const want = keepOut + radiusOf(bodies[i]) * fieldMult;
      if (d > 1e-6 && d < want) {
        const k = want / d;
        bx[i].x *= k;
        bx[i].y *= k;
        moved++;
      }
      bx[i].x = clamp(bx[i].x, -0.94, 0.94);
      bx[i].y = clamp(bx[i].y, -0.94, 0.94);
    }
    if (!moved) break;
  }

  bodies.forEach((b, i) => {
    b.x = w / 2 + bx[i].x * hx;
    b.y = h / 2 + bx[i].y * hy;
  });
}

export function GravityMap({ data }: { data: GravityMapData }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);
  const [hovered, setHovered] = useState<MapRepo | null>(null);
  const [cardAt, setCardAt] = useState({ x: 0, y: 0 });

  /** Scene geometry, rebuilt when the data changes (not per frame). */
  const scene = useMemo(() => {
    const bodies: Body[] = data.centres.map((centre, i) => {
      const repos = data.fields[centre.key] ?? [];
      return {
        key: centre.key,
        label: centre.label,
        tone: centre.tone,
        count: repos.length,
        r: BODY_MIN_R + 26 * (Math.log2(repos.length + 1) / Math.log2(14)),
        x: 0,
        y: 0,
        phase: prng(11 + i * 37)() * Math.PI * 2,
        spin: 0.35 + prng(13 + i * 41)() * 0.3,
      };
    });

    const particles: Particle[] = [];
    for (const body of bodies) {
      const repos = data.fields[body.key] ?? [];
      repos.forEach((repo, i) => {
        const rnd = prng(23 + i * 131 + bodies.indexOf(body) * 7);
        const ring = repo.private ? 0 : 1 + (i % 2);
        particles.push({
          repo,
          field: body.key,
          tone: body.tone,
          theta: GOLDEN * i + body.phase,
          ringMult: RINGS[ring],
          jitter: (rnd() - 0.5) * 0.26,
          size: repo.featured ? 4.6 : repo.private ? 3.1 : 2.4 + rnd() * 1.7,
          lum: 0.42 + rnd() * 0.5,
          x: 0,
          y: 0,
        });
      });
    }

    const heroes: Hero[] = data.heroes.map((repo, i) => ({
      repo,
      theta:
        (i / Math.max(1, data.heroes.length)) * Math.PI * 2 - Math.PI / 2,
      x: 0,
      y: 0,
    }));

    return { bodies, particles, heroes };
  }, [data]);

  /*
   * Category positions come from a relaxation solve in `layoutBodies` (module
   * scope, pure): no two fields overlap, none sits dead centre, and every field
   * stays outside the hero ring. Kept out of the component so the maths is
   * independent of viewport state and can be reasoned about on its own.
   */
  const layout = useCallback(
    (w: number, h: number) => {
      layoutBodies(scene.bodies, w, h, (b) => b.r * clamp(w / 900, 0.62, 1));
    },
    [scene],
  );

  /** Re-usable pick, so the DOM event and the render agree on coordinates. */
  const pickRef = useRef<(cx: number, cy: number) => MapRepo | null>(() => null);

  /** Hover state the draw loop reads without re-running the effect. */
  const hoveredRef = useRef<MapRepo | null>(null);
  const dwellRef = useRef<number | null>(null);

  const pointerHit = useCallback(
    (hit: MapRepo | null, clientX: number, clientY: number) => {
      if (dwellRef.current) {
        window.clearTimeout(dwellRef.current);
        dwellRef.current = null;
      }
      if (!hit) {
        hoveredRef.current = null;
        setHovered(null);
        return;
      }
      if (hoveredRef.current?.slug === hit.slug) {
        hoveredRef.current = hit;
        setCardAt({ x: clientX, y: clientY });
        return;
      }
      // A touch tap has no "resting pointer", so waiting out a dwell reads as
      // broken. Show immediately there; keep the dwell for mice, where a fast
      // sweep would otherwise strobe cards.
      const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

      hoveredRef.current = hit;
      setHovered(null);
      if (touch) {
        setHovered(hit);
        setCardAt({ x: clientX, y: clientY });
        return;
      }
      dwellRef.current = window.setTimeout(() => {
        if (hoveredRef.current?.slug !== hit.slug) return;
        setHovered(hit);
        setCardAt({ x: clientX, y: clientY });
      }, HOVER_MS);
    },
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      // No 2D context. Leave the static plate in place — it is the default.
      return;
    }

    // Touch devices need larger hit targets and cannot hover.
    const coarseQuery = window.matchMedia("(hover: none), (pointer: coarse)");
    const isCoarse = () => coarseQuery.matches;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    const onMotion = () => {
      reducedMotion = motionQuery.matches;
    };
    motionQuery.addEventListener("change", onMotion);

    // Canvas cannot resolve `var(--font-mono)`, so the stack is read from the
    // element's computed style once. Without this, fillText falls back to a
    // serif default and the labels look wrong.
    const mono =
      getComputedStyle(wrap).getPropertyValue("font-family").trim() ||
      "ui-monospace, monospace";

    let w = 0;
    let h = 0;
    let dpr = 1;
    let t = 0;
    let last = performance.now();
    const view = { zoom: 1, panX: 0, panY: 0 };
    // Hero ring radius is viewport-derived: a fixed 240px overflows a phone.
    let heroOrbit = HERO_ORBIT;
    const pointer = { x: -1e4, y: -1e4, on: false, coarse: false };
    let compiled = false;
    let idle = 0;
    let nextDraw = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Small screens get a tighter ring and smaller bodies, so the whole map
      // stays on screen instead of being cropped by the canvas edge.
      heroOrbit = clamp(Math.min(w * 0.3, h * 0.34), 78, HERO_ORBIT);
      layout(w, h);
      compiled = false;
    };

    /*
     * Client pixels -> scene units.
     *
     * The canvas sits part-way down a real page, so a pointer event's
     * clientX/clientY are page coordinates while the scene is canvas-local.
     * Subtracting the canvas rect first is what makes this work outside a
     * full-bleed standalone demo.
     */
    /*
     * Effective radius for the current viewport. Derived, never stored: the
     * scene graph is memoised from props and must not be mutated by layout.
     */
    const rAt = (body: Body) =>
      body.r * clamp(w / 900, 0.62, 1);

    const toScene = (cx: number, cy: number): [number, number] => {
      const rect = canvas.getBoundingClientRect();
      return [
        (cx - rect.left - view.panX) / view.zoom,
        (cy - rect.top - view.panY) / view.zoom,
      ];
    };

    pickRef.current = (cx, cy) => {
      const [mx, my] = toScene(cx, cy);
      let best: MapRepo | null = null;
      // Touch targets need to be forgiving; a 22px radius is a mouse number.
      let bestD = (pointer.coarse ? 30 : 22) / view.zoom;
      for (const hero of scene.heroes) {
        const d = Math.hypot(hero.x - mx, hero.y - my);
        if (d < bestD) {
          bestD = d;
          best = hero.repo;
        }
      }
      if (best) return best;
      for (const p of scene.particles) {
        const d = Math.hypot(p.x - mx, p.y - my);
        if (d < bestD) {
          bestD = d;
          best = p.repo;
        }
      }
      return best;
    };

    const drawStars = () => {
      const rnd = prng(23);
      const cx = w / 2;
      const cy = h / 2;
      ctx.fillStyle = "rgba(255,255,255,0.26)";
      ctx.beginPath();
      for (let i = 0; i < 900; i++) {
        const a = rnd() * Math.PI * 2;
        const rr = Math.sqrt(0.04 + rnd() * 1.6);
        const x = cx + Math.cos(a) * rr * w * 0.55;
        const y = cy + Math.sin(a) * rr * h * 0.55 * 0.8;
        if (rnd() > 0.12) ctx.rect(x, y, 1, 1);
      }
      ctx.fill();
    };

    const drawHeroes = () => {
      const cx = w / 2;
      const cy = h / 2;
      const spin = reducedMotion ? 0 : t * 0.018;
      const grow = compiled ? 1 : 1 - Math.pow(1 - Math.min(1, t / 1.4), 3);

      ctx.globalAlpha = 0.16;
      ctx.strokeStyle = "rgba(255,255,255,1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy,
        heroOrbit,
        heroOrbit * SQUASH,
        0,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * grow,
      );
      ctx.stroke();
      ctx.globalAlpha = 1;

      for (const hero of scene.heroes) {
        const th = hero.theta + spin;
        hero.x = cx + Math.cos(th) * heroOrbit;
        hero.y = cy + Math.sin(th) * heroOrbit * SQUASH;

        const grad = ctx.createRadialGradient(hero.x, hero.y, 0, hero.x, hero.y, 30);
        grad.addColorStop(0, "rgba(255,255,255,0.3)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(hero.x, hero.y, 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.58;
        ctx.strokeStyle = "rgba(255,255,255,1)";
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(hero.x, hero.y, 12.6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 1;
        ctx.fillStyle = hero.repo.private ? "#000000" : "#ffffff";
        ctx.beginPath();
        ctx.arc(hero.x, hero.y, 5.2, 0, Math.PI * 2);
        ctx.fill();
        if (hero.repo.private) {
          ctx.strokeStyle = "rgba(255,255,255,1)";
          ctx.beginPath();
          ctx.arc(hero.x, hero.y, 5.2, 0, Math.PI * 2);
          ctx.stroke();
        }

        const lx = cx + Math.cos(th) * (heroOrbit + 26);
        const ly = cy + Math.sin(th) * (heroOrbit * SQUASH + 22);
        ctx.textAlign =
          Math.abs(Math.cos(th)) < 0.25 ? "center" : Math.cos(th) > 0 ? "left" : "right";
        ctx.textBaseline = "middle";
        ctx.font = `600 11px ${mono}`;
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 0.94;
        ctx.fillText(hero.repo.name.toUpperCase(), lx, ly);
        ctx.globalAlpha = 1;
      }
    };

    /*
     * Monochrome contract: every mark is white at some alpha over the black
     * plate. `tone` sets how strongly a field reads, never its hue — so the map
     * survives a colourblind viewer, a greyscale print, and the design system's
     * "signal teal is for live/interactive only" rule.
     */
    const INK = "255,255,255";

    const drawBodies = () => {
      const grow = compiled ? 1 : 1 - Math.pow(1 - Math.min(1, t / 1.1), 3);
      for (const body of scene.bodies) {
        const R = rAt(body);
        const grad = ctx.createRadialGradient(
          body.x,
          body.y,
          R * 0.05,
          body.x,
          body.y,
          R * 1.85,
        );
        // The field is a diffuse wash of white, not a coloured blob.
        grad.addColorStop(0, `rgba(${INK},${(body.tone * 0.16).toFixed(3)})`);
        grad.addColorStop(0.35, `rgba(${INK},${(body.tone * 0.06).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${INK},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(body.x, body.y, R * 1.85, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${INK},${(body.tone * 0.9).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(body.x, body.y, R * 0.052, 0, Math.PI * 2);
        ctx.fill();

        const drawn = Math.round(96 * grow);
        for (let i = 0; i < RINGS.length && drawn; i++) {
          ctx.strokeStyle = `rgba(${INK},${(body.tone * (0.26 - i * 0.06)).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(
            body.x,
            body.y,
            R * RINGS[i],
            R * RINGS[i] * SQUASH,
            0,
            -Math.PI / 2,
            -Math.PI / 2 + (Math.PI * 2 * drawn) / 96,
          );
          ctx.stroke();
        }

        // Labels are word-boxes: a filled plate behind the text so a name is
        // legible over the particle field rather than washed out by it.
        const label = body.label.toUpperCase();
        const count = `${body.count} repos`;
        ctx.font = `600 11px ${mono}`;
        const lw = Math.max(ctx.measureText(label).width, 42);
        ctx.font = `9px ${mono}`;
        const cw = ctx.measureText(count).width;
        const boxW = Math.max(lw, cw) + 12;
        const boxH = 30;
        const bx = body.x - boxW / 2;
        const by = body.y + R + 8;

        ctx.fillStyle = "rgba(0,0,0,0.86)";
        ctx.fillRect(bx, by, boxW, boxH);
        ctx.strokeStyle = `rgba(${INK},${(body.tone * 0.3).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 0.5, by + 0.5, boxW - 1, boxH - 1);

        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.font = `600 11px ${mono}`;
        ctx.fillStyle = `rgba(${INK},0.9)`;
        ctx.fillText(label, body.x, by + 5);
        ctx.font = `9px ${mono}`;
        ctx.fillStyle = `rgba(${INK},${(body.tone * 0.62).toFixed(3)})`;
        ctx.fillText(count, body.x, by + 18);
      }
    };

    const drawParticles = () => {
      const buckets = new Map<number, Map<string, Array<[number, number, number]>>>();
      const privates: Array<[number, number, number, number]> = [];
      const [mx, my] = toScene(pointer.x, pointer.y);
      const radius = REPULSION_PX / view.zoom;

      for (const p of scene.particles) {
        const spin = reducedMotion ? 0 : t * 0.0107 * 0.6;
        const th = p.theta + spin + p.jitter;
        let x = 0;
        let y = 0;
        const body = scene.bodies.find((b) => b.key === p.field);
        if (!body) continue;
        const base = p.ringMult * rAt(body);
        x = body.x + Math.cos(th) * base;
        y = body.y + Math.sin(th) * base * SQUASH;

        if (pointer.on) {
          const dx = x - mx;
          const dy = y - my;
          const d = Math.hypot(dx, dy);
          if (d < radius && d > 0.01) {
            const f = Math.pow(1 - d / radius, 2) * 5.5;
            x += (dx / d) * f;
            y += (dy / d) * f;
          }
        }
        p.x = x;
        p.y = y;

        if (p.repo.private) {
          privates.push([x, y, p.size, p.tone]);
          continue;
        }
        // One fill per luminance step; hue never varies, so no colour grouping.
        const bi = clamp(Math.round(p.lum * 4), 0, 4);
        let bucket = buckets.get(bi);
        if (!bucket) buckets.set(bi, (bucket = new Map()));
        const key = String(p.tone);
        let pts = bucket.get(key);
        if (!pts) bucket.set(key, (pts = []));
        pts.push([x, y, p.size]);
      }

      ctx.globalCompositeOperation = "lighter";
      for (const [bi, byTone] of buckets) {
        for (const [toneKey, pts] of byTone) {
          const tone = Number(toneKey);
          ctx.fillStyle = `rgba(${INK},${(0.55 + tone * 0.45).toFixed(3)})`;
          ctx.globalAlpha = (bi / 4) * 0.9;
          ctx.beginPath();
          for (const [x, y, size] of pts) {
            ctx.moveTo(x + size, y);
            ctx.arc(x, y, size, 0, Math.PI * 2);
          }
          ctx.fill();
        }
      }
      // Private repos read as hollow rings: same ink, no fill, no link.
      ctx.lineWidth = 1.1;
      for (const [x, y, size, tone] of privates) {
        ctx.globalAlpha = 0.42;
        ctx.strokeStyle = `rgba(${INK},${(0.5 + tone * 0.4).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const frame = (now: number) => {
      rafRef.current = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reducedMotion) t += dt;

      idle = hoveredRef.current ? 0 : idle + dt;
      if (now < nextDraw) return;
      nextDraw = now + (idle > 1 ? 1000 / 30 : 0);

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(view.panX, view.panY);
      ctx.scale(view.zoom, view.zoom);
      drawStars();
      drawHeroes();
      drawBodies();
      drawParticles();
      ctx.restore();
      compiled = true;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    rafRef.current = requestAnimationFrame(frame);

    // Pan, zoom, and hover live here so the canvas owns its own coordinates.
    let drag: { x: number; y: number; px: number; py: number; moved: boolean } | null =
      null;

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.on = true;
      pointer.coarse = isCoarse();
      if (drag) {
        view.panX = drag.px + (e.clientX - drag.x);
        view.panY = drag.py + (e.clientY - drag.y);
        if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 3) drag.moved = true;
        return;
      }
      const hit = pickRef.current(e.clientX, e.clientY);
      pointerHit(hit, e.clientX, e.clientY);
    };

    const onDown = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY, px: view.panX, py: view.panY, moved: false };
    };

    const onUp = (e: PointerEvent) => {
      const wasClick = drag && !drag.moved;
      drag = null;
      if (!wasClick) return;
      const hit = pickRef.current(e.clientX, e.clientY);
      if (hit?.href) window.location.assign(hit.href);
    };

    const onLeave = () => {
      pointer.on = false;
      pointerHit(null, 0, 0);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const nz = clamp(view.zoom * (1 - e.deltaY * 0.0012), 0.55, 3.2);
      const k = nz / view.zoom;
      view.panX = e.clientX - (e.clientX - view.panX) * k;
      view.panY = e.clientY - (e.clientY - view.panY) * k;
      view.zoom = nz;
    };

    wrap.addEventListener("pointermove", onMove, { passive: true });
    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("wheel", onWheel, { passive: false });

    // A real context is drawing, so hide the static plate.
    document.documentElement.dataset.gravityCanvas = "live";

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      motionQuery.removeEventListener("change", onMotion);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointerup", onUp);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("wheel", onWheel);
      delete document.documentElement.dataset.gravityCanvas;
    };
  }, [scene, layout, pointerHit]);

  return (
    <div className={styles.root} data-testid="gravity-map">
      <div className={styles.stage} ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-hidden="true"
          data-testid="gravity-canvas"
        />
      </div>

      {/* Static plate: always in the DOM, revealed when the canvas cannot run
          (no JS, no 2D context, or a browser that refuses it). This is the same
          data in reading order, so the map degrades to a list, not a blank box. */}
      <StaticPlate data={data} />

      {hovered ? <HoverCard repo={hovered} at={cardAt} /> : null}

      {/* Assistive path: every repo is a real link, in a stable order. */}
      <ul className="sr-only">
        {data.heroes.map((repo) => (
          <li key={repo.slug}>
            {repo.href ? (
              <a href={repo.href}>
                {repo.name} — finished product. {repo.why}
              </a>
            ) : (
              <span>
                {repo.name} — finished product, private. {repo.why}
              </span>
            )}
          </li>
        ))}
        {data.centres.flatMap((centre) =>
          (data.fields[centre.key] ?? []).map((repo) => (
            <li key={repo.slug}>
              {repo.href ? (
                <a href={repo.href}>
                  {repo.name} — {centre.label}. {repo.tagline}
                </a>
              ) : (
                <span>
                  {repo.name} — {centre.label} (private). {repo.tagline}
                </span>
              )}
            </li>
          )),
        )}
      </ul>
    </div>
  );
}

/**
 * Static plate — the map as text and boxes, with no canvas at all.
 *
 * Rendered on the server and kept in the DOM. It is visible only when the
 * canvas cannot draw: no JS, no 2D context, or a coarse/no-hover device that
 * would rather read than prod. Same data, same order, same monochrome contract.
 */
function StaticPlate({ data }: { data: GravityMapData }) {
  return (
    <div className={styles.staticPlate} data-testid="gravity-static">
      <section className={styles.staticSection} aria-label="Finished products">
        <p className={styles.staticLabel}>Finished products</p>
        <ul className={styles.staticList}>
          {data.heroes.map((repo) => (
            <li key={repo.slug} className={styles.staticCard}>
              <p className={styles.staticName}>
                {repo.href ? (
                  <a href={repo.href}>{repo.name}</a>
                ) : (
                  <span>{repo.name}</span>
                )}
                {repo.private ? (
                  <span className={styles.pill}>private</span>
                ) : null}
              </p>
              <p className={styles.staticWhy}>{repo.why}</p>
              {repo.tech.length ? (
                <p className={styles.cardMeta}>
                  {repo.tech.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {data.centres.map((centre) => {
        const repos = data.fields[centre.key] ?? [];
        if (!repos.length) return null;
        return (
          <section
            key={centre.key}
            className={styles.staticSection}
            aria-label={centre.label}
          >
            <p className={styles.staticLabel}>
              {centre.label}
              <span>{repos.length}</span>
            </p>
            <ul className={styles.staticList}>
              {repos.map((repo) => (
                <li key={repo.slug} className={styles.staticCard}>
                  <p className={styles.staticName}>
                    {repo.href ? (
                      <a href={repo.href}>{repo.name}</a>
                    ) : (
                      <span>{repo.name}</span>
                    )}
                    {repo.private ? (
                      <span className={styles.pill}>private</span>
                    ) : null}
                  </p>
                  <p className={styles.staticWhy}>{repo.tagline}</p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function HoverCard({ repo, at }: { repo: MapRepo; at: { x: number; y: number } }) {
  const width = 340;
  const flipX = at.x + 24 + width + 16 > window.innerWidth;
  const x = Math.max(16, flipX ? at.x - width - 24 : at.x + 24);
  const y = Math.max(16, at.y + 18);

  return (
    <div
      className={styles.card}
      style={{ left: x, top: y, width }}
      role="status"
      aria-live="polite"
    >
      {repo.video || repo.still ? (
        <div className={styles.cardMedia}>
          {repo.video ? (
            <video
              muted
              loop
              playsInline
              autoPlay
              preload="none"
              poster={repo.poster}
              src={repo.video}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={repo.still} alt="" />
          )}
        </div>
      ) : null}

      <div className={styles.cardBody}>
        <p className={styles.cardName}>
          {repo.name}
          {repo.isHero ? (
            <span className={styles.pill}>finished product</span>
          ) : null}
          {repo.private ? <span className={styles.pill}>private</span> : null}
        </p>
        <p className={styles.cardWhy}>{repo.why ?? repo.tagline}</p>
        {repo.description ? (
          <p className={styles.cardDesc}>{repo.description}</p>
        ) : null}
        <p className={styles.cardMeta}>
          {repo.tech.map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </p>
        <p className={styles.cardFoot}>
          {repo.href ? (
            <a href={repo.href}>Open dossier</a>
          ) : (
            <span>No public link</span>
          )}
        </p>
      </div>
    </div>
  );
}
