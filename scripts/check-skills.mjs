#!/usr/bin/env node
// Checks the invariants in AGENTS.md: every skill folder is listed in
// plugin.json and the README, has a matching name, an agents/openai.yaml whose
// invocation policy matches the SKILL.md, every roles/ file it cites exists,
// and no prose uses an em-dash.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("..", import.meta.url));
const plugin = JSON.parse(readFileSync(join(repo, ".claude-plugin/plugin.json"), "utf8"));
const readme = readFileSync(join(repo, "README.md"), "utf8");
const errors = [];

const skills = readdirSync(join(repo, "skills"), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
for (const name of skills) {
  const dir = join(repo, "skills", name);
  const md = readFileSync(join(dir, "SKILL.md"), "utf8");
  const front = md.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  if (!new RegExp(`^name: ${name}$`, "m").test(front)) errors.push(`${name}: frontmatter name does not match the folder`);
  if (!/^description: .+/m.test(front)) errors.push(`${name}: missing description`);
  if (!plugin.skills.includes(`./skills/${name}`)) errors.push(`${name}: missing from .claude-plugin/plugin.json`);
  if (!readme.includes(`skills/${name}/SKILL.md`)) errors.push(`${name}: README does not link skills/${name}/SKILL.md`);
  const yamlPath = join(dir, "agents/openai.yaml");
  if (!existsSync(yamlPath)) errors.push(`${name}: missing agents/openai.yaml`);
  else {
    const userInvoked = /^disable-model-invocation: true$/m.test(front);
    const noImplicit = /allow_implicit_invocation: false/.test(readFileSync(yamlPath, "utf8"));
    if (userInvoked !== noImplicit) errors.push(`${name}: disable-model-invocation and openai.yaml policy disagree`);
  }
  for (const [, file] of md.matchAll(/roles\/([a-z-]+\.md)/g)) {
    if (!existsSync(join(dir, "roles", file))) errors.push(`${name}: cites roles/${file}, which does not exist`);
  }
}
for (const path of plugin.skills) {
  if (!existsSync(join(repo, path, "SKILL.md"))) errors.push(`plugin.json lists ${path}, which has no SKILL.md`);
}

const prose = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
  if (d.name.startsWith(".git") || d.name === "node_modules") return [];
  const p = join(dir, d.name);
  return d.isDirectory() ? prose(p) : /\.(md|js|mjs|json|yaml|sh)$/.test(d.name) ? [p] : [];
});
for (const file of prose(repo)) {
  if (readFileSync(file, "utf8").includes(String.fromCharCode(0x2014))) errors.push(`${file.slice(repo.length)}: contains an em-dash`);
}

if (errors.length) {
  console.error(errors.map((e) => `- ${e}`).join("\n"));
  process.exit(1);
}
console.log(`${skills.length} skills ok`);
