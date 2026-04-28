# Git auth on the Swarm manager (`git fetch` / HTTPS / SSH)

`scripts/cluster-deploy.sh` starts with **`git fetch origin`** and **`git reset --hard origin/main`**. If that fails, Docker never runs.

## Deploy without git (temporary)

If the tree on the server is already correct (e.g. you rsync’d or you’re sure `main` is checked out):

```bash
SKIP_GIT=1 ./scripts/cluster-deploy.sh
```

**Risk:** you can ship stale code. Fix git auth and drop `SKIP_GIT` for normal deploys.

---

## HTTPS: “Invalid username or token”

This error usually means Git is sending a **bad or revoked PAT** (often from `~/.git-credentials` or another helper). **`portfolio-hub` is public** — after you remove the bad entry, **`git fetch` over HTTPS often works with no username/password at all**.

### 0) Try anonymous fetch first (public repo)

```bash
rm -f ~/.git-credentials
git config --global --unset-all credential.helper 2>/dev/null || true
git config --system --unset-all credential.helper 2>/dev/null || true
git config --local --unset-all credential.helper 2>/dev/null || true
# remove ~/.netrc github lines if you use netrc
cd ~/portfolio-hub
git remote set-url origin https://github.com/duketopceo/portfolio-hub.git
git ls-remote origin HEAD
```

If `git ls-remote` succeeds, run **`./scripts/cluster-deploy.sh`** (no PAT needed for fetch).

### 1) If you still need a PAT (private fork, rate limits, org policy)

1. Create a **new** PAT (classic **`repo`**, or fine‑grained read on this repo). Revoke any token that was ever pasted into chat, logs, or tickets.
2. Clear old cached HTTPS creds on the manager:

   ```bash
   rm -f ~/.git-credentials
   git config --global --unset credential.helper 2>/dev/null || true
   git config --global credential.helper store
   ```

3. Set a clean remote (no token in the URL):

   ```bash
   cd ~/portfolio-hub
   git remote set-url origin https://github.com/duketopceo/portfolio-hub.git
   GIT_TERMINAL_PROMPT=1 git fetch origin
   ```

   - **Username:** your GitHub username  
   - **Password:** the **PAT only** (not your GitHub account password)

4. Verify:

   ```bash
   git ls-remote origin HEAD
   ```

---

## SSH: `Permission denied (publickey)`

The host must offer a key GitHub accepts:

```bash
ls -la ~/.ssh
ssh-add -l
ssh -vT git@github.com
```

Generate a key on the manager if needed, add the **public** key to GitHub (user SSH keys or repo **Deploy keys** with read access), then:

```bash
git remote set-url origin git@github.com:duketopceo/portfolio-hub.git
ssh -T git@github.com
git fetch origin
```

---

## Cursor (IDE) — fresh GitHub / token hygiene

Cursor does **not** control your **Linux server’s** `git` credentials. For **this Mac / Cursor** after a token leak:

1. **Revoke** the exposed PAT on GitHub.
2. In **Cursor**: open **Settings** and disconnect or sign out of **GitHub** under Accounts / Git if shown; sign in again only after a **new** token or OAuth flow.
3. On Mac, **Keychain Access**: search `github` and remove stale **internet password** entries for `github.com` if HTTPS prompts keep sending old tokens.
4. **Terminal history**: if a PAT was pasted into a terminal, clear that scrollback or consider rotating again; prefer `git credential fill` / helper prompts over pasting into the shell line.

---

## App build token (separate from `git fetch`)

`GITHUB_TOKEN` in **`~/portfolio-hub/.env`** is for **`next build`** / runtime GitHub API inside the container. It does **not** fix `git fetch`. You need **both**: working **git** auth for the script’s sync step, and **`.env`** for the Docker build unless you only rebuild unchanged code with `SKIP_GIT=1`.
