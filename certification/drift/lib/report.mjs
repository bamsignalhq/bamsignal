import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function writeDriftReports(outputDir, report) {
  mkdirSync(outputDir, { recursive: true });
  const stamp = report.runId;
  const jsonPath = join(outputDir, `drift-cert-${stamp}.json`);
  const mdPath = join(outputDir, `drift-cert-${stamp}.md`);
  const latestPath = join(outputDir, "latest.json");

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(latestPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(mdPath, renderMarkdown(report), "utf8");

  return { jsonPath, mdPath, latestPath };
}

function renderMarkdown(report) {
  if (report.skipped || report.status === "skipped") {
    return `# Operational Drift Certification™

**Run ID:** ${report.runId}  
**Generated:** ${report.generatedAt}  
**Profile:** ${report.certificationProfile || "local"}  
**Status:** SKIPPED  
**Reason:** ${report.skipReason || "environment unavailable"}  
**Detail:** ${report.skipDetail || ""}

---
Command: \`npm run certify:drift\`
`;
  }

  const domainRows = (report.domains || [])
    .map(
      (item) =>
        `| ${item.label} | ${item.findingsCount} | ${item.criticalCount} | ${item.passed ? "PASS" : "FAIL"} |`
    )
    .join("\n");

  const findingRows = (report.findings || [])
    .filter((item) => !item.passed)
    .slice(0, 20)
    .map(
      (item) =>
        `| ${item.domainId} | ${item.title} | ${item.severity} | ${item.compareTarget} | ${item.detail} |`
    )
    .join("\n");

  return `# Operational Drift Certification™

**Run ID:** ${report.runId}  
**Generated:** ${report.generatedAt}  
**Mode:** ${report.mode}  
**Drift score:** ${report.driftScore}%  
**Release gate:** ${report.passed ? "PASS" : "BLOCKED"}

## Summary

| Metric | Value |
|--------|------:|
| Unexpected drift | ${report.unexpectedDrift} |
| Unauthorized changes | ${report.unauthorizedChanges} |
| Configuration mismatches | ${report.configurationMismatches} |
| Missing secrets | ${report.missingSecrets ?? 0} |
| Unused secrets | ${(report.unusedSecrets || []).length} |

## Domains

| Domain | Findings | Critical | Status |
|--------|----------:|---------:|--------|
${domainRows}

## Open findings

| Domain | Title | Severity | Compare | Detail |
|--------|-------|----------|---------|--------|
${findingRows || "| — | — | — | — | — |"}

## Unused secrets

${(report.unusedSecrets || []).map((item) => `- ${item}`).join("\n") || "- None"}

## Recommendations

${(report.recommendations || []).map((item) => `- [${item.priority}] ${item.title}: ${item.detail}`).join("\n") || "- None"}

---
Command: \`npm run certify:drift\`
`;
}
