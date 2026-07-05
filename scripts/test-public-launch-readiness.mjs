#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hqRoot = join(dirname(root), "stankings");
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const assetsChecklist = read("play-store/ASSETS_CHECKLIST.md");
assert(assetsChecklist.includes("Feature graphic"), "assets checklist feature graphic");
assert(assetsChecklist.includes("Screenshots"), "assets checklist screenshots");
assert(assetsChecklist.includes("bamsignal.com/privacy"), "privacy URL in checklist");
assert(assetsChecklist.includes("bamsignal.com/terms"), "terms URL in checklist");

assert(
  existsSync(join(root, "play-store/assets/feature-graphic-1024x500.png")),
  "feature graphic file on disk",
);
assert(
  existsSync(join(root, "store-assets/captions/play-store-copy.txt")),
  "play store copy on disk",
);

const footer = read("src/constants/footer.ts");
for (const path of ["/terms", "/privacy", "/safety-policy", "/contact"]) {
  assert(footer.includes(`"${path}"`), `footer legal paths include ${path}`);
}

const routeAudit = read("src/utils/routeAudit.ts");
assert(routeAudit.includes("/faq"), "route audit includes FAQ hub");
assert(routeAudit.includes("LEGAL_PATHS"), "route audit registers legal paths");

const hqExecutive = join(
  hqRoot,
  "docs/bamsignal/launch-readiness/PROGRAM-001-EXECUTIVE-LAUNCH-REPORT.md",
);
if (existsSync(hqExecutive)) {
  const text = readFileSync(hqExecutive, "utf8");
  assert(text.includes("NO_GO"), "HQ executive report synced");
  assert(!text.match(/\b92%\b/), "HQ report must not use assumed percentages");
} else {
  console.log("SKIP: HQ executive report not at sibling path");
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("PASS: PROGRAM 001 Milestone 4 public launch readiness (BamSignal)");
