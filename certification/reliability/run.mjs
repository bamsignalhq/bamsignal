#!/usr/bin/env node
/**
 * Reliability Certification™ — failure survival gate.
 *
 * Usage: npm run certify:reliability
 * Simulates dependency outages and verifies graceful degradation.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.mjs";
import { runAllReliabilitySimulations, buildRecommendations } from "./lib/simulations.mjs";
import { buildReliabilityScore, evaluateReleaseGate, summarizeRecovery } from "./lib/score.mjs";
import { writeReliabilityReports } from "./lib/report.mjs";
import { resolveCertificationProfile } from "../../shared/certificationProfile.mjs";
import { certificationExitCode } from "../../shared/certificationRunner.mjs";
import { loadCertificationEnvironment } from "../../shared/loadCertificationEnv.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(rootPath, config.outputDir);

async function main() {
  loadCertificationEnvironment();
  const profile = resolveCertificationProfile(process.env);

  console.log("\n=== Reliability Certification™ ===\n");
  console.log(`Run ID: ${config.runId}`);
  console.log(`Profile: ${profile.toUpperCase()}\n`);

  const scenarios = await runAllReliabilitySimulations();
  const recovery = summarizeRecovery(scenarios);
  const reliabilityScore = buildReliabilityScore(scenarios);
  const passed = evaluateReleaseGate(scenarios);
  const recommendations = buildRecommendations(scenarios);

  const report = {
    runId: config.runId,
    generatedAt: new Date().toISOString(),
    certificationProfile: profile,
    reliabilityScore,
    passed,
    status: passed ? "passed" : "failed",
    recoveryTimeMs: {
      average: recovery.average,
      max: recovery.max
    },
    recoverySuccess: recovery.recoverySuccess,
    recoveryFailures: recovery.recoveryFailures,
    scenarios,
    recommendations,
    source: "cli"
  };

  const paths = writeReliabilityReports(outputDir, report);

  console.log(`Reliability score: ${reliabilityScore}%`);
  console.log(
    `Recovery — success: ${recovery.recoverySuccess}/${scenarios.length}, avg: ${recovery.average ?? "—"}ms, max: ${recovery.max ?? "—"}ms`
  );
  console.log(`Release gate: ${passed ? "PASS" : "BLOCKED"}`);
  console.log(`Report: ${paths.jsonPath}\n`);

  if (!passed) {
    console.error("Reliability certification FAILED — platform must survive simulated failures.\n");
    for (const failure of recovery.recoveryFailures) {
      console.error(`  • ${failure}`);
    }
    process.exit(certificationExitCode(report, profile));
  }

  console.log("Reliability certification PASSED.\n");
}

main().catch((error) => {
  console.error("Reliability certification crashed:", error);
  process.exit(1);
});
