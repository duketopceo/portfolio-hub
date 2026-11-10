---
title: AI Role Positioning - Plan
type: feat
date: 2026-11-10
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-brainstorm
---

# AI Role Positioning - Plan

## Goal Capsule

- **Objective:** A hiring manager at an AI-native company (Perplexity, OpenRouter, xAI) who opens luke-the-duke.com concludes within seconds that Luke builds model systems, measures them on cost and quality, and ships them.
- **Authority:** Luke's choices in the 2026-11-10 brainstorm; `docs/plans/2026-11-09-2247-feat-portfolio-redesign-r2-plan.md` for everything this plan does not change; `BRAND.md`.
- **Open blockers:** none.

---

## Product Contract

### Summary

Five pinned lead projects, chosen for AI-native roles, lead every page in a professional lead band. All projects regroup by capability. The top three carry measured numbers. A Perplexity-style sector sphere maps every project, and the video queue follows the new ranking.

### Problem Frame

The site's leads were picked by a generic completeness score, so the third lead was the portfolio itself, and three lists in the code and older plans disagree on who leads. Projects are grouped by an old category list (finance, ai, osint, infra, apps, data) that says nothing about the work AI-native teams hire for. The catalog carries almost no measured outcomes: no eval scores, pass rates or cost figures. Hiring reviewers reward a few curated projects framed by outcomes and backed by verifiable proof.

### Requirements

**Lead projects**
- **R1.** The pinned leads are, in order: Orchestral, Argus, Kurultai, open-computer, Tallyline. They replace every other lead list.
- **R2.** The lead band shows all five professionally: each card states the outcome first, then the proof (a measured number when one exists, a live link, a video), then the stack.

**Grouping**
- **R3.** Projects group by capability: Evals & routing, Retrieval & memory, Agents & computer use, Products, Tooling & infra. Every listed project belongs to exactly one group.
- **R4.** Within each group, projects keep the existing score order; a lead appears only in the lead band.

**Measured proof**
- **R5.** Orchestral shows pass rate and cost per pass, Argus shows dollars per run and cache-hit rate, and Kurultai shows a retrieval eval score, each from a real, recorded run.
- **R6.** A number that cannot be measured honestly is not shown; no estimated or invented figures.

**Project sphere**
- **R7.** A wireframe sphere divided into one sector per capability group places each listed project as a dot colored by its group, with a legend.
- **R8.** Hovering or focusing a dot shows the project name; activating it opens the project's page.
- **R9.** The sphere heads `/projects`; home shows a compact version under the lead band that links to it.
- **R10.** The sphere rotates slowly unless reduced motion is on, and an accessible list of the same projects carries its meaning.

**Videos**
- **R11.** The frozen top-15 video queue is taken from the new ranking, leads first.

### Key Decisions

- **KD1.** The five leads are Orchestral, Argus, Kurultai, open-computer, Tallyline. (session-settled: user-directed — chosen over a set including OpenRouter demos, which Luke rejected, and over agentflow, jev-compact or fleet-models for the last slots.) Governs R1.
- **KD2.** Capability groups replace the category list for grouping. (session-settled: user-approved — chosen over keeping finance/ai/osint/infra/apps/data.) Governs R3.
- **KD3.** The sphere is drawn without a second WebGL context, to stay inside the integrated-graphics budget. (session-settled: user-approved — chosen over a three.js force graph.) Governs R7.
- **KD4.** Measured numbers come from cheap real runs billed to the Orchestral eval key, and are omitted when they cannot be measured. (session-settled: user-approved — chosen over estimated figures.) Governs R5, R6.

### Success Criteria

- Asked after a few seconds on home, a reviewer names the kind of work Luke does in terms of models, evals or cost.
- Each of the five lead cards shows at least one piece of verifiable proof.

### Scope Boundaries

- No new project write-ups beyond lead-card outcome lines, no hosting change.
- The engineering signal keeps tracking ranking positions 1–5, which now means the five leads.

#### Deferred for later

- Measured numbers for open-computer and Tallyline.
- A full three.js 3D graph.

### Outstanding Questions

#### Deferred to Planning

- How projects are spread within a sector (by score, recency, or similarity) and how the 2D sphere is drawn.
- Which eval set Kurultai's retrieval score uses.

### Sources

- Repo grounding scan (2026-11-10): catalog entries, ranking files, conflicting lead lists, absence of metrics.
- Web research (2026-11-10): reviewers favor 3–5 curated projects, outcome-first case studies, verifiable shipping, evals over API wrappers; react-force-graph is the common 3D option.
- Perplexity memory view (owner screenshot): wireframe sphere with colored dots, legend and hover labels.
