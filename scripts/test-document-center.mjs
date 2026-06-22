#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/documentCenterAdmin.ts"), "utf8");
assert(adminSource.includes('DOCUMENT_CENTER_ADMIN_PATH = "/hard/documents"'), "admin documents route");

const constantsSource = readFileSync(join(rootPath, "src/constants/documentCenter.ts"), "utf8");
assert(constantsSource.includes("Document Center™"), "document center brand");
assert(constantsSource.includes("consultant-guides"), "consultant guides category");
assert(constantsSource.includes("meeting-frameworks"), "meeting frameworks category");
assert(constantsSource.includes("DOCUMENT_CENTER_FUTURE_KINDS"), "future kinds documented");
assert(constantsSource.includes("Document signatures"), "document signatures future item");
assert(constantsSource.includes("AI search"), "ai search future item");
assert(constantsSource.includes("Knowledge retrieval"), "knowledge retrieval future item");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("documents"), "hard routes include documents tab");

const engineSource = readFileSync(join(rootPath, "src/utils/documentCenterEngine.ts"), "utf8");
assert(engineSource.includes("buildDocumentCenterBundle"), "document center engine exists");

const logicSource = readFileSync(join(rootPath, "src/utils/documentCenterLogic.ts"), "utf8");
assert(logicSource.includes("filterDocuments"), "document filter logic");
assert(logicSource.includes("countDocumentsByCategory"), "category counts");

const seedSource = readFileSync(join(rootPath, "src/data/documentCenterSeed.ts"), "utf8");
assert(seedSource.includes("versionHistory"), "seed includes version history");
assert(seedSource.includes("approval"), "seed includes approval metadata");

const adminComponents = [
  "DocumentCard.tsx",
  "DocumentCategoryCard.tsx",
  "DocumentVersionCard.tsx",
  "DocumentApprovalCard.tsx",
  "DocumentSearchCard.tsx",
  "DocumentCenterPage.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/documents", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("DocumentCenterPage"), "admin hub mounts document center");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"documents"'), "admin nav includes documents tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:document-center"), "package.json defines test:document-center");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("document-center.css"), "document center styles imported");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Document Center checks passed.");
