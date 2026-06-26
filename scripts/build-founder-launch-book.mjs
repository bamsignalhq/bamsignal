#!/usr/bin/env node
/**
 * Founder Launch Book™ — assemble versioned Markdown + print-ready PDF HTML.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import {
  FOUNDER_LAUNCH_BOOK_BRAND,
  FOUNDER_LAUNCH_BOOK_CHAPTERS,
  FOUNDER_LAUNCH_BOOK_EDITION,
  FOUNDER_LAUNCH_BOOK_VERSION
} from "../shared/founderLaunchBookManifest.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
const chaptersDir = join(rootPath, "docs/founder-launch-book/chapters");
const exportsDir = join(rootPath, "docs/founder-launch-book/exports");

function readChapter(file) {
  return readFileSync(join(chaptersDir, file), "utf8").trim();
}

function resolveCommitSha() {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: rootPath, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function markdownToHtmlBody(markdown) {
  const lines = markdown.split("\n");
  const parts = [];
  let inList = false;
  let inCode = false;
  let codeBuffer = [];

  function closeList() {
    if (inList) {
      parts.push("</ul>");
      inList = false;
    }
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (!inCode) {
        closeList();
        inCode = true;
        codeBuffer = [];
      } else {
        parts.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
        inCode = false;
      }
      continue;
    }
    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    if (line.startsWith("### ")) {
      closeList();
      parts.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      closeList();
      parts.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      closeList();
      parts.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith("- ")) {
      if (!inList) {
        parts.push("<ul>");
        inList = true;
      }
      parts.push(`<li>${escapeHtml(line.slice(2))}</li>`);
      continue;
    }
    if (/^\|.+\|$/.test(line.trim())) {
      closeList();
      parts.push(`<p><code>${escapeHtml(line.trim())}</code></p>`);
      continue;
    }
    if (!line.trim()) {
      closeList();
      continue;
    }
    closeList();
    parts.push(`<p>${escapeHtml(line)}</p>`);
  }
  closeList();
  return parts.join("\n");
}

function buildBookMarkdown(generatedAt, commitSha) {
  const frontMatter = `# ${FOUNDER_LAUNCH_BOOK_BRAND}

**Version:** ${FOUNDER_LAUNCH_BOOK_VERSION}  
**Edition:** ${FOUNDER_LAUNCH_BOOK_EDITION}  
**Generated:** ${generatedAt}  
**Repository commit:** \`${commitSha}\`  
**Production URL:** https://bamsignal.com  
**Control plane:** https://control.bamsignal.com (Coolify)

---

## Table of contents

${FOUNDER_LAUNCH_BOOK_CHAPTERS.map((chapter, index) => `${index + 1}. [${chapter.title}](#${chapter.id})`).join("\n")}

---

`;

  const body = FOUNDER_LAUNCH_BOOK_CHAPTERS.map((chapter) => {
    const source = readChapter(chapter.file);
    return `<!-- chapter:${chapter.id} -->\n\n<a id="${chapter.id}"></a>\n\n${source}\n`;
  }).join("\n---\n\n");

  const footer = `\n---\n\n*End of ${FOUNDER_LAUNCH_BOOK_BRAND} v${FOUNDER_LAUNCH_BOOK_VERSION}*\n`;

  return `${frontMatter}${body}${footer}`;
}

function buildPdfHtml(markdown, generatedAt, commitSha) {
  const chapterHtml = FOUNDER_LAUNCH_BOOK_CHAPTERS.map((chapter) => {
    const source = readChapter(chapter.file);
    return `<section class="chapter" id="${chapter.id}">
  <h2>${escapeHtml(chapter.title)}</h2>
  ${markdownToHtmlBody(source.replace(/^# .+$/m, ""))}
</section>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(FOUNDER_LAUNCH_BOOK_BRAND)} v${FOUNDER_LAUNCH_BOOK_VERSION}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #111; margin: 40px; line-height: 1.5; font-size: 11pt; }
    h1, h2, h3 { font-family: Helvetica, Arial, sans-serif; page-break-after: avoid; }
    h1 { font-size: 1.8rem; border-bottom: 2px solid #1a0a2e; padding-bottom: 8px; }
    h2 { font-size: 1.25rem; margin-top: 28px; color: #1a0a2e; }
    h3 { font-size: 1.05rem; margin-top: 18px; }
    .meta { color: #444; margin: 16px 0 32px; }
    .toc { margin: 24px 0; padding: 16px; background: #f8f6fb; border: 1px solid #ddd; }
    .toc ol { margin: 0; padding-left: 20px; }
    .chapter { page-break-inside: avoid; margin-bottom: 24px; }
    pre { background: #f5f5f5; padding: 12px; overflow-x: auto; font-size: 0.85rem; }
    code { font-family: Menlo, Consolas, monospace; font-size: 0.9em; }
    @media print {
      body { margin: 24px; }
      .chapter { page-break-before: auto; }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(FOUNDER_LAUNCH_BOOK_BRAND)}</h1>
  <p class="meta">
    Version <strong>${FOUNDER_LAUNCH_BOOK_VERSION}</strong> · ${escapeHtml(FOUNDER_LAUNCH_BOOK_EDITION)}<br />
    Generated ${escapeHtml(generatedAt)} · Commit <code>${escapeHtml(commitSha)}</code><br />
    Production: <strong>https://bamsignal.com</strong> · Coolify: <strong>https://control.bamsignal.com</strong>
  </p>
  <div class="toc">
    <h2>Table of contents</h2>
    <ol>
      ${FOUNDER_LAUNCH_BOOK_CHAPTERS.map((chapter) => `<li><a href="#${chapter.id}">${escapeHtml(chapter.title)}</a></li>`).join("\n      ")}
    </ol>
  </div>
  ${chapterHtml}
  <p><em>Print this document to PDF for the institutional operations record.</em></p>
</body>
</html>`;
}

function main() {
  const generatedAt = new Date().toISOString();
  const commitSha = resolveCommitSha();
  const markdown = buildBookMarkdown(generatedAt, commitSha);
  const pdfHtml = buildPdfHtml(markdown, generatedAt, commitSha);

  mkdirSync(exportsDir, { recursive: true });

  const versionedMd = join(exportsDir, `founder-launch-book-v${FOUNDER_LAUNCH_BOOK_VERSION}.md`);
  const versionedPdf = join(exportsDir, `founder-launch-book-v${FOUNDER_LAUNCH_BOOK_VERSION}.pdf.html`);
  const latestMd = join(exportsDir, "latest.md");
  const latestPdf = join(exportsDir, "latest.pdf.html");
  const manifestPath = join(exportsDir, "manifest.json");

  const manifest = {
    brand: FOUNDER_LAUNCH_BOOK_BRAND,
    version: FOUNDER_LAUNCH_BOOK_VERSION,
    edition: FOUNDER_LAUNCH_BOOK_EDITION,
    generatedAt,
    commitSha,
    chapters: FOUNDER_LAUNCH_BOOK_CHAPTERS.length,
    exports: {
      markdown: versionedMd,
      pdfHtml: versionedPdf,
      latestMarkdown: latestMd,
      latestPdfHtml: latestPdf
    }
  };

  writeFileSync(versionedMd, `${markdown}\n`, "utf8");
  writeFileSync(latestMd, `${markdown}\n`, "utf8");
  writeFileSync(versionedPdf, pdfHtml, "utf8");
  writeFileSync(latestPdf, pdfHtml, "utf8");
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(`\n=== ${FOUNDER_LAUNCH_BOOK_BRAND} ===\n`);
  console.log(`Version: ${FOUNDER_LAUNCH_BOOK_VERSION}`);
  console.log(`Chapters: ${FOUNDER_LAUNCH_BOOK_CHAPTERS.length}`);
  console.log(`Markdown: ${versionedMd}`);
  console.log(`PDF HTML: ${versionedPdf}`);
  console.log(`Manifest: ${manifestPath}\n`);
}

main();
