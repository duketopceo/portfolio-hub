# Capability groups

The capability taxonomy re-cut on 2026-11-14 (owner request: better categories and a more even spread). The old five groups held 4, 2, 6, 16 and 8 projects, and "Products" was a dumping ground. The new seven hold 4 to 6 each. Each project's group is its catalog `curated.capability`; a test keeps this table and the catalog in step. The five lead projects (`src/data/ranking-pins.ts`) are unchanged and keep their groups' meaning: orchestral and argus (Evals & routing), kurultai (Retrieval & memory), open-computer (Agents & computer use), tallyline (Platforms & web).

Groups were derived from what each project is, using its catalog description and stack, and cut for an AI-company reader: three groups are the AI-engineering core (evals, memory, agents), four say what kind of builder the rest of the work shows (desktop and tools, hosted platforms, shipped iPhone apps, hardware and simulation).

## Groups

| Group | Id | Before | After |
|---|---|---|---|
| Evals & routing | `evals-routing` | 4 | 4 |
| Retrieval & memory | `retrieval-memory` | 2 | 5 |
| Agents & computer use | `agents-computer-use` | 6 | 6 |
| Desktop & dev tools | `desktop-devtools` | new | 5 |
| Platforms & web | `platforms-web` | new | 5 |
| Mobile apps | `mobile-apps` | new | 4 |
| Hardware, sim & infra | `hardware-sim` | new | 6 |
| Products | `products` | 16 | retired |
| Tooling & infra | `tooling-infra` | 8 | retired |

Total 35 listed projects (Bartlett Permits was removed on 2026-11-15, which took Platforms & web from 6 to 5).

## Colour

Groups carry no colour (owner decision, 2026-11-15). A group is told apart by its name and its position on the gravity map, never by a hue: every group's `color` in `src/data/capability-meta.ts` is the same white, and the sand, clay, gold, grey, amber and ember group colours are retired. Posters for every group are white and off-white thin-line diagrams on black. The palette is in `BRAND.md`.

## Mapping

| Slug | Old | New | Why |
|---|---|---|---|
| `argus` | `evals-routing` | `evals-routing` | Vision-model E2E testing is an eval harness; stays. |
| `openrouter` | `evals-routing` | `evals-routing` | Provider bakeoffs and guardrail probes; stays. |
| `openrouter-usage` | `evals-routing` | `evals-routing` | Spend by workspace is the cost side of routing; stays. |
| `orchestral` | `evals-routing` | `evals-routing` | Eval harness for orchestrator and worker stacks; stays. |
| `dayflow-linux` | `products` | `retrieval-memory` | A searchable journal of the day is memory, not a generic product; it was in Products. |
| `jev-compact` | `retrieval-memory` | `retrieval-memory` | Context compaction is agent memory; stays. |
| `kurultai` | `retrieval-memory` | `retrieval-memory` | The retrieval brain; stays. |
| `military-hardware-db` | `products` | `retrieval-memory` | A searchable reference database (SIPRI data, filters, compare); it was in Products. |
| `snapdex` | `tooling-infra` | `retrieval-memory` | Indexes screenshots so they can be found again; it was in Tooling & infra. |
| `agent-zero-plugins` | `agents-computer-use` | `agents-computer-use` | Plugins that extend an agent runtime; stays. |
| `agentflow` | `agents-computer-use` | `agents-computer-use` | Multi-agent orchestration across harnesses; stays. |
| `khan` | `agents-computer-use` | `agents-computer-use` | Agent runtime fork with memory and risk scoring; stays. |
| `open-computer` | `agents-computer-use` | `agents-computer-use` | Computer-use agent with sandboxes; stays. |
| `pinetree-solari-demo` | `agents-computer-use` | `agents-computer-use` | Browser-to-sandbox agent pipeline; stays. |
| `wisp` | `agents-computer-use` | `agents-computer-use` | Voice computer-use agent; stays. |
| `keytypist` | `tooling-infra` | `desktop-devtools` | Terminal next-key predictor; it was in Tooling & infra. |
| `luke-agents` | `tooling-infra` | `desktop-devtools` | Standards for building with coding agents; it was in Tooling & infra. |
| `omarchy-plugins` | `tooling-infra` | `desktop-devtools` | Linux desktop bar widgets; it was in Tooling & infra. |
| `omaseal` | `tooling-infra` | `desktop-devtools` | Keyring manager for the Linux desktop and agents; it was in Tooling & infra. |
| `wordink` | `products` | `desktop-devtools` | Dictation app for Linux, macOS and Windows desktops; it was in Products. |
| `pace-gallery` | `products` | `platforms-web` | Public static web gallery; it was in Products. |
| `pace-server` | `products` | `platforms-web` | Production platform (gateway, auth, billing); it was in Products. |
| `personal-blog` | `products` | `platforms-web` | Hosted writing site; it was in Products. |
| `portfolio-hub` | `products` | `platforms-web` | This website; it was in Products. |
| `tallyline` | `products` | `platforms-web` | Hosted agent-native issue tracker; it was in Products. |
| `cairn` | `products` | `mobile-apps` | iPhone study app; it was in Products. |
| `harbor-openrouter-ios-client` | `products` | `mobile-apps` | iPhone OpenRouter client; it was in Products. |
| `kate` | `products` | `mobile-apps` | iPhone app built and signed on Linux; it was in Products. |
| `scooter-ios` | `products` | `mobile-apps` | iPhone Bluetooth remote; it was in Products. |
| `dixi` | `products` | `hardware-sim` | Camera-and-projector installation; it was in Products. |
| `fivebyfive` | `tooling-infra` | `hardware-sim` | RP2040 macropad firmware; it was in Tooling & infra. |
| `helm-qmk-macropad` | `tooling-infra` | `hardware-sim` | QMK macropad hardware; it was in Tooling & infra. |
| `homelab` | `tooling-infra` | `hardware-sim` | Three-node home cluster; it was in Tooling & infra. |
| `reactor-sim` | `products` | `hardware-sim` | Deterministic plant simulator in Unity; it was in Products. |
| `rts-skyrim` | `products` | `hardware-sim` | Game mod driven by a 0 A.D. simulation; it was in Products. |

Earlier work (archived repositories) and components of a parent entry have no group and do not appear on the map.
