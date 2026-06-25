#!/usr/bin/env node
/**
 * Run every npm test:* script for launch certification (excluding meta runners).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(join(rootPath, "package.json"), "utf8"));

const skip = new Set([
  "test:certification-suite",
  "test:founder-acceptance",
  "test:fortress",
  "test:all-integrity",
  "test:docker-integrity-stages"
]);

const scripts = Object.keys(packageJson.scripts)
  .filter((name) => name.startsWith("test:") && !skip.has(name))
  .sort();

let failed = 0;
const results = [];

for (const script of scripts) {
  const started = Date.now();
  const result = spawnSync("npm", ["run", script], {
    cwd: rootPath,
    stdio: "pipe",
    env: process.env
  });
  const elapsed = Date.now() - started;
  const ok = result.status === 0;
  if (!ok) failed += 1;
  results.push({ script, ok, elapsed, stderr: result.stderr?.toString() || "" });
  console.log(`${ok ? "PASS" : "FAIL"} ${script} (${elapsed}ms)`);
  if (!ok && result.stderr) {
    console.error(result.stderr.toString().slice(0, 500));
  }
}

console.log(`\nCertification suite: ${scripts.length - failed}/${scripts.length} passed.`);

if (failed > 0) {
  console.error("\nFailed scripts:");
  for (const item of results.filter((entry) => !entry.ok)) {
    console.error(`  - ${item.script}`);
  }
  process.exit(1);
}
