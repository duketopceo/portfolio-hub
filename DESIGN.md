# Cosmic Intelligence — Design Standard

`BRAND.md` is the sole canonical Star Chart standard for this repository.

This file intentionally preserves only the retired HUD baseline's pointer. The
older launch-blue, Exo, zero-radius, backdrop-blur direction is
superseded and must not be used for new work.

Exception, 2026-11-10 (owner request 2026-11-09; do not revert silently): the BACKGROUND black hole, background
planets and stardust are back, redesigned from scratch on the Star Chart
palette (white accent, ember, amber and soft gold on pure black). The HUD tokens and Exo type
stay retired; see `BRAND.md` ("Palette" and "Motion & Canvas Layers") for the
current rules, which include a static SVG/CSS rendition for every piece.

Current authority:

- Visual system: `BRAND.md`
- Global tokens and legacy orchestration: `src/app/globals.css`
- Design-system layer: `src/app/design-system/`
- Shared composition primitives: `src/components/design/`
- Mechanical guardrails: `scripts/check-design-system.mjs`
- Route baselines: `tests/visual/`

Any conflict between this file and `BRAND.md` resolves in favor of `BRAND.md`.
