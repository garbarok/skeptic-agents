# AGENTS.md

Agent skills distributed three ways from one tree: skills.sh (`npx skills add`), the Claude Code / Codex / Copilot plugin (`.claude-plugin/`), and local symlinks for development (`scripts/link-skills.sh`).

## Layout

- One flat folder per skill: `skills/<name>/`. No buckets: skills.sh, Gemini and the plugin manifests all read this layout without extra paths.
- Each skill folder holds `SKILL.md`, `roles/*.md` (the prompt for each agent role), `agents/openai.yaml` (Codex UI metadata) and, when it has a Claude Code Workflow mode, `workflow.js`.
- A skill is self-contained. Installers copy only the skill folder, so nothing in a skill may point outside it. Shared material is duplicated on purpose rather than linked across folders.

## Invariants

`npm run check` enforces the first five.

1. Every skill folder appears in `.claude-plugin/plugin.json`'s `skills` array and is linked from `README.md` as `skills/<name>/SKILL.md`.
2. The frontmatter `name` matches the folder name.
3. Every skill is user-invoked or model-invoked in both harnesses at once: `disable-model-invocation: true` in `SKILL.md` goes with `policy.allow_implicit_invocation: false` in `agents/openai.yaml`, and neither or both. A user-invoked skill's `description` is one human-facing line; a model-invoked one keeps its trigger phrasing ("Use when...").
4. Every `roles/<file>.md` a `SKILL.md` cites exists.
5. No em-dashes anywhere. Rewrite the sentence with a comma, colon, period or parentheses instead of swapping the character.
6. `version` in `.claude-plugin/plugin.json` equals `package.json`. Bump `package.json`, run `npm run version:sync`, and add a `CHANGELOG.md` entry in the same commit. Plugin installs only update when this version changes.
7. Every mode of a skill uses the same role files. When you change what a role does, change its `roles/*.md`, not the workflow prompt. `workflow.js` reads the roles from its `args`.
8. Nothing personal: no names, projects, employers or paths from anyone's machine in skills, examples or docs. Examples stay generic (a 404 page, an RSS feed, a hosting comparison).

## Checks before committing

```bash
npm run check
```

```bash
claude plugin validate . --strict
```

Run the second one whenever `.claude-plugin/` changes.
