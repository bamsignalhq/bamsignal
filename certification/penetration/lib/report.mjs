import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function attackRows(attacks) {
  return attacks
    .map(
      (item) =>
        `| ${item.label} | ${item.category} | ${item.exploited ? "EXPLOITED" : "BLOCKED"} | ${item.severity} | ${String(item.detail).replace(/\|/g, "\\|")} |`
    )
    .join("\n");
}

function fixRows(fixes) {
  return fixes
    .map(
      (item) =>
        `| ${item.label} | ${item.priority} | ${item.exploited ? "yes" : "no"} | ${String(item.fix).replace(/\|/g, "\\|")} |`
    )
    .join("\n");
}

function riskRows(risks) {
  return risks
    .map(
      (item) =>
        `- **${item.label}** (${item.severity}): ${item.residualRisk}`
    )
    .join("\n");
}

export function writePenetrationReports(outputDir, report) {
  mkdirSync(outputDir, { recursive: true });
  const jsonPath = join(outputDir, `penetration-cert-${report.runId}.json`);
  const mdPath = join(outputDir, `penetration-cert-${report.runId}.md`);
  const latestPath = join(outputDir, "latest.json");

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(latestPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(mdPath, renderMarkdown(report), "utf8");

  return { jsonPath, mdPath, latestPath };
}

function renderMarkdown(report) {
  return `# Production Penetration Certification™

**Run ID:** ${report.runId}  
**Generated:** ${report.generatedAt}  
**Target:** ${report.baseUrl}  
**Penetration score:** ${report.penetrationScore}%  
**Release gate:** ${report.passed ? "PASS" : "BLOCKED"}

## Penetration report

| Metric | Value |
|--------|------:|
| Attacks attempted | ${report.attacks.length} |
| Blocked | ${report.counts.blocked} |
| Exploited | ${report.counts.exploited} |
| Critical severity | ${report.counts.critical} |
| High severity | ${report.counts.high} |

## Attack results

| Attack | Category | Result | Severity | Detail |
|--------|----------|--------|----------|--------|
${attackRows(report.attacks)}

## Fixes

| Attack | Priority | Exploited | Control / fix |
|--------|----------|-----------|----------------|
${fixRows(report.fixes)}

## Residual risk

${riskRows(report.residualRisks)}
`;
}
