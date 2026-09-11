# Cosmic Intelligence — Design Standard

## Visual thesis

A deep-space HUD interface: star-white type on a near-black void, one launch-blue accent, precise geometric type, and a single dominant visual anchor. The interface should feel like a mission-control dossier, not a marketing template.

## Authority

This standard is built with `ui-ux-pro-max` (HUD/Sci-Fi FUI) and `ce-frontend-design` (editorial composition, minimal chrome, strong visual anchor). It overrules the previous Cosmic Intelligence theme for all future UI work.

## Tokens

| Role | Value | CSS variable |
|------|-------|--------------|
| Background | `#0B0B10` | `--background` |
| Foreground | `#F8FAFC` | `--foreground` |
| Muted foreground | `#94A3B8` | `--muted-foreground` |
| Primary (accent/CTA) | `#3B82F6` | `--primary` |
| On primary | `#000000` | `--primary-foreground` |
| Card / surface | `#1E1E23` | `--card` |
| Muted surface | `#232328` | `--muted` |
| Border | `#1E293B` | `--border` |
| Ring | `#3B82F6` | `--ring` |
| Error | `#EF4444` | `--destructive` |

## Typography

- **Display & body:** Exo (300–700) — `var(--font-display)`
- **Mono:** JetBrains Mono (400–500) — `var(--font-mono)`
- Two typefaces only. No Inter, Roboto, Arial, or Space Grotesk.
- Hero: `clamp(3rem, 11vw, 8rem)`, `font-weight: 700`, `letter-spacing: -0.03em`, `line-height: 0.95`
- Section: `2rem`–`2.5rem`, `font-weight: 600`
- Body: `1rem` (16px), `line-height: 1.5`
- Labels/mono: `0.75rem`, uppercase, `letter-spacing: 0.15em`

## Spacing & composition

- Container: `max-w-7xl`, `mx-auto`, `px-4 sm:px-6 lg:px-8`
- Section vertical: `py-24` (desktop), `py-16` (mobile)
- Treat the first viewport as a poster: one strong composition, not a dashboard
- No card styling unless the item is a clear interactive container
- Zero border-radius across the board — sharp, technical edges
- Use whitespace and alignment before chrome

## Landing page map

1. **Hero** — name + role line, H1, one-line promise, two CTAs, dominant black-hole visual
2. **Featured systems** — 6 lead projects as a plain list with category and status labels
3. **About** — one paragraph of positioning
4. **Final CTA** — one bordered panel, copy, single action
5. **Full catalog** — `src/app/projects/page.tsx` with every non-catalog system, ranked

## Motion

- Hero: staggered reveal on load (300ms apart, 35px rise)
- Black hole: slow continuous rotation and pulse glow
- Hover: border color to `--primary` over 150ms
- Reduced motion: disable continuous spins, keep opacity reveals

## Hard rules

- One accent color only (launch blue)
- No gradients for backgrounds
- No abstract decorative blobs
- No shadows except the black-hole glow
- 0px border radius on components; circular visual anchors (black hole, live dot) are intentional exceptions
- No emoji, no generic marketing copy
- Semantic HTML: `nav`, `main`, `section`, `article`, `footer`
- Focus rings on every interactive element

## Components

- **Button primary:** `bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold uppercase tracking-widest`
- **Button secondary:** `border border-foreground text-foreground px-5 py-2.5 text-sm font-semibold uppercase tracking-widest hover:border-primary hover:text-primary`
- **Link:** `text-muted-foreground hover:text-foreground transition-colors`
- **List item:** `border-b border-border py-6 group hover:border-primary transition-colors`
- **Status label:** `text-[10px] uppercase tracking-[0.1em] text-primary border border-primary px-1.5 py-0.5`
- **Header:** minimal sticky bar, brand left, nav right, `bg-background/90 backdrop-blur` on scroll
