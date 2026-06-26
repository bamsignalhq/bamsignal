import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function subsystemRows(scores) {
  return scores
    .map(
      (item) =>
        `| ${item.label} | ${item.score}% | ${item.status} | ${item.passed ? "PASS" : "FAIL"} | ${item.summary.replace(/\|/g, "\\|")} |`
    )
    .join("\n");
}

function issueList(items) {
  if (!items.length) return "- None";
  return items.map((item) => `- **${item.title}** (${item.subsystemId}): ${item.detail}`).join("\n");
}

export function writeRcReports(outputDir, report) {
  mkdirSync(outputDir, { recursive: true });
  const stamp = report.runId;
  const jsonPath = join(outputDir, "release-candidate-report.json");
  const stampedJsonPath = join(outputDir, `release-candidate-report-${stamp}.json`);
  const mdPath = join(outputDir, "release-candidate-report.md");
  const stampedMdPath = join(outputDir, `release-candidate-report-${stamp}.md`);
  const pdfPath = join(outputDir, "release-candidate-report.pdf.html");
  const stampedPdfPath = join(outputDir, `release-candidate-report-${stamp}.pdf.html`);
  const latestPath = join(outputDir, "latest.json");

  const exports = {
    json: jsonPath,
    jsonStamped: stampedJsonPath,
    markdown: mdPath,
    markdownStamped: stampedMdPath,
    pdf: pdfPath,
    pdfStamped: stampedPdfPath
  };

  const fullReport = { ...report, exports };
  const payload = `${JSON.stringify(fullReport, null, 2)}\n`;

  writeFileSync(jsonPath, payload, "utf8");
  writeFileSync(stampedJsonPath, payload, "utf8");
  writeFileSync(latestPath, payload, "utf8");
  writeFileSync(mdPath, renderMarkdown(fullReport), "utf8");
  writeFileSync(stampedMdPath, renderMarkdown(fullReport), "utf8");
  const pdfHtml = renderPdfHtml(fullReport);
  writeFileSync(pdfPath, pdfHtml, "utf8");
  writeFileSync(stampedPdfPath, pdfHtml, "utf8");

  return { jsonPath, mdPath, pdfPath, latestPath, stampedJsonPath, stampedMdPath, stampedPdfPath };
}

function renderMarkdown(report) {
  return `# Release Candidate Certification™

**RC Number:** ${report.rcNumber}  
**Generated:** ${report.certificationTimestamp}  
**Git commit:** ${report.gitCommit}  
**Build version:** ${report.buildVersion} (${report.buildCode})  
**Environment:** ${report.environment}  
**Overall score:** ${report.overallScore}%  
**Decision:** ${report.releaseDecisionLabel}

## Summary

| Metric | Value |
|--------|------:|
| Passed checks | ${report.passedChecks} / ${report.subsystemScores.length} |
| Warnings | ${report.warnings.length} |
| Blockers | ${report.blockers.length} |

## Subsystem scores

| Subsystem | Score | Status | Gate | Summary |
|-----------|------:|--------|------|---------|
${subsystemRows(report.subsystemScores)}

## Blockers

${issueList(report.blockers)}

## Warnings

${issueList(report.warnings)}

---
Command: \`npm run certify:rc\`  
No production deployment may proceed without a passing RC certification.
`;
}

function renderPdfHtml(report) {
  const body = `
  <h1>Release Candidate Certification™</h1>
  <p class="meta">
    <strong>RC ${escapeHtml(report.rcNumber)}</strong><br />
    Generated: ${escapeHtml(report.certificationTimestamp)}<br />
    Git: ${escapeHtml(report.gitCommitShort)} · Build ${escapeHtml(report.buildVersion)} (${escapeHtml(report.buildCode)})<br />
    Environment: ${escapeHtml(report.environment)}
  </p>
  <p class="verdict">${escapeHtml(report.releaseDecisionLabel)} — ${report.overallScore}% overall</p>
  <p>${escapeHtml(report.releaseDecisionDetail)}</p>
  <p>Passed checks: <strong>${report.passedChecks}</strong> · Blockers: <strong>${report.blockers.length}</strong> · Warnings: <strong>${report.warnings.length}</strong></p>
  <h2>Subsystem scores</h2>
  <table>
    <thead><tr><th>Subsystem</th><th>Score</th><th>Status</th><th>Gate</th></tr></thead>
    <tbody>
      ${report.subsystemScores
        .map(
          (item) =>
            `<tr><td>${escapeHtml(item.label)}</td><td>${item.score}%</td><td>${escapeHtml(item.status)}</td><td>${item.passed ? "PASS" : "FAIL"}</td></tr>`
        )
        .join("")}
    </tbody>
  </table>
  <h2>Blockers</h2>
  <ul>${report.blockers.map((item) => `<li>${escapeHtml(item.title)} — ${escapeHtml(item.detail)}</li>`).join("") || "<li>None</li>"}</ul>
  <h2>Warnings</h2>
  <ul>${report.warnings.slice(0, 15).map((item) => `<li>${escapeHtml(item.title)}</li>`).join("") || "<li>None</li>"}</ul>
  <p><em>Print this page to PDF for the release candidate record.</em></p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Release Candidate Report — ${escapeHtml(report.rcNumber)}</title>
  <style>
    body { font-family: Helvetica, Arial, sans-serif; color: #111; margin: 40px; line-height: 1.45; }
    h1, h2 { margin-bottom: 8px; }
    .meta { color: #444; margin-bottom: 20px; }
    .verdict { font-size: 1.35rem; font-weight: 700; margin: 16px 0; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.9rem; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    ul { padding-left: 20px; }
    @media print { body { margin: 24px; } }
  </style>
</head>
<body>${body}</body>
</html>`;
}
