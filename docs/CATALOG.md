# Project catalog

Portfolio projects live in `src/data/projects/catalog/`. The catalog is deliberately curated: include active systems and intentional showcases, not every repository.

## Add a project

1. Add one file under `src/data/projects/catalog/`.
2. Export one project created with `defineProject()` from `../define`.
3. Import that export in `src/data/projects/index.ts` and add it to `projectConfigs`.
4. Keep Kurultai first; it is the portfolio lead system.
5. Add or change `src/data/deployments.ts` only when a verified deployment exists.

`defineProject()` requires identity, narrative, category, type, and `techStack`. It supplies conservative defaults for `featured`, `private`, `highlights`, `tier`, and `status`. Set `private: true` explicitly for non-public repositories.

Lead and core entries should include an `architecture` pipeline and useful `engineeringDecisions` so the detail page can explain what is behind the product before showing general context or documentation.

## Curation rules

- Verify repository name, visibility, language, and archive state before publishing.
- Keep external deployments only when they are intentionally part of the showcase.
- Do not publish personal emails, credentials, internal network addresses, tokens, or secrets.
- Use `status: "showcase"` for retained portfolio artifacts that are not active product development.
