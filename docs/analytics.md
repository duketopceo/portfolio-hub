# Analytics — Umami

Self-hosted Umami at `https://analytics.pacehq.io`, website ID
`85c70ffd-c5dc-4f8a-a18e-b13bbe101904`. Script loads `beforeInteractive`
from `src/app/layout.tsx` (deferred, SSR-injected — do not move to
`afterInteractive`; that strategy never reliably injected in practice).

No cookies, no PII, no fingerprinting. `npm run lint` runs the privacy
source check — keep it green.

## How tracking works

Two mechanisms, one grammar:

1. **`data-umami-event` attributes** (preferred) — Umami's delegated
   listener picks these up automatically. Use `data-umami-event-<key>`
   for event data. Put them on the element that owns the semantics.
2. **`UmamiOutbound`** (`src/components/UmamiOutbound.tsx`) — one client
   component for observer-derived events that have no single element:
   outbound links, PDF downloads, scroll depth, section impressions.
   It **skips elements with `data-umami-event`** so nothing double-fires.

To instrument something new: prefer `data-umami-event` on the element;
only extend `UmamiOutbound` for scroll/visibility/lifecycle signals.

## Event catalog

| Event | Data | Fires on |
|---|---|---|
| `orbit-marker` | `slug`, `tier` | Orbit marker click (home orbital nav) |
| `survey-file-open` | `slug`, `source` | Dossier entry — orbit card, lead cards, project grid, footer |
| `contact-email` | `source` | mailto CTA (hire/contact/cta) |
| `resume-view` / `resume-download` | `format`, `from` | Resume links (pdf/json/md) |
| `live-site` / `live-demo` | `url` | Live deployment links |
| `github-repo` | `url` | Repository links |
| `demo-embed-load` / `demo-launch` / `demo-open-external` | `demo`/`url` | Demo embeds and launch CTAs |
| `intro-choice` / `intro-dismiss` | `destination` | First-visit overlay |
| `catalog-view` | `view` | Registry ↔ Open PRs toggle |
| `catalog-filter` | `category` | Category pills on `/projects` |
| `catalog-sort` | `sort` | recent/name/stars |
| `scroll-depth` | `depth` (25/50/75/100), `page` | `/projects/*`, `/demos/*` — once per threshold |
| `dossier-section-view` | `page`, `section` | `DossierSection`/`EvidencePanel` entering viewport (deep pages only) |
| `not-found` | `path` | 404 page mount |
| `outbound-link` | `url` (host), `from` | Any external link without an explicit event |

## UTM convention

Umami auto-captures `utm_source`/`utm_medium`/`utm_campaign`. When sharing
links, tag them:

```
https://<site>/?utm_source=linkedin&utm_campaign=job-hunt-2026
https://<site>/projects/kurultai?utm_source=resume
```

## Dashboard checklist (operator, one-time)

- [ ] Mark `contact-email` and `resume-download` as **Goals** in the
      website settings — gives funnel conversion on the dashboard.
- [ ] Enable the weekly email report for the website.
- [ ] Verify event props under Events → `<event>` → breakdown after first
      real traffic.

## Verification recipe (real browser)

Headless Chromium on Asahi is flaky — prefer BrowserOS via raw CDP on
`127.0.0.1:9107` (the running browser's debug port; the `browseros-server`
daemon expects :9108 — that mismatch is a separate infra bug).

1. `npm run build && npm run start` (port 3100).
2. `PUT http://127.0.0.1:9107/json/new?http://127.0.0.1:3100/…` → grab
   `webSocketDebuggerUrl`.
3. `Runtime.evaluate` probes:
   - `typeof window.umami` → `"object"`
   - `performance.getEntriesByType("resource")` filtered to `pacehq` /
     `api/send` → script load + beacons
   - `document.querySelectorAll("[data-umami-event]").length` → tracked
     elements present
4. To spy on events: before interaction,
   `window.__calls=[]; const t=umami.track.bind(umami); umami.track=(e,d)=>{__calls.push([e,d]);t(e,d)}`
   then drive scroll/clicks and read `__calls`.

## Deferred

- Public stats surface (visitor counter, shared dashboard link) — revisit
  once real traffic exists.
- `guide-*` events — land with the Portfolio Guide implementation.
- First-party script proxy (`/_a/script.js`) — only if blockers bite.
