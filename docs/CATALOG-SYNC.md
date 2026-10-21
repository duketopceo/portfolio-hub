# Catalog sync

A weekly workflow (`.github/workflows/catalog-sync.yml`) keeps the per-project catalog in `src/data/catalog/` current by opening one proposal pull request. It runs Mondays at 13:17 UTC and on manual dispatch.

## What the bot does

- Reads the owner's PUBLIC repositories only and aborts with no writes if any node is not public.
- Refreshes the `github` block of existing, non-private catalog entries.
- Rewrites `src/data/catalog/_proposals.json` and puts a readable summary in the PR body: new candidates above the curation bar, entries below it, upstream archives, renames, entries that are no longer public, and a range warning if the listed count leaves the target.
- Opens or updates a single PR from `bot/catalog-sync` into `main`, authored by the App's bot user so CI runs on it.

## What the bot never does

- Touch `curated` fields, private entries, or create a catalog entry for a new repo.
- Merge, approve, or list anything. A proposal takes effect only when you edit `curated` and merge.
- Update the PR if someone else committed to `bot/catalog-sync`. It posts a comment on the open PR instead and leaves the branch alone.
- Put private names or text into the PR, logs or comments. Repo-sourced text in the PR body is code-wrapped and `@` is neutralized.

## One-time setup (Luke)

1. Create a GitHub App named `portfolio-sync` (Settings, Developer settings, GitHub Apps). Repository permissions: Contents read and write, Pull requests read and write, Metadata read. No webhook needed.
2. Install it only on `duketopceo/portfolio-hub`.
3. Generate a private key. Add repository secrets `SYNC_APP_ID` (the App ID) and `SYNC_APP_PRIVATE_KEY` (the full PEM) under Settings, Secrets and variables, Actions.
4. Optional with an App token: Settings, Actions, General, enable "Allow GitHub Actions to create and approve pull requests". The workflow does not need it.

Then run the workflow once from the Actions tab (Catalog sync, Run workflow). A second dispatch after a hand commit on the branch should produce a comment, not a push.

## Reviewing a proposal PR

- New candidate you want on the site: create its entry file and fill in `curated` (title, blurb, tier, media slots), commit that onto the PR branch or a normal branch. Committing onto `bot/catalog-sync` makes the bot stop updating that PR, so merge it before the next run.
- Entry below the bar, archived or stale: edit `curated` (for example `era: earlier`) or remove the entry.
- Renamed repo: the `github` block already follows the rename; check the slug still reads well.
- Ignore a candidate: do nothing. It reappears in later proposals until the bar or the repo changes.
- Check CI is green, then merge. The branch is deleted on merge.

## If the schedule stops

GitHub disables scheduled workflows in a repository after 60 days without repository activity. Merged sync PRs count as activity. If the Actions tab shows the workflow as disabled, open it and choose "Enable workflow", then run it once by dispatch.
