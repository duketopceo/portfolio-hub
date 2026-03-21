# Cosmic Intelligence — Full Rebrand Plan

> This document contains everything Cursor needs to implement the "Cosmic Intelligence" rebrand of the portfolio site at `luke-the-duke.com`. Generated brand assets are in `/cosmic-brand-assets/` at the project root (copy them into `public/` before starting).

---

## Status Tracker

| # | Task | Status |
|---|------|--------|
| 1 | Brand assets in `public/brand/` | ✅ Done |
| 2 | Design system tokens (globals.css) | ⬜ Pending |
| 3 | Cosmic background (replace grid-bg) | ⬜ Pending |
| 4 | Font — add Space Grotesk (layout.tsx) | ⬜ Pending |
| 5 | Metadata & favicons (layout.tsx) | ⬜ Pending |
| 6 | Homepage hero + ConstellationNav | ⬜ Pending |
| 7 | Header — SVG logo + "COSMIC INTELLIGENCE" | ⬜ Pending |
| 8 | Footer — "Cosmic Intelligence" text | ⬜ Pending |
| 9 | Hover card cosmic glow | ⬜ Pending |
| 10 | Project detail pages cosmic treatment | ⬜ Pending |
| 11 | Animations (twinkle, orbital float) | ⬜ Pending |
| 12 | Shared cosmic-theme.css for subdomains | ⬜ Pending |
| 16 | **Projects list page — full rework** | ⬜ Pending |
| 17 | **Project card — cosmic card redesign** | ⬜ Pending |
| 18 | **Project detail — public: observatory + demo frame; private: classified dossier** | ⬜ Pending |
| 19 | **Activity (/now) page — cosmic timeline** | ⬜ Pending |
| 20 | **`projects.ts` data — add businessContext, scopeAndScale, engineeringDecisions per private repo** | ⬜ Pending |
| 21 | **Live demos — reliable previews (embeds, fallbacks, health)** | ⬜ Pending — see §21 |
| 22 | **Document title / SEO — “Luke the Duke” primary in `<title>`; Cosmic as in-site brand** | ✅ Done |

---

## Reference Image

The design direction comes from the [Perplexity Comet "Cosmic Intelligence" art print](https://www.perplexity.ai). Key visual elements:
- **Human silhouette** filled with stars, galaxies, and nebula
- **Geometric overlays**: orbital rings (ellipses), crosshair lines, radiating guide lines
- **Corner registration brackets** (like camera viewfinder framing)
- **Deep space background**: dark teal (#080C14) with blue and purple nebula washes
- **Typography**: clean sans-serif, uppercase tracking on taglines, monospace for data labels
- **HUD-style icons**: small glyph icons in the upper-right corner area

---

## 1. Brand Assets (Already Generated) ✅ DONE

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
| `public/brand/*` | ✅ DONE | All brand assets (favicon, OG, hero-bg, apple-touch-icon) |
| `src/app/globals.css` | MODIFY | New design tokens, cosmic-bg, updated component styles |
| `src/app/layout.tsx` | MODIFY | Space Grotesk font, metadata, favicon, cosmic-bg div |
| `src/app/page.tsx` | MODIFY | New hero section, cosmic layout |
| `src/components/Header.tsx` | MODIFY | SVG logo, "COSMIC INTELLIGENCE" wordmark |
| `src/components/Footer.tsx` | MODIFY | "Cosmic Intelligence" bottom text |
| `src/components/QuadrantGraph.tsx` | MODIFY → rename to ConstellationNav.tsx | Constellation edges, cosmic node glow, transparent bg |
| `public/cosmic-theme.css` | ADD | Shared design tokens for subdomain projects |
| `src/app/projects/page.tsx` | MODIFY | Full page rework — see Section 16 |
| `src/components/FilterBar.tsx` | MODIFY | Cosmic filter pills, 2-col layout — see Section 17 |
| `src/components/ProjectCard.tsx` | MODIFY | Cosmic card redesign — see Section 17 |
| `src/app/projects/[slug]/page.tsx` | MODIFY | Full rework — public demo + private deep-dive — see Section 18 |
| `src/app/now/page.tsx` | MODIFY | Cosmic timeline rework — see Section 19 |
| `src/data/projects.ts` | MODIFY | Add `businessContext`, `scale`, `scope` fields — see Section 18 |

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

---

## 16. Projects List Page — Full Rework (`src/app/projects/page.tsx` + `FilterBar.tsx`)

**Problem:** Current page is cramped — 3-col grid with tiny cards, no breathing room, no cosmic typography, generic feel.

**Goal:** An observatory catalog. Each card should feel like a star system entry — spacious, deliberate, with the category accent glowing through the design.

### Layout Changes

- **2-column grid on desktop** (was 3). Cards are larger and breathe. Each card gets more vertical height.
- **Full-width page header** with a large Space Grotesk heading, mono subtitle, and a faint orbital SVG decoration in the top-right corner (decorative, aria-hidden).
- **Filter bar** redesigned as a horizontal scrollable row of glowing pills — each pill shows the category color accent on active state, not just generic teal.
- **Sort control** becomes a styled segmented control (Recent / Name / Stars) instead of a `<select>` dropdown.
- **Section dividers** between category groups (optional: group by category with a faint mono label as separator).

### Page Header Spec

```tsx
<header className="projects-page-header">
  {/* Decorative orbital — top right, aria-hidden */}
  <div className="projects-page-header__orbit" aria-hidden="true">
    <svg viewBox="0 0 200 200" fill="none" ...>
      <ellipse cx="100" cy="100" rx="90" ry="45" stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.08" transform="rotate(-20 100 100)"/>
      <ellipse cx="100" cy="100" rx="65" ry="30" stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.12" transform="rotate(15 100 100)"/>
      <circle cx="100" cy="100" r="4" fill="var(--color-accent)" opacity="0.2"/>
    </svg>
  </div>

  <p className="projects-page-header__eyebrow">CATALOG</p>
  <h1 className="projects-page-header__title">All Projects</h1>
  <p className="projects-page-header__sub">
    {count} repositories across finance, AI, OSINT, infrastructure, and web.
  </p>
</header>
```

```css
.projects-page-header {
  position: relative;
  padding: clamp(2.5rem, 5vw, 4rem) 0 clamp(1.5rem, 3vw, 2.5rem);
  overflow: hidden;
}

.projects-page-header__orbit {
  position: absolute;
  right: -40px;
  top: -40px;
  width: 220px;
  height: 220px;
  pointer-events: none;
}

.projects-page-header__eyebrow {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--color-accent);
  margin-bottom: 0.5rem;
}

.projects-page-header__title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.03em;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.projects-page-header__sub {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-faint);
}
```

### Filter Pill Redesign

Each category pill gets its **own accent color** (not just teal for all) when active:

```tsx
const catPillColors: Record<string, string> = {
  all:     "#2DD4BF",
  finance: "#2DD4BF",
  ai:      "#A78BFA",
  osint:   "#FBBF24",
  data:    "#38BDF8",
  infra:   "#F472B6",
  apps:    "#34D399",
};

// Active pill style:
{
  color: catPillColors[cat.key],
  background: `${catPillColors[cat.key]}12`,
  border: `1px solid ${catPillColors[cat.key]}30`,
  boxShadow: `0 0 8px ${catPillColors[cat.key]}20`,
}
```

### Grid Change

```tsx
// Change from:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

// Change to:
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

---

## 17. ProjectCard — Cosmic Card Redesign (`src/components/ProjectCard.tsx`)

**Problem:** Cards are visually flat, cramped, hard to scan. No cosmic identity. All look identical.

**Goal:** Each card = a star system entry. The category accent color glows through the left border and icon. More vertical padding, larger title, two-line description allowed.

### Key Visual Changes

1. **Left accent border** — 2px solid with the category color (replaces the top language-color bar)
2. **Category icon** — small 28×28 circle with category icon inside, accent color bg tint — shown top-left of card body
3. **Title** — Space Grotesk, `font-size: var(--text-lg)`, weight 600
4. **Description** — allow 2 lines (`line-clamp-2` instead of `line-clamp-1`), larger `--text-sm`
5. **Bottom row** — language dot + live badge stay; add a subtle `→` arrow on hover (right side)
6. **Hover state** — left border brightens, subtle nebula glow behind card

### Card Structure

```tsx
<div
  className="cosmic-project-card group"
  style={{ "--card-accent": accentColor } as React.CSSProperties}
>
  <Link href={`/projects/${project.slug}`} className="block p-5" style={{ textDecoration: "none" }}>

    {/* Top row: icon + category + date */}
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2.5">
        {/* Category icon circle */}
        <div className="cosmic-card-icon">
          {getCategoryIcon(meta?.icon || "globe", "w-3.5 h-3.5")}
        </div>
        <span className="cosmic-card-category">{meta?.label || project.category}</span>
        {project.private && <LockIcon className="w-3 h-3 opacity-40" />}
      </div>
      <span className="cosmic-card-date">{formatDate(project.lastUpdated)}</span>
    </div>

    {/* Title */}
    <h3 className="cosmic-card-title group-hover:text-[var(--color-accent)] transition-colors">
      {project.displayName}
    </h3>

    {/* Description — 2 lines */}
    <p className="cosmic-card-desc line-clamp-2">{project.tagline}</p>

    {/* Footer row */}
    <div className="flex items-center gap-3 mt-auto">
      {project.language && (
        <span className="cosmic-card-lang">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColor || "#6B7280" }} />
          {project.language}
        </span>
      )}
      {hasDemo && (
        <span className="cosmic-card-live ml-auto">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--color-live)" }} />
          live
        </span>
      )}
      {/* Hover arrow */}
      <span className="cosmic-card-arrow opacity-0 group-hover:opacity-100 transition-opacity">→</span>
    </div>
  </Link>
</div>
```

### Card CSS

```css
.cosmic-project-card {
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 2px solid color-mix(in srgb, var(--card-accent, var(--color-accent)) 40%, transparent);
  border-radius: var(--radius-lg);
  transition: all var(--transition);
  display: flex;
  flex-direction: column;
  min-height: 160px;
}

.cosmic-project-card:hover {
  border-color: var(--color-border-glass);
  border-left-color: var(--card-accent, var(--color-accent));
  background: var(--color-surface-2);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--card-accent, var(--color-accent)) 10%, transparent),
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 20px color-mix(in srgb, var(--card-accent, var(--color-accent)) 6%, transparent);
  transform: translateY(-1px);
}

.cosmic-card-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--card-accent, var(--color-accent)) 12%, transparent);
  color: var(--card-accent, var(--color-accent));
  border: 1px solid color-mix(in srgb, var(--card-accent, var(--color-accent)) 25%, transparent);
}

.cosmic-card-category {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

.cosmic-card-date {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-faint);
}

.cosmic-card-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.01em;
  line-height: 1.25;
  margin-bottom: 0.5rem;
}

.cosmic-card-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.55;
  margin-bottom: 1rem;
  flex: 1;
}

.cosmic-card-lang {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-faint);
  display: flex;
  align-items: center;
  gap: 6px;
}

.cosmic-card-live {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-live);
  display: flex;
  align-items: center;
  gap: 5px;
}

.cosmic-card-arrow {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-accent);
  margin-left: auto;
}
```

---

## 18. Project Detail Page — Full Rework (`src/app/projects/[slug]/page.tsx`)

**Problem:** Current detail page is dense and generic. The "top band" has no cosmic character. Public/private projects are treated almost identically. Spacing is tight. Font is wrong.

**Goal:** Two completely different experiences depending on repo visibility:

---

### 18A. Public Repos — "Observatory View"

Public repos get the full showcase treatment. The page becomes an immersive project observatory.

#### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ BREADCRUMB                                          │
├─────────────────────────────────────────────────────┤
│ PROJECT HERO (large, full-width, accent bg wash)    │
│  - Big Space Grotesk title                          │
│  - Category badge + live badge                      │
│  - Tagline in body font (larger, more breathing)    │
│  - Tech stack chips                                 │
│  - "Launch Demo →" CTA button (prominent)           │
├─────────────────────────────────────────────────────┤
│ DEMO EMBED (full-width, 600px tall, cosmic frame)   │
├─────────────────────────────────────────────────────┤
│ TWO-COLUMN BODY                                     │
│  Left (60%): About / Features / Architecture / README│
│  Right (40%): Live URL / Tech Stack / Meta / Related│
└─────────────────────────────────────────────────────┘
```

#### Hero Spec

```css
.project-hero {
  background:
    radial-gradient(ellipse 80% 60% at 30% 50%, color-mix(in srgb, var(--project-accent) 8%, transparent) 0%, transparent 70%),
    var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: clamp(2rem, 4vw, 3.5rem) 0;
}

.project-hero__title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--color-text);
  margin-bottom: 0.75rem;
}

.project-hero__tagline {
  font-family: var(--font-body);
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  color: var(--color-text-muted);
  line-height: 1.6;
  max-width: 580px;
  margin-bottom: 1.25rem;
}
```

#### Demo Embed Frame

Wrap `DemoEmbed` in a cosmic frame — corner brackets + a mono URL label above:

```tsx
<div className="demo-frame">
  <div className="demo-frame__header">
    <span className="demo-frame__bracket demo-frame__bracket--tl" />
    <span className="demo-frame__bracket demo-frame__bracket--tr" />
    <span className="demo-frame__url">{embedUrl.replace(/^https?:\/\//, '')}</span>
    <a href={embedUrl} target="_blank" rel="noopener noreferrer" className="demo-frame__open">
      open ↗
    </a>
  </div>
  <DemoEmbed url={embedUrl} title={project.displayName} embeddable={project.embeddable} />
</div>
```

```css
.demo-frame {
  position: relative;
  border: 1px solid var(--color-border-glass);
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: var(--color-surface);
}

.demo-frame__header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: var(--color-surface-2);
  border-bottom: 1px solid var(--color-border);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-faint);
  gap: 8px;
}

.demo-frame__url { flex: 1; opacity: 0.7; }

.demo-frame__open {
  color: var(--color-accent);
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 150ms;
}
.demo-frame__open:hover { opacity: 1; }
```

---

### 18B. Private Repos — "Classified Dossier View"

Private repos get NO demo embed. Instead, replace the entire demo section with a rich **Project Dossier** — a series of cosmic-styled panels that tell the full story of the project.

#### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ BREADCRUMB                                          │
├─────────────────────────────────────────────────────┤
│ PROJECT HERO (same as public but with 🔒 CLASSIFIED │
│  badge instead of live badge)                       │
├─────────────────────────────────────────────────────┤
│ ████████  CLASSIFIED DOSSIER  ████████              │
│                                                     │
│  ┌── BUSINESS CONTEXT ──────────────────────────┐  │
│  │  What problem this solves. Who uses it.      │  │
│  │  Real-world impact. Dollar value if any.     │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌── SCOPE & SCALE ─────────────────────────────┐  │
│  │  Users / data volume / request throughput /  │  │
│  │  geographic reach / integrations count, etc  │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌── TECHNICAL ARCHITECTURE ────────────────────┐  │
│  │  Full stack breakdown. System design.        │  │
│  │  Architecture flow (existing component).     │  │
│  │  Key engineering decisions + why.            │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌── KEY FEATURES ──────────────────────────────┐  │
│  │  Existing highlights component (kept)        │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌── AVAILABILITY ──────────────────────────────┐  │
│  │  "Source available on request for interviews │  │
│  │   and technical discussions."                │  │
│  └──────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│ RIGHT SIDEBAR: Tech Stack / Meta / Related          │
└─────────────────────────────────────────────────────┘
```

#### Data Model Addition (`src/data/projects.ts`)

Add these optional fields to the project config type and per-project data:

```ts
interface ProjectConfig {
  // ...existing fields...

  // Private project dossier fields
  businessContext?: string;      // 2–4 sentences: problem, users, real-world impact
  scopeAndScale?: string;        // 1–3 sentences: users, data volume, throughput, reach
  engineeringDecisions?: string[]; // Array of "Decision: Rationale" strings
  // architectureFlow already exists as project.architecture
  // highlights already exists for key features
}
```

Example data for a private project:
```ts
{
  slug: "tradingbot",
  businessContext: "Automates IBKR order execution and portfolio rebalancing based on quantitative signals. Eliminates emotional trading decisions and enables systematic strategies across multiple account types including Roth IRA, traditional IRA, and taxable brokerage.",
  scopeAndScale: "Manages 4 IBKR accounts with real-money capital. Processes live market data at 1-minute resolution. Monitors 50+ instruments across equities, ETFs, and options.",
  engineeringDecisions: [
    "IBKR TWS API over Alpaca — required for IRA account access and options trading",
    "Docker on home cluster over cloud — zero latency to broker, no egress costs",
    "Python asyncio event loop — handles concurrent market data streams without threading overhead",
  ],
}
```

#### Dossier Panel CSS

```css
.dossier-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: clamp(1.25rem, 2.5vw, 1.75rem);
  margin-bottom: 1rem;
}

.dossier-section__label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dossier-section__label::before {
  content: '';
  display: block;
  width: 16px;
  height: 1px;
  background: var(--color-accent);
  opacity: 0.4;
}

.dossier-section__body {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.7;
}

.dossier-classified-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgba(71, 85, 105, 0.08);
  border: 1px solid rgba(71, 85, 105, 0.15);
  border-radius: var(--radius-md);
  margin-bottom: 1.25rem;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.15em;
  color: var(--color-text-faint);
}

.dossier-eng-decision {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-divider);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.5;
}

.dossier-eng-decision:last-child { border-bottom: none; }

.dossier-eng-decision__bullet {
  flex-shrink: 0;
  margin-top: 6px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
  opacity: 0.5;
}

.dossier-eng-decision strong {
  color: var(--color-text);
  font-weight: 500;
}
```

#### Classified Badge (for hero)

```tsx
{project.private && (
  <span className="dossier-classified-badge">
    <LockIcon className="w-3 h-3" />
    CLASSIFIED
  </span>
)}
```

```css
.dossier-classified-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.15em;
  color: var(--color-text-faint);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface-3);
}
```

---

## 19. Activity Page — Cosmic Timeline (`src/app/now/page.tsx`)

**Problem:** Generic spaced list. The timeline connector is barely visible. No cosmic treatment.

**Goal:** A mission log — monochrome orbital timeline with glowing accent on the latest entry.

### Key Changes

1. **Page header** — same eyebrow + large Space Grotesk title treatment as Section 16
2. **Timeline line** — `2px` wide, gradient from accent (top) to transparent (bottom), not a flat divider
3. **Timeline dots** — larger (`10px`), first one glows with accent pulse animation, rest are dimmed circles
4. **Each entry** uses the `cosmic-project-card` component (from Section 17) instead of `ProjectCard`
5. **Date labels** — `font-mono`, larger (`13px`), with a faint horizontal rule extending right from the date
6. **"latest" badge** — cosmic accent pill, same glow treatment as other accent elements

### Timeline CSS Changes

```css
.cosmic-timeline {
  position: relative;
  padding-left: 28px;
}

.cosmic-timeline::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: linear-gradient(
    to bottom,
    var(--color-accent) 0%,
    rgba(45, 212, 191, 0.3) 30%,
    transparent 100%
  );
}

.cosmic-timeline-dot {
  position: absolute;
  left: -24px;
  top: 10px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: var(--color-surface-3);
}

.cosmic-timeline-dot--active {
  border-color: var(--color-accent);
  background: var(--color-accent);
  box-shadow: 0 0 10px rgba(45, 212, 191, 0.4), 0 0 20px rgba(45, 212, 191, 0.15);
  animation: star-twinkle 2s ease-in-out infinite;
}
```

---

## 21. Live demos & embeds (future implementation)

**Problem:** Many project “live demo” links do not render inside the site: iframes are blocked by `X-Frame-Options` / `Content-Security-Policy: frame-ancestors`, sites require auth, or URLs are stale. Today `DemoEmbed` only shows a real iframe when `embeddable: true` in `projects.ts`; otherwise users get a placeholder or broken experience.

**Goal:** Every public project with a demo should offer a **reliable** preview path: open in new tab always works; in-page preview should degrade gracefully with a clear explanation and visual.

### Planned work (implement in a future milestone)

1. **Per-project demo strategy in `projects.ts` / `ProjectConfig`**
   - `demoMode: "iframe" | "screenshot" | "link-only" | "video"`
   - Optional `demoScreenshot?: string` (path under `public/demos/…` or remote URL)
   - Optional `demoVideoUrl?: string` (short loop hosted on R2/YouTube unlisted)
   - `embeddable` stays as the iframe gate; audit every `liveUrl` / `demoUrl` and set realistic flags.

2. **`DemoEmbed` / detail page UX**
   - If iframe blocked or fails `onError`: show **screenshot + “Open in new tab”** CTA (no empty frame).
   - **Link-only:** large hero preview card using screenshot or OG image fetch (server-side capture job optional).
   - Loading / timeout state (e.g. 8s) then fallback to screenshot or CTA-only.
   - Optional **“Preview unavailable”** copy explaining third-party framing policy.

3. **Automation (optional)**
   - CI or script: Playwright (or similar) **capture** `public/demos/{slug}.webp` on release; commit or upload to CDN.
   - **Health check** workflow: ping `liveUrl` HEAD weekly; flag broken links in build or issue.

4. **Legal / security**
   - Only embed whitelisted origins or user-consented URLs; never proxy arbitrary URLs through the app without review.

5. **Card / list**
   - “Open live demo” remains; consider **tooltip** “Opens external site” when not embeddable.

### Files to touch (when executing)

- `src/data/projects.ts`, `src/lib/types.ts`
- `src/components/DemoEmbed.tsx`, `src/app/projects/[slug]/page.tsx`
- `public/demos/` (screenshots)
- Optional: `.github/workflows/demo-screenshots.yml` or `scripts/capture-demos.ts`

---

## 20. Updated Implementation Order

1. ~~Copy brand assets into `public/brand/`~~ ✅ Done
2. Update `globals.css` — tokens, cosmic-bg, new component classes (Sections 2, 3, 17, 18, 19)
3. Update `layout.tsx` — Space Grotesk, metadata, favicons, cosmic-bg div (Sections 4, 5)
4. Update `Header.tsx` — SVG logo (Section 7)
5. Update `Footer.tsx` — "Cosmic Intelligence" (Section 8)
6. Update `page.tsx` (homepage) — hero section (Section 6)
7. Create/update `ConstellationNav.tsx` (Section 6)
8. **Update `projects/page.tsx`** — new header, 2-col layout (Section 16)
9. **Update `FilterBar.tsx`** — per-category colored pills, segmented sort (Section 16)
10. **Update `ProjectCard.tsx`** — cosmic card redesign (Section 17)
11. **Update `projects/[slug]/page.tsx`** — public observatory view + private dossier view (Section 18)
12. **Update `src/data/projects.ts`** — add `businessContext`, `scopeAndScale`, `engineeringDecisions` for private repos (Section 18)
13. **Update `now/page.tsx`** — cosmic timeline (Section 19)
14. Add animations — twinkle, orbital float (Section 11)
15. Extract `cosmic-theme.css` for subdomains (Section 13)
16. Test dark/light mode
17. `npm run build` — verify clean build
18. **§21 Live demos** — screenshot fallbacks, `demoMode`, iframe error handling, optional capture pipeline (separate PR)
