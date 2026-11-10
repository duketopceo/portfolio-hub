# Cosmic Intelligence — Brand Guidelines

Luke Kimball's portfolio system. Applied across `luke-the-duke.com`.

**Design system:** *Star Chart* — a neo-industrial survey instrument. The site
reads as a field registry / engineering survey sheet: cataloged bodies, sector
maps, survey files, and telemetry — not a generic space theme.

---

## Name & Voice

| Context | Usage |
|---|---|
| Full name | **Cosmic Intelligence** |
| Short | **CI** (registry references: `CI-01`, `CI / SYSTEM REGISTRY`) |
| Author | **Luke Kimball** |
| Tagline | *Systems that compound.* |
| Voice | Precise, confident, terse. Instrument language: survey, registry, dossier, sector, transmission, uplink. No hype, no filler. |

### Terminology

| Concept | Term |
|---|---|
| Project | "Body" / "system" in the registry |
| Project detail page | "Dossier" / "survey file" (`CI-NN`) |
| Project catalog | "System registry" / "sector map" |
| Activity feed | "Transmissions" |
| Contact | "Engage" / "open channel" |
| Loading state | "Establishing uplink" |
| Private project | "Classified" / "restricted" (orange marks) |
| 404 | "Signal lost" / "off-chart record" |

---

## Color Palette

All colors are CSS custom properties in `src/app/globals.css`. Near-monochrome
dark survey plate; teal and ember are the complementary pair, one pop color accents.

### Surfaces & Lines

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#07090B` | Survey-plate background |
| `--color-surface` | `#0B0F13` | Panel base |
| `--color-surface-2` | `#0F151B` | Raised surface |
| `--color-surface-3` | `#151D24` | Elevated element |
| `--color-border` | `rgba(228,234,240,0.09)` | Hairline rules |
| `--color-border-strong` | `rgba(228,234,240,0.16)` | Plate edges |
| `--color-divider` | `rgba(228,234,240,0.07)` | Section dividers |

### Text

| Token | Value | Use |
|---|---|---|
| `--color-text` | `#E9ECEF` | Primary copy |
| `--color-text-muted` | `#9AA3AC` | Secondary / body |
| `--color-text-faint` | `#7E8A96` | Marginalia, registry IDs (≥4.84:1 on every surface; verify with `node scripts/check-contrast.mjs`) |

### Palette: two complements plus one pop (2026-11-10)

The whole site uses three chromatic colors; everything else is neutral.
Mirrored for canvas/SVG in `src/lib/palette.ts` (a test fails on drift).

| Token | Value | Role |
|---|---|---|
| `--color-accent` | `#2DD4BF` | Complement A, signal teal: interactive + live status |
| `--color-signal` | `#FF5C1A` | Complement B, ember: classification / alert, and the black hole's accretion heat |
| `--color-pop` | `#A78BFA` | Pop, ultraviolet: falling starlight, ice-world ring and rim, text selection. Rare. |

Contrast on the four surfaces (`node scripts/check-contrast.mjs` for text
tokens; `palette.test.ts` for the three colors): teal and ember and pop all
clear 4.5:1 on every surface.

Retired and folded: `--color-live` green (`#34D399`) is now an alias of the
accent; category colors (`catColors`, catalog planet colors) fold into teal,
ember, pop and the slate neutral `#9AA3AC` (amber, sky blue and pink removed).
GitHub language dots keep their third-party colors by design.

Rules:
- Teal carries interactive elements and live states; use it for the primary
  action and status, not as decoration on every surface.
- **Alert / classification meaning is carried by `--color-signal` (ember)**, and
  only ever through the alert treatment: mono ALL-CAPS tag, 1px ember border,
  lock or marker glyph, and the words RESTRICTED / CLASSIFIED / ALERT. Color
  alone never says "alert". Ember also appears as scenery (the black hole's
  accretion light, the gas giant's storm); scenery is `aria-hidden`, sits behind
  everything, and is never a control or a label, so it cannot be confused
  with an alert tag.
- Pop violet is for sparkle and rare highlights only, never controls or text.

### Chart Overlays

| Token | Value |
|---|---|
| `--chart-grid` | `rgba(228,234,240,0.035)` |
| `--chart-grid-major` | `rgba(228,234,240,0.06)` |
| `--chart-tick` | `rgba(228,234,240,0.28)` |

---

## Surfaces

No glassmorphism. Panels are **solid, squared, hairline-bordered plates**:

```css
background: var(--color-surface);
border: 1px solid var(--color-border-strong);
border-radius: var(--radius-lg); /* 3px */
```

Hover states use a 1px teal inset ring (`--glass-shadow-hover`), not glow.
Panels and controls never glow. The one sanctioned glow is the background
black hole's accretion ring (scenery, 2026-11-10).

---

## Typography

| Role | Font | Token |
|---|---|---|
| Display / body | Archivo (grotesk) | `--font-display`, `--font-body` |
| Mono / marginalia / code | JetBrains Mono | `--font-mono` |

Rules:
- Headlines: Archivo, heavy weight, tight tracking, uppercase-capable
- Marginalia/labels/registry IDs: JetBrains Mono, ALL CAPS, `letter-spacing: 0.14–0.2em`, `11–12px`
- Body copy: `16–18px`, `line-height: 1.6–1.75`, measure `58–70ch`
- Meaningful UI copy and controls: minimum `12px`
- Mono inline "chips" for handles, paths, and technical strings inside body copy

---

## Page families

Every route uses one of six compositions; no page is a generic max-width div
with unrelated cards.

| Family | Routes | Role |
|---|---|---|
| Poster | `/`, non-interactive flagship landings | Introduce, orient, and route |
| Registry | `/projects`, `/now` | Scan, filter, and compare systems or transmissions |
| Dossier | `/projects/[slug]`, `/resume` | Prove ownership, architecture, decisions, evidence, and outcome |
| Transmission | `/about`, `/hire`, `/contact` | One editorial message and one conversion goal |
| Mission briefing | `/openrouter`, interactive job demos | Scenario, controls, output, evaluation, and limitations |
| System state | loading, empty, error, offline, 404 | Explain state and recovery without blocking comprehension |

## Layout and spacing

- One page rail: fluid `16–48px` horizontal inset, maximum `1440px`
- Reading measure: `58–70ch`; evidence surfaces may use the full rail
- 4px spacing foundation: `4/8` micro, `12/16` controls, `24/32` components,
  `48/64` sections, `96/128` major transitions
- Mobile compression preserves hierarchy rather than simply removing space
- Prefer rows, tables, diagrams, and editorial groups over repeated cards

## Evidence standard

Every featured dossier answers in order: what it is, why it exists, what Luke
owned, what was difficult, system shape, decisions and tradeoffs, inspectable
proof, outcome/status, and the next action.

Private projects use curated, publish-safe evidence packages. They may disclose
purpose, approved context, ownership, sanitized architecture, technology,
decisions, safe scale ranges, outcomes, media, and the reason source remains
private. Raw private source, credentials, client records, internal hosts,
account data, and unapproved claims are never published or indexed.

---

## Geometry

Squared engineering geometry:

| Token | Value |
|---|---|
| `--radius-sm` | `1px` |
| `--radius-md` | `2px` |
| `--radius-lg` | `3px` |
| `--radius-xl` | `4px` |

Corner ticks (`corner-ticks` utility), hairline grids, crosshair/reticle
markers on the home project map, figure numbers (`FIG. 01`), margin strips,
and drafting title blocks are the signature motifs.

**Why this changed (owner request, 2026-11-09; applied 2026-11-10).** The owner
asked for a black hole, planets and falling starlight as the site's cosmic
background, and a tighter palette. Do not revert this silently in a later
redesign: change it only by an explicit owner decision recorded here.

**Direction change, 2026-11-10.** The earlier rule "no black
hole, crosshair/reticle markers in place of glowing planets" is superseded for
the BACKGROUND ONLY. The site background now carries a slow black hole (dark
core, thin bright accretion ring, one disk revolution per ~75 s; original
design, no third-party mark) on every page. **Round 2 (2026-11-09 plan, KD3):
the three background planets are removed** and the hole shrinks to a small,
dim, off-centre body so it recedes behind content. Planets live only in the
home project map (FIG.01/02): reticle-marked lit bodies as below. The black
hole is scenery, never navigation or meaning.

Planets on the home map are real lit 3D bodies with procedural surfaces
(rocky, gas, ice, cratered, terrain), lit by one key light with a hard
terminator, a 1px survey limb just outside the disc, and a reticle when
focused. They never glow: no additive blending, no radial falloff outside the
limb, no bloom. A thin atmosphere is allowed only as a rim tint blended
INSIDE the silhouette on the lit side (strength capped at 0.5). On software GL
the bodies fall back to line-art limbs and meridians. The black hole is the one deliberate
exception (its accretion light is additive emission). See `docs/planets.md`.

---

## Motion & Canvas Layers

WebGL/canvas layers are progressive enhancement. Every layer skips mounting
under `prefers-reduced-motion` and leaves meaning-bearing HTML intact. Every
background piece has a deliberate static rendition (server-rendered SVG/CSS,
crisp at any DPR, same palette and same positions as the live version):

| Piece | Component | Live (WebGL / canvas) | Static (reduced motion, no WebGL, software GL, Save-Data, failure) | Where |
|---|---|---|---|---|
| Black hole | `BlackHole` (glow and lensing ported from Rune, MIT: `THIRD_PARTY_NOTICES.md`) | R3F full-screen shader via `SceneFrame`: black event horizon, thin photon ring, near-edge-on disk (about 5x the shadow wide) whose far side is lensed over and under the hole, Doppler-bright on the approaching (left) side, ~75 s per revolution | `BlackHoleSvg`: the same composition as a full-screen still (shadow, photon ring, lensed arcs, tilted disk, brighter left limb); disk streaks turn in CSS, 60-90 s per turn, and stand still under reduced motion | Site background, every page |
| Stardust | `StardustCanvas` | 2D canvas, sparse falling motes, idle at top of page, paused in hidden tabs | `StaticStardust`: frozen SVG pattern (warm dots, amber sparkles) | Pages that scroll, further down |
| Quiet starfield | `StarfieldScene` | R3F, same context as the black hole; dimmer than before, constellation links dropped on the low tier | CSS stars (`cosmic-bg::before/::after`) | Site background |
| Primary orbit | `OrbitalScene` | R3F via `SceneFrame` | Static survey plate | Home FIG.01 (hero, beside the intro) |
| Secondary belt | `BeltScene` | R3F via `SceneFrame` | Static survey plate | Home FIG.02 |
| Surveyed terrain | `SectorTerrain` | ThreeUI `constellation-field` / `topo-field` | Skips mounting | `/projects` sector map |
| Telemetry arcs | `DossierArcField` | ThreeUI `predictive-arc` | Skips mounting | Dossier hero band |
| Hyperspace streaks | `WarpFieldLayer` | ThreeUI `warp-field/hyperspace` | Skips mounting | 404 plate |
| Uplink loader | `UplinkLoader` | ThreeUI | Skips mounting | Route transitions (`loading.tsx`) |

Background contract: the background is one full-screen black hole (original
rendering in the Gargantua / NASA-visualization register) over a quiet
starfield; planets never appear in it (they belong to the orbit figures, not
the backdrop). The scene is warm white, amber and ember orange only: no teal,
green or violet anywhere in it (`lib/cosmos-colors.ts`, enforced by
`cosmos-colors.test.ts`). The page's pure-white text sits on top, so legibility
comes first: the scene's light level is capped (`HOLE_LIGHT`), a flat dim plus
a soft centre pool (`.cosmic-bg__scrim`) and a heavy edge vignette sit above
both renditions, and the hole drifts up and fades as the page scrolls. ONE WebGL context for the whole background (hole and stars share
it); the live scene lazy-loads after first paint and only after a WebGL probe
passes. Only renderers named llvmpipe, SwiftShader or softpipe count as
software GL and start on the static plate; Apple and unknown renderer strings
start live and measurement decides. DPR is capped at 1 (0.75 on the low tier),
`preserveDrawingBuffer` is off, and the frame loop pauses when the tab is
hidden or the canvas is off screen. drei's `PerformanceMonitor` steps quality
down when frames stay under 45 fps (budget: 55+ on integrated graphics): full
(DPR 1, starfield lensing, ring and plane glow, two shader octaves, star links)
to high (lensing dropped first) to low (DPR 0.75, no glow, one octave, no links) to
the static plate, never back up, logging each step as `[cosmos] tier a -> b`
and recording the rung in `data-cosmos-tier` on `.cosmic-bg`. The static plate
hides only after the live scene's first rendered frame and returns if the
scene is lost or given up on; its CSS rotation stops while the live scene
covers it. Stardust is a separate 2D canvas (never a second WebGL context).
`?cosmos=static` and `?cosmos=live` are QA overrides (live cannot beat
reduced motion or a missing WebGL context); `?cosmos-tier=pin` additionally
holds full quality and skips the monitor, for tests on software GL.

Canvas layers never carry meaning: semantic HTML, labels, and keyboard
paths work with every layer disabled.

---

## Do / Don't

**Do:**
- Dark survey plate always — no light mode
- Solid panels, hairline borders, squared corners
- Mono microcopy for labels, IDs, and marginalia
- Teal sparingly for interactive/live signal
- Exactly three chromatic colors (teal, ember, ultraviolet pop) plus neutrals
- A static SVG/CSS rendition for every background piece
- `prefers-reduced-motion` guards on every canvas layer

**Don't:**
- Glassmorphism, backdrop-blur panels, soft glows on UI (the background black hole's ring is the one exception), or rounded "SaaS" cards
- Orange outside classification/alert contexts and the black hole's heat
- Teal, green or violet inside the black-hole scene (warm white, amber, ember only)
- Pop violet on controls or body text; any fourth chromatic color
- A second WebGL context for the background
- Emoji in production UI
- Canvas/WebGL as the only carrier of meaning
