# Positioning proof: measured numbers

Recorded 2026-11-10 for `docs/plans/2026-11-10-0108-feat-ai-role-positioning-plan.md` (U4). Each figure also lives on its catalog entry with source, date and method. Nothing here is estimated.

## Orchestral (new runs, billed to the dedicated Orchestral eval key)

- Command shape: `orch .venv/bin/python harness.py grid --task <task> --orchestrators deepseek/deepseek-v4-flash-0731 --workers z-ai/glm-5.3-flash --no-judge --group positioning-2026-11-10 --replicate <n>`, run from the Orchestral repo; `orch` bills the key stored as `openrouter/orchestral`, never the default key.
- Pairing: the cheapest orchestrator and worker in the model catalog (`models/default.yaml`).
- Scope: 4 tasks (constraint-product-blurb, needle-deploy-token, extract-invoice, api-order-lookup), 4 replicates each, mechanical verdict, no LLM judge.
- Result from `python harness.py report --leaderboard --group positioning-2026-11-10`: 16 runs, 12 finished, 11 passed (92% of finished), cost per pass $0.00165. Four api-order-lookup runs ended with malformed planner output ("orchestrator plan must be a JSON object, got list") and one finished run failed validation; counting every started run, 11 of 16 passed (69%).
- Spend: $0.0182 reported by the harness for the group. Total eval spend for this work, including one invalid task id that errored before any call, is under $0.02 against a $3 ceiling.
- Run ids: 52525b166e42, cf307fb9b0b7, c911f9d33585, fc2ed62eb670, 8017e9362362, 8e27258656db, 2303e7222511, da85108fafce, 88bbaf1c5461, 8bd05d1515b3, 20d2e293aa8b, 7e2c4aacda2e, and four api-order-lookup runs (c4ef0c1c29d8, e2173f59503a, 80d9fdc33a71, 7483c6be655b).

## Argus (existing reports, no new spend)

- Source: the Argus repo's own eval report `docs/evals/2026-09-30.md`, matching `evals/results/2026-09-30T06-28-49-359Z.json`.
- gemini-2.5-flash-lite: cold run $0.0014, 3 of 3 passed, 6 vision calls; warm replay 0 calls. kimi-k2.5: cold run $0.088, 2 of 3 passed; warm replay 4 calls.
- Other recorded runs of the same suite (2026-09-11, and 2026-09-30 06:27) gave different costs ($0.0016, $0.0379 for gemini); the figure shown is the one that matches the committed report.

## Kurultai (omitted)

No honest retrieval score could be measured. `kurultai eval` scores a 14-query golden set labelled against Luke's real dogfood corpus (Hey threads, session history), which is not available here; the only corpus on hand was the repository's own markdown, with full-text search only (no embedding key). That run scored recall@10 0.136, which measures the missing corpus, not retrieval quality, so no Kurultai figure is shown. Its lead card carries a video and a source link instead.
