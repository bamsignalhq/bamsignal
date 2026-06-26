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

const adminSource = readFileSync(join(rootPath, "src/constants/consultantAcademyAdmin.ts"), "utf8");
assert(adminSource.includes('CONSULTANT_ACADEMY_ADMIN_PATH = "/hard/academy"'), "admin academy route");

const constantsSource = readFileSync(join(rootPath, "src/constants/consultantAcademy.ts"), "utf8");
assert(constantsSource.includes("Consultant Academy™"), "academy brand");
assert(constantsSource.includes("relationship-consultant"), "relationship consultant track");
assert(constantsSource.includes("diaspora-consultant"), "diaspora consultant track");
assert(constantsSource.includes("master-steward"), "master steward certification");
assert(constantsSource.includes("mission-culture"), "mission culture module");
assert(constantsSource.includes("safety-escalations"), "safety escalations module");
assert(constantsSource.includes("CONSULTANT_ACADEMY_FUTURE_KINDS"), "future kinds documented");
assert(constantsSource.includes("Video learning"), "video learning future item");
assert(constantsSource.includes("Mentorship"), "mentorship future item");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("academy"), "hard routes include academy tab");

const engineSource = readFileSync(join(rootPath, "src/utils/consultantAcademyEngine.ts"), "utf8");
assert(engineSource.includes("buildConsultantAcademyBundle"), "academy engine exists");

const logicSource = readFileSync(join(rootPath, "src/utils/consultantAcademyLogic.ts"), "utf8");
assert(logicSource.includes("buildAcademyMetrics"), "academy metrics logic");
assert(logicSource.includes("modules-completed"), "modules completed metric");
assert(logicSource.includes("promotion-readiness"), "promotion readiness metric");

const seedSource = readFileSync(join(rootPath, "src/data/consultantAcademySeed.ts"), "utf8");
assert(seedSource.includes("moduleProgress"), "seed includes module progress");
assert(seedSource.includes("assessments"), "seed includes assessments");
assert(seedSource.includes("timeline"), "seed includes timeline");

const adminComponents = [
  "AcademyTrackCard.tsx",
  "TrainingModuleCard.tsx",
  "CertificationCard.tsx",
  "LearningProgressCard.tsx",
  "AssessmentCard.tsx",
  "AcademyTimelineCard.tsx",
  "ConsultantAcademyPage.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/academy", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("ConsultantAcademyPage"), "admin hub mounts consultant academy");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"academy"'), "admin nav includes academy tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:consultant-academy"), "package.json defines test:consultant-academy");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
const entryAdminSource = readFileSync(join(rootPath, "src/styles/entry-admin.css"), "utf8");
assert((entryAdminSource.includes("consultant-academy.css") || mainSource.includes("consultant-academy.css")), "academy styles imported");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Consultant Academy checks passed.");
