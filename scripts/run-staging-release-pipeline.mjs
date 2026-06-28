#!/usr/bin/env node
/**
 * Canonical staging release pipeline — run in CI or dedicated release runner.
 *
 * Usage:
 *   CERTIFICATION_PROFILE=staging npm run certify:pipeline:staging
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCertificationEnvironment } from "../shared/loadCertificationEnv.mjs";
import { mergeExecutionContext } from "../shared/certificationProfile.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

const STAGING_PIPELINE = [
  { name: "build", command: "npm", args: ["run", "build"] },
  { name: "test-suite", command: "npm", args: ["test"] },
  { name: "security", command: "npm", args: ["run", "certify:security"] },
  { name: "reliability", command: "npm", args: ["run", "certify:reliability"] },
  { name: "performance", command: "npm", args: ["run", "certify:performance"] },
  { name: "platform-load", command: "npm", args: ["run", "certify:platform-load"] },
  { name: "data-integrity", command: "npm", args: ["run", "certify:data-integrity"] },
  { name: "database", command: "npm", args: ["run", "certify:database"] },
  { name: "drift", command: "npm", args: ["run", "certify:drift"] },
  { name: "rc-staging", command: "npm", args: ["run", "certify:rc:staging"] }
];

function runStep(step) {
  console.log(`\n=== Pipeline: ${step.name} ===\n`);
  const result = spawnSync(step.command, step.args, {
    cwd: rootPath,
    stdio: "inherit",
    env: {
      ...process.env,
      CERTIFICATION_PROFILE: "staging",
      CI: process.env.CI || "true"
    }
  });
  return result.status === 0;
}

function main() {
  loadCertificationEnvironment();
  process.env.CERTIFICATION_PROFILE = "staging";
  const context = mergeExecutionContext(process.env);

  console.log("\n=== BamSignal Staging Release Pipeline ===\n");
  console.log(`Profile: ${context.profile}`);
  console.log(`Playwright ready: ${context.prerequisites.playwright.ready}`);
  console.log(`Database configured: ${context.prerequisites.database}\n`);

  const results = [];
  for (const step of STAGING_PIPELINE) {
    const ok = runStep(step);
    results.push({ name: step.name, passed: ok });
    if (!ok) {
      console.error(`\nPipeline failed at step: ${step.name}\n`);
      process.exit(1);
    }
  }

  console.log("\nStaging release pipeline PASSED.\n");
  for (const item of results) {
    console.log(`  ✓ ${item.name}`);
  }
}

main();
