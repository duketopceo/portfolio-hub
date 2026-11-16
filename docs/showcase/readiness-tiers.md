# Showcase readiness tiers

Which projects get a full video, which get a short video, and which get a looping clip only. Assigned 2026-11-14 from evidence checked that day: catalog fields, `curl` status of live URLs, the README and ROADMAP in the local clone, `git log`, and `gh release list`. Each tier is also stored in the catalog as `curated.showcaseCard.tier` (a test keeps this table and the catalog in step).

## Tiers

| Tier | Meaning | Output | Count |
|---|---|---|---|
| A | Shippable product a stranger can use or run: a live URL or install path, a working demo, and real users or measured results. | Full narrated video, plus a loop for the card | 7 |
| B | Works and is demoable, with a narrower audience or an unfinished edge. | Short video of at least 15 s, plus a loop | 12 |
| C | Library, config, plugin, hardware, prototype, archived, or nothing a stranger can run. | A looping clip only | 16 |

Every tier gets a loop that plays next to the explanation on its dossier.

## Excluded

Bartlett Permits was removed from the portfolio on 2026-11-15 (owner request); `/projects/bartlett-permits` redirects to `/projects`. The exclusion rule stays: `SHOWCASE_EXCLUDED` keeps any Bartlett entry out of the showcase card system, since Bartlett projects stay out of Cosmic branding. Earlier work (archived) and components of a parent entry have no dossier and are not tiered.

## Privacy

Private entries are tiered, but the evidence lines use only what the catalog marks public (`showcase.status`, `finishLine`, live URLs). Their roadmap blocks are sourced from those catalog fields, never from a private repo's files. Every clip of a private product must be sanitised and reviewed before use (docs/MEDIA.md).

## Tier A: full video

| Slug | Tier | Evidence | What the video or GIF should show |
|---|---|---|---|
| `kurultai` | A | Public, 351 commits, INSTALL_GUIDE, v0.6.0 per ROADMAP, daemon plus Brain UI at /ui/; init to ask path is the stated exit criterion. | init, index, ask from a fresh shell, then the Brain UI explorer over the same corpus. |
| `argus` | A | Public, 305 commits, npm trusted publishing and GitHub Action, clean-install smoke in CI, ROADMAP phases P1 and P2 shipped; GitHub latest release v0.4.2. | A pull request opened, Argus reproduces a suspected bug in the sandbox, posts the sticky verdict comment. |
| `dayflow-linux` | A | Public, 214 commits, v1.6.0 release, Omarchy marketplace listing with scripted install, local-first. | Install, a day of captures summarised into the timeline, standup copy. |
| `kate` | A | https://kate.shippedit.dev returns 200; open sign-up; site and API on Cloudflare Workers per catalog; 212 commits. | Create a crew journal, post an entry from iPhone, see it on the web. |
| `orchestral` | A | Public repo, 428 commits, ROADMAP shipped list; catalog measured 14 of 16 passes at $0.0012 per pass; demo and release video slots already filled. | Leaderboard of orchestrator and worker pairings by pass rate and cost per pass, then the quality-per-dollar report. |
| `tallyline` | A | https://tallyline.app returns 200; 215 commits; Luke runs his own projects on it; iOS app on TestFlight; ROADMAP Done table. | Board and issue loop on web, an agent updating an issue, the iPhone app syncing the same change. |
| `wordink` | A | Public, desktop v1.0.2 released (Linux x86_64 and aarch64, macOS arm64, Windows x64) with one-line installers. | Hold the hotkey in any app, speak, text lands in the focused field; show engine choice. |

## Tier B: short video, 15 s or more

| Slug | Tier | Evidence | What the video or GIF should show |
|---|---|---|---|
| `khan` | B | Private; catalog states CLI, vault and memory persistence work, live agent loop not fully wired, no release downloads. | Python CLI creating a vault entry and recalling it; no agent claims. |
| `pace-server` | B | Private beta, invite-only; catalog states gateway, auth and billing live, agent system not yet proven end to end. | Sanitised walk through sign-in and the gateway dashboard; no real data on screen. |
| `openrouter` | B | Public repo; five harnesses and dashboard done per ROADMAP; in-site demo at /projects/openrouter returns 200; live bakeoff sign-off still pending. | Provider bakeoff table with latency, estimated first-token time and cost, then the guardrail probe. |
| `military-hardware-db` | B | Public, 60 commits, v3.0.0 per ROADMAP; live URL currently 530 (tunnel down), runs from Docker. | Filter platforms by domain and contractor, compare two, open the SIPRI charts. |
| `dixi` | B | Public, 143 commits, CHANGELOG and ROADMAP; liveUrl in catalog does not resolve today (DNS fail). | Hand gesture in front of a camera driving a projected scene. |
| `omaseal` | B | Public, 87 commits, install.sh, GitHub release v0.5.0 (2026-11-14); narrow audience (Omarchy users). | Store, read and flag a secret from the CLI and the agent tool; masked values only. |
| `wisp` | B | Public, 507 commits, v1.0.0-rc.3 prerelease (2026-11-09); stable v1.0 still a verification milestone per ROADMAP. | Double-tap Control, ask about the focused window, answer spoken while the cursor points. |
| `open-computer` | B | Public, 148 commits; MVP scope with conformance harness and router merged, P2 to P6 still open in ROADMAP; no live URL. | One command runs a cost-capped task in a sandbox, the approval gate prompts, the ledger prints. |
| `agentflow` | B | Public, 52 commits, README install and examples, ROADMAP; GitHub release listing empty. | A script fanning work across agents, status tail, a resumed run. |
| `cairn` | B | Private; catalog states backend deployed, internal TestFlight build being prepared; 47 commits. | Upload a document, generate a quiz, answer three questions. |
| `portfolio-hub` | B | Public, 225 commits, this site is live; changelog covers 3.0.0 to unreleased; the demo is the site itself. | Scroll of the registry: lead cards, capability groups, a dossier. |
| `reactor-sim` | B | Public, 65 commits, v0.2.0 preview release (2026-11-11); Unity build, no live URL; ROADMAP lists polish still to do. | Walk the control room, withdraw rods, watch power and xenon respond. |

## Tier C: looping clip only

| Slug | Tier | Evidence | What the video or GIF should show |
|---|---|---|---|
| `homelab` | C | Private infrastructure; nothing a stranger can run. | Node and service map with status. |
| `luke-agents` | C | Private standards repo; no product surface. | King-file inheritance tree resolving for one repo. |
| `personal-blog` | C | Private; blog.luke-the-duke.com does not resolve today. | Post list and a post page. |
| `omarchy-plugins` | C | Public umbrella of bar plugins; README says personal plugins, not a marketplace listing. | Bar widgets updating on a live Omarchy desktop. |
| `openrouter-usage` | C | Public dashboard, 24 commits, last commit 2026-09-30; no live URL. | Workspace spend chart filtering by key. |
| `helm-qmk-macropad` | C | Public firmware and CAD, 4 commits; hardware only. | Macropad layers and knob action on the desk. |
| `harbor-openrouter-ios-client` | C | Public iOS client, 2 commits, no TestFlight or release. | Simulator chat with a key entered in settings (key masked). |
| `agent-zero-plugins` | C | Seven plugin repos, no standalone surface; upstream marketplace listing pending. | Terminal loop of one plugin handling a call inside Agent Zero. |
| `rts-skyrim` | C | Private; catalog says work in progress, Windows only, no long playtest. | Box-select NPCs and issue a move order in game. |
| `scooter-ios` | C | Private; catalog says telemetry decoding is provisional. | BLE connect and lock toggle in the simulator or on device. |
| `jev-compact` | C | Public library, 11 commits; no UI or live demo. | Before and after context size with tombstones in a terminal. |
| `pinetree-solari-demo` | C | Public prototype, 2 commits. | Pricing page in, CSV and JSON out. |
| `snapdex` | C | Public CLI, 3 commits; works on Wayland, no release. | A screenshot saved and renamed by date and caption. |
| `keytypist` | C | Public terminal tool, 2 commits, install.sh. | TUI predicting the next key as a sentence is typed. |
| `fivebyfive` | C | Public firmware, 2 commits; hardware only. | Keys and knobs lighting a layer change on the board. |
| `pace-gallery` | C | Public static grid of component cards, 2 commits. | Scroll of the component grid with hover states. |

## Data model

All fields live under `curated.showcaseCard` (`src/data/catalog/schema.ts`). The older `curated.showcase` is the private entries' hand-written card with required copy, so the new slots are a separate field. Only `tier` is required.

| Field | Type | Notes |
|---|---|---|
| `tier` | `"A" \| "B" \| "C"` | Required once an entry is in the system. |
| `thumbnail` | string | 1280x720 WebP under `public/media/thumbs/<slug>.webp` (under 120 KB; a test enforces it): a real capture inset in a black frame, built by `scripts/media/build-thumbs.mjs`. Absent or failing to load: the generated deterministic poster is used. |
| `thumbnailAlt` | string | What the thumbnail honestly shows (a live capture, a README image, terminal output, or the generated poster). |
| `gif` | `{ url, poster, alt }` | Muted loop. Prefer MP4 or WebM over a real GIF for weight; `poster` is required and is what reduced-motion visitors see. |
| `video` | media asset | Narrated video; same shape as `media.release` (transcript required). |
| `skills` | string[] | Taken from the catalog `techStack`; a test checks each skill appears there. Filled for the 15 queue slugs only. |
| `roadmap` | `{ started: { date, summary }, done[], next[], source }` | Beginning, where it is, what remains. `source` names the file and the date it was read. |

Cards render without any of these: no media gives the generated poster, no skills or roadmap hides those blocks.

## Wiring the real clips

1. Put the loop (MP4 or WebM, muted, under about 1.5 MB) and its poster JPG on the media host or under `public/media/loops/`.
2. Set `showcaseCard.gif = { url, poster, alt }` in the project's catalog JSON. The grid card plays it on hover and focus, the dossier plays it beside the description, and reduced-motion visitors see the poster only.
3. For tier A and B, set `showcaseCard.video` (or the existing `media.release` and `media.demo` slots).

## Components

| Component | Where | Role |
|---|---|---|
| `ShowcaseMedia` | grid card, dossier | Still plus optional loop; hover or focus on the grid, autoplay with a pause button on the dossier; poster only under reduced motion. |
| `ThemedPoster` | inside `ShowcaseMedia` | Deterministic SVG per slug and capability group; project name in type. |
| `ShowcaseExplainer` | dossier "What it is" | Loop floats right at 720 px and above so the text wraps around it; stacks on a phone. Then skills, then the roadmap. |
| `SkillChips`, `RoadmapTimeline` | dossier | Chips; three steps (Started, Done, Remaining) that stack vertically below 720 px. |

The older `ShowcaseCard` in `components/dossier` is the private-entry text card and is unrelated.
