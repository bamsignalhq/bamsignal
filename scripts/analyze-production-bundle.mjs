#!/usr/bin/env node
/**
 * Production bundle analysis — reports largest JS/CSS assets and initial-load totals.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
const distAssets = join(rootPath, "dist", "assets");
const reportPath = join(rootPath, "BUNDLE_OPTIMIZATION_REPORT.md");

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatPct(saved, before) {
  if (!before) return "—";
  return `${Math.round((saved / before) * 100)}%`;
}

function listAssets() {
  if (!existsSync(distAssets)) {
    throw new Error("dist/assets missing — run npm run build first");
  }
  return readdirSync(distAssets)
    .map((name) => {
      const path = join(distAssets, name);
      const size = statSync(path).size;
      const kind = name.endsWith(".css") ? "css" : name.endsWith(".js") ? "js" : "other";
      return { name, path, size, kind };
    })
    .sort((a, b) => b.size - a.size);
}

function findInitialEntry(assets) {
  const indexJs = assets.filter((item) => item.kind === "js" && /^index-/.test(item.name));
  const indexCss = assets.filter((item) => item.kind === "css" && /^index-/.test(item.name));
  return {
    js: indexJs[0] ?? null,
    css: indexCss[0] ?? null,
    jsBytes: indexJs.reduce((sum, item) => sum + item.size, 0),
    cssBytes: indexCss.reduce((sum, item) => sum + item.size, 0)
  };
}

function largestImage() {
  const publicRoot = join(rootPath, "public");
  const stack = [publicRoot];
  let largest = { path: "", size: 0 };
  while (stack.length) {
    const dir = stack.pop();
    if (!dir) continue;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
        continue;
      }
      if (!/\.(png|jpe?g|webp|avif)$/i.test(entry.name)) continue;
      const size = statSync(full).size;
      if (size > largest.size) largest = { path: full.replace(`${rootPath}/`, ""), size };
    }
  }
  return largest;
}

const baselinePath = join(rootPath, "reports", "bundle-baseline.json");
const assets = listAssets();
const initial = findInitialEntry(assets);
const largestJs = assets.filter((item) => item.kind === "js").slice(0, 8);
const largestCss = assets.filter((item) => item.kind === "css").slice(0, 8);
const image = largestImage();
const deferredJs = assets
  .filter((item) => item.kind === "js" && !/^index-/.test(item.name))
  .slice(0, 6);

const snapshot = {
  generatedAt: new Date().toISOString(),
  initialJsBytes: initial.jsBytes,
  initialCssBytes: initial.cssBytes,
  initialTotalBytes: initial.jsBytes + initial.cssBytes,
  largestJs: largestJs.map((item) => ({ name: item.name, bytes: item.size })),
  largestCss: largestCss.map((item) => ({ name: item.name, bytes: item.size })),
  largestImage: image
};

let before = null;
if (existsSync(baselinePath)) {
  try {
    before = JSON.parse(readFileSync(baselinePath, "utf8"));
  } catch {
    before = null;
  }
}

if (!before) {
  writeFileSync(baselinePath, `${JSON.stringify(snapshot, null, 2)}\n`);
}

const jsSaved = before ? before.initialJsBytes - snapshot.initialJsBytes : 0;
const cssSaved = before ? before.initialCssBytes - snapshot.initialCssBytes : 0;
const totalSaved = before ? before.initialTotalBytes - snapshot.initialTotalBytes : 0;

const lines = [
  "# Production Bundle Optimization Report",
  "",
  `Generated: ${snapshot.generatedAt}`,
  "",
  "## Initial load (entry index chunks)",
  "",
  "| Metric | Before | After | Savings |",
  "|--------|--------|-------|---------|",
  `| Initial JS | ${before ? formatKb(before.initialJsBytes) : "—"} | ${formatKb(snapshot.initialJsBytes)} | ${before ? `${formatKb(jsSaved)} (${formatPct(jsSaved, before.initialJsBytes)})` : "baseline captured"} |`,
  `| Initial CSS | ${before ? formatKb(before.initialCssBytes) : "—"} | ${formatKb(snapshot.initialCssBytes)} | ${before ? `${formatKb(cssSaved)} (${formatPct(cssSaved, before.initialCssBytes)})` : "baseline captured"} |`,
  `| Initial total | ${before ? formatKb(before.initialTotalBytes) : "—"} | ${formatKb(snapshot.initialTotalBytes)} | ${before ? `${formatKb(totalSaved)} (${formatPct(totalSaved, before.initialTotalBytes)})` : "baseline captured"} |`,
  "",
  "## Largest JS chunks (deferred load acceptable)",
  "",
  ...largestJs.map((item) => `- \`${item.name}\` — ${formatKb(item.size)}`),
  "",
  "## Largest CSS chunks",
  "",
  ...largestCss.map((item) => `- \`${item.name}\` — ${formatKb(item.size)}`),
  "",
  "## Deferred route chunks (sample)",
  "",
  ...deferredJs.map((item) => `- \`${item.name}\` — ${formatKb(item.size)}`),
  "",
  "## Largest image (served)",
  "",
  `- \`${image.path}\` — ${formatKb(image.size)} (production uses WebP where available)`,
  "",
  "## Optimizations applied",
  "",
  "- CSS code-split: admin, public marketing, institute, careers, support, concierge, and moment styles load with their lazy routes",
  "- Voice Vibe page lazy-loaded from App shell",
  "- react-easy-crop dynamically imported in cover photo modal",
  "- Vite manual chunks: tensorflow, photo-crop, heic2any isolated from initial bundle",
  "- modulePreload polyfill disabled (modern browsers only)",
  ""
];

writeFileSync(reportPath, `${lines.join("\n")}\n`);
console.log(`Bundle report written to ${reportPath.replace(`${rootPath}/`, "")}`);
console.log(`Initial load: JS ${formatKb(snapshot.initialJsBytes)}, CSS ${formatKb(snapshot.initialCssBytes)}, total ${formatKb(snapshot.initialTotalBytes)}`);
