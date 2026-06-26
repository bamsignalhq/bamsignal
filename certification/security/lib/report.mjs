import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function severityRows(findings) {
  return findings
    .filter((item) => !item.passed)
    .map(
      (item) =>
        `| ${item.checkId} | ${item.severity.toUpperCase()} | ${item.title} | ${item.detail.replace(/\|/g, "\\|")} |`
    )
    .join("\n");
}

export function writeSecurityReports(outputDir, report) {
  mkdirSync(outputDir, { recursive: true });
  const jsonPath = join(outputDir, `security-cert-${report.runId}.json`);
  const mdPath = join(outputDir, `security-cert-${report.runId}.md`);
  const latestPath = join(outputDir, "latest.json");

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(latestPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const md = `# Security Certification™

**Run ID:** ${report.runId}  
**Generated:** ${report.generatedAt}  
**Security score:** ${report.securityScore}%  
**Release gate:** ${report.passed ? "PASS" : "BLOCKED"}

## Severity counts

| Severity | Count |
|----------|------:|
| Critical | ${report.counts.critical} |
| High | ${report.counts.high} |
| Medium | ${report.counts.medium} |
| Low | ${report.counts.low} |

## Failed checks

| Check | Severity | Title | Detail |
|-------|----------|-------|--------|
${severityRows(report.findings) || "| — | — | All checks passed | — |"}

## Recommendations

${report.recommendations.map((item) => `- **${item.title}** (${item.priority}): ${item.detail}`).join("\n")}

---
Command: \`npm run certify:security\`
`;

  writeFileSync(mdPath, md, "utf8");
  return { jsonPath, mdPath, latestPath };
}
