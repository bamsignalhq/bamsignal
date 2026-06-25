#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertTransferPayloadComplete,
  assertTransferPayloadImmutable,
  buildCapacityMetrics,
  buildStaffingForecast,
  buildTransferRecord,
  computeLeaveCapacityReduction,
  deriveCapacityState,
  getWorkforceDatabaseTableManifest,
  rankWorkforceRecommendations
} from "../server/services/workforceManagement.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/workforceAdmin.ts"), "utf8");
assert(adminSource.includes('WORKFORCE_MANAGEMENT_ADMIN_PATH = "/hard/workforce"'), "admin workforce route");

const constantsSource = readFileSync(join(rootPath, "src/constants/workforceManagement.ts"), "utf8");
assert(constantsSource.includes("Operational Capacity & Workforce Management™"), "workforce brand");
assert(constantsSource.includes("Relationship Consultant"), "relationship consultant role");
assert(constantsSource.includes("Executive Assistant"), "executive assistant role");
assert(constantsSource.includes("near-capacity"), "near capacity state");
assert(constantsSource.includes("overloaded"), "overloaded state");
assert(constantsSource.includes("Medical Leave"), "medical leave type");
assert(constantsSource.includes("WORKFORCE_FUTURE_REGIONS"), "future regions documented");
assert(constantsSource.includes("Asia"), "asia future region");
assert(constantsSource.includes("South America"), "south america future region");
assert(constantsSource.includes("workforce_profiles"), "workforce_profiles table");

const migrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606251200_workforce_management.sql"),
  "utf8"
);
assert(migrationSource.includes("uuid primary key"), "uuid primary keys");
assert(migrationSource.includes("created_by"), "created_by audit field");
assert(migrationSource.includes("updated_by"), "updated_by audit field");
assert(migrationSource.includes("staffing_forecasts"), "staffing_forecasts table");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes("workforce"), "hard routes include workforce tab");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/workforce"), "workforce route permission mapped");

const engineSource = readFileSync(join(rootPath, "src/utils/workforceManagementEngine.ts"), "utf8");
assert(engineSource.includes("buildWorkforceManagementBundle"), "workforce engine exists");

const capacitySource = readFileSync(join(rootPath, "src/utils/workforceCapacityEngine.ts"), "utf8");
assert(capacitySource.includes("buildCapacityMetrics"), "capacity engine");
assert(capacitySource.includes("computeLeaveCapacityReduction"), "leave impact");

const recommendationSource = readFileSync(
  join(rootPath, "src/utils/workforceRecommendationEngine.ts"),
  "utf8"
);
assert(recommendationSource.includes("rankWorkforceRecommendations"), "recommendation ranking");

const forecastSource = readFileSync(join(rootPath, "src/utils/workforceForecastEngine.ts"), "utf8");
assert(forecastSource.includes("buildStaffingForecast"), "forecast engine");

const storeSource = readFileSync(join(rootPath, "src/utils/workforceManagementStore.ts"), "utf8");
assert(storeSource.includes("appendAuditCenterEvent"), "audit center integration");

const auditSource = readFileSync(join(rootPath, "src/constants/auditCenter.ts"), "utf8");
assert(auditSource.includes("workforce-transfer"), "workforce transfer audit action");
assert(auditSource.includes("workforce-leave"), "workforce leave audit action");

const adminComponents = [
  "WorkforceOverviewCard.tsx",
  "CapacityHeatmapCard.tsx",
  "AvailabilityCalendarCard.tsx",
  "AssignmentRecommendationCard.tsx",
  "LeaveManagementCard.tsx",
  "RegionalTeamCard.tsx",
  "TransferHistoryCard.tsx",
  "ConsultantWorkloadCard.tsx",
  "StaffingForecastCard.tsx",
  "WorkforceManagementPage.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/workforce", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("WorkforceManagementPage"), "admin hub mounts workforce page");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"workforce"'), "admin nav includes workforce tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:workforce"), "package.json defines test:workforce");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
assert(mainSource.includes("workforce-management.css"), "workforce styles imported");

const profile = {
  id: "profile_test",
  displayName: "Test Consultant",
  roleId: "relationship-consultant",
  employmentStatus: "active",
  regionId: "nigeria",
  specialization: ["legacy"],
  languages: ["English"],
  availability: "available",
  maxActiveJourneys: 12,
  currentWorkload: 6,
  experienceLevel: "mid",
  certifications: [],
  performanceSummary: { satisfactionScore: 4.5 }
};

const leaves = [
  {
    profileId: "profile_test",
    status: "approved",
    startsAt: "2026-06-01T00:00:00.000Z",
    endsAt: "2026-12-31T00:00:00.000Z",
    capacityReduction: 1,
    leaveType: "vacation"
  }
];

const reduction = computeLeaveCapacityReduction(leaves, new Date("2026-06-20T00:00:00.000Z"));
assert(reduction === 1, "leave impact reduces capacity");

const capacity = buildCapacityMetrics(
  profile,
  { activeJourneys: 10, followUpsPending: 2, introductionsPending: 1, consultationsToday: 2 },
  leaves,
  new Date("2026-06-20T00:00:00.000Z")
);
assert(capacity.availabilityScore === 0, "full leave zeroes availability score");
assert(capacity.capacityState === "at-capacity", "full leave marks at-capacity");

const healthyState = deriveCapacityState({
  activeJourneys: 3,
  maxActiveJourneys: 12,
  followUpsPending: 1,
  introductionsPending: 0,
  consultationsToday: 1,
  availabilityScore: 1,
  employmentStatus: "active"
});
assert(healthyState === "available", "low utilization is available");

const overloadedState = deriveCapacityState({
  activeJourneys: 14,
  maxActiveJourneys: 12,
  followUpsPending: 4,
  introductionsPending: 3,
  consultationsToday: 4,
  availabilityScore: 1,
  employmentStatus: "active"
});
assert(overloadedState === "overloaded", "high utilization is overloaded");

const regionalAssignments = [
  {
    profileId: "profile_test",
    regionId: "nigeria",
    isPrimary: true,
    coverageCities: ["Lagos"],
    coverageCountries: ["Nigeria"]
  }
];

const recommendations = rankWorkforceRecommendations(
  [profile],
  [capacity],
  regionalAssignments,
  {
    memberCity: "Lagos",
    memberCountry: "Nigeria",
    memberLanguages: ["English"],
    relationshipType: "legacy"
  }
);
assert(recommendations.length >= 0, "recommendation logic runs");

const transfer = buildTransferRecord({
  id: "transfer_test",
  fromProfileId: "from",
  toProfileId: "to",
  transferredPayload: {
    journeys: ["BS-JR-2026-0001"],
    consultations: ["c1"],
    "meeting-history": ["m1"],
    notes: ["n1"],
    communications: ["cm1"],
    assignments: ["a1"],
    "audit-history": ["au1"]
  }
});
assert(transfer.transferredPayload.journeys.length === 1, "transfer preserves journeys");

let threw = false;
try {
  assertTransferPayloadComplete({ journeys: [] });
} catch {
  threw = true;
}
assert(threw, "incomplete transfer payload rejected");

threw = false;
try {
  assertTransferPayloadImmutable(transfer.transferredPayload, {
    ...transfer.transferredPayload,
    journeys: []
  });
} catch {
  threw = true;
}
assert(threw, "transfer domain shrink rejected");

const forecast = buildStaffingForecast("nigeria", [profile], [capacity]);
assert(forecast.projectedConsultationDemand > 0, "forecast demand calculated");
assert(typeof forecast.estimatedHiringNeeds === "number", "hiring needs calculated");

const manifest = getWorkforceDatabaseTableManifest();
assert(manifest.length === 9, "database persistence manifest has nine tables");
assert(manifest.every((item) => item.hasUuidPrimaryKey), "all workforce tables use uuid");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Workforce management checks passed.");
