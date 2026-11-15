import { describe, expect, it } from "vitest";
import { CAPABILITY_IDS, capabilityMeta } from "@/data/capability-meta";
import { siteRedirects } from "@/data/redirects";
import { RANKING_PINS } from "@/data/ranking-pins";
import { listedProjects } from "@/lib/catalog";
import { rankProjects } from "@/lib/ranking";
import {
  buildGravityMap,
  centreOrbit,
  COUNT_DROP,
  labelPlacement,
  memberJitter,
  memberScale,
  centrePositions,
  leadPositions,
  memberPositions,
  TALL_FRAME,
  WIDE_FRAME,
} from "./gravity-map";

const ranked = rankProjects(listedProjects());
const map = buildGravityMap(ranked);

describe("buildGravityMap", () => {
  it("uses the five pinned leads, in pin order", () => {
    expect(map.heroes.map((h) => h.slug)).toEqual([...RANKING_PINS]);
  });

  it("takes each lead's line from its catalog outcome", () => {
    for (const h of map.heroes) {
      const p = ranked.find((r) => r.slug === h.slug);
      expect(h.why).toBe(p?.outcome ?? p?.tagline);
      expect(h.why.length).toBeGreaterThan(20);
    }
  });

  it("has one centre per capability group, in CAPABILITY_ORDER, with the shared colours", () => {
    expect(map.centres.map((c) => c.id)).toEqual([...CAPABILITY_IDS]);
    for (const c of map.centres) {
      expect(c.label).toBe(capabilityMeta[c.id].label);
      expect(c.color).toBe(capabilityMeta[c.id].color);
    }
  });

  it("places every capability-tagged project once: leads plus members equals the group", () => {
    for (const c of map.centres) {
      const leads = map.heroes.filter((h) => h.capability === c.id).length;
      expect(c.members.length + leads).toBe(c.count);
    }
    const tagged = ranked.filter((p) => (CAPABILITY_IDS as readonly string[]).includes(p.capability ?? ""));
    expect(map.total).toBe(tagged.length);
  });

  it("includes reactor-sim under Hardware, sim & infra and snapdex under Retrieval & memory", () => {
    const hardware = map.centres.find((c) => c.id === "hardware-sim");
    const memory = map.centres.find((c) => c.id === "retrieval-memory");
    expect(hardware?.members.some((m) => m.slug === "reactor-sim")).toBe(true);
    expect(memory?.members.some((m) => m.slug === "snapdex")).toBe(true);
  });

  it("never lists a lead among the members", () => {
    const members = new Set(map.centres.flatMap((c) => c.members.map((m) => m.slug)));
    for (const h of map.heroes) expect(members.has(h.slug)).toBe(false);
  });

  it("skips a pin that is not listed", () => {
    const m = buildGravityMap(ranked, ["no-such-slug", "argus"]);
    expect(m.heroes.map((h) => h.slug)).toEqual(["argus"]);
  });
});

const frames = [["wide", WIDE_FRAME], ["tall", TALL_FRAME]] as const;
const PHASES = Array.from({ length: 24 }, (_, i) => (i * 2 * Math.PI) / 24 / 1.7);
const DOT_R = 3;

/** Every dot (members and leads) and every group label box at phase `t`, in frame units. */
function scene(frame: typeof WIDE_FRAME, phase: number) {
  const tall = frame.h > frame.w;
  // The tall map holds still (GravityMap draws it at phase 0), so only phase 0 is checked there.
  const t = tall ? 0 : phase;
  const centres = centrePositions(map.centres.length, frame);
  const scale = memberScale(frame);
  const dots: { id: string; x: number; y: number }[] = [];
  const boxes: { id: string; x0: number; x1: number; y0: number; y1: number }[] = [];
  map.centres.forEach((c, i) => {
    const pos = centres[i];
    const j = memberJitter(c.members.length, i + 1);
    memberPositions(c.members.length, pos, t, j, scale).forEach((p, k) =>
      dots.push({ id: c.members[k].slug, ...p })
    );
    dots.push({ id: `${c.id}:core`, ...pos });
    const lp = labelPlacement(pos, frame, tall ? c.short : c.label);
    boxes.push({ id: c.id, x0: lp.x - lp.half, x1: lp.x + lp.half, y0: lp.y - 11, y1: lp.y + COUNT_DROP + 4 });
  });
  const leads = leadPositions(map.heroes.length, frame, t);
  map.heroes.forEach((h, i) => dots.push({ id: h.slug, ...leads[i] }));
  // Lead names are drawn under their dot on every frame (13px mono, 7.8 units a glyph).
  map.heroes.forEach((h, i) =>
    boxes.push({ id: `lead:${h.slug}`, x0: leads[i].x - (h.name.length * 7.8) / 2, x1: leads[i].x + (h.name.length * 7.8) / 2, y0: leads[i].y + 14, y1: leads[i].y + 30 })
  );
  return { dots, boxes };
}

describe("layout", () => {
  for (const [name, frame] of frames) {
    it(`keeps every body and label inside the ${name} frame at any phase`, () => {
      for (const t of PHASES) {
        const { dots, boxes } = scene(frame, t);
        for (const p of dots) {
          expect(p.x, p.id).toBeGreaterThan(DOT_R);
          expect(p.x, p.id).toBeLessThan(frame.w - DOT_R);
          expect(p.y, p.id).toBeGreaterThan(DOT_R);
          expect(p.y, p.id).toBeLessThan(frame.h - DOT_R);
        }
        for (const b of boxes) {
          expect(b.x0, b.id).toBeGreaterThanOrEqual(0);
          expect(b.x1, b.id).toBeLessThanOrEqual(frame.w);
          expect(b.y0, b.id).toBeGreaterThanOrEqual(0);
          expect(b.y1, b.id).toBeLessThanOrEqual(frame.h);
        }
      }
    });

    it(`never overlaps two dots on the ${name} frame at any phase`, () => {
      for (const t of PHASES) {
        const { dots } = scene(frame, t);
        for (let i = 0; i < dots.length; i++) {
          for (let k = i + 1; k < dots.length; k++) {
            const d = Math.hypot(dots[i].x - dots[k].x, dots[i].y - dots[k].y);
            expect(d, `${dots[i].id} / ${dots[k].id} at t=${t.toFixed(2)}`).toBeGreaterThan(2 * DOT_R + 1);
          }
        }
      }
    });

    it(`never overlaps two labels, or a label and a dot, on the ${name} frame at any phase`, () => {
      for (const t of PHASES) {
        const { dots, boxes } = scene(frame, t);
        for (let i = 0; i < boxes.length; i++) {
          for (let k = i + 1; k < boxes.length; k++) {
            const a = boxes[i];
            const b = boxes[k];
            const hit = a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
            expect(hit, `${a.id} x ${b.id} at t=${t.toFixed(2)}`).toBe(false);
          }
          for (const d of dots) {
            // Skip the dot a lead name hangs from.
            if (boxes[i].id === `lead:${d.id}`) continue;
            const a = boxes[i];
            const hit = d.x + DOT_R > a.x0 && d.x - DOT_R < a.x1 && d.y + DOT_R > a.y0 && d.y - DOT_R < a.y1;
            expect(hit, `${a.id} x dot ${d.id} at t=${t.toFixed(2)}`).toBe(false);
          }
        }
      }
    });
  }

  it("labels all five leads on the tall frame too, inside it and clear of every group label and dot", () => {
    const { boxes } = scene(TALL_FRAME, 0);
    const leadBoxes = boxes.filter((b) => b.id.startsWith("lead:"));
    expect(leadBoxes.map((b) => b.id)).toEqual(map.heroes.map((h) => `lead:${h.slug}`));
    expect(leadBoxes).toHaveLength(5);
    for (const b of leadBoxes) {
      expect(b.x0, b.id).toBeGreaterThanOrEqual(0);
      expect(b.x1, b.id).toBeLessThanOrEqual(TALL_FRAME.w);
    }
  });

  it("spreads the groups evenly around the leads, which sit in the centre", () => {
    const n = map.centres.length;
    const centres = centrePositions(n, WIDE_FRAME);
    const cx = WIDE_FRAME.w / 2;
    const cy = WIDE_FRAME.h / 2;
    const { rx, ry } = centreOrbit(WIDE_FRAME);
    const angles = centres.map((c) => Math.atan2((c.y - cy) / ry, (c.x - cx) / rx)).map((a) => (a + 2 * Math.PI) % (2 * Math.PI));
    angles.sort((a, b) => a - b);
    for (let i = 0; i < n; i++) {
      const gap = (angles[(i + 1) % n] - angles[i] + 2 * Math.PI) % (2 * Math.PI);
      expect(gap).toBeCloseTo((2 * Math.PI) / n, 3);
    }
    const lead = leadPositions(5, WIDE_FRAME, 0);
    const mean = { x: lead.reduce((s, p) => s + p.x, 0) / 5, y: lead.reduce((s, p) => s + p.y, 0) / 5 };
    expect(Math.hypot(mean.x - cx, mean.y - cy)).toBeLessThan(1);
    for (const p of lead) {
      for (const c of centres) expect(Math.hypot(p.x - c.x, p.y - c.y)).toBeGreaterThan(100);
    }
  });

  it("keeps the same jitter for the same seed", () => {
    expect(memberJitter(6, 4)).toEqual(memberJitter(6, 4));
    expect(memberJitter(6, 4)).not.toEqual(memberJitter(6, 5));
  });

  it("is deterministic", () => {
    expect(memberPositions(7, { x: 10, y: 10 }, 0.5)).toEqual(memberPositions(7, { x: 10, y: 10 }, 0.5));
    expect(scene(WIDE_FRAME, 0.7)).toEqual(scene(WIDE_FRAME, 0.7));
  });
});

describe("retired /gravity page", () => {
  it("redirects to /projects", () => {
    expect(siteRedirects).toContainEqual({ source: "/gravity", destination: "/projects", permanent: true });
  });
});
