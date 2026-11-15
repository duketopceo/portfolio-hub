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

All colors are CSS custom properties in `src/app/design-system/tokens.css`
(canonical) and `src/app/globals.css`. **Owner decision, 2026-11-15:** the site
is true black, white and a very slightly warm off-white, with greys for muted
text, and at most **two** accent colours used sparingly where meaning needs
them. No purple, violet, blue, teal or green anywhere (UI, SVG, shaders, OG
images, favicons). Groups and categories carry no colour of their own; they are
told apart by name and position.

**Contrast decision (2026-11-10):** white text on deep black ("ink") ships; the
black-on-white variant was built, screenshotted and dropped. `scripts/check-contrast.mjs`
checks body, tint, muted, faint and accent text against every surface at 4.5:1.

### Surfaces & Lines

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#000000` | Survey-plate background |
| `--color-surface` | `#070707` | Panel base |
| `--color-surface-2` | `#0E0E0E` | Raised surface |
| `--color-surface-3` | `#161616` | Elevated element |
| `--color-border` | `rgba(255,255,255,0.09)` | Hairline rules |
| `--color-border-strong` | `rgba(255,255,255,0.16)` | Plate edges |
| `--color-divider` | `rgba(255,255,255,0.07)` | Section dividers |

### Text

| Token | Value | Use |
|---|---|---|
| `--color-text` | `#FFFFFF` | Primary copy and headings |
| `--color-tint` | `#F2EFEA` | Warm off-white: secondary copy (the home lede), lines, some labels. Easier on the eyes than pure white; the tint is only 8 levels from grey. |
| `--color-text-muted` | `#B8B8B8` | Secondary / body |
| `--color-text-faint` | `#9A9A9A` | Marginalia, registry IDs (≥6:1 on every surface; verify with `node scripts/check-contrast.mjs`) |

Borders, dividers and hairlines are the same tint at low alpha
(`rgba(242,239,234,...)`), so plate edges read warm-white, not cold.

### Capability groups and the gravity map (2026-11-15)

Seven capability groups (`src/data/capability-meta.ts`): Evals & routing,
Retrieval & memory, Agents & computer use, Desktop & dev tools, Platforms & web,
Mobile apps, Hardware, sim & infra. Order is fixed everywhere (home map, /projects
groups, filter pills, sphere sectors, legend). **Groups have no colour.** Every
group's `color` is white, and the old sand, clay, soft gold, grey, amber and ember
group colours are retired: a group is named in text and placed on the map, and
the legend and lists always say its name. All showcase posters are white and
off-white thin-line diagrams on black. The sphere (`src/components/sphere`) is
plain SVG, thin grey wireframe, small dots, no glow, and stays still under reduced
motion.

### Palette: black, white, tinted white, greys, two accents (2026-11-15, owner decision)

| Role | Token | Hex | Where it is used |
|---|---|---|---|
| Ground | `--color-bg` (+ surfaces `#070707`, `#0E0E0E`, `#161616`) | `#000000` | Background and panels |
| Primary | `--color-text`, `--color-accent` | `#FFFFFF` | Body, headings, controls, focus rings, poster line art |
| Tint | `--color-tint` | `#F2EFEA` | Secondary copy, hairlines, some stars |
| Greys | `--color-text-muted`, `--color-text-faint`, `--color-redact` | `#B8B8B8`, `#9A9A9A`, `#C8C8C8` | Muted text, marginalia, redaction bars |
| Accent 1: amber | `--color-heat` (also `--color-live`) | `#FF9F1C` | Highlight, live and active state, signal heat bars, release markers, a few stars |
| Accent 2: ember | `--color-signal` | `#FF5C1A` | Alert, classification, failure only |

Mirrored for canvas/SVG in `src/lib/palette.ts` (`palette.test.ts` fails on
drift, on a third chromatic colour, and on any hue outside warm). Mechanical
guardrails: `scripts/check-design-system.mjs` (part of `npm run lint`) fails any
hex, `rgb()`, `hsl()` or Tailwind colour outside black, white, greys, the tint and
the two accents, in `src`, `public` and `scripts`; `node scripts/check-contrast.mjs`
checks text contrast.

Retired: signal teal `#2DD4BF`, green `#34D399`, ultraviolet `#A78BFA`, soft gold
`#F5D76E` (`--color-pop`), sand `#E8DCC8`, clay `#A89C8A`, and every GitHub
language brand colour (language dots are one neutral grey; the language name
carries the meaning). Product screenshots in `public/demos` and
`public/projects` are evidence of third-party UIs and are not recoloured.

Rules:
- White carries interactive elements; hover is a 1px white ring, focus is a
  white ring.
- Amber is used sparingly, only where meaning needs it: live or active state,
  a highlight, a heat bar. Never body text, never large fills, never a group
  colour.
- **Alert / classification / failure is carried by ember** and only through the
  alert treatment: mono ALL-CAPS tag, 1px ember border, lock or marker glyph, and
  the words RESTRICTED / CLASSIFIED / ALERT. Colour alone never says "alert".
- Never a third chromatic colour. If a design needs one, it needs another cue
  (shape, weight, label, position) instead.

### Chart Overlays

| Token | Value |
|---|---|
| `--chart-grid` | `rgba(255,255,255,0.035)` |
| `--chart-grid-major` | `rgba(255,255,255,0.06)` |
| `--chart-tick` | `rgba(255,255,255,0.28)` |

---

## Surfaces

No glassmorphism. Panels are **solid, squared, hairline-bordered plates**:

```css
background: var(--color-surface);
border: 1px solid var(--color-border-strong);
border-radius: var(--radius-lg); /* 3px */
```

Hover states use a 1px white inset ring (`--glass-shadow-hover`), not glow.
Panels and controls never glow.

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

**Direction change, 2026-11-14 (owner request: "background is still the black
hole, drop that").** The background black hole introduced on 2026-11-10 is
removed completely: no event horizon, accretion glow, lensing or warm band,
live or static, and its shader, SVG and tests are deleted. The background is
now ONLY deep space and stars (see "Background contract"). The planets stay
out of the background (they live only in the home project map, FIG.01/02).

Planets on the home map are real lit 3D bodies with procedural surfaces
(rocky, gas, ice, cratered, terrain), lit by one key light with a hard
terminator, a 1px survey limb just outside the disc, and a reticle when
focused. They never glow: no additive blending, no radial falloff outside the
limb, no bloom. A thin atmosphere is allowed only as a rim tint blended
INSIDE the silhouette on the lit side (strength capped at 0.5). On software GL
the bodies fall back to line-art limbs and meridians. See `docs/planets.md`.

---

## Motion & Canvas Layers

WebGL/canvas layers are progressive enhancement. Every layer skips mounting
under `prefers-reduced-motion` and leaves meaning-bearing HTML intact. Every
background piece has a deliberate static rendition (server-rendered SVG/CSS,
crisp at any DPR, same palette and same positions as the live version):

| Piece | Component | Live (WebGL / canvas) | Static (reduced motion, no WebGL, software GL, Save-Data, failure) | Where |
|---|---|---|---|---|
| Starfield | `Starfield` (`lib/starfield.ts`) | R3F points via `SceneFrame`, the whole background: 3,200 round points at 1440 x 900 in three parallax layers (far, mid, near), a slow sideways drift, a very subtle twinkle on about 40% of them, a small scroll parallax; white, the warm tint and a few amber (`STAR_COLORS`) | `starfield-still-{wide,tall}.svg` (`scripts/generate-starfield-still.mjs`, same generator), a pre-rendered SVG, nothing animates | Site background, every page |
| Primary orbit | `OrbitalScene` | R3F via `SceneFrame` | Static survey plate | Home FIG.01 (hero, beside the intro) |
| Secondary belt | `BeltScene` | R3F via `SceneFrame` | Static survey plate | Home FIG.02 |
| Surveyed terrain | `SectorTerrain` | ThreeUI `constellation-field` / `topo-field` | Skips mounting | `/projects` sector map |
| Telemetry arcs | `DossierArcField` | ThreeUI `predictive-arc` | Skips mounting | Dossier hero band |
| Hyperspace streaks | `WarpFieldLayer` | ThreeUI `warp-field/hyperspace` | Skips mounting | 404 plate |
| Uplink loader | `UplinkLoader` | ThreeUI | Skips mounting | Route transitions (`loading.tsx`) |

Background contract (revised 2026-11-14, owner requests: "all background be
space and stars", then "drop the black hole"): the background is deep black
space with a layered starfield and nothing else. No central object (no black
hole, planet or glow), no constellation lines, survey grid, mapped stars,
stardust clouds, streak rings or warm band, live or static. Stars are white
(a fifth lean to the warm tint, a few amber), never tinted green, teal, blue or
violet. It is atmosphere behind content, not an object competing with it:
fixed in place, with a small depth shift of the stars as the page scrolls.
Star counts per quality tier at 1440 x 900: full 3,200, high 2,200, low 1,000,
scaled by viewport area (0.4x to 1.2x, so a phone gets about 1,300 at full); the
static plate is a pre-rendered still of about 1,500 (wide) or 900 (tall) stars.
Words come first: star peak brightness is capped, stars are 1 to 2.5 px, and a
soft scrim (darker toward the side edges) and vignette sit over both
renditions. Text contrast is measured on screenshots with
`scripts/capture-background.mjs` (it writes `contrast.json`: every text box
against the brightest 5% of the pixels painted under it). ONE WebGL context for
the whole background; the live scene lazy-loads after first paint and only
after a WebGL probe passes. Only renderers named llvmpipe, SwiftShader or
softpipe count as software GL and start on the static plate; Apple and unknown
renderer strings start live and measurement decides. DPR is capped at 1 (0.75
on the low tier), `preserveDrawingBuffer` is off, and the frame loop pauses when
the tab is hidden or the canvas is off screen. drei's `PerformanceMonitor`
steps quality down when frames stay under 45 fps (budget: 55+ on integrated
graphics): full (3,200 stars, DPR 1) to high (2,200) to low (1,000, DPR 0.75) to
the static plate, never back up, logging each step as `[cosmos] tier a -> b` and
recording the rung in `data-cosmos-tier` on `.cosmic-bg`. The static plate hides
only after the live scene's first rendered frame and returns if the scene is
lost or given up on. `?cosmos=static` and `?cosmos=live` are QA overrides (live
cannot beat reduced motion or a missing WebGL context); `?cosmos-tier=pin`
additionally holds full quality and skips the monitor, for tests on software GL.

Canvas layers never carry meaning: semantic HTML, labels, and keyboard
paths work with every layer disabled.

---

## Do / Don't

**Do:**
- Dark survey plate always — no light mode
- Solid panels, hairline borders, squared corners
- Mono microcopy for labels, IDs, and marginalia
- White for primary text and controls, the warm tint for secondary copy and lines
- At most two accents (amber for live/highlight, ember for alert), sparingly, plus neutrals
- A static SVG/CSS rendition for every background piece
- `prefers-reduced-motion` guards on every canvas layer

**Don't:**
- Glassmorphism, backdrop-blur panels, soft glows on UI, or rounded "SaaS" cards
- Ember outside alert and classification contexts
- Purple, violet, blue, teal or green anywhere (the stars are white, the tint and a few amber)
- A per-group or per-category colour; amber on controls or body text
- Constellation lines, grids, nebula or stardust clouds, or any layer beyond the starfield in the background, and above all no central object such as a black hole
- A third chromatic colour, soft gold, sand or clay
- A second WebGL context for the background
- Emoji in production UI
- Canvas/WebGL as the only carrier of meaning
