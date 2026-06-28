#!/usr/bin/env node
/**
 * Performance Certification™ — release performance gate.
 *
 * Usage: npm run certify:performance
 * Requires: npm run build (for bundle metrics), network access to target URL.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { config } from "./config.mjs";
import { measureBundle, readBuildId } from "./lib/measure-bundle.mjs";
import { measureApiLatency, measureDatabaseResponse } from "./lib/measure-api.mjs";
import { measureWebPerformance } from "./lib/measure-web.mjs";
import { appendSnapshot, loadHistory } from "./lib/history.mjs";
import { bundleGrowthPercent, evaluateMetrics } from "./lib/score.mjs";
import { writePerformanceReports } from "./lib/report.mjs";
import { resolvePerformanceCertTarget } from "./lib/server.mjs";
import {
  detectPlaywrightBrowsers,
  mergeExecutionContext,
  resolveCertificationProfile
} from "../../shared/certificationProfile.mjs";
import {
  buildSkippedCertReport,
  certificationExitCode
} from "../../shared/certificationRunner.mjs";
import { loadCertificationEnvironment } from "../../shared/loadCertificationEnv.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(rootPath, config.outputDir);
const distDir = join(rootPath, config.distDir);

async function main() {
  loadCertificationEnvironment();
  const profile = resolveCertificationProfile(process.env);
  const context = mergeExecutionContext(process.env);

  console.log("\n=== Performance Certification™ ===\n");
  console.log(`Target: ${config.baseUrl || `local (127.0.0.1:${config.port})`}`);
  console.log(`Profile: ${profile.toUpperCase()} — ${context.profileDescription}`);
  console.log(`Run ID: ${config.runId}\n`);

  if (!existsSync(distDir)) {
    console.error("dist/ not found — run npm run build first.");
    process.exit(1);
  }

  const playwright = detectPlaywrightBrowsers();
  if (!playwright.ready) {
    const skipped = buildSkippedCertReport({
      suite: "performance",
      requirement: "playwright_browsers",
      detail: playwright.reason || "Playwright Chromium is not installed.",
      extra: {
        runId: config.runId,
        performanceScore: 0,
        baseUrl: config.baseUrl || null
      }
    });
    const paths = writePerformanceReports(skipped, outputDir);
    console.log(`SKIPPED — ${skipped.skipDetail}`);
    console.log(`Report: ${paths.jsonPath}\n`);
    process.exit(certificationExitCode(skipped, profile));
  }

  const bundle = measureBundle(distDir);
  const buildId = readBuildId(distDir);
  const target = await resolvePerformanceCertTarget(config);
  console.log(`Measuring: ${target.baseUrl}${target.local ? " (local)" : ""}\n`);

  const api = await measureApiLatency(target.baseUrl);
  const database = await measureDatabaseResponse(target.baseUrl);
  const web = await measureWebPerformance(target.baseUrl, { headless: config.headless });

  const history = loadHistory(outputDir);
  const previousBundleKb =
    history[0]?.metrics?.find((item) => item.id === "bundle-size")?.value ?? null;
  const growth = bundleGrowthPercent(bundle.bundleSizeKb, previousBundleKb);

  const raw = {
    ...web,
    apiP95Ms: api.apiP95Ms,
    slowestEndpointMs: api.slowestEndpointMs,
    slowestEndpoint: api.slowestEndpoint,
    bundleSizeKb: bundle.bundleSizeKb,
    largestJsChunkKb: bundle.largestJsChunkKb,
    largestJsChunkName: bundle.largestJsChunkName,
    largestImageKb: bundle.largestImageKb,
    largestImageName: bundle.largestImageName,
    databaseResponseMs: database.databaseResponseMs
  };

  const scored = evaluateMetrics(raw, { bundleGrowthPercent: growth });

  const snapshot = {
    runId: config.runId,
    generatedAt: new Date().toISOString(),
    baseUrl: target.baseUrl,
    buildId,
    certificationProfile: profile,
    performanceScore: scored.score,
    passed: scored.passed,
    status: scored.passed ? "passed" : "failed",
    metrics: scored.metrics
  };

  const updatedHistory = appendSnapshot(outputDir, snapshot);

  const report = {
    ...snapshot,
    trend: "stable",
    regressions: [],
    recommendations: [],
    failures: scored.metrics.filter((item) => !item.passed).map((item) => `${item.label} failed`),
    comparisons: []
  };

  if (updatedHistory.length > 1) {
    const previous = updatedHistory[1];
    const prevScore = previous.performanceScore ?? 0;
    const delta = prevScore ? Math.round(((scored.score - prevScore) / prevScore) * 1000) / 10 : 0;
    report.trend = delta >= 3 ? "regressing" : delta <= -3 ? "improving" : "stable";
    report.comparisons = [
      { windowId: "previous-release", windowLabel: "Previous release", deltaPercent: delta, score: prevScore }
    ];

    for (const metric of scored.metrics) {
      const baseline = previous.metrics?.find((item) => item.id === metric.id);
      if (!baseline?.value || baseline.value === 0) continue;
      const regDelta = Math.round(((metric.value - baseline.value) / baseline.value) * 1000) / 10;
      if (regDelta > 10 && !metric.passed) {
        report.regressions.push({
          id: `reg_${metric.id}`,
          metricId: metric.id,
          title: `${metric.label} regressed`,
          deltaPercent: regDelta,
          compareWindow: "previous-release",
          detail: `${metric.value}${metric.unit} vs ${baseline.value}${metric.unit}`,
          severity: regDelta >= 20 ? "critical" : "warning"
        });
      }
    }
  }

  if (!scored.passed) {
    report.recommendations.push({
      id: "rec_fix_failures",
      title: "Fix failing metrics",
      detail: report.failures.join("; "),
      priority: "critical"
    });
  }

  const paths = writePerformanceReports(report, outputDir);

  console.log(`Score: ${scored.score}%`);
  console.log(`Result: ${scored.passed ? "PASS" : "FAIL"}`);
  console.log(`Report: ${paths.jsonPath}`);
  console.log(`Latest: ${paths.latestPath}\n`);

  for (const metric of scored.metrics) {
    console.log(`${metric.passed ? "PASS" : "FAIL"} ${metric.label}: ${metric.value}${metric.unit}`);
  }

  process.exit(certificationExitCode(report, profile));
}

main().catch((error) => {
  const profile = resolveCertificationProfile(process.env);
  if (
    profile === "local" &&
    /playwright|Executable doesn't exist|browserType.launch/i.test(String(error?.message || error))
  ) {
    console.error("Performance certification skipped — Playwright unavailable on local profile.");
    process.exit(0);
  }
  console.error("Performance certification failed:", error);
  process.exit(1);
});
