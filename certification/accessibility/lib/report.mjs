import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function writeAccessibilityReports(outputDir, report) {
  mkdirSync(outputDir, { recursive: true });
  const stamp = report.runId;
  const jsonPath = join(outputDir, `accessibility-cert-${stamp}.json`);
  const mdPath = join(outputDir, `accessibility-cert-${stamp}.md`);
  const latestPath = join(outputDir, "latest.json");

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(latestPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(mdPath, renderMarkdown(report), "utf8");

  return { jsonPath, mdPath, latestPath };
}

function renderMarkdown(report) {
  const domainRows = report.domains
    .map(
      (item) =>
        `| ${item.label} | ${item.score}% | ${item.openCount} | ${item.criticalCount} | ${item.passed ? "PASS" : "FAIL"} |`
    )
    .join("\n");

  const violationRows = report.violations
    .map((item) => `- **[${item.severity}]** ${item.title}: ${item.detail}`)
    .join("\n");

  const recommendationRows = report.recommendations
    .map((item) => `- [${item.priority}] ${item.title}: ${item.detail}`)
    .join("\n");

  const openFindings = report.findings
    .filter((item) => !item.passed)
    .map(
      (item) =>
        `| ${item.domainId} | ${item.severity} | ${item.title} | ${item.detail.replace(/\|/g, "\\|")} |`
    )
    .join("\n");

  return `# Accessibility Certification™

**Run ID:** ${report.runId}  
**Generated:** ${report.generatedAt}  
**Accessibility score:** ${report.accessibilityScore}%  
**Release gate:** ${report.passed ? "PASS" : "BLOCKED"}

## Summary

| Metric | Value |
|--------|------:|
| Domains verified | ${report.domains.length} |
| Total findings | ${report.findings.length} |
| Violations | ${report.violations.length} |
| Critical failures | ${report.counts.critical} |
| High failures | ${report.counts.high} |

## Domains

| Domain | Score | Open | Critical | Status |
|--------|------:|-----:|---------:|--------|
${domainRows}

## Violations

${violationRows || "- None"}

## Open findings

| Domain | Severity | Title | Detail |
|--------|----------|-------|--------|
${openFindings || "| — | — | — | — |"}

## Recommendations

${recommendationRows || "- None"}

---
Command: \`npm run certify:accessibility\`
`;
}
