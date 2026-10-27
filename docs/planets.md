# Planets: the 3D orbit map

The home page (`/`) draws its lead projects as real lit 3D planets in a React
Three Fiber scene. Each planet is described by one declarative spec in its
catalog JSON file; the scene and the static fallback plate both read the same
resolved spec. The DOM markers (`PlanetNode` links) stay the accessible,
interactive source of truth; the canvas is presentation.

## The PlanetSpec (`curated.planetVisual`)

Every field is optional. Missing fields get a deterministic default from the
project's category colour, type and slug (`src/lib/planet-spec.ts`).

| Field | Type | Meaning |
| --- | --- | --- |
| `size` | `xs`..`xl` | Body radius (`lg` default for lead planets) |
| `color` | `#RRGGBB` | Base colour; defaults to the category colour |
| `surface` | `rocky` `gas` `ice` `cratered` `terrain` | Procedural surface type |
| `palette` | `[low, mid, high]` hex | Overrides the palette derived from `color` |
| `seed` | int 0..100000 | Noise seed; same seed, same planet |
| `tilt` | -60..60 deg | Axial tilt |
| `rotationSpeed` | -0.6..0.6 rad/s | Spin; negative reverses |
| `atmosphere` | `{ strength 0..0.5, color? }` | Rim tint inside the limb; 0 disables |
| `rings[]` | `{ color?, opacity 0..1, tilt, inner, outer, bands 0..8 }` | Real ring geometry; `inner`/`outer` in planet radii. An authored list, even `[]`, is final |
| `moons[]` | `{ label, kind: stack\|live\|subproject, href? }` | Notable components, orbiting |
| `shape` | `sphere` `hex` `diamond` `cube` | Static plate and line-art silhouette only; 3D bodies are always spheres |

The Zod schema (`src/data/catalog/schema.ts`) validates ranges and rejects
unknown keys; `src/data/catalog/catalog.test.ts` checks every lead planet.

## Add a planet

1. Create or edit `src/data/catalog/<slug>.json` and add a `planetVisual`
   block to `curated` (at least `surface`; see the table).
2. Add the slug to `HOMEPAGE_FEATURED_SLUGS` in `src/lib/project-completeness.ts`
   (this list is the lead set and its order, five entries) and set
   `curated.featured` to match. The map lays bodies out from the list; no
   scene code changes.
3. `npm test` (catalog schema and lead-set tests) and look at `/`.

To remove or swap a planet, edit the same list and flags. To add a new surface
type, add a GLSL snippet to `src/components/scene/planets/surfaces.ts` and the
name to `PLANET_SURFACES` in `planet-spec.ts`.

## Module layout

- `src/lib/planet-spec.ts`: types, limits, defaults and palette derivation (pure)
- `src/lib/planet-visual.ts`: resolves a project to a `ResolvedPlanetVisual`
- `src/components/scene/planets/`: `Planet`, `Rings`, `Moons`, `planet-material`
  (shaders), `surfaces` (per-surface GLSL), `glsl`/`noise` (shared GLSL)
- `src/components/scene/scene-rig.tsx`: stage fit, camera drift, the star light
- `src/components/scene/survey-lines.tsx`, `survey-markers.tsx`: linework and
  focus furniture
- `src/components/scene/OrbitalScene.tsx`: composes the orbit system
- `src/components/scene/SceneFrame.tsx`: canvas, pause, fallbacks

## Lighting and brand

One key light (the star, a lifted point near the map centre), a flat ambient, a
hard anti-aliased terminator, a rim tint inside the silhouette only. Nothing is
drawn outside the limb: no additive blending, no bloom (BRAND.md).

## Performance and fallbacks

- The scene chunk is a dynamic, no-SSR import, mounted only when the browser
  is idle and the visitor allows it.
- Static survey plate (server-rendered, same links) instead of the scene for:
  `prefers-reduced-motion`, Save-Data, devices reporting 2 GB or less, no
  WebGL or context loss. Software GL keeps line-art limbs and meridians.
- Phones and 4 GB or less get the "lite" tier: coarser spheres, no ring
  shadow on the planet, DPR cap 1.25 (full: 1.5). Narrow stages draw bodies at
  0.6x so five planets stay legible.
- The frame loop stops when the map is off screen or the tab is hidden.
- The stage has a fixed aspect ratio and the canvas is absolutely positioned,
  so the swap from plate to canvas causes no layout shift.
