import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function writeProductionSmokeReports(outputDir, report) {
  mkdirSync(outputDir, { recursive: true });
  const stamp = report.runId;
  const jsonPath = join(outputDir, `production-smoke-${stamp}.json`);
  const mdPath = join(outputDir, `production-smoke-${stamp}.md`);
  const latestPath = join(outputDir, "latest.json");

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(latestPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(mdPath, renderMarkdown(report), "utf8");

  return { jsonPath, mdPath, latestPath };
}

function renderMarkdown(report) {
  const rows = report.checks
    .map(
      (item) =>
        `| ${item.label} | ${item.passed ? "PASS" : "FAIL"} | ${item.httpStatus || "—"} | ${item.responseTimeMs}ms | ${item.severity} | ${String(item.detail).replace(/\|/g, "\\|")} |`
    )
    .join("\n");

  const recommendations = report.recommendations
    .map((item) => `- [${item.priority}] ${item.title}: ${item.detail}`)
    .join("\n");

  return `# Production Smoke Suite™

**Run ID:** ${report.runId}  
**Target:** ${report.baseUrl}  
**Generated:** ${report.generatedAt}  
**Deployment timestamp:** ${report.deploymentTimestamp || "unknown"}  
**Commit SHA:** ${report.commitSha || "unknown"}  
**Deployment build:** ${report.deploymentBuildId || "unknown"}  
**Smoke score:** ${report.smokeScore}%  
**Result:** ${report.passed ? "PASS" : "FAIL"}

## Summary

| Metric | Value |
|--------|------:|
| Checks run | ${report.checks.length} |
| Passed | ${report.checksPassed} |
| Failed | ${report.checksFailed} |
| Critical failures | ${report.counts.critical} |

## Checks

| Surface | Result | HTTP | Time | Severity | Detail |
|---------|--------|-----:|-----:|----------|--------|
${rows}

## Recommendations

${recommendations || "- None"}

---
Command: \`npm run smoke:production\`
`;
}
