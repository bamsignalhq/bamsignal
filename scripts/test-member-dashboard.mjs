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

const constantsSource = readFileSync(join(rootPath, "src/constants/memberDashboard.ts"), "utf8");
assert(constantsSource.includes("Member Journey Dashboard™"), "dashboard brand");
assert(constantsSource.includes('MEMBER_JOURNEY_DASHBOARD_PATH = "/signal-concierge/dashboard"'), "dashboard route");
assert(constantsSource.includes("MEMBER_JOURNEY_READ_ONLY_COPY"), "read-only copy");

const routesSource = readFileSync(join(rootPath, "src/constants/signalConciergeRoutes.ts"), "utf8");
assert(routesSource.includes("dashboard"), "signal concierge dashboard route");
assert(routesSource.includes('"dashboard"'), "dashboard in auth routes");

const logicSource = readFileSync(join(rootPath, "src/utils/memberDashboardLogic.ts"), "utf8");
assert(logicSource.includes("buildMemberUpcomingItems"), "upcoming builder");
assert(logicSource.includes("buildMemberIntroductionBuckets"), "introduction buckets");
assert(logicSource.includes("buildMemberRelationshipJourney"), "relationship journey");
assert(logicSource.includes("buildMemberSuccessStorySummary"), "success story summary");
assert(logicSource.includes("buildMemberConsultantDetail"), "consultant detail");

const engineSource = readFileSync(join(rootPath, "src/utils/memberDashboardEngine.ts"), "utf8");
assert(engineSource.includes("buildMemberJourneyDashboardBundle"), "dashboard engine");

const componentFiles = [
  "JourneyOverviewCard.tsx",
  "JourneyTimelineCard.tsx",
  "JourneyConsultantCard.tsx",
  "JourneyIntroductionCard.tsx",
  "JourneyMilestoneCard.tsx",
  "JourneySuccessStoryCard.tsx",
  "JourneyUpcomingCard.tsx",
  "MemberJourneyDashboard.tsx"
];

for (const file of componentFiles) {
  assert(
    readFileSync(join(rootPath, "src/components/signalConcierge", file), "utf8").length > 0,
    `${file} exists`
  );
}

const appSource = readFileSync(join(rootPath, "src/App.tsx"), "utf8");
assert(appSource.includes("LazySignalConciergeDashboardPage"), "app mounts dashboard page");
assert(appSource.includes('signalConciergeRoute === "dashboard"'), "dashboard route switch");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:member-dashboard"), "package.json defines test:member-dashboard");

if (failed) process.exit(1);
console.log("member dashboard tests ok");
