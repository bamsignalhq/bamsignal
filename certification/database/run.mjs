#!/usr/bin/env node
/**
 * Database Performance Certification™ — database efficiency gate.
 *
 * Usage: npm run certify:database
 * Blocks release when critical query regressions or critical issues exist.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.mjs";
import { detectQueryRegressions, runDatabasePerformanceChecks } from "./lib/checks.mjs";
import { measureDatabasePerformance, runStaticPerformanceChecks } from "./lib/measure.mjs";
import { buildRecommendations } from "./lib/recommendations.mjs";
import {
  buildCertificationSummary,
  buildRiskScore,
  evaluateReleaseGate,
  summarizeAreas
} from "./lib/score.mjs";
import { writeDatabasePerformanceReports } from "./lib/report.mjs";
import { initDatabase, isDatabaseReady, pool } from "../../server/db.js";
import {
  certificationModeDescription,
  resolveCertificationExecutionMode
} from "../../shared/certificationEnvironment.mjs";
import { loadCertificationEnvironment } from "../../shared/loadCertificationEnv.mjs";

loadCertificationEnvironment();

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(rootPath, config.outputDir);

function loadPreviousReport() {
  const latestPath = join(outputDir, "latest.json");
  if (!existsSync(latestPath)) return null;
  try {
    return JSON.parse(readFileSync(latestPath, "utf8"));
  } catch {
    return null;
  }
}

async function main() {
  console.log("\n=== Database Performance Certification™ ===\n");
  console.log(`Run ID: ${config.runId}\n`);

  const executionMode = resolveCertificationExecutionMode(process.env);
  console.log(`Execution mode: ${executionMode} — ${certificationModeDescription(executionMode)}\n`);

  const previousReport = loadPreviousReport();
  const staticScan = await runStaticPerformanceChecks();

  let areas = [];
  let mode = "static";
  let metrics = {
    avgQueryMs: 0,
    p95Ms: 0,
    p99Ms: 0,
    slowQueryCount: 0,
    cacheHitPercent: 0,
    connectionPoolUsedPercent: 0,
    connectionPoolWaiting: 0,
    databaseSizeBytes: 0,
    largestTables: [],
    largestIndexes: [],
    expensiveEndpoints: [],
    queryPlanSamples: []
  };

  await initDatabase();

  if (isDatabaseReady() && pool) {
    mode = "database";
    metrics = await measureDatabasePerformance(pool);
    areas = await runDatabasePerformanceChecks(pool, metrics);
  } else {
    console.warn("Database not connected — running static performance checks only.\n");
    const failedStatic = staticScan.checks.filter((item) => !item.pass);
    areas = [
      {
        id: "schema",
        label: "Schema",
        objectsScanned: staticScan.objectsScanned,
        criticalIssues: failedStatic
          .filter((item) => item.critical)
          .map((item) => ({
            id: item.id,
            areaId: "schema",
            title: item.title,
            detail: item.detail,
            severity: "critical",
            count: 1
          })),
        warnings: [
          ...failedStatic
            .filter((item) => !item.critical)
            .map((item) => ({
              id: item.id,
              areaId: "schema",
              title: item.title,
              detail: item.detail,
              severity: "warning",
              count: 1
            })),
          {
            id: "db-unavailable",
            areaId: "schema",
            title: "Live database scan skipped",
            detail:
              executionMode === "dry-run"
                ? "Dry Run — DATABASE_URL not connected. Use .env.staging + .env.local for full database certification."
                : "DATABASE_URL not connected — run against staging/production for full certification.",
            severity: "warning",
            optionalIntegration: true,
            count: 1
          }
        ],
        passed: failedStatic.filter((item) => item.critical).length === 0
      }
    ];
  }

  const criticalRegressions =
    mode === "database" ? detectQueryRegressions(metrics, previousReport) : [];

  const summary = buildCertificationSummary(areas, metrics, criticalRegressions);
  const totals = summarizeAreas(areas);
  let riskScore = buildRiskScore(areas, metrics, criticalRegressions);
  if (executionMode === "dry-run" && mode === "static") {
    const failedCritical = areas.some((area) => (area.criticalIssues || []).length > 0);
    if (!failedCritical) riskScore = 100;
  }
  const passed = evaluateReleaseGate(criticalRegressions, summary.criticalIssues);
  const recommendations = buildRecommendations(
    summary.opportunities,
    summary.criticalIssues,
    summary.warnings
  );

  const report = {
    runId: config.runId,
    generatedAt: new Date().toISOString(),
    executionMode,
    mode,
    riskScore,
    passed,
    objectsScanned: totals.objectsScanned,
    areasPassed: totals.areasPassed,
    areas,
    metrics,
    criticalRegressions,
    criticalIssues: summary.criticalIssues,
    warnings: summary.warnings,
    optimizationOpportunities: summary.opportunities,
    recommendations,
    staticScan,
    source: "cli"
  };

  const paths = writeDatabasePerformanceReports(outputDir, report);

  console.log(`Mode: ${mode} (${executionMode})`);
  console.log(`Risk score: ${riskScore}%`);
  console.log(
    `Latency — avg: ${metrics.avgQueryMs}ms · p95: ${metrics.p95Ms}ms · p99: ${metrics.p99Ms}ms`
  );
  console.log(
    `Scanned: ${totals.objectsScanned} areas · passed: ${totals.areasPassed}/${areas.length}`
  );
  console.log(
    `Regressions: ${criticalRegressions.length} · Critical: ${summary.criticalIssues.length} · Warnings: ${summary.warnings.length}`
  );
  console.log(`Opportunities: ${summary.opportunities.length}`);
  console.log(`Release gate: ${passed ? "PASS" : "BLOCKED"}`);
  console.log(`Report: ${paths.jsonPath}\n`);

  if (!passed) {
    console.error("Database performance certification FAILED — resolve critical regressions/issues.\n");
    for (const item of [...criticalRegressions, ...summary.criticalIssues].slice(0, 10)) {
      console.error(`  • ${item.title}: ${item.detail}`);
    }
    process.exit(1);
  }

  console.log("Database performance certification PASSED.\n");
}

main().catch((error) => {
  console.error("Database performance certification crashed:", error);
  process.exit(1);
});
