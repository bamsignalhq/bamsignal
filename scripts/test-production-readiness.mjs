#!/usr/bin/env node
/**
 * Sprint 7 — Production readiness tests.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  runSecurityAudit,
  runPerformanceAudit,
  runResilienceAudit,
  runDeploymentAudit,
  runObservabilityAudit,
  runRateLimitAudit,
  runDisasterRecoveryAudit,
  buildLoadTestPlan,
  buildProductionReadinessReport,
  DISASTER_RECOVERY_CHECKLIST,
  LOAD_TEST_SCENARIOS
} from "../server/services/productionReadiness/index.js";
import { PRODUCTION_CERT_VERSION } from "../shared/productionCertification.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(rel) {
  return readFileSync(join(rootPath, rel), "utf8");
}

assert(existsSync(join(rootPath, "server/services/productionReadiness/index.js")), "production readiness module");
assert(read("server/services/productionReadiness/securityAudit.js").includes("runSecurityAudit"), "security audit");
assert(read("server/services/productionReadiness/performanceAudit.js").includes("PERFORMANCE_THRESHOLDS"), "performance audit");
assert(read("server/services/productionReadiness/resilienceAudit.js").includes("runResilienceAudit"), "resilience audit");
assert(read("server/services/productionReadiness/deploymentAudit.js").includes("runDeploymentAudit"), "deployment audit");
assert(read("server/services/productionReadiness/observabilityAudit.js").includes("runObservabilityAudit"), "observability audit");
assert(read("server/services/productionReadiness/rateLimitAudit.js").includes("runRateLimitAudit"), "rate limit audit");
assert(read("server/services/productionReadiness/disasterRecovery.js").includes("DISASTER_RECOVERY_CHECKLIST"), "DR checklist");
assert(read("server/services/productionReadiness/loadTestPlan.js").includes("LOAD_TEST_SCENARIOS"), "load test plan");

assert(DISASTER_RECOVERY_CHECKLIST.length >= 6, "DR checklist items");
assert(LOAD_TEST_SCENARIOS.length >= 6, "load test scenarios");

const security = runSecurityAudit({ NODE_ENV: "development" });
assert(security.findings.length >= 5, "security findings");

const performance = runPerformanceAudit();
assert(performance.thresholds.startupMaxMs > 0, "performance thresholds");

const resilience = runResilienceAudit();
assert(resilience.findings.length >= 6, "resilience findings");

const deployment = runDeploymentAudit();
assert(deployment.findings.some((f) => f.name === "health_endpoint"), "health endpoint check");

const observability = runObservabilityAudit();
assert(observability.checks.length >= 6, "observability checks");

const rateLimit = runRateLimitAudit();
assert(rateLimit.findings.length >= 5, "rate limit findings");

const dr = runDisasterRecoveryAudit();
assert(dr.checklist.length >= 6, "DR audit checklist");

const loadPlan = buildLoadTestPlan();
assert(loadPlan.scenarios.length >= 6, "load plan scenarios");

const report = await buildProductionReadinessReport({ NODE_ENV: "development" });
assert(report.domains.security, "readiness report security domain");
assert(report.loadTestPlan, "readiness report includes load plan");

assert(existsSync(join(rootPath, "scripts/certify-production-journeys.mjs")), "production journeys cert");

for (const doc of [
  "docs/operations/PRODUCTION_READINESS.md",
  "docs/operations/DISASTER_RECOVERY.md",
  "docs/operations/DEPLOYMENT_GUIDE.md",
  "docs/operations/SECURITY_CHECKLIST.md",
  "docs/operations/PERFORMANCE_BASELINE.md"
]) {
  assert(existsSync(join(rootPath, doc)), `${doc} exists`);
}

assert(PRODUCTION_CERT_VERSION === "1.7.0", "certification version for Sprint 7");

const certRun = read("certification/production/run.mjs");
assert(certRun.includes("test:production-readiness"), "production cert includes readiness tests");
assert(certRun.includes("certify:production-journeys"), "production cert includes journey cert");

if (failed) process.exit(1);
console.log("production readiness tests ok");
