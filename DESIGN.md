# Cosmic Intelligence — Design Standard

`BRAND.md` is the sole canonical Star Chart standard for this repository.

This file intentionally preserves only the retired HUD baseline's pointer. The
older launch-blue, Exo, zero-radius, backdrop-blur direction is
superseded and must not be used for new work.

Exception, 2026-11-14 (owner request; do not revert silently): the background is deep space and stars only: a
layered warm-white starfield on every page, with a pre-rendered static still. The black hole that the
2026-11-10 exception introduced is removed; there is no central object. See `BRAND.md` ("Background
contract"). The HUD tokens and Exo type stay retired.

Current authority:

- Visual system: `BRAND.md`
- Global tokens and legacy orchestration: `src/app/globals.css`
- Design-system layer: `src/app/design-system/`
- Shared composition primitives: `src/components/design/`
- Mechanical guardrails: `scripts/check-design-system.mjs`
- Route baselines: `tests/visual/`

Any conflict between this file and `BRAND.md` resolves in favor of `BRAND.md`.
