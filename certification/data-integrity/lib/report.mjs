import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function writeDataIntegrityReports(outputDir, report) {
  mkdirSync(outputDir, { recursive: true });
  const stamp = report.runId;
  const jsonPath = join(outputDir, `data-integrity-cert-${stamp}.json`);
  const mdPath = join(outputDir, `data-integrity-cert-${stamp}.md`);
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
        `| ${item.label} | ${item.objectsScanned} | ${item.objectsRepaired} | ${item.criticalIssues.length} | ${item.warnings.length} | ${item.passed ? "PASS" : "FAIL"} |`
    )
    .join("\n");

  return `# Data Integrity Certification™

**Run ID:** ${report.runId}  
**Generated:** ${report.generatedAt}  
**Mode:** ${report.mode}  
**Integrity score:** ${report.integrityScore}%  
**Release gate:** ${report.passed ? "PASS" : "BLOCKED"}

## Summary

| Metric | Value |
|--------|------:|
| Objects scanned | ${report.objectsScanned} |
| Objects repaired | ${report.objectsRepaired} |
| Requiring review | ${report.objectsRequiringReview} |
| Critical issues | ${report.criticalIssues.length} |
| Warnings | ${report.warnings.length} |

## Domains

| Domain | Scanned | Repaired | Critical | Warnings | Status |
|--------|--------:|---------:|---------:|---------:|--------|
${domainRows}

## Critical issues

${report.criticalIssues.map((item) => `- **${item.title}** (${item.domainLabel}): ${item.detail}`).join("\n") || "- None"}

## Warnings

${report.warnings.map((item) => `- **${item.title}** (${item.domainLabel}): ${item.detail}`).join("\n") || "- None"}

## Safe repairs applied

${report.repairs.map((item) => `- ${item.action}: ${item.count}`).join("\n") || "- None"}

## Flagged for manual review

${report.flaggedForReview.map((item) => `- ${item.action}: ${item.detail}`).join("\n") || "- None"}

---
Command: \`npm run certify:data-integrity\`
`;
}
