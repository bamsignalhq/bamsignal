#!/usr/bin/env node
/**
 * Platform Load Certification™ — realistic member load gate.
 *
 * Usage: npm run certify:platform-load
 * Simulates weighted member journeys (login, browse, discover, signals, chats,
 * profile edits, notifications, payments, OTP) with think times — not API spam.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PLATFORM_LOAD_CERT_BRAND, PLATFORM_LOAD_DEFAULT_VIRTUAL_MEMBERS } from "../../shared/platformLoadCertification.mjs";
import { config } from "./config.mjs";
import { resolveLoadCertTarget } from "./lib/server.mjs";
import { simulatePlatformLoad } from "./lib/simulate.mjs";
import {
  buildLoadRecommendations,
  buildLoadScore,
  evaluateLoadGate,
  identifyBottlenecks
} from "./lib/score.mjs";
import { writePlatformLoadReports } from "./lib/report.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = join(rootPath, config.outputDir);

async function main() {
  console.log(`\n=== ${PLATFORM_LOAD_CERT_BRAND} ===\n`);
  console.log(`Run ID: ${config.runId}`);
  if (config.fast) {
    console.log("Mode: FAST (set LOAD_CERT_FAST=0 for full 1000-member run)\n");
  } else {
    console.log(`Virtual members: ${config.virtualMembers} (default ${PLATFORM_LOAD_DEFAULT_VIRTUAL_MEMBERS})\n`);
  }

  const target = await resolveLoadCertTarget(config);
  const baseUrl = target.baseUrl;
  console.log(`Target: ${baseUrl}${target.local ? " (local server)" : ""}`);
  console.log(`Concurrency: ${config.maxConcurrency}\n`);

  const simulation = await simulatePlatformLoad({
    baseUrl,
    virtualMembers: config.virtualMembers,
    maxConcurrency: config.maxConcurrency,
    timeoutMs: config.requestTimeoutMs,
    sampleReadyEveryMs: config.sampleReadyEveryMs,
    fast: config.fast
  });

  const bottlenecks = identifyBottlenecks(simulation);
  const loadScore = buildLoadScore(simulation, bottlenecks);
  const passed = evaluateLoadGate(bottlenecks);
  const recommendations = buildLoadRecommendations(bottlenecks, simulation);
  const failures = bottlenecks.filter((item) => item.critical).map((item) => item.detail);

  const report = {
    runId: config.runId,
    generatedAt: new Date().toISOString(),
    baseUrl,
    localServer: target.local,
    fast: config.fast,
    virtualMembers: config.virtualMembers,
    maxConcurrency: config.maxConcurrency,
    durationMs: simulation.durationMs,
    loadScore,
    passed,
    journeysPassed: simulation.journeysPassed,
    journeysFailed: simulation.journeysFailed,
    byType: simulation.byType,
    measurement: simulation.measurement,
    bottlenecks,
    recommendations,
    failures,
    source: "cli"
  };

  const paths = writePlatformLoadReports(outputDir, report);

  const m = simulation.measurement;
  console.log(`Load score: ${loadScore}%`);
  console.log(
    `Members: ${simulation.journeysPassed}/${config.virtualMembers} journeys OK · requests ${m.totalRequests} · failures ${m.failures} (${m.failureRatePercent}%)`
  );
  console.log(
    `Latency — API p95 ${m.api.p95}ms · health p95 ${m.health.p95}ms · /ready p95 ${m.database.p95}ms`
  );
  console.log(
    `Resources — CPU user ${m.cpu.userMs}ms · RAM peak ${m.ram.peakMb}MB · queue depth ${m.queueDepth.max}`
  );
  console.log(`Bottlenecks: ${bottlenecks.length}`);
  console.log(`Release gate: ${passed ? "PASS" : "BLOCKED"}`);
  console.log(`Report: ${paths.jsonPath}\n`);

  if (!passed) {
    console.error("Platform load certification FAILED — critical bottlenecks detected.\n");
    for (const failure of failures.slice(0, 12)) {
      console.error(`  • ${failure}`);
    }
    process.exit(1);
  }

  console.log("Platform load certification PASSED.\n");
}

main().catch((error) => {
  console.error("Platform load certification runner failed:", error);
  process.exit(1);
});
