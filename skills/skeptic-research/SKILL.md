---
name: skeptic-research
description: Research one question from several independent angles in parallel and get one sourced, ranked plan in a file.
disable-model-invocation: true
---

# Skeptic research

Several researchers look at one question from different sides, without seeing each other's work. An advisor then weighs their findings and writes one plan to a file. Nothing else in the repo changes.

The role instructions live in `roles/` next to this file: `researcher.md` and `advisor.md`.

## 1. Write the context

One paragraph on the project, its assets, its real numbers and the owner's constraints (time, money, what they will not do). Read the repo and anything the user has told you to get it right. The researchers see nothing else, so leave nothing out that changes the answer.

## 2. Pick the angles

Four to six independent angles, each `{ id, prompt }`, so each researcher looks from a different side: for example channels, real people who did it, automation, audience, contrarian bets. **At least one angle is contrarian**: it looks for why the obvious plan fails.

## 3. Choose the output path

A Markdown file in the user's language, where the repo already keeps such notes: match its existing folder and naming. If there is none, use `docs/research/<topic>-<YYYY-MM-DD>.md` and say so. No confirmation step: research changes nothing but this file.

## 4. Run it

Pick the first mode your environment supports.

### Mode A: Claude Code with the Workflow tool

Read both files in `roles/`, then call Workflow with `scriptPath` set to the absolute path of `workflow.js` in this skill's directory and:

```json
{
  "context": "<the paragraph from step 1>",
  "angles": [ { "id": "...", "prompt": "..." } ],
  "output": "<path from step 3>",
  "language": "<the user's language>",
  "roles": { "researcher": "<roles/researcher.md>", "advisor": "<roles/advisor.md>" }
}
```

Optional `"models": { "research": "sonnet", "advise": "opus" }` overrides the defaults shown.

### Mode B: an agent that can start subagents

Start one subagent per angle, in parallel when you can, each with the full text of `roles/researcher.md`, the context and its angle. When all have returned, start one subagent with `roles/advisor.md`, the context and every finding, and have it write the plan (structure in step 5) to the output path.

### Mode C: no subagents

Research each angle yourself, one at a time. Before each, re-read `roles/researcher.md` and the context, and keep to that angle. Save each angle's findings to `.skeptic-research/<id>.md` before starting the next, so one angle's conclusions don't leak into the next. Then act as the advisor over those files, write the plan, and delete `.skeptic-research/`.

## 5. Plan structure

1. The three things to start this week, with what agents can automate and the owner's minutes per week.
2. A ranked table of bets, split into safe and risky, each with expected effect, evidence (URL) or "hypothesis", risk, and the two-to-four-week test that decides whether to continue.
3. What to stop or not do, with reasons.
4. The patterns from real people most worth copying, with sources.
5. The metrics to watch weekly.

## 6. Check and report

Read the plan file. Check that its sources are linked and every number is sourced or marked as a hypothesis; fix what isn't. Give the user a short summary and the file path. Commit the file only if the user wants it in the repo.

Done when the plan file exists, you have checked it, and the user has the summary.
