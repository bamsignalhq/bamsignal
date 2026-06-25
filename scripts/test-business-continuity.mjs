#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assessBackupHealth,
  buildRiskAssessment,
  canAccessBusinessContinuityConsole,
  countActiveIncidents,
  deriveOverallContinuityStatus,
  getBusinessContinuityDatabaseTableManifest,
  validateRecoveryPlaybook,
  appendIncidentTimeline,
  BUSINESS_CONTINUITY_DB_TABLES,
  MONITORED_PROVIDER_IDS,
  RECOVERY_PLAYBOOK_DOMAINS,
  CONTINUITY_HEALTH_STATUSES
} from "../server/services/businessContinuity.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

const PROVIDER_STATUS_FIXTURE = [
  { providerId: "supabase", status: "healthy" },
  { providerId: "sendchamp", status: "degraded" }
];

const INCIDENT_FIXTURE = [
  { status: "resolved" },
  { status: "closed" }
];

const BACKUP_FIXTURE = [
  {
    areaId: "database",
    status: "completed",
    health: "healthy",
    verified: true,
    completedAt: "2026-06-24T03:03:04.000Z",
    createdAt: "2026-06-24T03:00:00.000Z",
    jobRef: "BK-DB-TEST"
  },
  {
    areaId: "media-storage",
    status: "completed",
    health: "degraded",
    verified: false,
    completedAt: "2026-06-23T05:10:12.000Z",
    createdAt: "2026-06-23T05:00:00.000Z",
    jobRef: "BK-MEDIA-TEST"
  }
];

const RECOVERY_PLAN_FIXTURE = {
  domainId: "database-outage",
  procedureSteps: [
    { order: 1, title: "Declare", detail: "Open incident" },
    { order: 2, title: "Assess", detail: "Blast radius" },
    { order: 3, title: "Recover", detail: "Restore service" }
  ]
};

const INCIDENT_TIMELINE_FIXTURE = {
  timeline: [{ at: "2026-06-18T14:20:00.000Z", actor: "ops@bamsignal.com", note: "Detected issue." }]
};

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/businessContinuityAdmin.ts"), "utf8");
assert(adminSource.includes('BUSINESS_CONTINUITY_ADMIN_PATH = "/hard/business-continuity"'), "business continuity route");

const constantsSource = readFileSync(join(rootPath, "src/constants/businessContinuity.ts"), "utf8");
assert(constantsSource.includes("Business Continuity & Disaster Recovery Center™"), "continuity brand");
assert(constantsSource.includes("partial-outage"), "partial outage status");
assert(constantsSource.includes("major-outage"), "major outage status");
assert(constantsSource.includes("cron-jobs"), "cron jobs provider");
assert(constantsSource.includes("authentication"), "authentication provider");
assert(constantsSource.includes("database-outage"), "database outage playbook");
assert(constantsSource.includes("dns-outage"), "dns outage playbook");
assert(constantsSource.includes("BUSINESS_CONTINUITY_FUTURE_ARCHITECTURE"), "future architecture documented");
assert(constantsSource.includes("multi-region-failover"), "multi-region failover");
assert(constantsSource.includes("incident_reports"), "incident_reports table");

const migrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606251600_business_continuity.sql"),
  "utf8"
);
assert(migrationSource.includes("uuid primary key"), "uuid primary keys");
assert(migrationSource.includes("incident_reports"), "incident_reports migration");
assert(migrationSource.includes("recovery_plans"), "recovery_plans migration");
assert(migrationSource.includes("backup_jobs"), "backup_jobs migration");
assert(migrationSource.includes("provider_status"), "provider_status migration");
assert(migrationSource.includes("continuity_exercises"), "continuity_exercises migration");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/business-continuity"), "route permission mapped");
assert(permissionsSource.includes("businesscontinuity"), "hard tab permission");

const engineSource = readFileSync(join(rootPath, "src/utils/businessContinuityEngine.ts"), "utf8");
assert(engineSource.includes("buildBusinessContinuityBundle"), "continuity engine exists");

const storeSource = readFileSync(join(rootPath, "src/utils/businessContinuityStore.ts"), "utf8");
assert(storeSource.includes("appendAuditCenterEvent"), "continuity audit logging");

const adminComponents = [
  "IncidentOverviewCard.tsx",
  "ProviderHealthCard.tsx",
  "RecoveryPlaybookCard.tsx",
  "BackupStatusCard.tsx",
  "ContinuityExerciseCard.tsx",
  "InfrastructureHealthCard.tsx",
  "RiskAssessmentCard.tsx",
  "BusinessContinuityPage.tsx"
];

for (const file of adminComponents) {
  const path = join(rootPath, "src/components/admin/businessContinuity", file);
  try {
    readFileSync(path, "utf8");
  } catch {
    assert(false, `missing component ${file}`);
  }
}

assert(BUSINESS_CONTINUITY_DB_TABLES.length === 6, "six continuity tables");
assert(MONITORED_PROVIDER_IDS.length === 10, "ten monitored providers");
assert(RECOVERY_PLAYBOOK_DOMAINS.length === 10, "ten recovery playbooks");
assert(CONTINUITY_HEALTH_STATUSES.length === 5, "five health statuses");

const manifest = getBusinessContinuityDatabaseTableManifest();
assert(manifest.length === 6, "database table manifest");

assert(canAccessBusinessContinuityConsole(["ManageOperations"]), "operations can access");
assert(canAccessBusinessContinuityConsole(["ManageRecovery"]), "recovery can access");
assert(!canAccessBusinessContinuityConsole(["ViewMembers"]), "members cannot access");

const overall = deriveOverallContinuityStatus(PROVIDER_STATUS_FIXTURE);
assert(overall === "degraded", "overall status reflects degraded provider");

const active = countActiveIncidents(INCIDENT_FIXTURE);
assert(active === 0, "no active incidents in fixture");

const backup = assessBackupHealth(BACKUP_FIXTURE);
assert(backup.total >= 1, "backup assessment has areas");
assert(backup.latest?.jobRef, "latest backup identified");

const risks = buildRiskAssessment(PROVIDER_STATUS_FIXTURE, backup, active);
assert(risks.length === 3, "three risk dimensions");

const validPlan = validateRecoveryPlaybook(RECOVERY_PLAN_FIXTURE);
assert(validPlan.ok, "recovery plan validates");

const invalidPlan = validateRecoveryPlaybook({ domainId: "unknown", procedureSteps: [] });
assert(!invalidPlan.ok, "invalid plan rejected");

const updated = appendIncidentTimeline(INCIDENT_TIMELINE_FIXTURE, {
  actor: "test@bamsignal.com",
  note: "Test timeline entry"
});
assert(updated.timeline.length === 2, "timeline appended");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes("businesscontinuity"), "nav tab registered");

const hubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(hubSource.includes("BusinessContinuityPage"), "admin hub mounts page");

const cssSource = readFileSync(join(rootPath, "src/styles/business-continuity.css"), "utf8");
assert(cssSource.includes("business-continuity-page"), "continuity styles");

if (failed) {
  console.error(`\n${failed} business continuity test(s) failed.`);
  process.exit(1);
}

console.log("All business continuity tests passed.");
