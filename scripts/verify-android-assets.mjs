#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = join(root, "dist");
const androidRoot = join(root, "android", "app", "src", "main", "assets", "public");

export const ANDROID_ASSET_FIX_HINT =
  "Fix: rm -rf dist android/app/src/main/assets/public && npm run build && npx cap sync android && npm run android:verify-assets";

function readRequired(path, label) {
  if (!existsSync(path)) {
    throw new Error(
      `${label} is missing at ${relative(root, path)}.\n${ANDROID_ASSET_FIX_HINT}`
    );
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

function hashFile(targetRoot, relativePath) {
  const path = join(targetRoot, relativePath);
  if (!existsSync(path)) return null;
  return createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 16);
}

function hashAsset(targetRoot, ref) {
  return hashFile(targetRoot, ref);
}

function collectTarget(label, targetRoot) {
  const indexPath = join(targetRoot, "index.html");
  const html = readRequired(indexPath, `${label}/index.html`);
  const jsRefs = extractAssetRefs(html, ".js");
  const cssRefs = extractAssetRefs(html, ".css");

  return {
    label,
    root: targetRoot,
    indexPath,
    buildMarker: extractBuildMarker(html),
    swCacheVersion: extractServiceWorkerCacheName(targetRoot),
    swHash: hashFile(targetRoot, "sw.js"),
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
      `${kind} asset references differ between dist and Android bundle.\n` +
        `  dist:    ${distRefs.length ? distRefs.join(", ") : "(none)"}\n` +
        `  android: ${androidRefs.length ? androidRefs.join(", ") : "(none)"}\n` +
        ANDROID_ASSET_FIX_HINT
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
      errors.push(`android bundle is missing ${kind} asset ${distItem.ref}`);
      continue;
    }
    if (distItem.hash !== androidItem.hash) {
      errors.push(
        `${kind} asset content hash differs for ${distItem.ref}:\n` +
          `  dist sha256=${distItem.hash}\n` +
          `  android sha256=${androidItem.hash}\n` +
          ANDROID_ASSET_FIX_HINT
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
    errors.push(
      "dist/index.html is missing a resolved bamsignal-build marker.\n" +
        "Run npm run build and confirm index.html contains meta name=\"bamsignal-build\"."
    );
  }
  if (!android.buildMarker || android.buildMarker.includes("__BAMSIGNAL_BUILD__")) {
    errors.push(
      "android/app/src/main/assets/public/index.html is missing a resolved bamsignal-build marker.\n" +
        "Run npx cap sync android after a fresh npm run build."
    );
  }
  if (dist.buildMarker && android.buildMarker && dist.buildMarker !== android.buildMarker) {
    errors.push(
      `Build marker differs:\n` +
        `  dist:    ${dist.buildMarker}\n` +
        `  android: ${android.buildMarker}\n` +
        ANDROID_ASSET_FIX_HINT
    );
  }

  if (
    (dist.swCacheVersion || android.swCacheVersion) &&
    dist.swCacheVersion !== android.swCacheVersion
  ) {
    errors.push(
      `Service worker CACHE_NAME differs:\n` +
        `  dist:    ${dist.swCacheVersion ?? "(none)"}\n` +
        `  android: ${android.swCacheVersion ?? "(none)"}\n` +
        ANDROID_ASSET_FIX_HINT
    );
  }

  if (dist.swHash && android.swHash && dist.swHash !== android.swHash) {
    errors.push(
      `Service worker file content differs:\n` +
        `  dist sha256=${dist.swHash}\n` +
        `  android sha256=${android.swHash}\n` +
        ANDROID_ASSET_FIX_HINT
    );
  }

  if (dist.buildMarker && dist.swCacheVersion && dist.buildMarker !== dist.swCacheVersion) {
    errors.push(
      `dist build marker does not match service worker cache name:\n` +
        `  index.html marker: ${dist.buildMarker}\n` +
        `  sw.js CACHE_NAME:  ${dist.swCacheVersion}\n` +
        "Rebuild web assets — npm run build must stamp both values together."
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
    `service worker hash: dist=${result.dist.swHash ?? "(none)"} android=${result.android.swHash ?? "(none)"}`,
    "dist JS refs:",
    ...formatHashLines(result.dist.js),
    "Android JS refs:",
    ...formatHashLines(result.android.js),
    "dist CSS refs:",
    ...formatHashLines(result.dist.css),
    "Android CSS refs:",
    ...formatHashLines(result.android.css)
  ].join("\n");
}

export function verifyAndroidAssetParity() {
  const result = collectAndroidAssetParity();
  if (result.errors.length) {
    const error = new Error(result.errors.join("\n\n"));
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
    console.error("[bamsignal] Android assets are stale — release blocked.");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
