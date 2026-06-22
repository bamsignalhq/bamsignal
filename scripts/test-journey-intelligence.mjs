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

const constantsSource = readFileSync(join(rootPath, "src/constants/journeyIntelligence.ts"), "utf8");
assert(constantsSource.includes("Journey Intelligence Dashboard™"), "intelligence brand");
assert(constantsSource.includes('JOURNEY_INTELLIGENCE_PATH = "/hard/concierge/intelligence"'), "intelligence route");
assert(constantsSource.includes("Mutual acceptances"), "executive metrics");
assert(constantsSource.includes("Success stories"), "success story metric");
assert(constantsSource.includes("Predictive insights"), "future predictive insights documented");
assert(constantsSource.includes("House Institute integration"), "future house institute documented");

const typesSource = readFileSync(join(rootPath, "src/types/journeyIntelligence.ts"), "utf8");
assert(typesSource.includes("JourneyIntelligenceConsultantInsight"), "consultant insight type");
assert(typesSource.includes("JourneyIntelligenceRegionalInsights"), "regional insight type");
assert(typesSource.includes("legacyGrowth"), "legacy growth in bundle");

const logicSource = readFileSync(join(rootPath, "src/utils/journeyIntelligenceLogic.ts"), "utf8");
assert(logicSource.includes("buildJourneyIntelligenceMetrics"), "executive metrics builder");
assert(logicSource.includes("buildConsultantInsights"), "consultant metrics");
assert(logicSource.includes("buildRegionalInsights"), "regional metrics");
assert(logicSource.includes("buildLegacyGrowthSignals"), "legacy growth signals");
assert(logicSource.includes("bothConsented"), "mutual acceptance counting");

const engineSource = readFileSync(join(rootPath, "src/utils/journeyIntelligenceEngine.ts"), "utf8");
assert(engineSource.includes("buildJourneyIntelligenceBundle"), "intelligence engine bundle");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("journey-intelligence"), "hard routes parse intelligence view");

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("JourneyIntelligencePage"), "admin hub mounts intelligence page");

const componentFiles = [
  "JourneyIntelligencePage.tsx",
  "JourneyMetricCard.tsx",
  "ConsultantInsightsCard.tsx",
  "RegionalInsightsCard.tsx",
  "JourneyTrendCard.tsx",
  "LegacyGrowthCard.tsx"
];

for (const file of componentFiles) {
  assert(
    readFileSync(join(rootPath, "src/components/admin/concierge", file), "utf8").length > 0,
    `${file} exists`
  );
}

const dashboardSource = readFileSync(
  join(rootPath, "src/components/admin/concierge/ConsultantDashboardPage.tsx"),
  "utf8"
);
assert(dashboardSource.includes("JOURNEY_INTELLIGENCE_NAV_LABEL"), "dashboard links to intelligence");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:journey-intelligence"), "package.json defines test:journey-intelligence");

if (failed) process.exit(1);
console.log("journey intelligence tests ok");
