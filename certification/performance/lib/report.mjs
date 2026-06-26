import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function writePerformanceReports(report, outputDir) {
  mkdirSync(outputDir, { recursive: true });
  const stamp = report.runId;
  const jsonPath = join(outputDir, `performance-certification-${stamp}.json`);
  const mdPath = join(outputDir, `performance-certification-${stamp}.md`);
  const htmlPath = join(outputDir, `performance-certification-${stamp}.html`);
  const latestPath = join(outputDir, "latest.json");

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(latestPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(mdPath, renderMarkdown(report), "utf8");
  writeFileSync(htmlPath, renderHtml(report), "utf8");

  return { jsonPath, mdPath, htmlPath, latestPath };
}

function renderMarkdown(report) {
  const lines = [
    `# Performance Certification™`,
    "",
    `**Run:** ${report.runId}`,
    `**Target:** ${report.baseUrl}`,
    `**Score:** ${report.performanceScore}%`,
    `**Result:** ${report.passed ? "PASS" : "FAIL"}`,
    `**Trend:** ${report.trend}`,
    "",
    "## Metrics",
    "",
    "| Metric | Value | Status | Threshold |",
    "|--------|-------|--------|-----------|"
  ];

  for (const metric of report.metrics) {
    lines.push(`| ${metric.label} | ${metric.value}${metric.unit} | ${metric.passed ? "PASS" : "FAIL"} | ${metric.thresholdLabel} |`);
  }

  if (report.regressions?.length) {
    lines.push("", "## Regressions", "");
    for (const item of report.regressions) {
      lines.push(`- **${item.title}** (+${item.deltaPercent}%): ${item.detail}`);
    }
  }

  if (report.recommendations?.length) {
    lines.push("", "## Recommendations", "");
    for (const item of report.recommendations) {
      lines.push(`- **${item.title}** — ${item.detail}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function renderHtml(report) {
  const rows = report.metrics
    .map(
      (m) =>
        `<tr><td>${escapeHtml(m.label)}</td><td>${m.value}${escapeHtml(m.unit)}</td><td class="${m.passed ? "pass" : "fail"}">${m.passed ? "PASS" : "FAIL"}</td><td>${escapeHtml(m.thresholdLabel)}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><title>Performance Certification™</title>
<style>body{font-family:system-ui,sans-serif;margin:2rem;background:#0b1220;color:#e8edf5} .pass{color:#4ade80}.fail{color:#f87171} table{width:100%;border-collapse:collapse} td,th{padding:.4rem;border-bottom:1px solid #1f2937}</style>
</head><body>
<h1>Performance Certification™</h1>
<p>Score: <strong>${report.performanceScore}%</strong> · Result: <span class="${report.passed ? "pass" : "fail"}">${report.passed ? "PASS" : "FAIL"}</span></p>
<table><thead><tr><th>Metric</th><th>Value</th><th>Status</th><th>Threshold</th></tr></thead><tbody>${rows}</tbody></table>
</body></html>`;
}
