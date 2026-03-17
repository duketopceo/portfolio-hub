# Cosmic Intelligence — Full Rebrand Plan

> This document contains everything Cursor needs to implement the "Cosmic Intelligence" rebrand of the portfolio site at `luke-the-duke.com`. Generated brand assets are in `/cosmic-brand-assets/` at the project root (copy them into `public/` before starting).

## Reference Image

The design direction comes from the [Perplexity Comet "Cosmic Intelligence" art print](https://www.perplexity.ai). Key visual elements:
- **Human silhouette** filled with stars, galaxies, and nebula
- **Geometric overlays**: orbital rings (ellipses), crosshair lines, radiating guide lines
- **Corner registration brackets** (like camera viewfinder framing)
- **Deep space background**: dark teal (#080C14) with blue and purple nebula washes
- **Typography**: clean sans-serif, uppercase tracking on taglines, monospace for data labels
- **HUD-style icons**: small glyph icons in the upper-right corner area

---

## 1. Brand Assets (Already Generated)

Copy these from `../cosmic-brand-assets/` into `public/brand/`:

| File | Purpose | Dimensions |
|------|---------|------------|
| `logo-cosmic.svg` | Inline SVG logo — orbital rings + core star node + corner brackets | 48×48 viewBox |
| `og-image.png` | Open Graph / social share image | 1200×630 |
| `hero-bg.jpg` | Homepage hero background — deep space nebula + star field + orbital geometry | 1920×1080 |
| `favicon.ico` | Multi-size favicon (.ico) | 32×32, 16×16 |
| `favicon-32.png` | PNG favicon | 32×32 |
| `favicon-16.png` | PNG favicon (small) | 16×16 |
| `apple-touch-icon.png` | Apple touch icon — cosmic mark on dark bg | 180×180 |

### Logo SVG Usage

The SVG logo uses `currentColor` so it adapts to theme. Embed inline:

```tsx
// In Header.tsx — replace "~/portfolio" text with inline SVG
<Link href="/" className="flex items-center gap-2">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" 
       width="28" height="28" aria-label="Cosmic Intelligence"
       style={{ color: 'var(--color-accent)' }}>
    <ellipse cx="24" cy="24" rx="20" ry="10" stroke="currentColor" strokeWidth="1" opacity="0.3" transform="rotate(-25 24 24)"/>
    <ellipse cx="24" cy="24" rx="14" ry="7" stroke="currentColor" strokeWidth="1" opacity="0.5" transform="rotate(15 24 24)"/>
    <ellipse cx="24" cy="24" rx="18" ry="5" stroke="currentColor" strokeWidth="0.75" opacity="0.25" transform="rotate(-60 24 24)"/>
    <line x1="24" y1="4" x2="24" y2="44" stroke="currentColor" strokeWidth="0.5" opacity="0.15"/>
    <line x1="4" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="0.5" opacity="0.15"/>
    <circle cx="24" cy="24" r="3.5" fill="currentColor" opacity="0.9"/>
    <circle cx="24" cy="24" r="5" stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <circle cx="38" cy="19" r="1.5" fill="currentColor" opacity="0.6"/>
    <circle cx="12" cy="30" r="1.2" fill="currentColor" opacity="0.4"/>
    <circle cx="30" cy="32" r="1" fill="currentColor" opacity="0.35"/>
    <path d="M4 8 L4 4 L8 4" stroke="currentColor" strokeWidth="0.75" opacity="0.2" fill="none"/>
    <path d="M40 4 L44 4 L44 8" stroke="currentColor" strokeWidth="0.75" opacity="0.2" fill="none"/>
    <path d="M4 40 L4 44 L8 44" stroke="currentColor" strokeWidth="0.75" opacity="0.2" fill="none"/>
    <path d="M40 44 L44 44 L44 40" stroke="currentColor" strokeWidth="0.75" opacity="0.2" fill="none"/>
  </svg>
  <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '0.08em' }}>
    COSMIC INTELLIGENCE
  </span>
</Link>
```

---

## 2. Design System Tokens (globals.css)

Replace the entire `:root` and light mode blocks. The dark cosmic theme is the PRIMARY mode — light mode is secondary.

### Dark Mode (Default) — Deep Space

```css
:root {
  /* ── Deep Space Background ─────────────── */
  --color-bg: #080C14;
  --color-surface: #0C121E;
  --color-surface-2: #111827;
  --color-surface-3: #1A2236;
  --color-border: rgba(45, 212, 191, 0.08);
  --color-border-glass: rgba(45, 212, 191, 0.12);
  --color-divider: rgba(255, 255, 255, 0.04);

  /* ── Text — cool silver scale ──────────── */
  --color-text: #E4E4E7;
  --color-text-muted: #94A3B8;
  --color-text-faint: #475569;

  /* ── Cosmic Teal Accent ────────────────── */
  --color-accent: #2DD4BF;
  --color-accent-muted: rgba(45, 212, 191, 0.12);
  --color-accent-subtle: rgba(45, 212, 191, 0.06);
  --color-accent-glow: rgba(45, 212, 191, 0.15);

  /* ── Nebula Colors (for CSS gradients) ─── */
  --color-nebula-blue: rgba(30, 60, 120, 0.4);
  --color-nebula-purple: rgba(60, 30, 90, 0.3);
  --color-nebula-teal: rgba(20, 90, 85, 0.25);

  /* ── Status ────────────────────────────── */
  --color-live: #34D399;

  /* ── Glass (cosmic) ────────────────────── */
  --glass-bg: rgba(12, 18, 30, 0.7);
  --glass-bg-hover: rgba(12, 18, 30, 0.85);
  --glass-border: rgba(45, 212, 191, 0.08);
  --glass-border-hover: rgba(45, 212, 191, 0.18);
  --glass-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  --glass-shadow-hover: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(45, 212, 191, 0.05);
  --glass-blur: 16px;

  /* ── Type scale (unchanged) ────────────── */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.5rem;
  --text-2xl: 2rem;
  --text-3xl: 2.5rem;
  --text-hero: clamp(3rem, 0.5rem + 7vw, 5rem);

  /* ── Fonts ─────────────────────────────── */
  /* CHANGE: Replace Inter with Space Grotesk for display, keep JetBrains Mono */
  --font-display: var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif;
  --font-body: var(--font-inter), -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), 'JetBrains Mono', 'SF Mono', monospace;

  /* ── Radius ────────────────────────────── */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* ── Transition ────────────────────────── */
  --transition: 180ms cubic-bezier(0.16, 1, 0.3, 1);
  --transition-slow: 400ms cubic-bezier(0.16, 1, 0.3, 1);

  /* ── Spacing ───────────────────────────── */
  --space-xs: clamp(0.25rem, 0.5vw, 0.5rem);
  --space-sm: clamp(0.5rem, 1vw, 0.75rem);
  --space-md: clamp(0.75rem, 1.5vw, 1.25rem);
  --space-lg: clamp(1.25rem, 2.5vw, 2rem);
  --space-xl: clamp(2rem, 4vw, 3rem);
  --space-2xl: clamp(3rem, 6vw, 5rem);
}
```

### Light Mode Override

```css
:root:not(.dark) {
  --color-bg: #F0F4F8;
  --color-surface: #FFFFFF;
  --color-surface-2: #F7FAFC;
  --color-surface-3: #EDF2F7;
  --color-border: rgba(0, 0, 0, 0.08);
  --color-border-glass: rgba(0, 0, 0, 0.06);
  --color-divider: rgba(0, 0, 0, 0.04);

  --color-text: #1A202C;
  --color-text-muted: #4A5568;
  --color-text-faint: #A0AEC0;

  --color-accent: #0D9488;
  --color-accent-muted: rgba(13, 148, 136, 0.10);
  --color-accent-subtle: rgba(13, 148, 136, 0.05);
  --color-accent-glow: rgba(13, 148, 136, 0.08);

  --color-nebula-blue: rgba(30, 60, 120, 0.05);
  --color-nebula-purple: rgba(60, 30, 90, 0.04);
  --color-nebula-teal: rgba(20, 90, 85, 0.04);

  --color-live: #059669;

  --glass-bg: rgba(255, 255, 255, 0.70);
  --glass-bg-hover: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(0, 0, 0, 0.06);
  --glass-border-hover: rgba(0, 0, 0, 0.12);
  --glass-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  --glass-shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

### Category Colors (update in QuadrantGraph.tsx)

```ts
const catColors: Record<string, string> = {
  finance: "#2DD4BF",   // cosmic teal (primary)
  ai:     "#A78BFA",    // nebula purple
  osint:  "#FBBF24",    // star gold
  data:   "#38BDF8",    // deep space blue
  infra:  "#F472B6",    // nebula pink
  apps:   "#34D399",    // aurora green
};
```

---

## 3. Background Treatment

### Remove Old Grid Background

Delete the `.grid-bg` class and the `<div className="grid-bg">` from `layout.tsx`. Replace with a CSS-only cosmic background.

### New Cosmic Background (in globals.css)

```css
/* ── Cosmic background — replaces grid-bg ── */
.cosmic-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    /* Nebula glow — top-left blue */
    radial-gradient(ellipse 60% 50% at 20% 30%, var(--color-nebula-blue) 0%, transparent 70%),
    /* Nebula glow — top-right purple */
    radial-gradient(ellipse 50% 40% at 80% 20%, var(--color-nebula-purple) 0%, transparent 70%),
    /* Nebula glow — center teal */
    radial-gradient(ellipse 40% 40% at 50% 50%, var(--color-nebula-teal) 0%, transparent 60%),
    /* Base */
    var(--color-bg);
}

/* Star field — CSS pseudo-element with subtle dot pattern */
.cosmic-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.4) 0%, transparent 100%),
    radial-gradient(1px 1px at 25% 60%, rgba(255,255,255,0.3) 0%, transparent 100%),
    radial-gradient(1px 1px at 45% 25%, rgba(255,255,255,0.5) 0%, transparent 100%),
    radial-gradient(1px 1px at 55% 70%, rgba(255,255,255,0.3) 0%, transparent 100%),
    radial-gradient(1px 1px at 70% 40%, rgba(255,255,255,0.4) 0%, transparent 100%),
    radial-gradient(1px 1px at 85% 80%, rgba(255,255,255,0.3) 0%, transparent 100%),
    radial-gradient(1px 1px at 92% 15%, rgba(255,255,255,0.5) 0%, transparent 100%),
    radial-gradient(2px 2px at 30% 85%, rgba(255,255,255,0.2) 0%, transparent 100%),
    radial-gradient(2px 2px at 60% 10%, rgba(255,255,255,0.2) 0%, transparent 100%),
    radial-gradient(1px 1px at 5% 45%, rgba(255,255,255,0.3) 0%, transparent 100%),
    radial-gradient(1px 1px at 38% 92%, rgba(255,255,255,0.4) 0%, transparent 100%),
    radial-gradient(1px 1px at 78% 55%, rgba(255,255,255,0.35) 0%, transparent 100%);
  animation: twinkle 8s ease-in-out infinite alternate;
}

@keyframes twinkle {
  0% { opacity: 0.7; }
  100% { opacity: 1; }
}
```

In `layout.tsx`, replace:
```tsx
{/* Old: <div className="grid-bg" aria-hidden="true" /> */}
<div className="cosmic-bg" aria-hidden="true" />
```

---

## 4. Font Changes (layout.tsx)

Add Space Grotesk as the display font:

```tsx
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// In <body>:
<body className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}>
```

---

## 5. Metadata & Favicon (layout.tsx)

```tsx
export const metadata: Metadata = {
  title: "Cosmic Intelligence — Engineering Portfolio",
  description: "Systems that compound. Engineering portfolio showcasing AI, trading systems, OSINT platforms, and production infrastructure.",
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/brand/favicon.ico",
    apple: "/brand/apple-touch-icon.png",
  },
  openGraph: {
    title: "Cosmic Intelligence — Engineering Portfolio",
    description: "Systems that compound. Projects spanning AI automation, algorithmic trading, OSINT platforms, and Docker Swarm infrastructure.",
    type: "website",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630 }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};
```

---

## 6. Homepage Layout — Replace Quadrant with Constellation

The current homepage is a quadrant scatter graph. Replace it with a **constellation navigation** concept — projects float as star nodes connected by faint lines (constellation edges), with orbital rings as section dividers.

### New Homepage Concept (`src/app/page.tsx`)

```tsx
import { getEnrichedProjects } from "@/lib/github";
import ConstellationNav from "@/components/ConstellationNav";

export const revalidate = 3600;

export default async function Home() {
  const all = await getEnrichedProjects();
  const liveCount = all.filter((p) => p.liveUrl || p.demoUrl).length;
  const categories = new Set(all.map((p) => p.category));

  return (
    <div>
      {/* ── Hero Section ─────────────────────── */}
      <section className="cosmic-hero">
        <div className="cosmic-hero__inner">
          {/* Orbital decoration — behind text */}
          <div className="cosmic-hero__orbits" aria-hidden="true">
            {/* SVG orbital rings rendered here — see component below */}
          </div>
          
          {/* Title block */}
          <h1 className="cosmic-hero__title">
            Cosmic<br />Intelligence
          </h1>
          <p className="cosmic-hero__tagline">
            Systems that <span className="cosmic-hero__accent">compound.</span>
          </p>
          <div className="cosmic-hero__stats">
            <span>{all.length} projects</span>
            <span className="cosmic-hero__dot">·</span>
            <span>{categories.size} domains</span>
            <span className="cosmic-hero__dot">·</span>
            <span>{liveCount} live</span>
          </div>
        </div>
      </section>

      {/* ── Constellation Navigation ─────────── */}
      <section style={{ paddingBottom: "clamp(1rem, 2vw, 1.5rem)" }}>
        <ConstellationNav projects={all} />
      </section>
    </div>
  );
}
```

### Hero CSS

```css
/* ── Cosmic Hero ───────────────────────────── */
.cosmic-hero {
  position: relative;
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  padding: var(--space-xl) var(--space-md);
}

/* Optional: use hero-bg.jpg as background image */
.cosmic-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/brand/hero-bg.jpg') center/cover no-repeat;
  opacity: 0.4;
  z-index: 0;
}

.cosmic-hero__inner {
  position: relative;
  z-index: 1;
  max-width: 800px;
}

.cosmic-hero__title {
  font-family: var(--font-display);
  font-size: var(--text-hero);
  font-weight: 700;
  line-height: 0.95;
  color: var(--color-text);
  letter-spacing: -0.02em;
  margin-bottom: var(--space-sm);
}

.cosmic-hero__tagline {
  font-family: var(--font-body);
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  font-weight: 500;
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}

.cosmic-hero__accent {
  color: var(--color-accent);
}

.cosmic-hero__stats {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--color-text-faint);
  display: flex;
  justify-content: center;
  gap: 8px;
}

.cosmic-hero__dot {
  opacity: 0.3;
}

/* ── Orbital decoration ────────────────────── */
.cosmic-hero__orbits {
  position: absolute;
  inset: -20%;
  pointer-events: none;
  opacity: 0.15;
}
```

### ConstellationNav Component

Create `src/components/ConstellationNav.tsx`. This replaces `QuadrantGraph.tsx`:

**Key differences from Quadrant:**
1. Same scatter positioning logic (reuse `quadrant-positions.ts` data)
2. Add **constellation lines** — SVG `<line>` elements connecting related projects (same category = edge)
3. Nodes glow with nebula-style accent on hover (box-shadow with accent-glow)
4. Background of the graph area: transparent (relies on cosmic-bg)
5. Filter pills use cosmic glow style
6. The graph container has NO border/background — it floats in space

**Implementation approach:**
- Rename `ConstellationNav` but keep the same data structures
- The SVG overlay layer draws edges between projects in the same category
- Nodes have a subtle "pulse" animation (star-like twinkle)
- Hover card gets a nebula glow border

```tsx
// Start from QuadrantGraph.tsx and modify:
// 1. Rename component to ConstellationNav
// 2. Add an SVG layer at the back of the graph for constellation edges
// 3. Remove the q-graph background/border — make it transparent
// 4. Change node styling to star-node (glow + pulse)
// 5. Add edges between same-category nodes

// Constellation edges — render as SVG:
const edges = useMemo(() => {
  const result: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
  const pad = 8;
  const range = 100 - 2 * pad;
  
  // Connect each project to its nearest same-category neighbor
  const byCategory = positioned.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, typeof positioned>);
  
  Object.entries(byCategory).forEach(([cat, projects]) => {
    for (let i = 0; i < projects.length - 1; i++) {
      const a = projects[i];
      const b = projects[i + 1];
      result.push({
        x1: pad + ((a.qx + 1) / 2) * range,
        y1: pad + ((1 - a.qy) / 2) * range,
        x2: pad + ((b.qx + 1) / 2) * range,
        y2: pad + ((1 - b.qy) / 2) * range,
        color: catColors[cat] || "#2DD4BF",
      });
    }
  });
  return result;
}, [positioned]);

// In the render, add before nodes:
<svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
  {edges.map((edge, i) => (
    <line
      key={i}
      x1={`${edge.x1}%`} y1={`${edge.y1}%`}
      x2={`${edge.x2}%`} y2={`${edge.y2}%`}
      stroke={edge.color}
      strokeWidth="0.5"
      opacity="0.15"
      strokeDasharray="4 4"
    />
  ))}
</svg>
```

### Updated Graph CSS (replace `.q-graph` styles)

```css
.q-graph {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  /* REMOVE old background. Use transparent with subtle nebula radial */
  background: radial-gradient(
    ellipse 60% 50% at 50% 45%,
    rgba(45, 212, 191, 0.03) 0%,
    transparent 70%
  );
  /* REMOVE border — let it float in space */
  border: none;
  overflow: visible;
}

/* Node icon — cosmic glow */
.q-node__icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(12, 18, 30, 0.8);
  border: 1.5px solid var(--node-color, var(--color-accent));
  color: var(--node-color, var(--color-accent));
  box-shadow:
    0 0 0 2px var(--color-bg),
    0 0 8px rgba(45, 212, 191, 0.1),
    0 2px 6px rgba(0, 0, 0, 0.3);
  transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.q-node:hover .q-node__icon {
  transform: scale(1.25);
  box-shadow:
    0 0 0 3px var(--color-bg),
    0 0 25px color-mix(in srgb, var(--node-color, var(--color-accent)) 35%, transparent),
    0 0 50px color-mix(in srgb, var(--node-color, var(--color-accent)) 15%, transparent),
    0 8px 24px rgba(0, 0, 0, 0.3);
  background: color-mix(in srgb, var(--node-color, var(--color-accent)) 15%, rgba(12, 18, 30, 0.9));
}
```

---

## 7. Header Changes (`src/components/Header.tsx`)

1. Replace `~/portfolio` text logo with inline SVG logo + "COSMIC INTELLIGENCE" text (see Section 1 above)
2. Nav links remain the same but update active indicator to use accent glow
3. Glass header on scroll uses cosmic glass tokens
4. Optional: add a very subtle teal line at the very top of the page (1px accent border-top on `<header>`)

---

## 8. Footer Changes (`src/components/Footer.tsx`)

1. Change bottom text from "Engineering Portfolio" to "Cosmic Intelligence"
2. Keep existing structure but verify all links are correct
3. "Created with Perplexity" link stays

---

## 9. Hover Card Cosmic Glow

Update `.q-card` to have a nebula-style glow:

```css
.q-card {
  /* ...existing... */
  background: var(--color-surface);
  border: 1px solid var(--glass-border-hover);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 4px 12px rgba(0, 0, 0, 0.25),
    0 0 1px rgba(45, 212, 191, 0.1),
    0 0 30px rgba(45, 212, 191, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}
```

---

## 10. Project Detail Pages

If project detail pages exist at `/projects/[slug]`, update them to use cosmic theme:
1. Detail page header should use `--font-display` for the project name
2. Architecture flow arrows should use accent color with glow
3. Demo embed iframe container should have the cosmic glass treatment
4. "Launch Demo" button should have cosmic glow hover effect

---

## 11. Animations & Motion

### Star Twinkle (for node idle state)

```css
@keyframes star-twinkle {
  0%, 100% { opacity: 0.85; }
  50% { opacity: 1; }
}

.q-node__icon {
  animation: star-twinkle 3s ease-in-out infinite;
  animation-delay: calc(var(--node-index, 0) * 200ms);
}
```

### Orbital Float (for hero decoration)

```css
@keyframes orbital-float {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.cosmic-hero__orbits svg ellipse:nth-child(1) {
  animation: orbital-float 60s linear infinite;
}
.cosmic-hero__orbits svg ellipse:nth-child(2) {
  animation: orbital-float 45s linear infinite reverse;
}
```

### Scroll Entrance

Keep existing `fade-up` and `node-enter` animations. They work well with the cosmic theme.

---

## 12. Security Reminders

**DO NOT expose any of the following in the site code or metadata:**
- Personal email: kimballluke@gmail.com
- GitHub username: duketopceo
- Personal name: Luke Kimball
- Location: Utah
- Private repo URLs
- Any API keys or tokens

The site should feel anonymous/pseudonymous — "Cosmic Intelligence" is the brand identity, not a person's name.

---

## 13. Subdomain Shared Design System

For the subdomain projects (mildb, alphahedge, dixi, etc.), create a shared CSS file they can import to get the cosmic theme. The CSS variables from Section 2 should be extracted into a standalone file:

Create `public/cosmic-theme.css` with just the CSS custom properties (no Tailwind). Subdomain projects can add:
```html
<link rel="stylesheet" href="https://luke-the-duke.com/cosmic-theme.css">
```

This gives them the color palette and glass utilities without requiring any build system changes.

---

## 14. Implementation Order

1. **Copy brand assets** into `public/brand/`
2. **Update `globals.css`** — new design tokens (Section 2), new background (Section 3), updated component styles
3. **Update `layout.tsx`** — add Space Grotesk font, update metadata/favicons, replace grid-bg with cosmic-bg
4. **Update `Header.tsx`** — new logo (Section 7)
5. **Update `Footer.tsx`** — "Cosmic Intelligence" text (Section 8)
6. **Update `page.tsx`** (homepage) — new hero section (Section 6)
7. **Create/update `ConstellationNav.tsx`** — constellation edges, cosmic node styling (Section 6)
8. **Update hover cards** — cosmic glow (Section 9)
9. **Update project detail pages** — cosmic theme treatment (Section 10)
10. **Add animations** — twinkle, orbital float (Section 11)
11. **Extract shared theme** — `cosmic-theme.css` for subdomains (Section 13)
12. **Test dark/light mode** — verify both work
13. **Build and verify** — `npm run build` should succeed

---

## 15. File Summary

| File | Action | What Changes |
|------|--------|-------------|
| `public/brand/*` | ADD | All brand assets (favicon, OG, hero-bg, apple-touch-icon) |
| `src/app/globals.css` | MODIFY | New design tokens, cosmic-bg, updated component styles |
| `src/app/layout.tsx` | MODIFY | Space Grotesk font, metadata, favicon, cosmic-bg div |
| `src/app/page.tsx` | MODIFY | New hero section, cosmic layout |
| `src/components/Header.tsx` | MODIFY | SVG logo, "COSMIC INTELLIGENCE" wordmark |
| `src/components/Footer.tsx` | MODIFY | "Cosmic Intelligence" bottom text |
| `src/components/QuadrantGraph.tsx` | MODIFY → rename to ConstellationNav.tsx | Constellation edges, cosmic node glow, transparent bg |
| `public/cosmic-theme.css` | ADD | Shared design tokens for subdomain projects |

---

## Color Reference Quick Sheet

| Token | Dark Hex | Light Hex | Usage |
|-------|----------|-----------|-------|
| `--color-bg` | `#080C14` | `#F0F4F8` | Page background |
| `--color-surface` | `#0C121E` | `#FFFFFF` | Cards, panels |
| `--color-accent` | `#2DD4BF` | `#0D9488` | Links, CTAs, logo |
| `--color-text` | `#E4E4E7` | `#1A202C` | Primary text |
| `--color-text-muted` | `#94A3B8` | `#4A5568` | Secondary text |
| `--color-text-faint` | `#475569` | `#A0AEC0` | Tertiary/labels |
| Category: finance | `#2DD4BF` | — | Teal |
| Category: ai | `#A78BFA` | — | Purple |
| Category: osint | `#FBBF24` | — | Gold |
| Category: data | `#38BDF8` | — | Blue |
| Category: infra | `#F472B6` | — | Pink |
| Category: apps | `#34D399` | — | Green |
