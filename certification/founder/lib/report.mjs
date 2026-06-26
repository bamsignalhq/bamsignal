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
        `| ${item.label} | ${item.score}% | ${item.status} | ${item.summary.replace(/\|/g, "\\|")} |`
    )
    .join("\n");
}

function issueList(items) {
  if (!items.length) return "- None";
  return items.map((item) => `- **${item.title}** (${item.subsystemId}): ${item.detail}`).join("\n");
}

export function writeFounderReports(outputDir, report) {
  mkdirSync(outputDir, { recursive: true });
  const stamp = report.runId;
  const jsonPath = join(outputDir, `founder-cert-${stamp}.json`);
  const mdPath = join(outputDir, `founder-cert-${stamp}.md`);
  const founderPdfPath = join(outputDir, `founder-cert-${stamp}-founder.pdf.html`);
  const boardPdfPath = join(outputDir, `founder-cert-${stamp}-board.pdf.html`);
  const latestPath = join(outputDir, "latest.json");

  const exportMeta = {
    json: jsonPath,
    markdown: mdPath,
    founderPdf: founderPdfPath,
    boardPdf: boardPdfPath
  };

  const fullReport = { ...report, exports: exportMeta };
  writeFileSync(jsonPath, `${JSON.stringify(fullReport, null, 2)}\n`, "utf8");
  writeFileSync(latestPath, `${JSON.stringify(fullReport, null, 2)}\n`, "utf8");
  writeFileSync(mdPath, renderMarkdown(fullReport), "utf8");
  writeFileSync(founderPdfPath, renderFounderPdfHtml(fullReport), "utf8");
  writeFileSync(boardPdfPath, renderBoardPdfHtml(fullReport), "utf8");

  return { jsonPath, mdPath, founderPdfPath, boardPdfPath, latestPath };
}

function renderMarkdown(report) {
  return `# Founder Launch Certification™

**Run ID:** ${report.runId}  
**Release candidate:** ${report.releaseCandidate}  
**Generated:** ${report.generatedAt}  
**Overall score:** ${report.overallScore}%  
**Decision:** ${report.releaseDecisionLabel}

## Subsystem scores

| Subsystem | Score | Status | Summary |
|-----------|------:|--------|---------|
${subsystemRows(report.subsystemScores)}

## Critical issues

${issueList(report.criticalIssues)}

## Warnings

${issueList(report.warnings)}

## Resolved since last release

${report.resolvedSinceLastRelease.length ? report.resolvedSinceLastRelease.map((item) => `- ${item}`).join("\n") : "- None"}

---
Command: \`npm run certify:founder\`
`;
}

function pdfShell(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #111; margin: 40px; line-height: 1.45; }
    h1, h2 { font-family: Helvetica, Arial, sans-serif; }
    .meta { color: #444; margin-bottom: 24px; }
    .verdict { font-size: 1.4rem; font-weight: 700; margin: 16px 0; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.92rem; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    ul { padding-left: 20px; }
    @media print { body { margin: 24px; } }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

function renderFounderPdfHtml(report) {
  const body = `
  <h1>Founder Launch Certification™</h1>
  <p class="meta">Release candidate: <strong>${escapeHtml(report.releaseCandidate)}</strong><br />
  Generated: ${escapeHtml(report.generatedAt)}<br />
  Run ID: ${escapeHtml(report.runId)}</p>
  <p class="verdict">${escapeHtml(report.releaseDecisionLabel)} — ${report.overallScore}% overall</p>
  <p>${escapeHtml(report.releaseDecisionDetail)}</p>
  <h2>Subsystem scores</h2>
  <table>
    <thead><tr><th>Subsystem</th><th>Score</th><th>Status</th></tr></thead>
    <tbody>
      ${report.subsystemScores
        .map(
          (item) =>
            `<tr><td>${escapeHtml(item.label)}</td><td>${item.score}%</td><td>${escapeHtml(item.status)}</td></tr>`
        )
        .join("")}
    </tbody>
  </table>
  <h2>Critical blockers</h2>
  <ul>${report.criticalIssues.map((item) => `<li>${escapeHtml(item.title)} — ${escapeHtml(item.detail)}</li>`).join("") || "<li>None</li>"}</ul>
  <h2>Resolved since last release</h2>
  <ul>${report.resolvedSinceLastRelease.map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>None</li>"}</ul>
  <p><em>Print this page to PDF for the founder launch record.</em></p>`;
  return pdfShell("Founder Launch Certification", body);
}

function renderBoardPdfHtml(report) {
  const body = `
  <h1>BamSignal Board Launch Brief</h1>
  <p class="meta">Institutional launch decision summary for board review.<br />
  Release candidate: <strong>${escapeHtml(report.releaseCandidate)}</strong></p>
  <p class="verdict">${escapeHtml(report.releaseDecisionLabel)}</p>
  <p>Overall institutional score: <strong>${report.overallScore}%</strong></p>
  <p>${escapeHtml(report.releaseDecisionDetail)}</p>
  <h2>Risk summary</h2>
  <ul>
    <li>Critical issues: ${report.criticalIssues.length}</li>
    <li>Warnings: ${report.warnings.length}</li>
    <li>Resolved since prior release: ${report.resolvedSinceLastRelease.length}</li>
  </ul>
  <h2>Subsystem health</h2>
  <table>
    <thead><tr><th>Domain</th><th>Score</th><th>Status</th></tr></thead>
    <tbody>
      ${report.subsystemScores
        .map(
          (item) =>
            `<tr><td>${escapeHtml(item.label)}</td><td>${item.score}%</td><td>${escapeHtml(item.status)}</td></tr>`
        )
        .join("")}
    </tbody>
  </table>
  <h2>Warnings</h2>
  <ul>${report.warnings.slice(0, 12).map((item) => `<li>${escapeHtml(item.title)}</li>`).join("") || "<li>None</li>"}</ul>
  <p><em>Print this page to PDF for board distribution.</em></p>`;
  return pdfShell("BamSignal Board Launch Brief", body);
}
