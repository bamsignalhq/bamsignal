#!/usr/bin/env node
/**
 * Bump CACHE_VERSION on every production build so service workers never serve stale bundles.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const buildInfoPath = join(root, "src", "buildInfo.ts");
const swPath = join(root, "public", "sw.js");
const buildTime = new Date().toISOString();
const buildStamp = Date.now().toString(36);
const envBuildId = String(process.env.VITE_APP_BUILD_ID || "").trim();

const raw = readFileSync(buildInfoPath, "utf8");
const version = raw.match(/BUILD_VERSION = "([^"]+)"/)?.[1] ?? "1.0.17";
const code = raw.match(/BUILD_CODE = "([^"]+)"/)?.[1] ?? "0";
const cacheVersion =
  envBuildId || `bamsignal-v${version}-${code}-${buildStamp}`;

const nextBuildInfo = raw
  .replace(/export const CACHE_VERSION = "[^"]+";/, `export const CACHE_VERSION = "${cacheVersion}";`)
  .replace(/export const BUILD_TIME = "[^"]+";/, `export const BUILD_TIME = "${buildTime}";`);

writeFileSync(buildInfoPath, nextBuildInfo, "utf8");

if (readFileSync(swPath, "utf8").includes("CACHE_NAME")) {
  const sw = readFileSync(swPath, "utf8");
  writeFileSync(
    swPath,
    sw.replace(/const CACHE_NAME = "[^"]+";/, `const CACHE_NAME = "${cacheVersion}";`),
    "utf8"
  );
}

console.log(`[bamsignal] CACHE_VERSION = ${cacheVersion}`);
