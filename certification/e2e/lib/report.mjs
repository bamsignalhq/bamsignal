/**
 * Production Certification Report — JSON, Markdown, HTML exporters.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildReport({ runId, baseUrl, startedAt, finishedAt, scenarios, globalChecks = [] }) {
  const durationMs = finishedAt - startedAt;
  const allChecks = scenarios.flatMap((s) => s.checks || []);
  const totalChecks = allChecks.length + globalChecks.length;
  const passedChecks =
    allChecks.filter((c) => c.ok).length + globalChecks.filter((c) => c.ok).length;
  const overallScore = totalChecks ? Math.round((passedChecks / totalChecks) * 100) : 0;
  const scenariosPassed = scenarios.filter((s) => s.passed).length;

  return {
    brand: "Production End-to-End Certification™",
    runId,
    baseUrl,
    generatedAt: new Date(finishedAt).toISOString(),
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: new Date(finishedAt).toISOString(),
    durationMs,
    durationHuman: `${(durationMs / 1000).toFixed(1)}s`,
    overallScore,
    scenariosPassed,
    scenariosTotal: scenarios.length,
    pass: scenariosPassed === scenarios.length && overallScore === 100,
    globalChecks,
    scenarios: scenarios.map((s) => ({
      id: s.id,
      title: s.title,
      passed: s.passed,
      durationMs: s.durationMs,
      score: s.score,
      checks: s.checks,
      error: s.error || null,
      screenshot: s.screenshot || null,
      logs: s.logs || []
    }))
  };
}

export function writeReports(report, outputDir) {
  mkdirSync(outputDir, { recursive: true });
  const stamp = report.runId;
  const jsonPath = join(outputDir, `certification-report-${stamp}.json`);
  const mdPath = join(outputDir, `certification-report-${stamp}.md`);
  const htmlPath = join(outputDir, `certification-report-${stamp}.html`);

  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(mdPath, renderMarkdown(report), "utf8");
  writeFileSync(htmlPath, renderHtml(report), "utf8");

  return { jsonPath, mdPath, htmlPath };
}

function renderMarkdown(report) {
  const lines = [
    `# ${report.brand}`,
    "",
    `**Run:** ${report.runId}`,
    `**Target:** ${report.baseUrl}`,
    `**Generated:** ${report.generatedAt}`,
    `**Duration:** ${report.durationHuman}`,
    `**Overall score:** ${report.overallScore}%`,
    `**Result:** ${report.pass ? "PASS ✓" : "FAIL ✗"}`,
    "",
    `Scenarios: ${report.scenariosPassed}/${report.scenariosTotal}`,
    "",
    "## Scenarios",
    ""
  ];

  for (const scenario of report.scenarios) {
    lines.push(`### ${scenario.id} — ${scenario.title}`);
    lines.push(`- **Result:** ${scenario.passed ? "PASS" : "FAIL"} (${scenario.score}%)`);
    lines.push(`- **Duration:** ${(scenario.durationMs / 1000).toFixed(1)}s`);
    if (scenario.error) lines.push(`- **Error:** ${scenario.error}`);
    if (scenario.screenshot) lines.push(`- **Screenshot:** ${scenario.screenshot}`);
    lines.push("");
    lines.push("| Layer | Check | Status | Detail |");
    lines.push("|-------|-------|--------|--------|");
    for (const check of scenario.checks || []) {
      lines.push(
        `| ${check.layer} | ${check.name} | ${check.ok ? "PASS" : "FAIL"} | ${check.detail || ""} |`
      );
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function renderHtml(report) {
  const scenarioRows = report.scenarios
    .map((scenario) => {
      const checks = (scenario.checks || [])
        .map(
          (c) =>
            `<tr><td>${escapeHtml(c.layer)}</td><td>${escapeHtml(c.name)}</td><td class="${c.ok ? "pass" : "fail"}">${c.ok ? "PASS" : "FAIL"}</td><td>${escapeHtml(c.detail || "")}</td></tr>`
        )
        .join("");
      return `<section class="scenario ${scenario.passed ? "pass" : "fail"}">
        <h2>${escapeHtml(scenario.id)} — ${escapeHtml(scenario.title)}</h2>
        <p>Score: <strong>${scenario.score}%</strong> · Duration: ${(scenario.durationMs / 1000).toFixed(1)}s</p>
        ${scenario.error ? `<p class="error">${escapeHtml(scenario.error)}</p>` : ""}
        ${scenario.screenshot ? `<p>Screenshot: <code>${escapeHtml(scenario.screenshot)}</code></p>` : ""}
        <table><thead><tr><th>Layer</th><th>Check</th><th>Status</th><th>Detail</th></tr></thead><tbody>${checks}</tbody></table>
      </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(report.brand)} — ${escapeHtml(report.runId)}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; background: #0b1220; color: #e8edf5; }
    h1 { color: #7dd3fc; }
    .summary { background: #111827; padding: 1rem 1.25rem; border-radius: 12px; margin-bottom: 2rem; }
    .scenario { background: #111827; padding: 1rem 1.25rem; border-radius: 12px; margin-bottom: 1rem; border-left: 4px solid #64748b; }
    .scenario.pass { border-left-color: #22c55e; }
    .scenario.fail { border-left-color: #ef4444; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.75rem; }
    th, td { text-align: left; padding: 0.4rem 0.5rem; border-bottom: 1px solid #1f2937; font-size: 0.9rem; }
    .pass { color: #4ade80; }
    .fail { color: #f87171; }
    .error { color: #fca5a5; }
    code { color: #93c5fd; }
  </style>
</head>
<body>
  <h1>${escapeHtml(report.brand)}</h1>
  <div class="summary">
    <p><strong>Run:</strong> ${escapeHtml(report.runId)}</p>
    <p><strong>Target:</strong> ${escapeHtml(report.baseUrl)}</p>
    <p><strong>Overall score:</strong> ${report.overallScore}%</p>
    <p><strong>Result:</strong> <span class="${report.pass ? "pass" : "fail"}">${report.pass ? "PASS" : "FAIL"}</span></p>
    <p><strong>Scenarios:</strong> ${report.scenariosPassed}/${report.scenariosTotal} · <strong>Duration:</strong> ${escapeHtml(report.durationHuman)}</p>
  </div>
  ${scenarioRows}
</body>
</html>`;
}
