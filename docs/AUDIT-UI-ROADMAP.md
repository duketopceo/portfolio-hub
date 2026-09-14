# Portfolio Hub — UI Audit Roadmap

> Generated from Cursor Web Agent full audit (2026-03-21).
> Each section is a discrete task. Work top-down by priority.
>
> **Reconciled 2026-09-13 against the current tree.** Every item carries a status.
> Rubric: an item is **Done** when the artifact it names exists and the behavior
> it describes is observable; **Open** when either is missing. An item satisfied
> by a different mechanism than proposed counts as Done, with the actual
> mechanism named. The original analysis is preserved below each status.

---

## 1. Missing Error / State Pages — HIGH

### 1a. `src/app/not-found.tsx`

**Status: Done** — the branded 404 route exists.

Create a branded "lost in space" 404 page using the Cosmic Intelligence design system.

- Use `--color-bg`, `--color-text-primary`, `--color-accent` tokens
- Show a subtle starfield or nebula element (reuse existing CSS classes)
- Include heading: "404 — Lost in the Cosmos"
- Body text: "This page drifted out of orbit."
- Link back to `/projects` with accent-colored button
- Must export `default` (Next.js App Router convention)

### 1b. `src/app/loading.tsx`

**Status: Done** — the route-level loading boundary exists.

Create a root-level loading skeleton for route transitions.

- Subtle cosmic spinner or pulsing ring using `--color-accent` (teal)
- Centered vertically and horizontally
- Respect `prefers-reduced-motion` (static fallback)
- Keep it lightweight — no heavy SVG animations

### 1c. `src/app/global-error.tsx`

**Status: Done** — the global error boundary exists alongside a route-level `src/app/error.tsx`.

Create a global error boundary that replaces the root layout on catastrophic failure.

- **Must include its own `<html>` and `<body>` tags** (Next.js requirement — this replaces layout.tsx)
- Inline minimal CSS (cannot rely on global stylesheets since layout crashed)
- Show branded error message with retry button
- `'use client'` directive required
- Accept `error` and `reset` props per Next.js convention

---

## 2. Code-Level Fixes — MEDIUM

### 2a. Extract `catColors` to shared module

**Status: Done** — `catColors` is exported from `src/lib/utils.ts` and imported by the components that render category colors.

The same category-to-color mapping was duplicated across five files. The list below named `QuadrantGraph.tsx`, which has since been deleted; the shared map now lives in `src/lib/utils.ts`.

**Fix:**
1. Create export `catColors` in `src/lib/utils.ts` (or `src/data/projects.ts`)
2. Import from that single source in all 5 files
3. Delete the local copies

### 2b. Fix lint error in `SolarSystemNav.tsx`

**Status: Done** — the effect was replaced by the derived value described here, and `npm run lint` now exits 0 with no errors.

Line ~59: `setFocusIndex` called inside `useEffect` body triggers `react-hooks/set-state-in-effect`. ESLint exits with code 1.

**Fix:**
```tsx
// Replace the useEffect at lines 58-63 with a derived value:
const safeFocusIndex = n === 0 ? 0 : Math.min(focusIndex, n - 1);
```
Remove the `useEffect` entirely. Use `safeFocusIndex` wherever `focusIndex` was used downstream.

### 2c. Sanitize README HTML (`projects/[slug]/page.tsx` line ~249)

**Status: Done** — `isomorphic-dompurify` is a dependency and both the README and showcase markdown are sanitized before injection.

`dangerouslySetInnerHTML` injects GitHub-rendered README HTML without sanitization.

**Fix:**
1. `npm install isomorphic-dompurify`
2. Sanitize before rendering:
```tsx
import DOMPurify from 'isomorphic-dompurify';
const cleanHtml = DOMPurify.sanitize(readmeHtml);
```
3. Use `cleanHtml` in `dangerouslySetInnerHTML`

### 2d. Fix relative dates for ISR pages

**Status: Done** — the shared formatter uses absolute dates, with a comment recording why.

`formatDate` uses relative time ("2d ago") which goes stale between ISR generation and user view.

**Fix (pick one):**
- **Option A:** Use absolute dates for ISR-rendered content: `"Mar 19, 2026"` format
- **Option B:** Make the date display a client component (`'use client'`) that computes relative time on the client

Option A is simpler and recommended.

### 2e. Add `metadataBase` to root layout

**Status: Done** — `src/app/layout.tsx` sets `metadataBase`, and the build warning no longer occurs.

Build warns: "metadataBase property in metadata export is not set". OG images resolve to localhost in production.

**Fix:** In `src/app/layout.tsx`, add to the metadata export:
```tsx
export const metadata = {
  metadataBase: new URL('https://luke-the-duke.com'),
  // ... existing metadata
};
```

---

## 3. Error Handling Gaps — MEDIUM

### 3a. Add error boundary around `DemoEmbed` iframe

**Status: Open** — `DemoEmbed` is rendered directly in `src/app/projects/[slug]/page.tsx` with no error boundary wrapping it, and the repository has no error-boundary component.

If an embedded iframe crashes or blocks, there's no error state.

**Fix:** Wrap `DemoEmbed` in a React error boundary component. Show a fallback card: "Demo unavailable — [open in new tab](url)".

### 3b. Add fetch timeout to GitHub API calls

**Status: Done** — every GitHub fetch in `src/lib/github.ts` passes an abort signal with a timeout.

If `api.github.com` hangs, build/ISR blocks indefinitely.

**Fix:** In `src/lib/github.ts`, add to all fetch calls:
```tsx
signal: AbortSignal.timeout(10_000)
```

### 3c. Distinguish empty vs error state in `FilterBar`

**Status: Open** — the component renders a single empty-state block and accepts no status or error prop, so loading, no-match, and failure remain indistinguishable.

When `projects` is empty/undefined, the component shows "0 projects shown" but doesn't distinguish loading vs no-data vs error.

**Fix:** Accept an optional `error` or `status` prop. Show contextual messaging:
- Loading: skeleton pills
- Empty after filter: "No projects match these filters"
- Error: "Couldn't load projects — try refreshing"

---

## 4. UI Consistency — MEDIUM/LOW

### 4a. Footer link affordance — MEDIUM

**Status: Done** — `.cosmic-footer__link` uses `var(--color-text-muted)` with an accent hover transition.

Footer links use `--color-text-faint` (same as non-interactive text). Links are indistinguishable from labels.

**Fix:** Change `.cosmic-footer__link` color to `var(--color-text-muted)` at minimum, or `var(--color-accent)` for full brand compliance. Add subtle hover transition.

### 4b. Mobile filter pill scroll indicator — MEDIUM

**Status: Done** — `.filter-pills-row::after` provides the edge affordance.

On mobile, category pills scroll horizontally with no visual affordance.

**Fix:** Add a right-edge gradient mask:
```css
.filter-pills-row::after {
  content: '';
  position: sticky;
  right: 0;
  width: 2rem;
  background: linear-gradient(90deg, transparent, var(--color-bg));
  pointer-events: none;
}
```

### 4c. Remove duplicate tech stack on detail pages — LOW

**Status: Done** — the hero no longer renders tech chips; only the sidebar backend section does.

Hero band shows tech chips AND sidebar has "TECH STACK" section with the same chips.

**Fix:** Remove tech chips from the hero section. Keep them in the sidebar only.

---

## 5. SEO / Meta — LOW

### 5a. Add `robots.txt`

**Status: Done** — `public/robots.txt` exists (and is intentionally permissive for AI crawlers).

Create `public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://luke-the-duke.com/sitemap.xml
```

### 5b. Add `sitemap.xml`

**Status: Done** — served from `src/app/sitemap.ts` via the App Router convention, so no static `public/sitemap.xml` file is needed.

Create `src/app/sitemap.ts` using Next.js App Router convention:
```tsx
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Generate from project slugs
}
```

### 5c. Footer copyright

**Status: Done** — the footer renders the current year alongside "Cosmic Intelligence".

Add `© {new Date().getFullYear()}` to the footer bottom text alongside "Cosmic Intelligence".

---

## Verification Checklist

Reconciled against the tree on 2026-09-13.

- [x] `npm run build` — all pages generate
- [x] `npm run lint` — exits 0 with no errors and no warnings
- [x] 404 routes show branded page
- [x] Loading transitions show spinner
- [x] OG meta tags show correct `luke-the-duke.com` URLs
- [x] Mobile: filter pills show scroll affordance
- [x] Footer links visually distinct from labels
- [x] README HTML sanitized (check detail page source)

## Remaining Work

Two items from this audit are still open, both tracked as follow-up rather than part of the current pass:

- **3a** — error boundary around the `DemoEmbed` iframe.
- **3c** — distinct loading / empty / error states in `FilterBar`.
