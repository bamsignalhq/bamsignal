import { buildOptimizationOpportunities } from "./recommendations.mjs";

export function flattenIssues(areas) {
  const criticalIssues = [];
  const warnings = [];
  for (const area of areas) {
    for (const item of area.criticalIssues || []) {
      criticalIssues.push({ ...item, areaLabel: area.label });
    }
    for (const item of area.warnings || []) {
      warnings.push({ ...item, areaLabel: area.label });
    }
  }
  return { criticalIssues, warnings };
}

export function summarizeAreas(areas) {
  return areas.reduce(
    (acc, area) => {
      acc.objectsScanned += area.objectsScanned || 0;
      acc.areasPassed += area.passed ? 1 : 0;
      return acc;
    },
    { objectsScanned: 0, areasPassed: 0 }
  );
}

export function buildRiskScore(areas, metrics, criticalRegressions = []) {
  let score = 100;
  const { criticalIssues, warnings } = flattenIssues(areas);
  score -= criticalIssues.length * 12;
  score -= warnings.length * 3;
  score -= criticalRegressions.length * 15;

  if (metrics.p99Ms > 2000) score -= 10;
  else if (metrics.p95Ms > 1000) score -= 6;
  if (metrics.cacheHitPercent < 90) score -= 8;
  if (metrics.connectionPoolUsedPercent >= 90) score -= 10;

  return Math.max(0, Math.min(100, score));
}

export function evaluateReleaseGate(criticalRegressions, criticalIssues) {
  const regressionBlock = criticalRegressions.length > 0;
  const issueBlock = criticalIssues.length > 0;
  return !regressionBlock && !issueBlock;
}

export function buildCertificationSummary(areas, metrics, criticalRegressions) {
  const opportunities = buildOptimizationOpportunities(areas, metrics);
  const { criticalIssues, warnings } = flattenIssues(areas);
  const allCritical = [...criticalIssues, ...criticalRegressions.map((item) => ({
    ...item,
    areaLabel: "Regression"
  }))];

  return {
    opportunities,
    criticalIssues: allCritical,
    warnings
  };
}
