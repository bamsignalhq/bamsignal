#!/usr/bin/env node
/**
 * Migration certification — integrity guard without requiring database connectivity.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync, mkdirSync } from "node:fs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(rootPath, "certification/migrations/reports");

function main() {
  const started = Date.now();
  const verify = spawnSync("node", ["scripts/verify-migrations.mjs"], {
    cwd: rootPath,
    encoding: "utf8",
    env: process.env
  });

  const passed = verify.status === 0;
  const report = {
    suite: "migrations",
    status: passed ? "PASS" : "FAIL",
    passed,
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    stdout: verify.stdout || "",
    stderr: verify.stderr || ""
  };

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, "latest.json"), JSON.stringify(report, null, 2));

  if (!passed) {
    console.error(report.stderr || report.stdout || "Migration certification failed.");
    process.exit(1);
  }

  console.log("Migration certification PASS");
  process.exit(0);
}

main();
