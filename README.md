# skeptic-agents

[![skills.sh](https://skills.sh/b/garbarok/skeptic-agents)](https://skills.sh/garbarok/skeptic-agents)

Two agent skills for work you'd rather not babysit. Several agents build or research in parallel, and before anything reaches you, another agent tries to prove the result wrong.

The verifier is told to fail when unsure. Each item's brief carries testable acceptance criteria and an out-of-scope list, and the verifier checks both: what was asked and missing, and what was done without being asked. A value the cited source doesn't state counts as a failure, and a passing test only counts if it was actually run. You approve the work list once, then review what survived.

## Skills

Both are **user-invoked**: they run only when you type their name, because each one starts several agents.

| Skill | What it does |
| --- | --- |
| [skeptic-build](skills/skeptic-build/SKILL.md) | Takes a batch of independent items (pages, components, migrations, fixes). Each one is researched, built on its own branch and git worktree, checked on two separate axes (correctness against the brief and its sources, and the standards your repo documents) plus any review lenses you pick, and fixed if something serious survives. Finished items land on an integration branch; an advisor ranks the batch; you merge. |
| [skeptic-research](skills/skeptic-research/SKILL.md) | Splits one question into four to six angles, at least one of them contrarian. One researcher per angle works without seeing the others; an advisor weighs what they found and writes one plan to a Markdown file. Every claim gets a URL and a date, or is marked as a hypothesis. |

## Installation

Pick **one** route per agent. The plugin is a read-only bundle; skills.sh copies files you own and can edit. Installing both gives you every skill twice.

<details>
<summary><strong>Claude Code</strong> (plugin)</summary>

```bash
claude plugin marketplace add garbarok/skeptic-agents
```

```bash
claude plugin install skeptic-agents@skeptic-agents
```

</details>

<details>
<summary><strong>Codex</strong> (plugin)</summary>

Codex reads `.claude-plugin/` when a repo has no `.codex-plugin/`.

```bash
codex plugin marketplace add garbarok/skeptic-agents
```

```bash
codex plugin add skeptic-agents@skeptic-agents
```

</details>

<details>
<summary><strong>GitHub Copilot CLI</strong> (plugin)</summary>

```bash
copilot plugin marketplace add garbarok/skeptic-agents
```

```bash
copilot plugin install skeptic-agents@skeptic-agents
```

</details>

<details>
<summary><strong>Any other agent</strong> (skills.sh: Cursor, OpenCode, Gemini CLI, Windsurf, Amp and more)</summary>

```bash
npx skills@latest add garbarok/skeptic-agents
```

Add `-a <agent>` to pick the agent and `-g` to install for every project. Update with `npx skills@latest update`.

</details>

## Usage

```text
/skeptic-build add a 404 page, a /uses page and an RSS feed to this site
```

The agent reads the repo and turns the request into items: each gets an id, a brief, its sources and its review lenses. It shows you the table and the files several items will touch (a sitemap, a registry), then waits for one yes. At the end you get a table of merged and held items, what stayed unverified, and the advisor's ranked advice. Held items keep their branch so you can fix them later.

```text
/skeptic-research which hosting options fit a static site with a contact form, under 10 EUR a month
```

The agent writes a context paragraph, picks the angles, runs them and saves the plan to a file it names. Nothing else in the repo changes.

## How it runs on your agent

Each skill picks the first mode your environment supports. The role instructions live in each skill's `roles/` folder, so all three modes use the same prompts.

| Mode | When | How |
| --- | --- | --- |
| A. Workflow | Claude Code with the Workflow tool | `workflow.js` runs the whole pipeline: items in parallel, one worktree each, the correctness, standards and lens reviews in parallel inside it. |
| B. Subagents | Any agent that can start subagents | The skill starts one subagent per role and step, passing each its role file. |
| C. Single agent | No subagents | The agent plays each role in turn, writes each step to a file and verifies from the files on disk, not from memory. |

Mode C is the weakest: one context that built something is checking its own work. Writing each step to disk and re-reading the sources reduces that, but it isn't the same as a fresh context.

## Models

The Workflow mode defaults to a fast model for research, a capable one to build, and the strongest for verification and advice (`haiku`, `sonnet`, `opus`, `opus`). Pass `models` in the workflow args to change them. In the other modes, the skill tells your agent to use its own fastest, capable and strongest models for the same roles.

## Limits

- **Items must be independent.** If one needs another's result, run them in order or merge them into one item.
- **Agents write both the code and the tests**, so they can agree on the wrong behaviour. The verifier re-derives from the sources to catch that, but it doesn't prove correctness. Read the "unverified" list before merging.
- **Instructions aren't permissions.** The verifier is told to work read-only, but if your agent gives it shell access, nothing technical stops a write.
- **It costs tokens.** A batch of N items makes at least 2N agent calls, more with research, lenses and fixes, plus one advisor call.
- **Nothing is pushed for you.** Merging and pushing follow your repo's rules and stay with you.

## Developing

```bash
scripts/link-skills.sh
```

This symlinks the skills into `~/.claude/skills` and `~/.agents/skills`, so your edits are live. `npm run check` checks the repo's invariants (see [AGENTS.md](AGENTS.md)).

## License

[MIT](LICENSE)
