import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function attackRows(attacks) {
  return attacks
    .map((item) => {
      const failed = Object.entries(item.verification || {})
        .filter(([, ok]) => !ok)
        .map(([key]) => key)
        .join(", ");
      return `| ${item.label} | ${item.critical ? "yes" : "no"} | ${item.passed ? "PASS" : "FAIL"} | ${item.recoverySuccess ? "yes" : "no"} | ${item.recoveryTimeMs ?? "—"} | ${failed || "—"} | ${String(item.detail).replace(/\|/g, "\\|")} |`;
    })
    .join("\n");
}

export function writeChaosReports(outputDir, report) {
  mkdirSync(outputDir, { recursive: true });
  const jsonPath = join(outputDir, `chaos-cert-${report.runId}.json`);
  const mdPath = join(outputDir, `chaos-cert-${report.runId}.md`);
  const latestPath = join(outputDir, "latest.json");

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(latestPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(mdPath, renderMarkdown(report), "utf8");

  return { jsonPath, mdPath, latestPath };
}

function renderMarkdown(report) {
  const weaknessRows = report.criticalWeaknesses
    .map(
      (item) =>
        `- **${item.label}** (${item.critical ? "critical" : "non-critical"}): ${item.detail} — failed: ${item.failedChecks.join(", ") || "recovery"}`
    )
    .join("\n");

  return `# Chaos Engineering Certification™

**Run ID:** ${report.runId}  
**Generated:** ${report.generatedAt}  
**Chaos score:** ${report.chaosScore}%  
**Release gate:** ${report.passed ? "PASS" : "BLOCKED"}

## Chaos report summary

| Metric | Value |
|--------|------:|
| Attacks simulated | ${report.attacks.length} |
| Attacks passed | ${report.attacksPassed} |
| Recovery success | ${report.recoverySuccess}/${report.attacks.length} |
| Avg recovery time | ${report.recoveryTimeMs.average ?? "—"} ms |
| Max recovery time | ${report.recoveryTimeMs.max ?? "—"} ms |
| Critical weaknesses | ${report.criticalWeaknesses.length} |

## Attacks

| Attack | Critical | Gate | Recovered | Time (ms) | Failed checks | Detail |
|--------|----------|------|-----------|----------:|---------------|--------|
${attackRows(report.attacks)}

## Critical weaknesses

${weaknessRows || "- None — all attacks survived simulated failure."}

## Recommendations

${report.recommendations.map((item) => `- **[${item.priority}]** ${item.title}: ${item.detail}`).join("\n")}

---
Command: \`npm run certify:chaos\`
`;
}
