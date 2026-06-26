#!/usr/bin/env node
/**
 * Production Penetration Certification™ — attacker simulation gate.
 *
 * Usage: npm run certify:production-penetration
 * Attempts authorization bypass, injection, abuse, and payment attacks.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PENETRATION_CERT_BRAND } from "../../shared/productionPenetrationCertification.mjs";
import { config } from "./config.mjs";
import { resolvePenetrationTarget } from "./lib/server.mjs";
import { runAllPenetrationAttacks, summarizeSeverities } from "./lib/attacks.mjs";
import {
  buildPenetrationFixes,
  buildPenetrationScore,
  buildResidualRisks,
  evaluatePenetrationGate
} from "./lib/score.mjs";
import { writePenetrationReports } from "./lib/report.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(rootPath, config.outputDir);

async function main() {
  console.log(`\n=== ${PENETRATION_CERT_BRAND} ===\n`);
  console.log(`Run ID: ${config.runId}\n`);

  const target = await resolvePenetrationTarget(config);
  console.log(`Target: ${target.baseUrl}${target.local ? " (local server)" : ""}\n`);

  const attacks = await runAllPenetrationAttacks({
    baseUrl: target.baseUrl,
    pinLoginBurst: config.pinLoginBurst,
    otpBurst: config.otpBurst
  });

  const counts = summarizeSeverities(attacks);
  const penetrationScore = buildPenetrationScore(attacks);
  const passed = evaluatePenetrationGate(attacks);
  const fixes = buildPenetrationFixes(attacks);
  const residualRisks = buildResidualRisks(attacks);
  const failures = attacks
    .filter((item) => item.exploited)
    .map((item) => `${item.label}: ${item.detail}`);

  const report = {
    runId: config.runId,
    generatedAt: new Date().toISOString(),
    baseUrl: target.baseUrl,
    localServer: target.local,
    penetrationScore,
    passed,
    counts,
    attacks,
    fixes,
    residualRisks,
    failures,
    source: "cli"
  };

  const paths = writePenetrationReports(outputDir, report);

  console.log(`Penetration score: ${penetrationScore}%`);
  console.log(`Attacks: ${counts.blocked}/${attacks.length} blocked · ${counts.exploited} exploited`);
  console.log(
    `Severity — critical: ${counts.critical}, high: ${counts.high}, medium: ${counts.medium}, low: ${counts.low}`
  );
  console.log(`Residual risks documented: ${residualRisks.length}`);
  console.log(`Release gate: ${passed ? "PASS" : "BLOCKED"}`);
  console.log(`Report: ${paths.jsonPath}\n`);

  if (!passed) {
    console.error("Production penetration certification FAILED — exploitable findings detected.\n");
    for (const failure of failures.slice(0, 12)) {
      console.error(`  • ${failure}`);
    }
    process.exit(1);
  }

  console.log("Production penetration certification PASSED.\n");
}

main().catch((error) => {
  console.error("Production penetration certification runner failed:", error);
  process.exit(1);
});
