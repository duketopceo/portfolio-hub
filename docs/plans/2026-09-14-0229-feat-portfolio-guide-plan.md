---
title: Guarded Portfolio Guide on Cloudflare
type: feat
date: 2026-09-14
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-brainstorm
execution: code
status: ready
---

# Guarded Portfolio Guide on Cloudflare

## Goal Capsule

- **Objective:** Add a citation-first recruiter assistant that answers questions about Luke's public experience, projects, capabilities, private-project evidence, and job-specific demos without exposing private source or inventing claims.
- **Primary actor:** A recruiter or hiring manager evaluating fit.
- **Core outcome:** The visitor asks a natural-language question and receives a concise answer linked to the exact dossier, résumé section, demonstration, or approved evidence package that supports it.
- **Platform:** Cloudflare Workers Free, Agents SDK with SQLite Durable Objects, Vectorize, Workers AI, AI Gateway, Turnstile, and optional OpenRouter escalation.
- **Dependencies:** The Portfolio Hub design-system foundation defines the widget UI. Cloudflare Email Routing is independent.
- **Stop conditions:** No raw private repository access, no uncited project claims, no mutation tools, no personal data retention, and no unbounded model spend.

## Product Contract

### Product definition

The Portfolio Guide is a guarded portfolio navigator, not a generic chatbot. It helps recruiters find relevant evidence and understand Luke's work while keeping the site itself—not the model response—the source of truth.

### Supported questions

- Which projects demonstrate a named capability?
- What did Luke personally own?
- What production systems and infrastructure has Luke operated?
- Which projects fit a pasted job description?
- What architecture or tradeoffs shaped a project?
- Which projects have live demonstrations or public source?
- What curated evidence is available for a private project?

### Answer contract

- Lead with the direct answer in two to five sentences.
- Cite every substantive claim to an approved corpus item.
- Link to the best next dossier, résumé section, demonstration, or repository.
- Label curated private-project evidence as curated; never imply the source is public.
- Say when evidence is incomplete or unavailable.
- Never infer confidential business facts, impact metrics, job titles, or ownership from repository names alone.

### Corpus classes

#### Public source

Approved public repositories, public READMEs, Portfolio Hub project data, résumé surfaces, public demonstrations, approved screenshots, and published architecture documents.

#### Curated private-project evidence

Separately authored and approved packages containing permitted purpose, business context, Luke's role, sanitized architecture, technology, decisions, tradeoffs, safe scale ranges, approved outcomes, media, current status, and why source remains private.

Approval applies only to the package. It never grants retrieval access to the private repository or adjacent private documents.

#### Forbidden

Raw private source, credentials, environment values, client or tenant records, personal contact data, internal hosts and addresses, brokerage information, contracts, private conversations, unpublished security posture, and unapproved claims.

### Privacy and retention

- Anonymous per-session identity.
- Conversation history stored only for the active session and automatically expired.
- No email, phone, IP-derived profile, or job-description retention beyond the session.
- Logs redact prompts, responses, and retrieved content by default; operational logs contain request IDs, timing, model route, token/Neuron usage, guardrail result, and source IDs only.
- No corpus or conversation is used for training by Portfolio Hub.

### Guardrails

- Turnstile before the first model request.
- Exact-origin CORS allowlist.
- Per-IP and per-session request ceilings.
- Input length, retrieval count, output length, and daily inference limits.
- AI Gateway rate limiting, analytics, DLP, and input/output guardrails.
- Retrieved documents and pasted job descriptions are untrusted evidence, not instruction.
- System policy and tool permissions cannot be changed by retrieved text.
- Initial tool set is read-only: corpus search, project lookup, résumé lookup, and link resolution.
- Unsupported questions receive a bounded refusal plus relevant navigation.

### Free-tier behavior

- Workers AI is the default inference route within the 10,000-Neuron daily free allocation.
- OpenRouter is used only for explicitly classified comparison or job-fit requests that exceed the default model's capability.
- AI Gateway caches safe repeated questions.
- An account-level daily OpenRouter budget caps paid inference.
- When inference quota is exhausted, the widget falls back to deterministic project and résumé search instead of failing or silently spending more.

## Planning Contract

### Request flow

1. The browser establishes an anonymous guide session and completes Turnstile.
2. The Worker validates origin, token, limits, and message shape.
3. The session Durable Object stores bounded message history and expiry metadata.
4. Vectorize retrieves approved chunks from the explicit corpus manifest.
5. The Worker rejects or redacts chunks whose approval/revocation metadata is invalid.
6. The routing policy chooses Workers AI or the bounded OpenRouter escalation.
7. AI Gateway applies observability, rate limits, DLP, and guardrails.
8. The response streams with source IDs.
9. The client resolves source IDs to human-readable citations and links.
10. The session expires and its conversation state is deleted.

### Corpus manifest

Each source record contains:

- Stable source ID
- Project slug or résumé section
- Corpus class: `public-source` or `curated-private`
- Approved text
- Human-readable title
- Public destination URL
- Provenance description
- Approval owner and date for curated-private items
- Optional expiry/review date
- Revocation state
- Content hash and embedding version

The ingestion command reads only manifest-listed records. It never enumerates private repositories.

### Model routing

- Default: a current Workers AI instruction-following model suitable for short grounded answers.
- Escalation: OpenRouter only for job-description comparison, cross-project synthesis, or a request the default model explicitly cannot answer well.
- No model chooses its own escalation. Deterministic server policy does.
- Both routes receive the same bounded evidence and guardrails.

## Implementation Units

### U1. Create the Cloudflare service

- Add an isolated Worker application and Wrangler configuration.
- Configure Workers AI, Vectorize, SQLite Durable Object, AI Gateway, and Turnstile bindings.
- Generate binding types; do not hand-write `Env`.
- Enable structured observability without prompt/response logging.

### U2. Define and validate the corpus

- Add the typed corpus manifest and schema validation.
- Convert current public portfolio evidence into manifest entries.
- Add curated-private package files separately from public-source extraction.
- Reject missing approval metadata, forbidden fields, duplicate source IDs, and revoked packages.
- Produce deterministic chunks with source IDs and content hashes.

### U3. Build ingestion and retrieval

- Embed manifest chunks and upsert them into Vectorize.
- Remove stale or revoked vectors before publishing the new corpus version.
- Retrieve a bounded top-k set filtered by corpus approval and project scope.
- Return citations with every chunk.

### U4. Build guarded chat sessions

- Use one SQLite Durable Object per anonymous session.
- Store bounded history, Turnstile state, rate counters, and expiry.
- Use WebSocket hibernation/resumable streaming where the client requires it.
- Delete expired sessions; never use one global Durable Object.

### U5. Implement deterministic model routing

- Implement Workers AI default and OpenRouter escalation through AI Gateway.
- Enforce daily and per-session budgets before model invocation.
- Apply DLP and input/output guardrails.
- Reject prompt-injection attempts to alter policy, tools, or corpus scope.
- Fall back to deterministic search when model quota is exhausted.

### U6. Build the Portfolio Guide UI

- Implement the widget in the final Mission briefing/Transmission design language.
- Provide starter questions, streaming, citations, retry, quota, offline-search, and refusal states.
- Keep the widget subordinate to page content and fully keyboard accessible.
- Do not display generic AI branding; call it Portfolio Guide.

### U7. Validate security, cost, and recruiter usefulness

- Unit-test schema, source approval, revocation, routing, budgets, and refusals.
- Integration-test Worker -> Durable Object -> Vectorize -> model gateway with local Cloudflare test infrastructure.
- Test prompt injection from user input, retrieved text, and pasted job descriptions.
- Test private/public citation labels and forbidden-source exclusion.
- Test Turnstile failure, exhausted quota, model failure, and Vectorize failure.
- Run a fixed recruiter-question evaluation set and require source-supported answers.
- Verify free-tier usage and fail-closed budget behavior from emitted metrics.

## Verification Contract

| Gate | Done signal |
|---|---|
| Types | Generated Worker binding types and TypeScript check pass |
| Unit tests | Corpus, routing, budget, and guardrail tests pass |
| Integration | Local Worker/DO/Vectorize-compatible chain passes without production data |
| Security | No forbidden corpus data, mutation tools, wildcard CORS, or prompt/response logs |
| Grounding | Every substantive evaluation claim cites an approved source |
| Privacy | Curated-private answers expose only approved package text |
| Failure | Quota, model, retrieval, and guardrail failures degrade to safe deterministic behavior |
| Cost | OpenRouter cannot exceed configured daily budget; Workers AI exhaustion cannot trigger unbounded escalation |
| UX | Keyboard, mobile, streaming, citation, retry, refusal, and offline-search states pass browser tests |

## Definition of Done

- Recruiters can ask supported questions and reach the underlying evidence.
- Public and curated-private evidence are clearly distinguished.
- Raw private repositories are inaccessible to ingestion and runtime retrieval.
- Every answer is cited or explicitly qualified.
- Turnstile, limits, DLP, guardrails, retention, and budget ceilings are enforced server-side.
- Free Workers AI is the default; OpenRouter spend is deliberate and bounded.
- The widget matches the final Portfolio Hub design system.
- Tests cover happy, failure, abuse, privacy, and quota paths.

## Upstream policy

The reusable corpus policy belongs in `luke-agents/SECURITY_GUIDELINES.md`. A draft exists at `/tmp/luke-agents-curated-private-corpus-policy.md`. The current local `luke-agents` checkout has pre-existing modified and untracked work, so it must not be edited or pushed until that work is committed, excluded, or moved by its owner.
