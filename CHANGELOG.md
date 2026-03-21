# Changelog

All notable releases are tagged as `vMAJOR.MINOR.PATCH` and published to `ghcr.io/duketopceo/portfolio-hub`.

## [3.0.0] — 2026-03-21

### Highlights

- **Cosmic Intelligence** rebrand across projects, activity, and detail pages
- **Content rail** — fluid `--cosmic-page-*` width/padding; header/footer aligned; wider desktop, clamped mobile/ultra-wide
- **Project cards v2** — spacious layout, gradient surface, pill meta row, full-width live demo strip, larger grid gutters
- **Spacing/layout fixes** — CSS cascade order for mobile overrides; `ProjectCard` flex (`flex-1`) for footer alignment
- **Readability** — measured prose (`65ch`), `.cosmic-readable`, dossier body; section labels on display font

### Docker

- Image tags: `latest` + `sha` on every `main` push; **semver tag** (e.g. `3.0.0`) on matching git tag `v3.0.0`

---

## Earlier

Pre-3.0.0 history lived on `main` without semver tags; treat **v3.0.0** as the first labeled baseline for **v4+**.
