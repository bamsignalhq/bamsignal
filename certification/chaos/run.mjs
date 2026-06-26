#!/usr/bin/env node
/**
 * Chaos Engineering Certification™ — controlled destruction gate.
 *
 * Usage: npm run certify:chaos
 * Simulates killing major subsystems and verifies graceful degradation.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CHAOS_CERT_BRAND } from "../../shared/chaosCertificationAttacks.mjs";
import { config } from "./config.mjs";
import { runAllChaosAttacks, buildChaosRecommendations } from "./lib/attacks.mjs";
import {
  buildChaosScore,
  buildCriticalWeaknesses,
  evaluateChaosGate,
  summarizeRecovery
} from "./lib/score.mjs";
import { writeChaosReports } from "./lib/report.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(rootPath, config.outputDir);

async function main() {
  console.log(`\n=== ${CHAOS_CERT_BRAND} ===\n`);
  console.log(`Run ID: ${config.runId}\n`);

  const attacks = await runAllChaosAttacks();
  const recovery = summarizeRecovery(attacks);
  const chaosScore = buildChaosScore(attacks);
  const criticalWeaknesses = buildCriticalWeaknesses(attacks);
  const passed = evaluateChaosGate(attacks);
  const recommendations = buildChaosRecommendations(attacks, criticalWeaknesses);
  const attacksPassed = attacks.filter((item) => item.passed).length;

  const failures = criticalWeaknesses
    .filter((item) => item.critical)
    .map((item) => `${item.label}: ${item.detail}`);

  const report = {
    runId: config.runId,
    generatedAt: new Date().toISOString(),
    chaosScore,
    passed,
    recoveryTimeMs: {
      average: recovery.average,
      max: recovery.max
    },
    recoverySuccess: recovery.recoverySuccess,
    attacksPassed,
    attacksFailed: attacks.length - attacksPassed,
    attacks,
    criticalWeaknesses,
    recommendations,
    failures,
    source: "cli"
  };

  const paths = writeChaosReports(outputDir, report);

  console.log(`Chaos score: ${chaosScore}%`);
  console.log(
    `Recovery — success: ${recovery.recoverySuccess}/${attacks.length}, avg: ${recovery.average ?? "—"}ms, max: ${recovery.max ?? "—"}ms`
  );
  console.log(`Critical weaknesses: ${criticalWeaknesses.length}`);
  console.log(`Release gate: ${passed ? "PASS" : "BLOCKED"}`);
  console.log(`Report: ${paths.jsonPath}\n`);

  if (!passed) {
    console.error("Chaos certification FAILED — critical subsystems did not survive attack.\n");
    for (const failure of failures.slice(0, 12)) {
      console.error(`  • ${failure}`);
    }
    process.exit(1);
  }

  console.log("Chaos certification PASSED.\n");
}

main().catch((error) => {
  console.error("Chaos certification runner failed:", error);
  process.exit(1);
});
