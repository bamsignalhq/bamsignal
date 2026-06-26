import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function bottleneckRows(bottlenecks) {
  return bottlenecks
    .map(
      (item) =>
        `| ${item.label} | ${item.critical ? "yes" : "no"} | ${item.metric} | ${item.value} | ${item.threshold} | ${String(item.detail).replace(/\|/g, "\\|")} |`
    )
    .join("\n");
}

function endpointRows(endpoints) {
  return endpoints
    .slice(0, 20)
    .map(
      (item) =>
        `| ${item.method} ${item.path} | ${item.requests} | ${item.failures} | ${item.p50} | ${item.p95} | ${item.max} |`
    )
    .join("\n");
}

function journeyRows(byType) {
  return byType
    .map((item) => `| ${item.label} | ${item.members} | ${item.passed} | ${item.failed} |`)
    .join("\n");
}

function recommendationRows(recommendations) {
  return recommendations
    .map((item) => `- **[${item.priority}]** ${item.title}: ${item.detail}`)
    .join("\n");
}

export function writePlatformLoadReports(outputDir, report) {
  mkdirSync(outputDir, { recursive: true });
  const jsonPath = join(outputDir, `platform-load-cert-${report.runId}.json`);
  const mdPath = join(outputDir, `platform-load-cert-${report.runId}.md`);
  const latestPath = join(outputDir, "latest.json");

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(latestPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(mdPath, renderMarkdown(report), "utf8");

  return { jsonPath, mdPath, latestPath };
}

function renderMarkdown(report) {
  const m = report.measurement;

  return `# Platform Load Certification™

**Run ID:** ${report.runId}  
**Generated:** ${report.generatedAt}  
**Target:** ${report.baseUrl}  
**Load score:** ${report.loadScore}%  
**Release gate:** ${report.passed ? "PASS" : "BLOCKED"}

## Load test report

| Metric | Value |
|--------|------:|
| Virtual members | ${report.virtualMembers} |
| Max concurrency | ${report.maxConcurrency} |
| Simulation duration | ${report.durationMs}ms |
| Journeys passed | ${report.journeysPassed}/${report.virtualMembers} |
| Total requests | ${m.totalRequests} |
| Failure rate | ${m.failureRatePercent}% |
| API p95 latency | ${m.api.p95}ms |
| Health p95 latency | ${m.health.p95}ms |
| Database (/ready) p95 | ${m.database.p95}ms |
| Max queue depth | ${m.queueDepth.max} |
| CPU user time | ${m.cpu.userMs}ms |
| Runner RAM peak | ${m.ram.peakMb}MB |

## Member journeys

| Journey | Members | Passed | Failed |
|---------|--------:|-------:|-------:|
${journeyRows(report.byType)}

## Bottlenecks

| Area | Critical | Metric | Value | Threshold | Detail |
|------|----------|--------|------:|----------:|--------|
${bottleneckRows(report.bottlenecks)}

## API latency (top endpoints)

| Endpoint | Requests | Failures | p50 | p95 | max |
|----------|--------:|---------:|----:|----:|----:|
${endpointRows(m.endpoints)}

## Recommendations

${recommendationRows(report.recommendations)}
`;
}
