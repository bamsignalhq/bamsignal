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

const constantsSource = readFileSync(join(rootPath, "src/constants/databaseAudit.ts"), "utf8");
assert(constantsSource.includes("Database Audit Center™"), "database audit brand");
assert(constantsSource.includes('DATABASE_AUDIT_ADMIN_PATH = "/hard/audit/database"'), "database audit path");
assert(constantsSource.includes("legacy-dependency"), "legacy dependency status");
assert(constantsSource.includes("needs-migration"), "needs migration status");
assert(constantsSource.includes("follow-ups"), "follow-ups domain");

const databaseAuditSource = readFileSync(join(rootPath, "src/utils/databaseAudit.ts"), "utf8");
assert(databaseAuditSource.includes("buildDatabaseTableInventory"), "table inventory builder");
assert(databaseAuditSource.includes("buildLocalStorageDependencies"), "localStorage dependency builder");
assert(databaseAuditSource.includes("concierge_members"), "concierge members table");
assert(databaseAuditSource.includes("CONCIERGE_SCHEMA_TABLES"), "concierge schema tables");

const supabaseReportSource = readFileSync(join(rootPath, "src/utils/supabaseHealthReport.ts"), "utf8");
assert(supabaseReportSource.includes("buildSupabaseHealthReport"), "supabase health report");
assert(supabaseReportSource.includes("detectMissingTables"), "missing table detection");
assert(supabaseReportSource.includes("getDuplicateTableGroups"), "duplicate table detection");

const migrationGapSource = readFileSync(join(rootPath, "src/utils/migrationGapReport.ts"), "utf8");
assert(migrationGapSource.includes("buildMigrationGapReport"), "migration gap report");

const hardRoutesSource = readFileSync(join(rootPath, "src/constants/hardRoutes.ts"), "utf8");
assert(hardRoutesSource.includes('"database"'), "audit database view in hard routes");
assert(hardRoutesSource.includes("DATABASE_AUDIT_ADMIN_PATH"), "database audit path wired in hard routes");

const adminComponents = [
  "DatabaseHealthCard.tsx",
  "MigrationStatusCard.tsx",
  "TableIntegrityCard.tsx",
  "DependencyCard.tsx",
  "DatabaseRecommendationCard.tsx",
  "DatabaseAuditPage.tsx"
];

for (const file of adminComponents) {
  const source = readFileSync(join(rootPath, "src/components/admin/databaseAudit", file), "utf8");
  assert(source.length > 0, `${file} exists`);
}

const adminHubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(adminHubSource.includes("DatabaseAuditPage"), "admin hub mounts database audit");
assert(adminHubSource.includes('auditView === "database"'), "audit database view wired");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:database-audit"), "package.json defines test:database-audit");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
const entryAdminSource = readFileSync(join(rootPath, "src/styles/entry-admin.css"), "utf8");
assert((entryAdminSource.includes("database-audit.css") || mainSource.includes("database-audit.css")), "database audit styles imported");

if (failed) {
  console.error(`\n${failed} assertion(s) failed.`);
  process.exit(1);
}

console.log("Database Audit Center checks passed.");
