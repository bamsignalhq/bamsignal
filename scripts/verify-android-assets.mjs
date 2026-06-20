#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = join(root, "dist");
const androidRoot = join(root, "android", "app", "src", "main", "assets", "public");

function readRequired(path) {
  if (!existsSync(path)) {
    throw new Error(`Missing ${relative(root, path)}. Run npm run build and npx cap sync android first.`);
  }
  return readFileSync(path, "utf8");
}

function normalizeAssetRef(ref) {
  return ref
    .split(/[?#]/)[0]
    .replace(/^\.\//, "")
    .replace(/^\//, "");
}

function extractAssetRefs(html, extension) {
  const refs = new Set();
  const attrPattern = /\b(?:src|href)=["']([^"']+)["']/g;
  for (const match of html.matchAll(attrPattern)) {
    const ref = normalizeAssetRef(match[1]);
    if (ref.startsWith("assets/") && ref.endsWith(extension)) {
      refs.add(ref);
    }
  }
  return [...refs].sort();
}

function extractBuildMarker(html) {
  const meta = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => match[0])
    .find((tag) => /\bname=["']bamsignal-build["']/i.test(tag));
  if (!meta) return null;
  return meta.match(/\bcontent=["']([^"']+)["']/i)?.[1] ?? null;
}

function extractServiceWorkerCacheName(targetRoot) {
  const swPath = join(targetRoot, "sw.js");
  if (!existsSync(swPath)) return null;
  const sw = readFileSync(swPath, "utf8");
  return sw.match(/\bCACHE_NAME\s*=\s*["']([^"']+)["']/)?.[1] ?? null;
}

function hashAsset(targetRoot, ref) {
  const path = join(targetRoot, ref);
  if (!existsSync(path)) return null;
  return createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 16);
}

function collectTarget(label, targetRoot) {
  const html = readRequired(join(targetRoot, "index.html"));
  const jsRefs = extractAssetRefs(html, ".js");
  const cssRefs = extractAssetRefs(html, ".css");

  return {
    label,
    root: targetRoot,
    buildMarker: extractBuildMarker(html),
    swCacheVersion: extractServiceWorkerCacheName(targetRoot),
    js: jsRefs.map((ref) => ({ ref, hash: hashAsset(targetRoot, ref) })),
    css: cssRefs.map((ref) => ({ ref, hash: hashAsset(targetRoot, ref) }))
  };
}

function listRefs(items) {
  return items.map((item) => item.ref);
}

function sameList(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function compareRefList(errors, kind, distItems, androidItems) {
  const distRefs = listRefs(distItems);
  const androidRefs = listRefs(androidItems);
  if (!sameList(distRefs, androidRefs)) {
    errors.push(
      `${kind} asset references differ:\n` +
        `  dist: ${distRefs.length ? distRefs.join(", ") : "(none)"}\n` +
        `  android: ${androidRefs.length ? androidRefs.join(", ") : "(none)"}`
    );
  }
}

function compareHashes(errors, kind, distItems, androidItems) {
  const androidByRef = new Map(androidItems.map((item) => [item.ref, item]));
  for (const distItem of distItems) {
    const androidItem = androidByRef.get(distItem.ref);
    if (!androidItem) continue;
    if (!distItem.hash) {
      errors.push(`dist is missing ${kind} asset ${distItem.ref}`);
      continue;
    }
    if (!androidItem.hash) {
      errors.push(`android is missing ${kind} asset ${distItem.ref}`);
      continue;
    }
    if (distItem.hash !== androidItem.hash) {
      errors.push(
        `${kind} asset content differs for ${distItem.ref}: ` +
          `dist=${distItem.hash} android=${androidItem.hash}`
      );
    }
  }
}

export function collectAndroidAssetParity() {
  const dist = collectTarget("dist", distRoot);
  const android = collectTarget("android", androidRoot);
  const errors = [];

  compareRefList(errors, "JS", dist.js, android.js);
  compareRefList(errors, "CSS", dist.css, android.css);
  compareHashes(errors, "JS", dist.js, android.js);
  compareHashes(errors, "CSS", dist.css, android.css);

  if (!dist.buildMarker || dist.buildMarker.includes("__BAMSIGNAL_BUILD__")) {
    errors.push("dist/index.html is missing a resolved bamsignal-build marker");
  }
  if (!android.buildMarker || android.buildMarker.includes("__BAMSIGNAL_BUILD__")) {
    errors.push("Android index.html is missing a resolved bamsignal-build marker");
  }
  if (dist.buildMarker && android.buildMarker && dist.buildMarker !== android.buildMarker) {
    errors.push(`Build marker differs: dist=${dist.buildMarker} android=${android.buildMarker}`);
  }

  if (
    (dist.swCacheVersion || android.swCacheVersion) &&
    dist.swCacheVersion !== android.swCacheVersion
  ) {
    errors.push(
      `Service worker cache version differs: ` +
        `dist=${dist.swCacheVersion ?? "(none)"} android=${android.swCacheVersion ?? "(none)"}`
    );
  }

  return { dist, android, errors };
}

function formatHashLines(items) {
  if (!items.length) return ["  (none)"];
  return items.map((item) => `  ${item.ref} sha256=${item.hash ?? "missing"}`);
}

export function formatAndroidAssetParityReport(result) {
  return [
    "[bamsignal] Android asset parity",
    `build marker: dist=${result.dist.buildMarker ?? "(none)"} android=${result.android.buildMarker ?? "(none)"}`,
    `service worker cache: dist=${result.dist.swCacheVersion ?? "(none)"} android=${result.android.swCacheVersion ?? "(none)"}`,
    "dist JS hashes:",
    ...formatHashLines(result.dist.js),
    "Android JS hashes:",
    ...formatHashLines(result.android.js),
    "dist CSS hashes:",
    ...formatHashLines(result.dist.css),
    "Android CSS hashes:",
    ...formatHashLines(result.android.css)
  ].join("\n");
}

export function verifyAndroidAssetParity() {
  const result = collectAndroidAssetParity();
  if (result.errors.length) {
    const error = new Error(result.errors.join("\n"));
    error.result = result;
    throw error;
  }
  return result;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath && invokedPath === fileURLToPath(import.meta.url)) {
  try {
    const result = verifyAndroidAssetParity();
    console.log(formatAndroidAssetParityReport(result));
    console.log("[bamsignal] Android asset parity OK");
  } catch (error) {
    if (error.result) {
      console.error(formatAndroidAssetParityReport(error.result));
    }
    console.error("[bamsignal] Android assets are stale.");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
