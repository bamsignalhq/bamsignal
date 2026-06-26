import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function writeDependencyReports(outputDir, report) {
  mkdirSync(outputDir, { recursive: true });
  const stamp = report.runId;
  const jsonPath = join(outputDir, `dependency-cert-${stamp}.json`);
  const mdPath = join(outputDir, `dependency-cert-${stamp}.md`);
  const latestPath = join(outputDir, "latest.json");

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(latestPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(mdPath, renderMarkdown(report), "utf8");

  return { jsonPath, mdPath, latestPath };
}

function renderMarkdown(report) {
  const categoryRows = report.categories
    .map(
      (item) =>
        `| ${item.label} | ${item.findingsCount} | ${item.criticalCount} | ${item.passed ? "PASS" : "FAIL"} |`
    )
    .join("\n");

  const criticalRows = report.criticalVulnerabilities
    .map((item) => `- **${item.name}** (${item.severity})`)
    .join("\n");

  const upgradeRows = report.upgradeCandidates
    .slice(0, 12)
    .map((item) => `| ${item.name} | ${item.current} | ${item.wanted} | ${item.latest} |`)
    .join("\n");

  const unusedRows = report.unusedDependencies
    .slice(0, 12)
    .map((item) => `- ${item}`)
    .join("\n");

  return `# Dependency & Supply Chain Certification™

**Run ID:** ${report.runId}  
**Generated:** ${report.generatedAt}  
**Dependency score:** ${report.dependencyScore}%  
**Release gate:** ${report.passed ? "PASS" : "BLOCKED"}

## Summary

| Metric | Value |
|--------|------:|
| Packages scanned | ${report.packagesScanned} |
| Critical vulnerabilities | ${report.criticalVulnerabilities.length} |
| Upgrade candidates | ${report.upgradeCandidates.length} |
| Unused dependencies | ${report.unusedDependencies.length} |
| Duplicate packages | ${report.duplicatePackages.length} |

## Categories

| Category | Findings | Critical | Status |
|----------|----------:|---------:|--------|
${categoryRows}

## Critical vulnerabilities

${criticalRows || "- None"}

## Upgrade candidates

| Package | Current | Wanted | Latest |
|---------|---------|--------|--------|
${upgradeRows || "| — | — | — | — |"}

## Unused dependencies

${unusedRows || "- None detected in static import scan"}

## Recommendations

${report.recommendations.map((item) => `- [${item.priority}] ${item.title}: ${item.detail}`).join("\n") || "- None"}

---
Command: \`npm run certify:dependencies\`
`;
}
