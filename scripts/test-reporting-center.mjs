#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  REPORTING_CENTER_DB_TABLES,
  buildReportingSummary,
  canAccessReportingCenter,
  filterReportsByCategory,
  formatReportingSummaryLine,
  getReportingCenterDatabaseTableManifest,
  listEnabledSchedules,
  recordReportExport,
  validateExportFormat
} from "../server/services/reportingCenter.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/reportingCenterAdmin.ts"), "utf8");
assert(adminSource.includes('REPORTING_CENTER_ADMIN_PATH = "/hard/reports"'), "reporting route");
assert(adminSource.includes("Institutional Reporting Center™"), "reporting brand");

const constantsSource = readFileSync(join(rootPath, "src/constants/reportingCenter.ts"), "utf8");
assert(constantsSource.includes("Executive Reports"), "executive reports category");
assert(constantsSource.includes("Operations Reports"), "operations reports category");
assert(constantsSource.includes("Consultant Reports"), "consultant reports category");
assert(constantsSource.includes("Journey Reports"), "journey reports category");
assert(constantsSource.includes("Community Reports"), "community reports category");
assert(constantsSource.includes("Research Reports"), "research reports category");
assert(constantsSource.includes("Financial Reports"), "financial reports category");
assert(constantsSource.includes("Support Reports"), "support reports category");
assert(constantsSource.includes("Compliance Reports"), "compliance reports category");
assert(constantsSource.includes('"pdf"'), "pdf export");
assert(constantsSource.includes('"excel"'), "excel export");
assert(constantsSource.includes('"csv"'), "csv export");
assert(constantsSource.includes('"print"'), "print export");
assert(constantsSource.includes("daily"), "daily schedule");
assert(constantsSource.includes("weekly"), "weekly schedule");
assert(constantsSource.includes("monthly"), "monthly schedule");
assert(constantsSource.includes("quarterly"), "quarterly schedule");
assert(constantsSource.includes("annual"), "annual schedule");
assert(constantsSource.includes("reporting_catalog_entries"), "catalog table");
assert(constantsSource.includes("REPORTING_AUDIT_ACTIONS"), "audit actions");
assert(constantsSource.includes("REPORTING_FUTURE_ARCHITECTURE"), "future architecture");
assert(constantsSource.includes("Board Reports"), "board reports future item");
assert(constantsSource.includes("AI Narrative Summaries"), "ai narrative future item");

const migrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606256000_reporting_center.sql"),
  "utf8"
);
assert(migrationSource.includes("uuid primary key"), "uuid primary keys");
assert(migrationSource.includes("reporting_catalog_entries"), "catalog migration");
assert(migrationSource.includes("reporting_schedules"), "schedules migration");
assert(migrationSource.includes("reporting_export_history"), "export history migration");
assert(migrationSource.includes("reporting_run_history"), "run history migration");
assert(migrationSource.includes("reporting_snapshots"), "snapshots migration");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/reports"), "reporting permission");
assert(permissionsSource.includes("ExportReports"), "export reports permission");

const engineSource = readFileSync(join(rootPath, "src/utils/reportingCenterEngine.ts"), "utf8");
assert(engineSource.includes("buildReportingCenterBundle"), "reporting engine");

const storeSource = readFileSync(join(rootPath, "src/utils/reportingCenterStore.ts"), "utf8");
assert(storeSource.includes("appendAuditCenterEvent"), "reporting audit logging");
assert(storeSource.includes("exportReportingCatalog"), "export reporting catalog");

const logicSource = readFileSync(join(rootPath, "src/utils/reportingCenterLogic.ts"), "utf8");
assert(logicSource.includes("buildReportingSummary"), "summary builder");
assert(logicSource.includes("formatReportingSummaryLine"), "summary line formatter");

const seedSource = readFileSync(join(rootPath, "src/data/reportingCenterSeed.ts"), "utf8");
assert(seedSource.includes("REPORT_CATALOG_SEED"), "catalog seed");
assert(seedSource.includes("REPORT_SCHEDULE_SEED"), "schedule seed");
assert(seedSource.includes("REPORT_EXPORT_SEED"), "export seed");
assert(seedSource.includes("REPORT_FILTER_PRESET_SEED"), "filter preset seed");
assert(seedSource.includes("REPORT_RUN_HISTORY_SEED"), "run history seed");

const adminComponents = [
  "ReportCard.tsx",
  "ReportBuilderCard.tsx",
  "ScheduledReportCard.tsx",
  "ExportHistoryCard.tsx",
  "ReportSummaryCard.tsx",
  "ReportingCenterPage.tsx"
];

for (const file of adminComponents) {
  try {
    readFileSync(join(rootPath, "src/components/admin/reporting", file), "utf8");
  } catch {
    assert(false, `missing component ${file}`);
  }
}

const hubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(hubSource.includes("ReportingCenterPage"), "admin hub mounts reporting page");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"reports"'), "reports nav tab");
assert(navSource.includes("institutional"), "institutional reporting nav keywords");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:reporting-center"), "package.json defines test:reporting-center");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
const entryAdminSource = readFileSync(join(rootPath, "src/styles/entry-admin.css"), "utf8");
assert((entryAdminSource.includes("reporting-center.css") || mainSource.includes("reporting-center.css")), "reporting styles imported");

const cssSource = readFileSync(join(rootPath, "src/styles/reporting-center.css"), "utf8");
assert(cssSource.includes("reporting-center-page"), "reporting styles");

const databaseAuditSource = readFileSync(join(rootPath, "src/utils/databaseAudit.ts"), "utf8");
assert(databaseAuditSource.includes("REPORTING_CENTER_SCHEMA_TABLES"), "database audit schema");
assert(databaseAuditSource.includes("bamsignal.reportingCenter.v1"), "localStorage manifest");

assert(REPORTING_CENTER_DB_TABLES.length === 6, "six reporting tables");
assert(getReportingCenterDatabaseTableManifest().length === 6, "database manifest");

assert(canAccessReportingCenter(["ManageOperations"]), "operations role can access");
assert(canAccessReportingCenter(["ViewExecutiveDashboard"]), "executive role can access");
assert(canAccessReportingCenter(["ExportReports"]), "export role can access");
assert(canAccessReportingCenter(["SystemAdministration"]), "system admin can access");
assert(!canAccessReportingCenter(["ViewMembers"]), "members cannot access");

const reports = [
  { id: "r1", categoryId: "executive", status: "published", supportedFormats: ["pdf", "excel"] },
  { id: "r2", categoryId: "operations", status: "published", supportedFormats: ["pdf"] },
  { id: "r3", categoryId: "consultant", status: "draft", supportedFormats: ["csv"] }
];
const schedules = [
  { id: "s1", enabled: true },
  { id: "s2", enabled: false },
  { id: "s3", enabled: true }
];
const exports = [
  {
    id: "e1",
    exportedAt: new Date().toISOString()
  }
];
const runHistory = [
  { id: "h1", preserved: true },
  { id: "h2", preserved: false }
];

const summary = buildReportingSummary(reports, schedules, exports, runHistory);
assert(summary.publishedReports === 2, "published report count");
assert(summary.scheduledReports === 2, "scheduled report count");
assert(summary.exportsLast30d === 1, "exports last 30d");
assert(summary.preservedRuns === 1, "preserved runs");
assert(formatReportingSummaryLine(summary).includes("published"), "summary line");

assert(filterReportsByCategory(reports, "executive").length === 1, "category filter");
assert(listEnabledSchedules(schedules).length === 2, "enabled schedules");

assert(validateExportFormat(reports[0], "pdf"), "valid export format");
assert(!validateExportFormat(reports[2], "pdf"), "invalid export format");

const exported = recordReportExport(
  {
    id: "exp_test",
    exportRef: "EXP-TEST",
    reportTitle: "Test Report",
    categoryId: "operations",
    format: "pdf",
    fileSizeKb: 100
  },
  "ops@bamsignal.com"
);
assert(exported.exportedBy === "ops@bamsignal.com", "export recorded");

let threw = false;
try {
  recordReportExport(
    {
      id: "exp_bad",
      exportRef: "EXP-BAD",
      reportTitle: "",
      categoryId: "operations",
      format: "pdf"
    },
    "ops@bamsignal.com"
  );
} catch {
  threw = true;
}
assert(threw, "missing report title throws");

if (failed) {
  console.error(`\n${failed} reporting center test(s) failed.`);
  process.exit(1);
}

console.log("Institutional Reporting Center checks passed.");
