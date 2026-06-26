#!/usr/bin/env node
/**
 * P0 Production Environment Audit — scan, report, verify startup/health alignment.
 *
 * Usage: npm run audit:production-environment
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCertificationEnvironment } from "../shared/loadCertificationEnv.mjs";
import {
  buildProductionEnvironmentAuditReport,
  buildStartupHealthVerification,
  renderCleanupReportMarkdown,
  renderUsageReportMarkdown
} from "../shared/productionEnvironmentAuditScan.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs/operations/environment");

async function verifyStartupAndHealth() {
  loadCertificationEnvironment();
  const { config } = await import("../server/config.js");
  const { readinessPayload } = await import("../server/services/readiness.js");
  const readiness = await readinessPayload({ detailed: true });
  const verification = buildStartupHealthVerification(readiness);

  return {
    configSnapshot: {
      hasDatabaseUrl: Boolean(config.databaseUrl),
      hasPaystackSecret: Boolean(config.paystackSecretKey),
      publicAppUrl: config.publicAppUrl,
      port: config.port,
      host: config.host
    },
    readiness: {
      ready: readiness.ready,
      database: readiness.database,
      paystack: readiness.paystack,
      signupEmail: readiness.signupEmail,
      photoStorage: readiness.photoStorage,
      resend: readiness.resend
    },
    verification
  };
}

async function main() {
  console.log("\n=== P0 Production Environment Audit ===\n");

  const report = buildProductionEnvironmentAuditReport(root);
  let startupHealth = null;

  try {
    startupHealth = await verifyStartupAndHealth();
    report.startupHealth = startupHealth;
  } catch (error) {
    report.startupHealth = {
      error: error instanceof Error ? error.message : String(error)
    };
  }

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "environment-usage-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(join(outDir, "environment-usage-report.md"), renderUsageReportMarkdown(report), "utf8");
  writeFileSync(
    join(outDir, "environment-cleanup-report.json"),
    `${JSON.stringify({ generatedAt: report.generatedAt, cleanup: report.cleanup, duplicateAnalysis: report.duplicateAnalysis, startupHealth: report.startupHealth }, null, 2)}\n`,
    "utf8"
  );
  writeFileSync(join(outDir, "environment-cleanup-report.md"), renderCleanupReportMarkdown(report), "utf8");

  console.log(`Scanned ${report.scannedFiles} files · ${report.uniqueVariables} variables`);
  console.log(`Undocumented: ${report.summary.missingFromRegistry.length}`);
  console.log(`Unused registry: ${report.summary.unusedInCode.length}`);
  console.log(`Legacy in code: ${report.summary.legacyVariables.length}`);
  console.log(`Duplicate groups with risk: ${report.duplicateAnalysis.filter((g) => g.referenced.length > 1).length}`);

  if (startupHealth?.verification) {
    console.log(`Startup/health verification: ${startupHealth.verification.allOk ? "PASS" : "WARN"}`);
    console.log(
      `  database=${startupHealth.readiness.database} paystack=${startupHealth.readiness.paystack} signupEmail=${startupHealth.readiness.signupEmail} photoStorage=${startupHealth.readiness.photoStorage}`
    );
  }

  console.log(`\nReports:`);
  console.log(`  docs/operations/environment/environment-usage-report.md`);
  console.log(`  docs/operations/environment/environment-cleanup-report.md\n`);

  if (report.summary.missingFromRegistry.length > 0) {
    console.log("Undocumented variables (add to shared/environmentRegistry.mjs):");
    for (const name of report.summary.missingFromRegistry.slice(0, 20)) {
      console.log(`  - ${name}`);
    }
    console.log("");
  }
}

main().catch((error) => {
  console.error("Production environment audit failed:", error);
  process.exit(1);
});
