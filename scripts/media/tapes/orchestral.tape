# VHS tape: orchestral report views over the key-free fixture corpus.
# Run through docs/MEDIA.md section 2 (CLIs): fixture corpus built outside the repo,
# VHS started with an empty environment. Required env: ORCH_REPO (clone path),
# ORCH_DEMO_RUNS (corpus runs dir), ORCH_PY (python with orchestral deps).
Output orchestral-raw.mp4

Require python3

Set Shell "bash"
Set Width 1280
Set Height 720
Set Padding 40
Set FontFamily "Liberation Mono"
Set FontSize 18
Set LineHeight 1.3
Set TypingSpeed 50ms
Set Framerate 30
Set CursorBlink false
Set Theme "Catppuccin Mocha"

# Setup is hidden: fixed prompt, no color, fixture-only alias. Nothing here shows a
# path, hostname or account.
Hide
Type "export PS1='$ ' NO_COLOR=1 PYTHONDONTWRITEBYTECODE=1" Enter
Type "cd $ORCH_REPO" Enter
Type "alias orchestral='$ORCH_PY harness.py --runs-dir $ORCH_DEMO_RUNS --tasks-dir tests/fixtures/observatory/tasks --models-dir tests/fixtures/observatory/models'" Enter
Type "clear" Enter
Show

Sleep 800ms
Type "# Which orchestrator and worker pairing gives the best quality per dollar?"
Enter
Sleep 600ms
Type "orchestral report --leaderboard"
Sleep 400ms
Enter
Sleep 6s

Type "clear" Enter
Type "orchestral report --pairings"
Sleep 400ms
Enter
Sleep 6s
