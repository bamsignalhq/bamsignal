#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hqRoot = join(dirname(root), "stankings");
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

assert(read("src/utils/launchCommandCenterEngine.ts").includes("buildLiveLaunchCommandCenterBundle"), "launch command engine");
assert(read("src/constants/launchCommandCenter.ts").includes("launch-readiness"), "launch command sections");

const hqDoc = join(hqRoot, "docs/bamsignal/launch-day/PROGRAM-001-COMMAND-CENTER.md");
if (existsSync(hqDoc)) {
  const text = readFileSync(hqDoc, "utf8");
  assert(text.includes("ecosystem_platform_events"), "HQ doc cites event bus");
  assert(text.includes("30 seconds"), "HQ doc cites refresh interval");
} else {
  console.log("SKIP: HQ command center doc not at sibling path");
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("PASS: PROGRAM 001 Milestone 5 launch day command center (BamSignal)");
