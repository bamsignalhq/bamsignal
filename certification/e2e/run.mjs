#!/usr/bin/env node
/**
 * Production End-to-End Certification™
 * Validates the complete member journey against the LIVE production environment.
 *
 * Required env:
 *   CERTIFICATION_BASE_URL (default https://bamsignal.com)
 *   DIAGNOSTICS_SECRET or CRON_SECRET
 *   DATABASE_URL
 *   CERTIFICATION_EMAIL_DOMAIN (default cert.bamsignal.com)
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config, assertCertificationEnv } from "./config.mjs";
import { createContext } from "./lib/context.mjs";
import { checkProductionReady } from "./lib/http.mjs";
import { launchCertBrowser, assertNoClientFaults } from "./lib/browser.mjs";
import { buildReport, writeReports } from "./lib/report.mjs";
import { scoreChecks } from "./lib/validators.mjs";
import { cleanupCertMember } from "./lib/cert-api.mjs";
import { certEmail } from "./config.mjs";

import scenario01 from "./scenarios/01-signup-onboarding.mjs";
import scenario02 from "./scenarios/02-discover-save.mjs";
import scenario03 from "./scenarios/03-signals.mjs";
import scenario04 from "./scenarios/04-chat.mjs";
import scenario05 from "./scenarios/05-premium.mjs";
import scenario06 from "./scenarios/06-trusted-member.mjs";
import scenario07 from "./scenarios/07-concierge.mjs";
import scenario08 from "./scenarios/08-report.mjs";
import scenario09 from "./scenarios/09-session-restore.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(rootPath, config.outputDir);
const scenarios = [
  scenario01,
  scenario02,
  scenario03,
  scenario04,
  scenario05,
  scenario06,
  scenario07,
  scenario08,
  scenario09
];

const startedAt = Date.now();
const results = [];
let browserHarness = null;
const globalChecks = [];

async function runScenario(module, ctx) {
  const started = Date.now();
  let checks = [];
  let error = null;
  let screenshot = null;

  try {
    const outcome = await module.run(ctx, {
      page: browserHarness.page,
      screenshot: async (label) => {
        if (!config.screenshotOnFailure) return null;
        return browserHarness.screenshot(label);
      }
    });
    checks = outcome.checks || [];
    await assertNoClientFaults(browserHarness.monitors, checks);
  } catch (err) {
    error = err?.message || String(err);
    if (config.screenshotOnFailure && browserHarness) {
      screenshot = await browserHarness.screenshot(`scenario-${module.id}-error`);
    }
    checks.push({
      layer: "ui",
      name: "scenario-execution",
      ok: false,
      detail: error
    });
  }

  const scored = scoreChecks(checks);
  const passed = !error && scored.score === 100;

  return {
    id: module.id,
    title: module.title,
    passed,
    durationMs: Date.now() - started,
    score: scored.score,
    checks,
    error,
    screenshot,
    logs: ctx.logs.slice()
  };
}

async function main() {
  console.log(`\n=== Production End-to-End Certification™ ===`);
  console.log(`Target: ${config.baseUrl}`);
  console.log(`Run ID: ${config.runId}\n`);

  assertCertificationEnv();

  const preflight = await checkProductionReady();
  globalChecks.push({
    layer: "api",
    name: "health-liveness",
    ok: preflight.healthOk,
    detail: JSON.stringify(preflight.health || {})
  });
  globalChecks.push({
    layer: "api",
    name: "ready-production",
    ok: preflight.readyOk,
    detail: JSON.stringify(preflight.ready || {})
  });

  if (!preflight.healthOk) {
    console.error("Production /health check failed — aborting certification.");
    process.exit(1);
  }

  browserHarness = await launchCertBrowser(outputDir);
  const ctx = createContext(config);

  for (const scenario of scenarios) {
    console.log(`\n--- Scenario ${scenario.id}: ${scenario.title} ---`);
    const result = await runScenario(scenario, ctx);
    results.push(result);
    console.log(`${result.passed ? "PASS" : "FAIL"} (${result.score}%) in ${(result.durationMs / 1000).toFixed(1)}s`);
    if (result.error) console.error(`  Error: ${result.error}`);
    if (!result.passed) {
      console.error("  Certification halted — fix failure before release approval.");
      break;
    }
  }

  await browserHarness.close();

  const finishedAt = Date.now();
  const report = buildReport({
    runId: config.runId,
    baseUrl: config.baseUrl,
    startedAt,
    finishedAt,
    scenarios: results,
    globalChecks
  });

  const paths = writeReports(report, outputDir);
  console.log(`\nReport JSON: ${paths.jsonPath}`);
  console.log(`Report Markdown: ${paths.mdPath}`);
  console.log(`Report HTML: ${paths.htmlPath}`);
  console.log(`\nOverall score: ${report.overallScore}%`);
  console.log(`Scenarios passed: ${report.scenariosPassed}/${report.scenariosTotal}`);
  console.log(`Duration: ${report.durationHuman}`);
  console.log(`Result: ${report.pass ? "PASS" : "FAIL"}\n`);

  if (process.env.CERTIFICATION_CLEANUP !== "false") {
    try {
      await cleanupCertMember(certEmail("a"));
      await cleanupCertMember(certEmail("b"));
      console.log("Certification test members cleaned up.");
    } catch (error) {
      console.warn("Cleanup warning:", error.message);
    }
  }

  process.exit(report.pass ? 0 : 1);
}

main().catch((error) => {
  console.error("Certification runner failed:", error);
  process.exit(1);
});
