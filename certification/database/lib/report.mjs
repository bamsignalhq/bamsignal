import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function writeDatabasePerformanceReports(outputDir, report) {
  mkdirSync(outputDir, { recursive: true });
  const stamp = report.runId;
  const jsonPath = join(outputDir, `database-perf-cert-${stamp}.json`);
  const mdPath = join(outputDir, `database-perf-cert-${stamp}.md`);
  const latestPath = join(outputDir, "latest.json");

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(latestPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(mdPath, renderMarkdown(report), "utf8");

  return { jsonPath, mdPath, latestPath };
}

function renderMarkdown(report) {
  const areaRows = report.areas
    .map(
      (item) =>
        `| ${item.label} | ${item.objectsScanned} | ${item.criticalIssues.length} | ${item.warnings.length} | ${item.passed ? "PASS" : "FAIL"} |`
    )
    .join("\n");

  const tableRows = report.metrics.largestTables
    .slice(0, 8)
    .map(
      (item) =>
        `| ${item.name} | ${formatBytes(item.totalBytes)} | ${item.liveRows} | ${item.seqScan} | ${item.idxScan} |`
    )
    .join("\n");

  const indexRows = report.metrics.largestIndexes
    .slice(0, 8)
    .map(
      (item) =>
        `| ${item.name} | ${item.tableName} | ${formatBytes(item.indexBytes)} | ${item.idxScan} |`
    )
    .join("\n");

  const endpointRows = report.metrics.expensiveEndpoints
    .slice(0, 8)
    .map(
      (item) =>
        `| ${item.method} | ${item.path} | ${item.avgResponseMs} | ${item.p95Ms} | ${item.p99Ms} |`
    )
    .join("\n");

  return `# Database Performance Certification™

**Run ID:** ${report.runId}  
**Generated:** ${report.generatedAt}  
**Mode:** ${report.mode}  
**Risk score:** ${report.riskScore}%  
**Release gate:** ${report.passed ? "PASS" : "BLOCKED"}

## Query latency

| Metric | Value |
|--------|------:|
| Average query | ${report.metrics.avgQueryMs}ms |
| P95 | ${report.metrics.p95Ms}ms |
| P99 | ${report.metrics.p99Ms}ms |
| Slow queries | ${report.metrics.slowQueryCount} |
| Cache hit | ${report.metrics.cacheHitPercent}% |
| Pool used | ${report.metrics.connectionPoolUsedPercent}% |
| Database size | ${formatBytes(report.metrics.databaseSizeBytes)} |

## Areas

| Area | Scanned | Critical | Warnings | Status |
|------|--------:|---------:|---------:|--------|
${areaRows}

## Critical query regressions

${report.criticalRegressions.map((item) => `- **${item.title}**: ${item.detail}`).join("\n") || "- None"}

## Critical issues

${report.criticalIssues.map((item) => `- **${item.title}** (${item.areaLabel ?? item.areaId}): ${item.detail}`).join("\n") || "- None"}

## Warnings

${report.warnings.map((item) => `- **${item.title}** (${item.areaLabel ?? item.areaId}): ${item.detail}`).join("\n") || "- None"}

## Largest tables

| Table | Size | Rows | Seq scans | Idx scans |
|-------|-----:|-----:|----------:|----------:|
${tableRows || "| — | — | — | — | — |"}

## Largest indexes

| Index | Table | Size | Scans |
|-------|-------|-----:|------:|
${indexRows || "| — | — | — | — |"}

## Most expensive endpoints

| Method | Path | Avg | P95 | P99 |
|--------|------|----:|----:|----:|
${endpointRows || "| — | — | — | — | — |"}

## Optimization opportunities

${report.optimizationOpportunities.map((item) => `- **${item.title}** (${item.impact}): ${item.detail}`).join("\n") || "- None"}

## Recommendations

${report.recommendations.map((item) => `- [${item.priority}] ${item.title}: ${item.detail}`).join("\n") || "- None"}

---
Command: \`npm run certify:database\`
`;
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 2)} ${units[unit]}`;
}
