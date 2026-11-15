# Capability groups

The capability taxonomy re-cut on 2026-11-14 (owner request: better categories and a more even spread). The old five groups held 4, 2, 6, 16 and 8 projects, and "Products" was a dumping ground. The new seven hold 4 to 6 each. Each project's group is its catalog `curated.capability`; a test keeps this table and the catalog in step. The five lead projects (`src/data/ranking-pins.ts`) are unchanged and keep their groups' meaning: orchestral and argus (Evals & routing), kurultai (Retrieval & memory), open-computer (Agents & computer use), tallyline (Platforms & web).

Groups were derived from what each project is, using its catalog description and stack, and cut for an AI-company reader: three groups are the AI-engineering core (evals, memory, agents), four say what kind of builder the rest of the work shows (desktop and tools, hosted platforms, shipped iPhone apps, hardware and simulation).

## Groups

| Group | Id | Colour | Before | After |
|---|---|---|---|---|
| Evals & routing | `evals-routing` | white | 4 | 4 |
| Retrieval & memory | `retrieval-memory` | #B3B3B3 | 2 | 5 |
| Agents & computer use | `agents-computer-use` | #FF9F1C | 6 | 6 |
| Desktop & dev tools | `desktop-devtools` | #E8DCC8 (sand) | new | 5 |
| Platforms & web | `platforms-web` | #F5D76E | new | 6 |
| Mobile apps | `mobile-apps` | #FF5C1A | new | 4 |
| Hardware, sim & infra | `hardware-sim` | #A89C8A (clay) | new | 6 |
| Products | `products` | | 16 | retired |
| Tooling & infra | `tooling-infra` | | 8 | retired |

Total 36 listed projects. Sand and clay are warm greys below the palette's chroma threshold (`--color-group-sand`, `--color-group-clay`); both pass 4.5:1 as text on every surface (`scripts/check-contrast.mjs`).

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
| `bartlett-permits` | `products` | `platforms-web` | Hosted operations platform; it was in Products. Still excluded from the showcase card system. |
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
