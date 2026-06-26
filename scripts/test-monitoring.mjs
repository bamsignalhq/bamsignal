#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MONITORING_CENTER_DB_TABLES,
  acknowledgeAlert,
  appendIncidentTimeline,
  buildMonitoringSummary,
  canAccessMonitoringCenter,
  filterServicesBySection,
  getMonitoringCenterDatabaseTableManifest,
  listIntegrationServices,
  listQueueServices,
  resolveAlert,
  resolveWorstMonitoringStatus
} from "../server/services/monitoringCenter.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/monitoringCenterAdmin.ts"), "utf8");
assert(adminSource.includes('MONITORING_CENTER_ADMIN_PATH = "/hard/monitoring"'), "monitoring route");
assert(
  adminSource.includes("Enterprise Monitoring, Observability & Incident Center™"),
  "monitoring brand"
);

const constantsSource = readFileSync(join(rootPath, "src/constants/monitoringCenter.ts"), "utf8");
assert(constantsSource.includes("overview"), "overview section");
assert(constantsSource.includes("integrations"), "integrations section");
assert(constantsSource.includes("partial-outage"), "partial outage status");
assert(constantsSource.includes("major-outage"), "major outage status");
assert(constantsSource.includes("journey-engine"), "journey engine service");
assert(constantsSource.includes("monitoring_incidents"), "monitoring_incidents table");
assert(constantsSource.includes("MONITORING_AUDIT_ACTIONS"), "audit actions");
assert(constantsSource.includes("MONITORING_FUTURE_ARCHITECTURE"), "future architecture");
assert(constantsSource.includes("OpenTelemetry"), "opentelemetry future item");
assert(constantsSource.includes("PagerDuty"), "pagerduty future item");

const migrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606252600_monitoring_center.sql"),
  "utf8"
);
assert(migrationSource.includes("uuid primary key"), "uuid primary keys");
assert(migrationSource.includes("monitoring_services"), "monitoring_services migration");
assert(migrationSource.includes("monitoring_incidents"), "monitoring_incidents migration");
assert(migrationSource.includes("metric_snapshots"), "metric_snapshots migration");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/monitoring"), "monitoring permission");

const engineSource = readFileSync(join(rootPath, "src/utils/monitoringCenterEngine.ts"), "utf8");
assert(engineSource.includes("buildMonitoringCenterBundle"), "monitoring engine");

const storeSource = readFileSync(join(rootPath, "src/utils/monitoringCenterStore.ts"), "utf8");
assert(storeSource.includes("appendAuditCenterEvent"), "monitoring audit logging");
assert(storeSource.includes("acknowledgeMonitoringAlert"), "alert acknowledgement");
assert(storeSource.includes("resolveMonitoringAlert"), "alert resolution");

const logicSource = readFileSync(join(rootPath, "src/utils/monitoringCenterLogic.ts"), "utf8");
assert(logicSource.includes("buildMonitoringSummary"), "summary builder");
assert(logicSource.includes("listOpenAlerts"), "open alerts helper");

const seedSource = readFileSync(join(rootPath, "src/data/monitoringCenterSeed.ts"), "utf8");
assert(seedSource.includes("MONITORING_SERVICE_SEED"), "service seed");
assert(seedSource.includes("MONITORING_INCIDENT_SEED"), "incident seed");
assert(seedSource.includes("MONITORING_ALERT_SEED"), "alert seed");

const adminComponents = [
  "SystemHealthCard.tsx",
  "ServiceHealthCard.tsx",
  "IntegrationHealthCard.tsx",
  "QueueHealthCard.tsx",
  "IncidentTimelineCard.tsx",
  "AlertFeedCard.tsx",
  "MaintenanceCard.tsx",
  "InfrastructureCard.tsx",
  "MonitoringCenterPage.tsx"
];

for (const file of adminComponents) {
  try {
    readFileSync(join(rootPath, "src/components/admin/monitoring", file), "utf8");
  } catch {
    assert(false, `missing component ${file}`);
  }
}

const hubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(hubSource.includes("MonitoringCenterPage"), "admin hub mounts monitoring page");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"monitoring"'), "monitoring nav tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:monitoring"), "package.json defines test:monitoring");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
const entryAdminSource = readFileSync(join(rootPath, "src/styles/entry-admin.css"), "utf8");
assert((entryAdminSource.includes("monitoring-center.css") || mainSource.includes("monitoring-center.css")), "monitoring styles imported");

const cssSource = readFileSync(join(rootPath, "src/styles/monitoring-center.css"), "utf8");
assert(cssSource.includes("monitoring-center-page"), "monitoring styles");

const databaseAuditSource = readFileSync(join(rootPath, "src/utils/databaseAudit.ts"), "utf8");
assert(databaseAuditSource.includes("MONITORING_CENTER_SCHEMA_TABLES"), "database audit schema");
assert(databaseAuditSource.includes("bamsignal.monitoringCenter.v1"), "localStorage manifest");

assert(MONITORING_CENTER_DB_TABLES.length === 6, "six monitoring tables");
assert(getMonitoringCenterDatabaseTableManifest().length === 6, "database manifest");

assert(canAccessMonitoringCenter(["ManageOperations"]), "operations can access");
assert(canAccessMonitoringCenter(["SystemAdministration"]), "system admin can access");
assert(canAccessMonitoringCenter(["ViewExecutiveDashboard"]), "executive can access");
assert(!canAccessMonitoringCenter(["ViewMembers"]), "members cannot access");

assert(resolveWorstMonitoringStatus(["healthy", "degraded"]) === "degraded", "worst status resolution");
assert(resolveWorstMonitoringStatus(["healthy", "major-outage"]) === "major-outage", "major outage wins");

const services = [
  { id: "api", status: "healthy", sectionId: "services" },
  { id: "paystack", status: "degraded", sectionId: "integrations" },
  { id: "queue-workers", status: "healthy", sectionId: "queues" }
];

const integrations = listIntegrationServices(services);
assert(integrations.length === 1, "integration filter");

const queues = listQueueServices(services);
assert(queues.length === 1, "queue filter");

const filtered = filterServicesBySection(services, "integrations");
assert(filtered.length === 1, "section filter");

const incidents = [
  {
    id: "inc_1",
    status: "active",
    timeline: []
  }
];
const alerts = [
  {
    id: "alert_1",
    status: "open"
  }
];
const maintenance = [
  {
    id: "maint_1",
    status: "scheduled"
  }
];

const summary = buildMonitoringSummary(services, incidents, alerts, maintenance);
assert(summary.openIncidents === 1, "open incident count");
assert(summary.openAlerts === 1, "open alert count");
assert(summary.degradedCount === 1, "degraded count");

const incident = {
  id: "inc_test",
  incidentRef: "INC-TEST",
  severity: "high",
  status: "investigating",
  affectedServices: ["api"],
  timeline: [],
  owner: "ops@bamsignal.com"
};
const updated = appendIncidentTimeline(incident, {
  actor: "ops@bamsignal.com",
  note: "Investigating elevated latency"
});
assert(updated.timeline.length === 1, "timeline appended");

const alert = {
  id: "alert_test",
  alertRef: "ALT-TEST",
  severity: "critical",
  status: "open",
  serviceId: "api",
  message: "Latency threshold exceeded",
  escalationLevel: 1
};
const acknowledged = acknowledgeAlert(alert, "ops@bamsignal.com");
assert(acknowledged.status === "acknowledged", "alert acknowledged");

const resolved = resolveAlert(acknowledged, "ops@bamsignal.com");
assert(resolved.status === "resolved", "alert resolved");

let threw = false;
try {
  acknowledgeAlert({ ...alert, status: "resolved" }, "ops@bamsignal.com");
} catch {
  threw = true;
}
assert(threw, "cannot acknowledge resolved alert");

if (failed) {
  console.error(`\n${failed} monitoring test(s) failed.`);
  process.exit(1);
}

console.log("Enterprise Monitoring & Incident Center checks passed.");
