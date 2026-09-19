---
title: Portfolio Hub Design System and Page Redesign
type: feat
date: 2026-09-14
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-brainstorm
execution: code
status: ready
---

# Portfolio Hub Design System and Page Redesign

## Goal Capsule

- **Objective:** Make every Portfolio Hub page feel like one coherent, high-end recruiter product rather than a mixture of Star Chart, old HUD, and generic dark SaaS patterns.
- **Primary actor:** A recruiter or hiring manager evaluating Luke Kimball's engineering work quickly.
- **Core outcome:** A visitor can discover relevant systems, understand Luke's ownership and technical depth, inspect evidence, run a demo, and contact Luke without the visual theme obstructing the decision.
- **Visual thesis:** A neo-industrial star chart: repositories are surveyed systems, projects are evidence-rich dossiers, and job demos are focused mission briefings.
- **Scope:** Design authority, tokens, shared compositions, global chrome, every Portfolio Hub page, project evidence structure, responsive behavior, accessibility, and visual regression coverage.
- **Out of scope:** The Cloudflare Portfolio Guide chatbot implementation, repository visibility changes, and raw private-repository publication. Those are separate workstreams that consume this system.
- **Stop conditions:** Do not trade readability for theme, ship fake evidence, expose raw private source, or remove semantic/no-JS fallbacks from visual surfaces.

## Product Contract

### Product definition

**Portfolio Hub is Luke Kimball's space-themed engineering showcase—turning repositories into recruiter-ready case studies and giving job-specific demos a polished place to live.**

### Experience definitions

- **UI:** A neo-industrial star chart: repositories become surveyed systems, projects become evidence-rich dossiers, and job demos become focused mission briefings.
- **UX:** Recruiter-first exploration: scan the constellation, open a dossier, inspect proof, run the demo, and reach Luke without getting lost in the theme.
- **Data showcase:** Evidence over decoration: ownership, architecture, decisions, activity, outcomes, screenshots, metrics, and working demonstrations.
- **Infrastructure:** Next.js on Railway, with Cloudflare providing DNS, CDN, security, email, storage, retrieval, and the later Portfolio Guide.

### Problem frame

The redesigned homepage and project registry establish a distinctive Star Chart direction, but the rest of the site still contains older design generations. `BRAND.md` describes teal, Archivo, squared survey plates, and no backdrop blur. `DESIGN.md` claims authority for an older blue/Exo/black-hole HUD direction and even prescribes backdrop blur. The implementation compounds the conflict: `globals.css` is roughly 6,900 lines with mixed eras, repeated selectors, raw colors, scattered media queries, inline styles, Tailwind utilities, and legacy rounded SaaS components.

The inconsistency is most visible on OpenRouter, About, Contact, Hire, Now, Resume, and portions of project dossiers. These pages are functional but do not meet the standard set by the homepage and registry. The redesign must create reusable compositions and evidence standards, not merely repaint each page independently.

### Key decisions

- **Star Chart is the sole visual authority.** `BRAND.md` becomes canonical and `DESIGN.md` is reconciled into it. The older launch-blue/Exo/black-hole HUD direction is retired.
- **Recruiter utility outranks decorative telemetry.** Instrument language and orbital motifs remain, but any coordinate, clock, label, animation, or chrome that competes with evidence is reduced or removed.
- **Luke's name, city-level location, GitHub, and LinkedIn remain public.** Exact coordinates, phone number, and personal mailbox do not.
- **Private projects remain showcaseable.** Their dossiers use explicitly curated, publish-safe evidence packages rather than raw private repository access.
- **No page is “a max-width div with cards.”** Every page uses an intentional composition with a clear focal point, reading order, evidence hierarchy, and close.
- **WebGL remains progressive enhancement.** Canvas layers never carry the only copy, link, state, or navigation path.
- **One implementation system.** Shared tokens and primitives replace page-local interpretations; exceptions require a documented reason.

### Page families

#### Poster

For `/` and non-interactive flagship job-demo landing surfaces. Poster introduces and routes; Mission briefing owns the interactive demo itself.

- One dominant first-viewport composition.
- Clear positioning statement and primary action.
- Sparse supporting metadata.
- One visual anchor; no dashboard wall.

#### Registry

For `/projects` and `/now`.

- Fast scanning and filtering.
- Strong data hierarchy.
- Rows, maps, and timelines preferred over repeated generic cards.
- Status and freshness are explicit.

#### Dossier

For `/projects/[slug]` and `/resume`.

- Context, ownership, architecture, decisions, proof, outcomes, and next action.
- Narrow reading measure paired with wide evidence surfaces.
- Private projects use sanitized evidence with explicit classification.

#### Transmission

For `/about`, `/hire`, and `/contact`.

- Editorial composition rather than settings-style cards.
- One message, one conversion goal, one strong close.
- Supporting links are secondary and ordered.

#### Mission briefing

For `/openrouter` and the interactive portion of job-specific demos.

- Demo purpose, scenario, controls, output, evaluation, and limitations.
- Interactive tools look like part of Star Chart, not embedded SaaS panels.
- Every demo includes deterministic fallback evidence when live inference is unavailable.

#### System state

For loading, empty, partial, error, global-error, offline-demo, and 404 surfaces.

- State and recovery action are immediately understandable.
- Branding supports comprehension rather than delaying it.
- Static HTML remains usable when JavaScript, WebGL, or a dynamic chunk fails.
- Reduced motion and keyboard behavior match the rest of the system.

### Design standards

#### Spacing

Use a 4px foundation with semantic tiers:

| Tier | Values | Use |
|---|---|---|
| Micro | 4, 8px | Icon/text gaps, inline metadata |
| Control | 12, 16px | Buttons, fields, compact rows |
| Component | 24, 32px | Panel interiors, grouped evidence |
| Section | 48, 64px | Section rhythm |
| Editorial | 96, 128px | Major narrative transitions |

Requirements:

- One shared page rail: fluid 16–48px horizontal inset, maximum 1440px.
- Reading measure: 58–70 characters.
- Evidence measure: up to the full page rail.
- Mobile compression preserves hierarchy; it does not merely remove whitespace.
- No arbitrary spacing values in page components when a semantic token exists.

#### Typography

- Archivo for display and body; JetBrains Mono for metadata, labels, paths, and technical values.
- Body copy: 16–18px, line-height 1.6–1.75.
- Meaningful UI copy: minimum 12px.
- Mono labels: 11–12px, uppercase, tracked; never the dominant reading texture.
- One obvious H1 per page, followed by logical H2/H3 structure.
- Headlines use tight tracking; body text does not.

#### Color and surfaces

- Dark-only near-black survey plate.
- Teal only for interaction and live signal.
- Orange only for classified, restricted, or warning states.
- Green only for genuinely live status.
- Solid surfaces, hairline borders, 0–4px radius.
- No backdrop blur, soft-glow card shells, decorative gradients, or rounded SaaS panels.
- Decorative grids and stars remain low-contrast enough to preserve reading comfort.

#### Motion

- Motion explains focus, hierarchy, or system state; it is not ambient noise by default.
- Prefer transform and opacity.
- All continuous motion stops under `prefers-reduced-motion`.
- Reduced motion creates no WebGL context.
- Entry transitions do not delay access to primary content or links.

#### Interaction and accessibility

- Every interactive element has visible hover, active, focus-visible, disabled, loading, and error behavior where applicable.
- Focus order follows visual order.
- Touch targets are at least 44px when isolated.
- Contrast meets WCAG AA.
- Canvas, charts, and diagrams have semantic HTML equivalents.
- Pages remain usable at 390px without horizontal scrolling.

### Project evidence standard

Every featured project dossier must answer, in order:

1. What is it?
2. Why does it exist?
3. What did Luke own?
4. What was technically difficult?
5. How is the system shaped?
6. What decisions and tradeoffs mattered?
7. What evidence can the visitor inspect?
8. What happened or what is its current state?
9. What should the visitor do next?

Evidence types include live links, public source, screenshots, recordings, architecture diagrams, test results, activity, verified metrics, and sanitized artifacts. Empty metric theater is prohibited.

Private-project evidence packages may include purpose, approved business context, Luke's role, sanitized architecture, technology, decisions, safe scale ranges, approved outcomes, approved media, and why source remains private. Raw private source, client records, credentials, internal hosts, brokerage data, and unapproved claims are excluded.

### Route acceptance matrix

| Route | Family | Required redesign outcome |
|---|---|---|
| `/` | Poster | Preserve orbital identity; sharpen positioning, featured proof, and demo/contact paths |
| `/projects` | Registry | Preserve sector map; improve scan/filter/status hierarchy and public/private clarity |
| `/projects/[slug]` | Dossier | Standard evidence sequence, sanitized private treatment, strong demo and next-project flow |
| `/openrouter` | Mission briefing | Replace rounded SaaS internals with instrument-grade demo briefs and consistent controls/states |
| `/resume` | Dossier | Web-first evidence hierarchy; résumé content remains printable and machine-readable |
| `/now` | Registry | Replace mixed timeline/card/Spotify styling with a coherent activity transmission layout |
| `/about` | Transmission | Add a strong editorial anchor, operating principles, and proof-linked narrative |
| `/hire` | Transmission | State role fit, ownership range, evidence, availability, and one primary contact action |
| `/contact` | Transmission | Replace the 2+1 settings-card layout with a focused conversion surface |
| 404/loading/error | System state | Branded, readable, reduced-motion-safe states with recovery actions |

## Planning Contract

### Architecture

- `BRAND.md` is the canonical human-readable standard.
- `DESIGN.md` becomes a short pointer or is replaced by the reconciled standard.
- `globals.css` retains Tailwind import and global orchestration only.
- Design ownership is split into token/base, primitives, chrome, and page-family styles.
- Shared React primitives own composition; pages supply content and data.
- Project evidence fields become typed data rather than ad hoc conditional page sections.

### Delivery strategy

Ship as sequential, reviewable PRs rather than one every-page diff:

1. Foundation: authority, baselines, tokens, style ownership, and shared primitives.
2. Chrome and Poster/Registry families.
3. Dossier data contract and project pages.
4. Mission briefing, Resume, Transmission, and System state families.
5. Legacy-style removal and final all-route verification.

Each PR is independently buildable and preserves the current production routes. Later layers depend on the merged foundation. Before starting, re-capture the baseline from the final merged head of PR #36; if that head changes materially from `bd5d352`, update affected assumptions and screenshots before implementation rather than treating this draft's snapshot as authoritative.

### Shared primitives

Plan for these conceptual primitives; exact filenames may follow existing component conventions:

- Page rail and page shell
- Registration/page header
- Section heading and marginalia
- Solid survey plate
- Evidence panel
- Metric/evidence row
- Status/classification mark
- Architecture flow
- Media/demo frame
- Project proof section
- Transmission close/CTA

A primitive is added only when at least three pages share the same responsibility. Two-site similarities remain local until the third use proves the abstraction.

## Implementation Units

### U1. Capture the visual baseline and reconcile authority

- Add `@playwright/test` and checked-in screenshot coverage under `tests/visual/`, with `test:visual` and `test:visual:update` package scripts.
- Capture desktop and 390px baselines for every route in the acceptance matrix.
- Run screenshot comparisons under reduced motion and mask nondeterministic canvas pixels, live UTC text, and external embeds; dedicated behavior checks cover those surfaces separately.
- Record overflow, console, accessibility, reduced-motion, and WebGL-off behavior.
- Reconcile `BRAND.md` and `DESIGN.md`; Star Chart becomes the only authority.
- Define the page-family and evidence standards in the canonical document.

### U2. Establish enforceable tokens and style ownership

- Normalize spacing, type, color, radius, motion, page-rail, and reading-measure tokens.
- Separate global CSS by ownership without changing rendered behavior first.
- Remove obsolete aliases, raw fallbacks, and duplicate selectors after proving consumers.
- Add a dependency-free `scripts/check-design-system.mjs` source check for mechanically enforceable rules: no `backdrop-filter`, no unsupported numeric radii above 4px outside explicit circular exceptions, and no retired token names.
- Enforce minimum meaningful copy size, focus visibility, and reduced-motion behavior in browser tests, where computed styles and active animations can be observed rather than guessed from CSS text.

### U3. Build shared page and evidence primitives

- Implement the common composition primitives.
- Preserve semantic elements and existing route behavior.
- Add component-level states for interactive primitives.
- Migrate one representative page from each family before broad rollout.

### U4. Redesign global chrome and system states

- Simplify header telemetry around navigation and recruiter orientation.
- Simplify footer into useful project/contact/navigation evidence.
- Reconcile loading, error, global error, and 404 surfaces.
- Preserve mobile navigation, focus handling, reduced motion, and no-WebGL fallbacks.

### U5. Redesign the Poster and Registry family

- Refine `/` without discarding the verified FIG.01/FIG.02 fallback contract.
- Refine `/projects` around discovery, status, classification, and evidence.
- Redesign `/now` as a coherent transmission/activity registry; integrate or visually subordinate Spotify.

### U6. Redesign project dossiers and data contracts

- Add typed ownership, problem, decisions, architecture, evidence, outcomes, and confidentiality fields.
- Migrate every featured project to the complete evidence sequence.
- Add curated private-project evidence packages without exposing source.
- Provide explicit incomplete-data states for catalog entries that lack enough evidence.

### U7. Redesign OpenRouter and job-demo briefings

- Replace generic rounded dashboard surfaces with Star Chart controls and output plates.
- Standardize demo purpose, scenario, controls, evidence, limitations, and source/live links.
- Ensure offline fixtures remain credible when inference is unavailable.
- Provide a reusable mission-briefing surface for future job applications.

### U8. Redesign Resume and Transmission pages

- Redesign `/resume` as a web-first dossier while preserving PDF, JSON, Markdown, JSON-LD, and print behavior.
- Redesign `/about` around positioning, operating principles, and linked proof.
- Redesign `/hire` around role fit, ownership range, evidence, and a single contact conversion.
- Redesign `/contact` around the working routed alias and high-signal secondary links.

### U9. Validate every page family

- Lint, typecheck, tests, and production build.
- Desktop and 390px screenshots for every route.
- Keyboard and focus-order pass.
- Reduced-motion and WebGL-disabled pass.
- No horizontal overflow.
- No uncaught console errors.
- Contrast and heading-structure audit.
- Visual review against the baseline and canonical standard.

### U10. Remove the old eras

- Remove superseded selectors, components, token fallbacks, and inline design decisions.
- Confirm no route still depends on old HUD/blue/Exo/glass/rounded-SaaS conventions.
- Regenerate documentation and route inventories.
- Run the complete verification contract again after cleanup.

## Verification Contract

| Gate | Requirement |
|---|---|
| Lint | 0 errors, 0 warnings |
| TypeScript | `npx tsc --noEmit` clean |
| Tests | Existing suite green; new behavior carries focused coverage where infrastructure exists |
| Build | Production build green; every route prerenders/serves as intended |
| Visual regression | `npm run test:visual` passes against checked-in 390px and desktop baselines |
| Browser | Every matrix route at 390px and desktop, no overflow or uncaught console errors |
| Accessibility | Keyboard path, focus visibility/order, headings, landmarks, labels, and AA contrast |
| Motion | Reduced motion stops continuous animation and creates no WebGL contexts |
| Failure | WebGL/chunk/demo failures retain readable HTML and recovery paths |
| Content | Every featured dossier satisfies the evidence sequence or displays an honest incomplete-evidence state |
| Privacy | Exact coordinates, phone, personal mailbox, raw private source, and unapproved client details absent |

## Definition of Done

- One canonical Star Chart standard governs the repository.
- All routes use one of the six defined page families.
- Homepage, registry, dossiers, OpenRouter, résumé, activity, about, hire, contact, and system states meet the route acceptance matrix.
- Every featured project carries structured, verifiable evidence.
- Private projects use curated evidence packages rather than raw source.
- The old visual eras and their dead selectors/tokens are removed.
- Durable visual-regression tests cover every route family at 390px and desktop widths.
- All verification gates pass.
- The redesign ships as the sequential PR series in Delivery strategy after PR #36 is merged; none of it is appended to the Star Chart merge-ready PR.

## Follow-Up Work

- Build the guarded Cloudflare Portfolio Guide against the approved public and curated-private corpus.
- Correct catalog visibility for repositories that are already public.
- Prepare approved personal repositories for open-source publication.
