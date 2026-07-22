export { runSecurityAudit } from "./securityAudit.js";
export { runPerformanceAudit, PERFORMANCE_THRESHOLDS } from "./performanceAudit.js";
export { runResilienceAudit } from "./resilienceAudit.js";
export { runDeploymentAudit } from "./deploymentAudit.js";
export { runObservabilityAudit } from "./observabilityAudit.js";
export { runRateLimitAudit } from "./rateLimitAudit.js";
export { runDisasterRecoveryAudit, DISASTER_RECOVERY_CHECKLIST } from "./disasterRecovery.js";
export { buildLoadTestPlan, LOAD_TEST_SCENARIOS } from "./loadTestPlan.js";

import { runSecurityAudit } from "./securityAudit.js";
import { runPerformanceAudit } from "./performanceAudit.js";
import { runResilienceAudit } from "./resilienceAudit.js";
import { runDeploymentAudit } from "./deploymentAudit.js";
import { runObservabilityAudit } from "./observabilityAudit.js";
import { runRateLimitAudit } from "./rateLimitAudit.js";
import { runDisasterRecoveryAudit } from "./disasterRecovery.js";
import { buildLoadTestPlan } from "./loadTestPlan.js";
import { PRODUCTION_CERT_VERSION } from "../../../shared/productionCertification.mjs";

export async function buildProductionReadinessReport(env = process.env) {
  const security = runSecurityAudit(env);
  const performance = runPerformanceAudit();
  const resilience = runResilienceAudit();
  const deployment = runDeploymentAudit(env);
  const observability = runObservabilityAudit();
  const rateLimiting = runRateLimitAudit();
  const disasterRecovery = runDisasterRecoveryAudit();
  const loadTestPlan = buildLoadTestPlan();

  const domains = {
    security,
    performance,
    resilience,
    deployment,
    observability,
    rateLimiting,
    disasterRecovery
  };

  const allPassed = Object.values(domains).every((d) => d.passed !== false);
  const blockers = Object.entries(domains)
    .filter(([, d]) => d.status === "FAIL")
    .map(([name]) => `${name}: audit FAIL`);

  return {
    generatedAt: new Date().toISOString(),
    certificationVersion: PRODUCTION_CERT_VERSION,
    contract: "production-readiness-v1",
    overallStatus: allPassed ? "PASS" : blockers.length ? "FAIL" : "WARN",
    domains,
    loadTestPlan,
    blockers,
    recommendations: [
      ...security.recommendations,
      ...deployment.recommendations,
      ...observability.alertingRecommendations
    ].slice(0, 10)
  };
}

export async function buildLaunchScorecardCategories(env = process.env) {
  const report = await buildProductionReadinessReport(env);

  function scoreFromDomain(domain, weight = 100) {
    if (domain.status === "PASS") return weight;
    if (domain.status === "WARN") return Math.round(weight * 0.85);
    return Math.round(weight * 0.5);
  }

  return {
    security: {
      score: scoreFromDomain(report.domains.security),
      blockingIssues: report.domains.security.highRiskCount > 0 ? ["High-risk security findings"] : [],
      recommendations: report.domains.security.recommendations
    },
    performance: {
      score: scoreFromDomain(report.domains.performance),
      blockingIssues: [],
      recommendations: report.domains.performance.recommendations
    },
    deployment: {
      score: scoreFromDomain(report.domains.deployment),
      blockingIssues: [],
      recommendations: report.domains.deployment.recommendations
    },
    recovery: {
      score: scoreFromDomain(report.domains.disasterRecovery),
      blockingIssues: [],
      recommendations: report.domains.disasterRecovery.restoreProcedure.slice(0, 2)
    },
    observability: {
      score: scoreFromDomain(report.domains.observability),
      blockingIssues: [],
      recommendations: report.domains.observability.alertingRecommendations.slice(0, 2)
    },
    rateLimiting: {
      score: scoreFromDomain(report.domains.rateLimiting),
      blockingIssues: [],
      recommendations: report.domains.rateLimiting.recommendations
    },
    resilience: {
      score: scoreFromDomain(report.domains.resilience),
      blockingIssues: [],
      recommendations: report.domains.resilience.remainingRisks.slice(0, 2)
    }
  };
}
