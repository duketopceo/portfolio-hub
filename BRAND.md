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
dark survey plate; a single teal carries signal.

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
| `--color-text-faint` | `#5B6570` | Marginalia, registry IDs |

### Signal Colors

| Token | Value | Use |
|---|---|---|
| `--color-accent` | `#2DD4BF` | Signal teal — live + interactive only |
| `--color-signal` | `#FF5C1A` | Classification / restricted / alert marks |
| `--color-live` | `#34D399` | Live-status indicators |

Rules: teal for interactive elements and live states; orange strictly for
classified/restricted treatments; green only for actual live status.

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
markers in place of glowing planets, figure numbers (`FIG. 01`), margin
strips, and drafting title blocks are the signature motifs.

---

## Motion & Canvas Layers

WebGL/canvas layers are progressive enhancement. Every layer skips mounting
under `prefers-reduced-motion` and leaves meaning-bearing HTML intact:

| Piece | Component | Implementation | Where |
|---|---|---|---|
| Living starfield | `StarfieldScene` | R3F via `SceneFrame` | Site background, under grid/noise/vignette |
| Primary orbit | `OrbitalScene` | R3F via `SceneFrame` | Home FIG.01 |
| Secondary belt | `BeltScene` | R3F via `SceneFrame` | Home FIG.02 |
| Surveyed terrain | `SectorTerrain` | ThreeUI `constellation-field` / `topo-field` | `/projects` sector map |
| Telemetry arcs | `DossierArcField` | ThreeUI `predictive-arc` | Dossier hero band |
| Hyperspace streaks | `WarpFieldLayer` | ThreeUI `warp-field/hyperspace` | 404 plate |
| Uplink loader | `UplinkLoader` | ThreeUI | Route transitions (`loading.tsx`) |

Canvas layers never carry meaning — semantic HTML, labels, and keyboard
paths work with every layer disabled.

---

## Do / Don't

**Do:**
- Dark survey plate always — no light mode
- Solid panels, hairline borders, squared corners
- Mono microcopy for labels, IDs, and marginalia
- Teal sparingly for interactive/live signal
- `prefers-reduced-motion` guards on every canvas layer

**Don't:**
- Glassmorphism, backdrop-blur panels, soft glows, or rounded "SaaS" cards
- Orange outside classification/alert contexts
- Emoji in production UI
- Canvas/WebGL as the only carrier of meaning
