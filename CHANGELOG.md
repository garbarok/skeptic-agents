# Changelog

## 0.1.1

- `skeptic-build`: the Claude Code workflow creates each item's worktree with `git worktree add` next to the repo instead of the Workflow tool's worktree isolation, which refused any repo where `.claude` is a symlink. New optional `base` arg (default `HEAD`) sets the branch items start from, so you no longer check out the integration branch first. `SKILL.md` notes passing the script inline when Workflow refuses its path.

## 0.1.0

- `skeptic-build`: batch pipeline of research, implement in a worktree, verify (correctness plus review lenses), fix, and one advisor review. Runs as a Claude Code workflow, with subagents on other agents, or as a single agent.
- `skeptic-research`: parallel research angles, at least one contrarian, synthesized into one sourced plan file.
- Install routes: skills.sh, and a plugin manifest read by Claude Code, Codex and Copilot CLI.
