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

const careersRoutesSource = readFileSync(join(rootPath, "src/constants/careersRoutes.ts"), "utf8");
assert(careersRoutesSource.includes('CAREERS_BASE_PATH = "/careers"'), "canonical careers base path");
assert(careersRoutesSource.includes("openRoles"), "open roles route key");
assert(careersRoutesSource.includes("culture"), "culture route key");
assert(careersRoutesSource.includes("ourValues"), "values route key");
assert(careersRoutesSource.includes("hiringProcess"), "hiring process route key");
assert(careersRoutesSource.includes("kind: \"role\""), "role detail route kind");

const careersConstantsSource = readFileSync(join(rootPath, "src/constants/careers.ts"), "utf8");
assert(careersConstantsSource.includes("Careers & Talent System™"), "careers brand");
assert(careersConstantsSource.includes("signal-concierge"), "signal concierge category");
assert(careersConstantsSource.includes("TALENT_RECRUITING_FUTURE_KINDS"), "future-ready kinds documented");
assert(careersConstantsSource.includes("applicant-tracking"), "applicant tracking documented only");

const talentConstantsSource = readFileSync(join(rootPath, "src/constants/talentRecruiting.ts"), "utf8");
assert(talentConstantsSource.includes('TALENT_RECRUITING_PATH = "/hard/talent"'), "admin talent route");
assert(talentConstantsSource.includes('"applications"'), "applications pipeline stage");
assert(talentConstantsSource.includes('"talent-pool"'), "talent pool stage");

const routesSource = readFileSync(join(rootPath, "src/constants/routes.ts"), "utf8");
assert(routesSource.includes("isCareersRoute"), "public routes include careers");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("talent"), "hard routes include talent tab");

const seedSource = readFileSync(join(rootPath, "src/data/careersSeed.ts"), "utf8");
assert(seedSource.includes("Relationship Consultant"), "relationship consultant role");
assert(seedSource.includes("Executive Assistant"), "executive assistant role");

const engineSource = readFileSync(join(rootPath, "src/utils/talentRecruitingEngine.ts"), "utf8");
assert(engineSource.includes("buildTalentRecruitingBundle"), "talent recruiting engine exists");
assert(engineSource.includes("updateTalentCandidateStage"), "stage updates supported");

const publicComponents = [
  "CareerCategoryCard.tsx",
  "CareerRoleCard.tsx",
  "CultureCard.tsx",
  "ValuesCard.tsx",
  "HiringProcessCard.tsx",
  "CareersLandingPage.tsx"
];

for (const file of publicComponents) {
  const source = readFileSync(join(rootPath, "src/components/careers", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminComponents = [
  "ApplicationPipelineCard.tsx",
  "CandidateProfileCard.tsx",
  "TalentPoolCard.tsx",
  "TalentRecruitingPage.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/talent", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:careers"), "package.json defines test:careers");

if (failed) process.exit(1);
console.log("careers tests ok");
