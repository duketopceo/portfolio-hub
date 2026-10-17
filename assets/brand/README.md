# Brand assets (proposal)

Logo proposal for Cosmic Intelligence. **Proposal only: the owner signs off logos.**

- `logo.svg` / `logo-light.svg`: 48x48 grid. A survey reticle: four square corner
  brackets (2px, square caps, 6px inset), a four-tick crosshair, a hairline ring
  (r9) and a teal core (r3.5). Teal appears once, as the single signal, matching
  `--color-accent`. Same geometry as the header mark in `src/components/Header.tsx`.
- `wordmark.svg`: mark + `COSMIC INTELLIGENCE` (Archivo ExtraBold, tracked) over the
  mono registry line `CI / SYSTEM REGISTRY` (JetBrains Mono). Falls back to system
  sans/mono when the fonts are not installed.
- `*.png`: resvg previews (`resvg -w 768 logo.svg logo.png`), optimised with oxipng.
  `logo-16.png` shows the 16px favicon size.
- Colours are the BRAND.md tokens: `#07090B`, `#E9ECEF`, `#7E8A96`, `#2DD4BF`. The
  light variant is for print/READMEs on white only; the site is dark-only.
- Not done: raster favicons in `public/brand/` (`favicon-*.png`, `.ico`,
  `apple-touch-icon.png`) still carry the older mark; regenerate them from `logo.svg`
  once the logo is approved.
