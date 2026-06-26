import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function scenarioRows(scenarios) {
  return scenarios
    .map(
      (item) =>
        `| ${item.label} | ${item.passed ? "PASS" : "FAIL"} | ${item.recoverySuccess ? "yes" : "no"} | ${item.recoveryTimeMs ?? "—"} | ${item.detail.replace(/\|/g, "\\|")} |`
    )
    .join("\n");
}

export function writeReliabilityReports(outputDir, report) {
  mkdirSync(outputDir, { recursive: true });
  const jsonPath = join(outputDir, `reliability-cert-${report.runId}.json`);
  const mdPath = join(outputDir, `reliability-cert-${report.runId}.md`);
  const latestPath = join(outputDir, "latest.json");

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(latestPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const md = `# Reliability Certification™

**Run ID:** ${report.runId}  
**Generated:** ${report.generatedAt}  
**Reliability score:** ${report.reliabilityScore}%  
**Release gate:** ${report.passed ? "PASS" : "BLOCKED"}

## Recovery summary

| Metric | Value |
|--------|------:|
| Recovery success | ${report.recoverySuccess}/${report.scenarios.length} |
| Avg recovery time | ${report.recoveryTimeMs.average ?? "—"} ms |
| Max recovery time | ${report.recoveryTimeMs.max ?? "—"} ms |
| Failures | ${report.recoveryFailures.length} |

## Scenarios

| Scenario | Gate | Recovered | Time (ms) | Detail |
|----------|------|-----------|----------:|--------|
${scenarioRows(report.scenarios)}

## Recommendations

${report.recommendations.map((item) => `- **${item.title}** (${item.priority}): ${item.detail}`).join("\n")}

---
Command: \`npm run certify:reliability\`
`;

  writeFileSync(mdPath, md, "utf8");
  return { jsonPath, mdPath, latestPath };
}
