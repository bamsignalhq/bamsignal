#!/usr/bin/env node
/**
 * Founder Launch Book™ — structure verification.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FOUNDER_LAUNCH_BOOK_CHAPTERS,
  FOUNDER_LAUNCH_BOOK_VERSION
} from "../shared/founderLaunchBookManifest.mjs";
import {
  founderLaunchBookCommandRegistered,
  founderLaunchBookModuleRegistered
} from "../server/services/founderLaunchBook.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

assert(existsSync(join(rootPath, "scripts/build-founder-launch-book.mjs")), "build script exists");
assert(existsSync(join(rootPath, "docs/founder-launch-book/README.md")), "book readme exists");

for (const chapter of FOUNDER_LAUNCH_BOOK_CHAPTERS) {
  assert(
    existsSync(join(rootPath, "docs/founder-launch-book/chapters", chapter.file)),
    `chapter file ${chapter.file}`
  );
}

const packageJson = JSON.parse(read("package.json"));
assert(founderLaunchBookCommandRegistered(JSON.stringify(packageJson.scripts)), "npm scripts wired");
assert(founderLaunchBookModuleRegistered(read("package.json")), "build module registered");

const buildSource = read("scripts/build-founder-launch-book.mjs");
assert(buildSource.includes("pdf.html"), "pdf html export");
assert(buildSource.includes("manifest.json"), "version manifest export");
assert(buildSource.includes("FOUNDER_LAUNCH_BOOK_VERSION"), "versioned export paths");

const requiredChapterIds = [
  "architecture-overview",
  "deployment-process",
  "rollback-procedure",
  "feature-flags",
  "remote-config",
  "launch-checklist",
  "first-30-day-operations-plan"
];

for (const id of requiredChapterIds) {
  assert(
    FOUNDER_LAUNCH_BOOK_CHAPTERS.some((chapter) => chapter.id === id),
    `manifest includes ${id}`
  );
}

assert(FOUNDER_LAUNCH_BOOK_CHAPTERS.length === 23, "23 chapters in manifest");
assert(FOUNDER_LAUNCH_BOOK_VERSION.match(/^\d+\.\d+\.\d+$/), "semver version");

if (failed > 0) {
  console.error(`\nFounder launch book tests failed: ${failed}\n`);
  process.exit(1);
}

console.log("Founder launch book tests passed.\n");
