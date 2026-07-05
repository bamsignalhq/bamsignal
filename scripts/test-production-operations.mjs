#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
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

for (const doc of [
  "docs/runbooks/wallet-recovery.md",
  "docs/runbooks/incident-response.md",
  "docs/runbooks/support-escalation.md"
]) {
  assert(existsSync(join(root, doc)), `exists ${doc}`);
}

assert(read("RUNBOOK.md").includes("runbooks"), "root RUNBOOK index");
assert(read("docs/runbooks/README.md").includes("wallet-recovery"), "runbooks README");

const hqManual = join(dirname(root), "stankings/docs/bamsignal/operations/PROGRAM-001-OPERATIONAL-MANUAL.md");
if (existsSync(hqManual)) {
  assert(readFileSync(hqManual, "utf8").includes("24/7"), "HQ operational manual");
} else {
  console.log("SKIP: HQ manual not at sibling path");
}

try {
  execSync("node scripts/test-runbooks.mjs", { cwd: root, stdio: "inherit" });
} catch {
  failed += 1;
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("PASS: PROGRAM 001 Milestone 3 production operations (BamSignal)");
