---
name: skeptic-build
description: Build a batch of independent items with agents that research, implement, attack the result and fix it, then merge it yourself.
disable-model-invocation: true
---

# Skeptic build

A batch of independent work items goes through one pipeline per item, each on its own branch. The user approves the work list once and stays out of the loop until the merge. Nothing is pushed or merged without them.

Per item: **research → implement → verify → fix**. Verification always runs two separate axes, plus any lenses you add:

- **Correctness**: does the work do what the brief and its sources say, and nothing else?
- **Standards**: does it follow the rules this repo documents?

A change can pass one and fail the other, so the axes are reported side by side, never merged into one score. Then one **advisor** pass over the whole batch.

The role instructions live in `roles/` next to this file: `researcher.md`, `implementer.md`, `verifier.md`, `advisor.md`. Every mode below uses them.

## 1. Scout the work-list

Turn the request into **items**. Each item is independent of the others (no item needs another's result) and has:

- `id`: short kebab-case, used for the branch `skeptic/<id>`.
- `title`.
- `brief`: the contract the implementer and the verifier both work from. An implementer who has seen nothing else must be able to finish from it. It has four parts:
  - **Desired behaviour**: what is true when the item is done, including edge cases and error states. Describe behaviour, not steps: "the RSS feed lists the 20 newest posts, newest first", not "add a loop in feed.ts".
  - **Acceptance criteria**: a short list, each one checkable on its own by running something or reading the result. "Works correctly" is not a criterion.
  - **Out of scope**: what must not change, and the adjacent work that might look related but belongs elsewhere.
  - **Reference**: the existing code to copy the structure from, named by its type or function rather than a line number.
- `sources`: where the facts come from (official docs, APIs, files in the repo), or `"repo only"`.
- `lenses`: zero to two extra review lenses, each `{ name, prompt }` (for example accessibility, performance, SEO, copy style). Correctness and standards always run; don't add them as lenses.

Also collect, once for the whole batch:

- The **fast checks** that must pass, joined with `&&` (lint, type-check, unit tests; not the full build).
- The **standards files**: every file that documents how code is written here. `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md` and `CODING_STANDARDS.md` are on the list whenever they exist; add linter configs only for rules the linter doesn't already enforce.
- The **shared files** several items will touch (sitemap, registries, changelogs).

Done when every item has those fields and you have the three batch lists.

## 2. Confirm once

Show the item table (id, title, acceptance criteria, sources, lenses) and the shared files, and get one yes. Skip this when the user already approved the list in this conversation.

## 3. Preflight

Before starting any agent, on the branch the items will start from:

1. The working tree is clean (`git status --porcelain` prints nothing). Worktrees branch from the last commit, so uncommitted work would be missing from every item.
2. The fast checks pass. If they already fail here, every item would fail for the same reason: stop and tell the user.
3. Create the **integration branch** `skeptic/batch-<YYYY-MM-DD>` from that commit. Finished items merge here, not into the main branch.

A failure in this step costs one command. The same failure found inside six parallel agents costs six.

## 4. Run the pipeline

Pick the first mode your environment supports.

### Mode A: Claude Code with the Workflow tool

Read the four files in `roles/`, then call Workflow with `scriptPath` set to the absolute path of `workflow.js` in this skill's directory and these `args`. If Workflow refuses that path because it sits outside the session's directories, pass the file's contents as `script` instead.

```json
{
  "base": "skeptic/batch-<YYYY-MM-DD>",
  "checks": "<fast checks joined with &&>",
  "standards": ["AGENTS.md", "CONTRIBUTING.md"],
  "rules": "<one paragraph of repo rules every agent must follow: language, commit style, no invented figures>",
  "roles": { "researcher": "<roles/researcher.md>", "implementer": "<roles/implementer.md>", "verifier": "<roles/verifier.md>", "advisor": "<roles/advisor.md>" },
  "items": [ { "id": "...", "title": "...", "brief": "...", "sources": "...", "lenses": [ { "name": "...", "prompt": "..." } ] } ]
}
```

Optional `"models": { "research": "haiku", "build": "sonnet", "verify": "opus", "advise": "opus" }` overrides the defaults shown. Each item's implementer creates its own worktree next to the repo (`<repo>-skeptic-<id>`) from `base` with `git worktree add`, so your checkout and its branch stay as they are. Its first step links the main checkout's installed dependencies (`node_modules`, `.venv`, `vendor`) instead of installing them, so a large batch costs a few MB of disk per item; it installs only when the item itself changes a dependency, after removing the link so the main checkout's copy is never touched. The script does not use the Workflow tool's worktree isolation, which refuses repos where `.claude` is a symlink. It runs correctness, standards and the lenses in parallel inside that worktree, read-only, only calls the fixer when a blocker or major finding survives, and then removes the worktree, whatever the outcome: the branch keeps the work. While it runs, keep working on other things; the completion notice brings you back.

### Mode B: an agent that can start subagents

Keep your own context for coordinating. Every piece of work happens in a subagent, in the background when your agent supports it.

Talk to subagents through **pointers**, not pasted content: the researcher saves its notes to `.skeptic/<id>/research.md` and the implementer is given that path; verifiers are given the worktree path and the brief, not a summary of the build. Each subagent also gets the full text of its role file.

For each item:

1. **Researcher** (skip when sources are `"repo only"`): writes facts with URLs and an `unverified` list to `.skeptic/<id>/research.md`.
2. **Implementer**: creates a worktree for branch `skeptic/<id>` from the integration branch (`git worktree add ../<repo>-skeptic-<id> -b skeptic/<id> skeptic/batch-<date>`), symlinks the main checkout's installed dependency directories (`node_modules`, `.venv`, `vendor`) into it instead of installing, builds there, runs the fast checks, commits. Returns branch, commit, worktree path and what stayed unverified.
3. **Verifiers**, in parallel, all read-only in that worktree: one for correctness, one for standards (give it the standards files), one per lens. Each returns `pass` or `fail` with issues.
4. **Implementer** again, only if a blocker or major issue survives, to fix in the same worktree.
5. **Clean up**, always, whatever the outcome: commit anything left uncommitted on the item's branch, then `git worktree remove --force` the worktree and `git worktree prune`. The branch keeps the work; worktrees never outlive their item.

Run items in parallel when your agent allows it. Start an item's verifiers as soon as its build finishes; don't wait for the other items. After all items, start one **advisor** subagent with the results table.

Use your fastest model for research, a capable one to build, and your strongest for verification and advice.

### Mode C: no subagents

Run the same steps yourself, one item at a time, one role at a time. Before each step, re-read that role's file and act only as that role. For each verify step (correctness, standards, each lens), start again from the brief and the sources, not from your memory of building it: re-read the files on disk and run the checks. Write each step's output to `.skeptic/<id>/<step>.md` so later steps read the record, not your recollection. Delete the `.skeptic/<id>/` folders after the merge; keep `.skeptic/batches/`.

## 5. Merge and report

Worktrees are scratch space. None is left on disk when this step ends: not for merged items, not for held ones, not the one you use for the integration branch.

1. Wait for the pipeline's completion notice before reading any item's state: branches still change while agents commit, so a mid-run `git log` is a stale reading. Then write the **batch record** `.skeptic/batches/<YYYY-MM-DD>.json` with, per item: id, branch, its commits in order (build and fix), whether a fix ran, each axis verdict, and what stayed unverified. Branches are deleted in step 5, so this file is what later work (an article, a PR description, a retro) cites about the batch, never live branches.
2. Merge each item that finished with checks passing and no blocker or major issue left into the integration branch, one at a time. Resolve conflicts in the shared files by keeping every item's addition.
3. Run the repo's full checks once on the integration branch, production build included. If you need a checkout of it, make a temporary worktree and remove it as soon as the merge to the main branch lands. A failure is yours to fix there, before anything reaches the main branch.
4. Bring the integration branch into the main branch following the repo's and the user's rules (pull request, or a merge to the main branch, hooks). Never push without the user's rules allowing it.
5. Once that lands, clean up: `git worktree remove --force` every worktree this batch created (items and integration, merged or held), `git worktree prune`, and `git branch -D` every merged `skeptic/*` branch, the integration branch included. Held items keep only their branch; reopen a worktree from it when you pick the item up again. Check `git worktree list` shows none left.
6. Report to the user, from the batch record: a table of items (merged or held, and why) with the correctness and standards verdicts in separate columns, what stayed unverified, the advisor's ranked advice and the follow-ups. Don't rerank findings across axes into one list.

Done when every item is either merged or held with its reason and branch named, and `git worktree list` shows no worktree from this batch.
