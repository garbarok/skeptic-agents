# Changelog

## 0.1.4

- `skeptic-build`: the merge step now starts by writing a batch record (`.skeptic/batches/<date>.json`) with each item's commits, fix and verdicts, read only after the pipeline's completion notice. Anything that later cites the batch reads that record, since a mid-run `git log` is stale and item branches are deleted after the merge.

## 0.1.3

- `skeptic-build`: worktrees no longer outlive their item. The workflow removes each item's worktree as soon as it is verified and fixed (or fails), committing any leftover changes to its branch first; held items keep only their branch. The merge step removes the integration worktree too and ends by checking `git worktree list`.

## 0.1.2

- `skeptic-build`: linking the main checkout's installed dependencies (`node_modules`, `.venv`, `vendor`) into each worktree is now the implementer's mandatory first step, instead of a hint. It installs only when the item changes a dependency, after removing the link, so the shared copy is never modified.

## 0.1.1

- `skeptic-build`: the Claude Code workflow creates each item's worktree with `git worktree add` next to the repo instead of the Workflow tool's worktree isolation, which refused any repo where `.claude` is a symlink. New optional `base` arg (default `HEAD`) sets the branch items start from, so you no longer check out the integration branch first. `SKILL.md` notes passing the script inline when Workflow refuses its path.

## 0.1.0

- `skeptic-build`: batch pipeline of research, implement in a worktree, verify (correctness plus review lenses), fix, and one advisor review. Runs as a Claude Code workflow, with subagents on other agents, or as a single agent.
- `skeptic-research`: parallel research angles, at least one contrarian, synthesized into one sourced plan file.
- Install routes: skills.sh, and a plugin manifest read by Claude Code, Codex and Copilot CLI.
