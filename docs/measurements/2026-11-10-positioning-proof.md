# Positioning proof: measured numbers

Recorded 2026-11-10 for `docs/plans/2026-11-10-0108-feat-ai-role-positioning-plan.md` (U4). Each figure also lives on its catalog entry with source, date and method. Nothing here is estimated.

## Orchestral (new runs, billed to the dedicated Orchestral eval key)

- Command shape: `orch .venv/bin/python harness.py grid --task <task> --orchestrators deepseek/deepseek-v4-flash-0731 --workers z-ai/glm-5.3-flash --no-judge --group planner-fix-2026-11-10 --replicate <n> --max-cost 1`, run from the Orchestral fix worktree; `orch` bills the key stored as `openrouter/orchestral`, never the default key.
- Pairing: the cheapest orchestrator and worker in the model catalog (`models/default.yaml`).
- Scope: 4 tasks (constraint-product-blurb, needle-deploy-token, extract-invoice, api-order-lookup), 4 replicates each, mechanical verdict, no LLM judge.
- Source: run group `planner-fix-2026-11-10`, measured 2026-11-10 on the planner fix (duketopceo/orchestral PR #211, `fix/planner-list-plan`).
- Result: **14 of 16 runs passed (88%)**, counted over every run started (passed / total, not of finished). All 16 finished. The two failures are constraint-product-blurb validation failures. api-order-lookup passed 4 of 4; those runs are self-executed (the orchestrator answered with the call list directly, `delegated: false`).
- Cost per pass: **$0.0012** (group spend $0.0162 over 16 runs divided by 14 passes). The harness leaderboard shows $0.0014 for the same group because it computes its own per-pass figure; the published number is total spend over passes.
- Spend: $0.0162 reported by the harness for the group, against a $1 cap.
- Earlier measurement, before the fix (group `positioning-2026-11-10`): 11 of 16 passed (69%) at $0.00165 per pass. Four api-order-lookup runs ended with malformed planner output ("orchestrator plan must be a JSON object, got list"). That is the failure the fix addresses.
- Caveat: the before and after groups used the same pairing and tasks but different random draws; the 69% to 88% gap is not a controlled estimate of the fix alone.

## Argus (existing reports, no new spend)

- Source: the Argus repo's own eval report `docs/evals/2026-09-30.md`, matching `evals/results/2026-09-30T06-28-49-359Z.json`.
- gemini-2.5-flash-lite: cold run $0.0014, 3 of 3 passed, 6 vision calls; warm replay 0 calls. kimi-k2.5: cold run $0.088, 2 of 3 passed; warm replay 4 calls.
- Other recorded runs of the same suite (2026-09-11, and 2026-09-30 06:27) gave different costs ($0.0016, $0.0379 for gemini); the figure shown is the one that matches the committed report.

## Kurultai (omitted)

No honest retrieval score could be measured. `kurultai eval` scores a 14-query golden set labelled against Luke's real dogfood corpus (Hey threads, session history), which is not available here; the only corpus on hand was the repository's own markdown, with full-text search only (no embedding key). That run scored recall@10 0.136, which measures the missing corpus, not retrieval quality, so no Kurultai figure is shown. Its lead card carries a video and a source link instead.
