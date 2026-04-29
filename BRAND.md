# Cosmic Intelligence — Brand Guidelines

Luke Kimball's portfolio system. Applied across `luke-the-duke.com` and its subdomains.

---

## Name & Voice

| Context | Usage |
|---|---|
| Full name | **Cosmic Intelligence** |
| Short | **CI** (system/code references only) |
| Author | **Luke Kimball** |
| Tagline | *Systems that compound.* |
| Voice | Precise, confident, terse. No hype, no filler. |

---

## Color Palette

All colors are CSS custom properties defined in `src/app/globals.css`.

### Core

| Token | Hex | Role |
|---|---|---|
| `--color-bg` | `#080C14` | Deep space background |
| `--color-surface` | `#0C121E` | Card / panel base |
| `--color-surface-2` | `#111827` | Raised surface |
| `--color-surface-3` | `#1A2236` | Elevated element |
| `--color-accent` | `#2DD4BF` | Primary teal accent |
| `--color-live` | `#34D399` | Live / online indicator |

### Text

| Token | Value | Use |
|---|---|---|
| `--color-text` | `#E4E4E7` | Primary copy |
| `--color-text-muted` | `#94A3B8` | Secondary / body |
| `--color-text-faint` | `#475569` | Labels, timestamps, hints |

### Accent Variants

| Token | Value |
|---|---|
| `--color-accent-muted` | `rgba(45,212,191,0.12)` |
| `--color-accent-subtle` | `rgba(45,212,191,0.06)` |
| `--color-accent-glow` | `rgba(45,212,191,0.15)` |

### Nebula (background only)

| Name | Value |
|---|---|
| Nebula blue | `rgba(30,60,120,0.4)` |
| Nebula purple | `rgba(60,30,90,0.3)` |
| Nebula teal | `rgba(20,90,85,0.25)` |

---

## Typography

| Role | Font | Weight | Token |
|---|---|---|---|
| Display / headings | Space Grotesk | 600–700 | `--font-display` |
| Body | Inter | 400–500 | `--font-body` |
| Mono / labels / code | JetBrains Mono | 400–600 | `--font-mono` |

### Type Scale

| Token | Value |
|---|---|
| `--text-xs` | `0.75rem` |
| `--text-sm` | `0.875rem` (→ `0.9375rem` on lg) |
| `--text-base` | `1rem` |
| `--text-lg` | `1.125rem` |
| `--text-xl` | `1.5rem` |
| `--text-2xl` | `2rem` |
| `--text-3xl` | `2.5rem` |
| `--text-hero` | `clamp(3rem, 0.5rem + 7vw, 5rem)` |

### Rules
- Headings: Space Grotesk, `letter-spacing: -0.02em`
- Labels / eyebrows: JetBrains Mono, ALL CAPS, `letter-spacing: 0.08–0.14em`
- Body: Inter, `line-height: 1.55`
- Code: JetBrains Mono, `font-size: 0.85em` relative

---

## Glass System

All surface components use the glass system for depth.

```css
/* Standard glass card */
background: rgba(12, 18, 30, 0.70);
backdrop-filter: blur(16px) saturate(150%);
border: 1px solid rgba(45, 212, 191, 0.08);
box-shadow: 0 1px 2px rgba(0,0,0,0.5);
border-radius: 14px;

/* Hover state */
border-color: rgba(45, 212, 191, 0.18);
box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(45,212,191,0.05);
```

---

## Logo

File: `public/brand/logo-cosmic.svg`

The logo is an SVG orrery — overlapping elliptical orbits with a central star dot. Rendered in `--color-accent` (`#2DD4BF`) on dark backgrounds.

**Minimum size:** 24×24px  
**Clear space:** equal to the logo's inner circle radius on all sides  
**Never:** recolor to anything other than `--color-accent` or white; stretch or skew

---

## Favicon / App Icons

| File | Size | Use |
|---|---|---|
| `favicon.ico` | multi | Browser tab fallback |
| `favicon-16.png` | 16×16 | Small tab |
| `favicon-32.png` | 32×32 | Standard tab |
| `apple-touch-icon.png` | 180×180 | iOS home screen |
| `og-image.png` | 1200×630 | Social share card |

---

## Animation Principles

- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` for entrances (spring-like)
- **Duration:** 150–200ms micro, 350–500ms page transitions, 4–14s ambient
- **Stars:** 3 independent CSS layers (`--near` 5.2s, `--mid` 8.4s, `--far` 13s) create staggered twinkle without JS
- **Nebula:** Two blob layers drift at 52s / 68s alternate; scale 1→1.05
- **Reduced motion:** All ambient animations off; entrance transitions intact

---

## Spacing

| Token | Value |
|---|---|
| `--space-xs` | `clamp(0.25rem, 0.5vw, 0.5rem)` |
| `--space-sm` | `clamp(0.5rem, 1vw, 0.75rem)` |
| `--space-md` | `clamp(0.75rem, 1.5vw, 1.25rem)` |
| `--space-lg` | `clamp(1.25rem, 2.5vw, 2rem)` |
| `--space-xl` | `clamp(2rem, 4vw, 3rem)` |
| `--space-2xl` | `clamp(3rem, 6vw, 5rem)` |

Page rail: `max-width: min(90rem, 100%)`, `padding: clamp(1rem, 4vw, 3rem)`

---

## Border Radius

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | `4px` | Chips, code, tiny elements |
| `--radius-md` | `8px` | Buttons, inputs |
| `--radius-lg` | `14px` | Cards, panels |
| `--radius-xl` | `18px` | Large cards, modals |

---

## Subdomains & Sections

| URL | Purpose | Brand notes |
|---|---|---|
| `luke-the-duke.com` | Main portfolio | Full cosmic theme |
| `luke-the-duke.com/projects` | Project catalog + quadrant map | Same theme |
| `luke-the-duke.com/now` | Live GitHub activity | Same theme |
| `luke-the-duke.com/podcast` | EP009 podcast page | Cosmic variant — `ep009.js`, `cosmic-pod.css`, carousel UI, TradingView, OpenRouter chat |

### Podcast sub-brand (`/podcast`)

- Inherits all core colors and fonts
- Adds: TradingView ticker, mosaic tile grid, star canvas (`initStars()`), OpenRouter AI chat
- Custom CSS: `public/podcast/cosmic-pod.css` (overrides/extends globals)
- No site header/footer (standalone experience)

---

## Component Inventory

| Component | File | Description |
|---|---|---|
| Site background | `SiteChrome.tsx` | Fixed nebula + 5 star layers |
| Header | `Header.tsx` | Sticky nav, glass on scroll |
| Solar system nav | `SolarSystemNav.tsx` | Orbit-style project navigator |
| Activity feed | `ActivityFeed.tsx` | GitHub commit feed widget |
| Welcome intro | `WelcomeIntro.tsx` | First-visit toast (localStorage) |
| Project card | `ProjectCard.tsx` | Glass card, lang border, live strip |
| Quadrant graph | `QuadrantGraph.tsx` | 2-axis scatter of projects |
| Pull requests panel | `PullRequestsPanel.tsx` | Public-only open PRs |
| Repo detail modal | `RepoDetailModal.tsx` | Expanded project info |

---

## Do / Don't

**Do:**
- Dark backgrounds always — no light mode
- Teal accent sparingly for interactive elements and highlights
- Mono font for all technical strings, labels, timestamps, stats
- Glass surfaces with backdrop-blur for floating UI

**Don't:**
- Use accent color for large background fills
- Introduce new colors outside the palette without updating this file
- Add light mode variants
- Use emoji in production UI unless explicitly part of content (podcast tiles OK)
- Skip `prefers-reduced-motion` guards on ambient animations
