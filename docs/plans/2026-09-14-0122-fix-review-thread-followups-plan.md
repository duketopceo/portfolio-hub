---
title: Review Thread Follow-Ups - Plan
type: fix
date: 2026-09-14
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-plan-bootstrap
execution: code
---

# Review Thread Follow-Ups - Plan

## Goal Capsule

- **Objective:** PR #36 can merge without leaving a known defect or a broken public contact path behind. Every remaining review thread is either fixed or explicitly answered, and `hello@luke-the-duke.com` actually receives mail before it ships as the published address.
- **Means:** Fix the eight actionable review threads in place, and stand up Cloudflare Email Routing on `luke-the-duke.com` (KTD1).
- **Authority:** The repo's `BRAND.md` and `AGENTS.md` govern design and contributor conventions. Where a review thread asks for something that contradicts an authored decision, the authored decision wins and the thread is answered, not obeyed.
- **Stop conditions:** Do not merge while the contact alias has no MX record — that publishes a dead mailto. Do not weaken a contrast, motion, or accessibility guard to make a check pass.
- **Execution profile:** Standard depth. Small, mostly independent fixes plus one infrastructure step owned by the user.
- **Finisher:** `ce-work` for the code units; the Email Routing unit is owner-run.

## Product Contract

### Summary

Close out PR #36's remaining review threads and make the published contact address real. Eight threads are actionable; two of those are deliberate decisions that need an answer rather than a change. The email alias currently has no MX record on the domain, so the contact surfaces ship a mailto that cannot deliver.

### Problem Frame

The PR is mergeable and its checks are green apart from one perpetually-pending bot, but it carries eight unworked review threads and one latent defect the review surfaced: the published address `hello@luke-the-duke.com` has no mail route. `luke-the-duke.com` is on Cloudflare (`grace`/`porter.ns.cloudflare.com`) with **no MX record and no SPF TXT record** — the domain receives no mail at all today. Merging as-is would replace a working (if over-exposed) Gmail address with an address that silently drops every message, which is worse than the exposure it fixed.

The eight threads are a mix of genuine defects and one false positive already answered. Two of them ask for changes that contradict authored decisions in this repository, and those should be answered rather than applied.

### Requirements

**Contact path**

- R1. `hello@luke-the-duke.com` delivers to the owner's mailbox before the PR merges, or the contact surfaces stop advertising an address that cannot receive mail.

**Review threads**

- R2. The header's `backdrop-filter` blur is removed, matching `BRAND.md`'s stated ban on backdrop-blur panels.
- R3. The orbit and reticle animations added by this branch are either composited (`transform`/`opacity`) or carry a `prefers-reduced-motion` guard.
- R4. `BRAND.md`'s canvas implementation table describes the canvas layers that exist, not the two that were deleted.
- R5. `FocusBeacon`'s damping actually runs — the `position` prop stops re-applying the target on every render.
- R6. The ThreeUI effect layers load client-only and fail locally, so a WebGL or chunk failure preserves the page instead of replacing it with the route error.
- R7. `INDEX.md`'s generator reports a stable self-entry, so `check()` does not report the committed index as permanently stale.
- R8. The two threads that ask for changes contradicting authored decisions are answered on their threads with the reasoning, and resolved.

**No regression**

- R9. Lint, typecheck, tests, and build stay green, and the touched routes still serve.

### Key Decisions

- **The portfolio publishes its owner's name, city, and GitHub profile.** *(session-settled: user-approved — chosen over removing them to satisfy the inherited "never expose a real name or location" rule: `public/llms.txt` and the résumé state the name and location outright, and the site exists to be found by recruiters.)* Governs R8.
- **The orbit math stays duplicated between the scene and the static plate.** *(session-settled: user-approved — chosen over extracting a shared helper: the plate must be geometrically correct before JavaScript loads, so its geometry lives in CSS custom properties and the two are kept in sync by a documented comment.)* Governs R8.

### Scope Boundaries

**In scope:** the eight review threads above, and the Email Routing rule.

**Deferred to Follow-Up Work:**

- Open-sourcing decisions for the private catalog projects (see the analysis in the PR discussion). Client and employer work stays private; several personal projects are candidates; the infra and trading projects need a secret scrub first.
- The `WelcomeIntro` `useSyncExternalStore` refactor recorded in `AGENTS.md`.
- Rotating the credential removed from `.mcp.json`, and the Next.js/PostCSS/Sharp advisory bump.

### Assumptions

- The owner has access to the Cloudflare dashboard for `luke-the-duke.com`.
- The alias should forward to the same mailbox that previously served as the public address.

## Planning Contract

### Key Technical Decisions

- KTD1. **Email Routing is an owner-run infrastructure step, not a code change.** Cloudflare Email Routing is free on the existing zone and revocable by deleting one rule. No credential for the Cloudflare API is available to this session, so the unit is documented for the owner rather than automated. *(chosen over pointing the alias at a third-party forwarding service: the domain is already on Cloudflare, and adding a second provider to route one address is more moving parts for the same result.)*

### High-Level Technical Design

No section. The units are independent, small, and localized; there is no cross-component topology or protocol sequence for a diagram to carry.

## Implementation Units

### U1. Stand up Email Routing for the contact alias

- **Goal:** Mail to `hello@luke-the-duke.com` reaches the owner's mailbox, so the published contact path works.
- **Requirements:** R1
- **Dependencies:** none — but it gates merge
- **Files:** none in the repository; this is a Cloudflare zone change
- **Approach:**
  1. Cloudflare dashboard → the `luke-the-duke.com` zone → **Email** → **Email Routing** → enable it. Cloudflare adds the required MX and SPF records to the zone as part of enabling.
  2. Under **Destination addresses**, add the mailbox that should receive the mail and complete the verification email Cloudflare sends it.
  3. Under **Routing rules**, create a custom address `hello@luke-the-duke.com` forwarding to that verified destination. Catch-all stays off.
  4. Send a test message from an unrelated account to the alias and confirm arrival. Check the spam folder before concluding it failed — a brand-new sending domain has no reputation.
- **Execution note:** This is an owner-run infrastructure step. It has no repository-derived completion signal, so it is done when the test message is observed arriving, not when the rule is created.
- **Test expectation:** none in-repo — external infrastructure. The verification is the observed test message.
- **Verification:** a message sent to `hello@luke-the-duke.com` from an outside account arrives in the destination mailbox.

### U2. Remove the header backdrop blur

- **Goal:** The sticky header uses a solid surface with a hairline border instead of a backdrop blur.
- **Requirements:** R2
- **Dependencies:** none
- **Files:** `src/app/globals.css`
- **Approach:** Drop `backdrop-filter` and its `-webkit-` variant from `.site-header`, and set an opaque background from the existing surface tokens so the header still separates from content behind it. Keep the existing bottom hairline. A full-width sticky element with a blur also forces a composited repaint of everything behind it on scroll, so this removes that cost as well.
- **Patterns to follow:** the panel tokens already in `:root` (`--glass-bg`, `--color-surface`) and the hairline convention used by other sticky chrome.
- **Test expectation:** none — a styling change. Verified visually.
- **Verification:** the header renders opaque with a hairline border, no blur, and content scrolling under it is not visible through it.

### U3. Composite or guard the new orbit and reticle animations

- **Goal:** The animations this branch added either animate only compositable properties or stop under reduced motion.
- **Requirements:** R3
- **Dependencies:** none
- **Files:** `src/app/globals.css`
- **Approach:** `solar-orbit-shimmer` animates `stroke-dashoffset`, which repaints the SVG path every frame rather than compositing. Either move the shimmer to an opacity-only effect, or accept the repaint but add the animation to the existing `prefers-reduced-motion` block at the same place the other gated animations live. Apply the same treatment to `reticle-breathe`. Reuse the existing reduced-motion block rather than adding a second one.
- **Patterns to follow:** the reduced-motion block that already disables `.animate-fade-up`, `.animate-fade-in`, `.animate-page-in`, and `.q-node-enter`.
- **Test expectation:** none — a styling change. Verified by emulating reduced motion.
- **Verification:** with `prefers-reduced-motion: reduce` emulated, the orbit and reticle animations do not run; with motion allowed, they still do.

### U4. Correct the BRAND.md canvas table

- **Goal:** The canvas implementation table names the layers that exist.
- **Requirements:** R4
- **Dependencies:** none
- **Files:** `BRAND.md`
- **Approach:** Replace `StarChartField` with `StarfieldScene` and `OrbitalBody` with `OrbitalScene`, add `BeltScene`, and attribute each layer correctly: `SectorTerrain`, `DossierArcField`, `WarpFieldLayer`, and `UplinkLoader` use `@designcodeio/threeui`, while `StarfieldScene`, `OrbitalScene`, and `BeltScene` are React Three Fiber scenes mounted through `SceneFrame`.
- **Test expectation:** none — documentation. Verified by checking every name in the table against the tree.
- **Verification:** every component named in the table exists, and no deleted component is named.

### U5. Let FocusBeacon's damping run

- **Goal:** The focus beacon springs toward the newly focused marker instead of jumping.
- **Requirements:** R5
- **Dependencies:** none
- **Files:** `src/components/scene/OrbitalScene.tsx`
- **Approach:** The `useFrame` callback damps `ref.current.position` toward `target`, but the same vector is also passed as the `position` prop, so a re-render copies the new target straight in and the spring never runs. Set the position once on mount and let the damping own it afterwards.
- **Execution note:** Confirm the beacon still lands on the correct marker after the change — the damping is the visual, the landing position is the contract.
- **Test scenarios:**
  - Happy path: changing the focused project moves the beacon to the new marker over several frames rather than in one.
  - Edge case: focusing the first and last project in the orbit still lands the beacon on the right marker.
- **Verification:** the beacon animates between markers, and its settled position matches the focused marker's computed orbit point.

### U6. Load the ThreeUI layers client-only with local fallbacks

- **Goal:** A ThreeUI load, render, or context failure degrades the affected layer instead of replacing the route with the error page.
- **Requirements:** R6
- **Dependencies:** none
- **Files:** the ThreeUI wrapper components (`src/components/SectorTerrain.tsx` and the other effect wrappers named in U4)
- **Approach:** Each wrapper currently renders its ThreeUI import directly when motion is allowed, with no `next/dynamic({ ssr: false })` and no local error boundary. The renderers require browser WebGL, so a failure reaches `src/app/error.tsx` and replaces the route. Load each effect through a client-only dynamic import and catch failures in a local boundary that renders the layer's non-WebGL fallback.
- **Patterns to follow:** `src/components/scene/SceneFrame.tsx` — the shared mount contract that already handles reduced motion, context loss, and a local error boundary for the R3F surfaces. Reuse its shape rather than inventing a second one.
- **Test scenarios:**
  - Happy path: with motion allowed, each effect layer still renders.
  - Error path: forcing the dynamic import to reject leaves the page rendering with that layer absent, not the route error page.
  - Reduced motion: no effect layer mounts, and the page renders as before.
- **Verification:** the affected routes serve with the layers present, and a simulated chunk failure leaves the page intact.

### U7. Stabilize the INDEX.md self-entry

- **Goal:** `check()` no longer reports the committed `INDEX.md` as permanently stale.
- **Requirements:** R7
- **Dependencies:** none
- **Files:** the index generator that owns `discover_files()`, `build_index_content()`, `parse_existing_index()`, and `check()`
- **Approach:** `discover_files()` includes `INDEX.md` itself, so the generated self-row uses the current mtime while `parse_existing_index()` discards the stored value, and the two never agree. Exclude `INDEX.md` from the comparison, or give the self-entry a stable normalized value.
- **Test expectation:** none in-repo unless the generator has a test file; verify by running the generator's check twice and confirming it reports clean the second time.
- **Verification:** running the generator's check against a freshly generated index reports no staleness.

### U8. Answer the two deliberate-decision threads

- **Goal:** The two threads that ask for changes contradicting authored decisions are answered and resolved.
- **Requirements:** R8
- **Dependencies:** none
- **Files:** none — thread replies only
- **Approach:**
  - The orbit-math duplication thread: the static plate must be geometrically correct before JavaScript loads, so its geometry lives in CSS custom properties and the duplication is intentional, kept in sync by a documented comment. Answer with that reasoning.
  - Any remaining thread asking to remove the owner's name or location: the site's purpose requires them, and `public/llms.txt` states them deliberately. Answer with that reasoning.
- **Test expectation:** none — no code change.
- **Verification:** both threads carry a reply with the reasoning and are resolved.

### U9. Verify the gates and the touched surfaces

- **Goal:** Nothing in this batch regressed.
- **Requirements:** R9
- **Dependencies:** U2, U3, U4, U5, U6, U7
- **Files:** none — verification only
- **Approach:** Run the repository gates, then re-check the pages whose styling or layers changed, plus the reduced-motion path.
- **Test scenarios:**
  - `npm run lint` → zero errors, zero warnings.
  - `npx tsc --noEmit` → clean.
  - `npm run test` → full suite passes.
  - `npm run build` → green.
  - `/`, `/projects`, `/projects/khan`, `/openrouter` → 200 with no console errors at 390 and 1440px.
  - Reduced-motion emulation → no canvas and no orbit animation.
- **Verification:** all gates green and every listed surface returns 200.

## Verification Contract

| Gate | Command | Applies to | Done signal |
|---|---|---|---|
| Lint | `npm run lint` | U2-U7, U9 | exits 0, zero errors and zero warnings |
| Typecheck | `npx tsc --noEmit` | U5, U6, U9 | clean |
| Tests | `npm run test` | U9 | full suite passes |
| Build | `npm run build` | U9 | green, pages still prerender |
| Reduced motion | browser emulation on `/` | U3, U6 | no canvas, no orbit animation |
| Contact delivery | send to `hello@luke-the-duke.com` from an outside account | U1 | message arrives in the destination mailbox |

## Definition of Done

- `hello@luke-the-duke.com` receives mail, verified by an observed test message.
- No review thread on PR #36 is left unanswered: each is fixed and resolved, or answered and resolved with reasoning.
- The header has no backdrop blur; the orbit and reticle animations are composited or reduced-motion gated; the `BRAND.md` canvas table names only components that exist; the focus beacon damps; the ThreeUI layers load client-only with local fallbacks; the index check is stable.
- Lint, typecheck, tests, and build are green, and the touched routes serve at both widths.
- No dead-end or experimental code is left in the diff.
