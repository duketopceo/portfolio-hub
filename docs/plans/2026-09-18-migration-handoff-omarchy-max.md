# Migration Handoff — omarchy-macbook-m1 → omarchy-max (2026-09-18)

Written for the agent picking up on the new machine. Everything below was the
live state on the M1 Pro at wipe time.

## Portfolio Hub (this repo)

- `main` is current and pushed. Untracked local state committed in this commit:
  `docs/plans/2026-09-14-0229-feat-portfolio-guide-plan.md` (Portfolio Guide
  chatbot plan, not yet implemented).
- Worktrees on the old machine do not migrate; their branches are pushed:
  - `feat/demos` — demos index + argus/kurultai demo pages
  - `feat/demo-dayflow` — dayflow demo page (PR #45, was awaiting merge call)
  - `feat/home-flow-redesign`, `feat/glitchtip-sentry` — already merged/gone
- `.codebase-memory/` dirs are generated index artifacts — regenerate with
  `codebase-memory-mcp cli index_repository --repo-path . --mode full --persistence true`.
- Enduring requirement still open: ship authored WebGL scenes (DOM-anchored
  orbit markers, focus tracking, live parallax) that demonstrably improve on
  the committed baseline — or verify baseline unchanged. Browser-verify on the
  new machine's WebGL stack (this was Asahi/M1; omarchy-max differs).
- Guardrails that still apply: Cloudflare-routed alias for public contact
  (no Gmail, no phone), no `.mcp.json` credentials committed, privacy/security
  checks green (`scripts/check-privacy.mjs`, `tests/visual/security.spec.ts`).

## luke-agents (~/Documents/github/personal/luke-agents)

- Open PR **#47** (`docs/stale-sweep` branch, worktree `luke-agents-cbm`):
  JEV deep-audit fixes + full TOOLS_ECOSYSTEM fleet refresh. Awaiting user
  review — the fleet table needs owner's confirm (bartlett-001 = Pace prod
  backend, cluster roles, omarchy-max should be added to the table).
- Merged this session: #44 (cbm docs → v0.11.0), #45 (§12 hosting fix),
  #46 (`agents/jev.md`).
- JEV: `typesafe/jev-latest` via OpenRouter `/api/alpha/decisions` — see
  `agents/jev.md`. ~$0.0001/call.
- New machine note: update the TOOLS_ECOSYSTEM fleet table for omarchy-max
  (and mark omarchy-macbook-m1 retired/wiped).

## kurultai (~/Documents/github/personal/kurultai)

- `kurultai connect` device flow is live on `api-knowledge.shippedit.dev`
  (use the api- host — UI host 302s through Cloudflare Access).
- **PR #358 merged**: persistent seat-id `{hostname}-{6hex}` in
  `~/.config/kurultai/seat-id`; omaseal keys now
  `{lane}-{codename}-{seat}-agent-token`. Root cause of the earlier 401 was
  seat-collision credential clobbering — fixed.
- Old machine's seat was `devin@lukekimball-736544` (key in omaseal
  `kurultai/dev-devin-lukekimball-736544-agent-token` — omaseal itself
  migrates via its own mechanism; if not, just `kurultai connect` fresh on
  omarchy-max, it mints a new seat-id).
- Last step was in-flight: verify 200 on `/api/status` + post Hey presence —
  handed to the kurultai pane agent. Re-run `kurultai connect` on omarchy-max
  and post presence fresh.
- Known follow-up defect not yet filed: `connect <ui-host>` fails unhelpfully
  on the CF 302 instead of resolving the api- host or hinting.
- `docs/brainstorms/2026-09-18---kurultai-connect-device-flow-requirements.md`
  committed in the same migration push.

## Fleet ops notes for omarchy-max

- `~/.local/bin/kurultai` must be rebuilt (`cargo build --release`) — binary
  does not migrate.
- `codebase-memory-mcp` binary at `~/.local/bin/` — reinstall pinned release,
  re-index repos.
- OmaSeal: run `omaseal agent unlock` per agent pane after first use.
- herdr workspaces/panes are machine-local — re-spawn agents on the new box.
