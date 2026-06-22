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

const constantsSource = readFileSync(
  join(rootPath, "src/constants/houseInstituteDataPipeline.ts"),
  "utf8"
);
assert(constantsSource.includes("House Institute Data Pipeline™"), "pipeline brand");
assert(constantsSource.includes('"applications"'), "applications data source");
assert(constantsSource.includes('"consultations"'), "consultations data source");
assert(constantsSource.includes('"legacy-families"'), "legacy families data source");
assert(constantsSource.includes('"diaspora-corridors"'), "diaspora corridors data source");
assert(constantsSource.includes("relationship-trends"), "relationship trends output");
assert(constantsSource.includes("annual-reports"), "future annual reports");
assert(constantsSource.includes("public-dashboards"), "future public dashboards");

const logicSource = readFileSync(join(rootPath, "src/utils/houseInstituteDataPipelineLogic.ts"), "utf8");
assert(logicSource.includes("buildHouseInstituteDataPipelineBundle"), "pipeline bundle builder");
assert(logicSource.includes("assertHousePipelineExcludesPersonalData"), "anonymity assertion");
assert(logicSource.includes("buildJourneyIntelligenceMetrics"), "journey intelligence integration");

const engineSource = readFileSync(join(rootPath, "src/utils/houseInstituteDataPipelineEngine.ts"), "utf8");
assert(engineSource.includes("getHouseInstituteDataPipelineBundle"), "pipeline engine");

const componentFiles = [
  "ResearchPipelineCard.tsx",
  "TrendCategoryCard.tsx",
  "InstitutionInsightCard.tsx",
  "LegacyResearchCard.tsx",
  "ObservatoryFeedCard.tsx",
  "HouseInstituteDataPipelineSection.tsx"
];

for (const file of componentFiles) {
  assert(
    readFileSync(
      join(rootPath, "src/components/bamSignalInstitute/houseInstitute/dataPipeline", file),
      "utf8"
    ).length > 0,
    `${file} exists`
  );
}

const intelligenceEngineSource = readFileSync(join(rootPath, "src/utils/journeyIntelligenceEngine.ts"), "utf8");
assert(intelligenceEngineSource.includes("housePipeline"), "journey intelligence house pipeline");

const intelligencePageSource = readFileSync(
  join(rootPath, "src/components/admin/concierge/JourneyIntelligencePage.tsx"),
  "utf8"
);
assert(intelligencePageSource.includes("HouseInstitutePipelineBridgeCard"), "journey intelligence bridge card");

const houseInstitutePageSource = readFileSync(
  join(rootPath, "src/components/bamSignalInstitute/houseInstitute/HouseInstitutePage.tsx"),
  "utf8"
);
assert(houseInstitutePageSource.includes("HouseInstituteDataPipelineSection"), "house institute pipeline section");

const observatoryPageSource = readFileSync(
  join(rootPath, "src/components/bamSignalInstitute/bamSignalObservatory/ObservatoryPage.tsx"),
  "utf8"
);
assert(observatoryPageSource.includes("ObservatoryFeedCard"), "observatory feed integration");

const relationshipIndexPageSource = readFileSync(
  join(rootPath, "src/components/bamSignalInstitute/relationshipIndex/RelationshipIndexPage.tsx"),
  "utf8"
);
assert(relationshipIndexPageSource.includes("InstitutionInsightCard"), "relationship index integration");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:house-pipeline"), "package.json defines test:house-pipeline");

if (failed) process.exit(1);
console.log("house pipeline tests ok");
