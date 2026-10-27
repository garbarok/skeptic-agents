#!/usr/bin/env bash
set -euo pipefail

# Dev-only: symlinks every skill in this repo into the local skill folders, so
# edits here are live and a `git pull` updates them. Users install with
# skills.sh or the plugin instead (see README.md).
#   ~/.claude/skills   Claude Code
#   ~/.agents/skills   Codex and other Agent Skills harnesses

REPO="$(cd "$(dirname "$0")/.." && pwd)"

for DEST in "$HOME/.claude/skills" "$HOME/.agents/skills"; do
  mkdir -p "$DEST"
  for src in "$REPO"/skills/*/; do
    src="${src%/}"
    target="$DEST/$(basename "$src")"
    if [ -e "$target" ] && [ ! -L "$target" ]; then
      echo "skip $target: a real folder is there; remove it first" >&2
      continue
    fi
    ln -sfn "$src" "$target"
    echo "linked $(basename "$src") ($DEST)"
  done
done
