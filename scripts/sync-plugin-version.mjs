#!/usr/bin/env node
// Copies package.json's version into .claude-plugin/plugin.json.
// With --check it writes nothing and exits 1 when the two differ.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const pluginPath = join(repo, ".claude-plugin", "plugin.json");
const { version } = JSON.parse(readFileSync(join(repo, "package.json"), "utf8"));
const source = readFileSync(pluginPath, "utf8");
const current = JSON.parse(source).version;

if (current === version) {
  console.log(`plugin.json version is ${version}`);
  process.exit(0);
}
if (process.argv.includes("--check")) {
  console.error(`plugin.json is ${current}, package.json is ${version}. Run npm run version:sync.`);
  process.exit(1);
}
// Replace only the version line so key order and formatting stay put.
writeFileSync(pluginPath, source.replace(/("version"\s*:\s*")[^"]*(")/, `$1${version}$2`));
console.log(`plugin.json ${current} -> ${version}`);
