#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  REQUIRED_SCHEMA_TABLES,
  checkSchema,
  resetSchemaVerificationCache
} from "../server/services/schemaVerification.js";
import { listMigrationFiles } from "../server/migrationRunner.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const dbSource = read("server/db.js");
const schemaVerificationSource = read("server/services/schemaVerification.js");
const migrationRunnerSource = read("server/migrationRunner.js");
const baselineMigrationSource = read("migrations/0002_baseline_bamsignal_schema.sql");

assert(
  schemaVerificationSource.includes("export async function checkSchema") &&
    schemaVerificationSource.includes("REQUIRED_SCHEMA_TABLES") &&
    schemaVerificationSource.includes("information_schema.tables"),
  "schema verification must inspect information_schema instead of mutating schema"
);

assert(
  dbSource.includes("checkSchema({ force: true })") &&
    !dbSource.includes("create table if not exists") &&
    !dbSource.includes("alter table") &&
    !dbSource.includes("create index if not exists"),
  "database startup must verify schema without runtime DDL"
);

assert(
  migrationRunnerSource.includes("export async function runMigrations") &&
    migrationRunnerSource.includes("schema_migrations") &&
    read("migrations/0001_schema_migrations.sql").includes("create table if not exists schema_migrations"),
  "migration runner must track applied migrations in schema_migrations"
);

for (const tableName of REQUIRED_SCHEMA_TABLES) {
  assert(
    baselineMigrationSource.includes(`create table if not exists ${tableName}`),
    `baseline migration must define required table ${tableName}`
  );
}

function simulateMissingSchema(presentTables) {
  const present = new Set(presentTables);
  const missing = REQUIRED_SCHEMA_TABLES.filter((tableName) => !present.has(tableName));
  return {
    ok: missing.length === 0,
    missing,
    message:
      missing.length === 0
        ? "Database schema verified."
        : `Database schema is not migrated. Missing tables: ${missing.join(", ")}. Run: npm run migrate`
  };
}

const missingCore = simulateMissingSchema(["app_users"]);
assert(!missingCore.ok, "missing schema must fail verification");
assert(missingCore.missing.includes("app_member_profiles"), "missing schema diagnostics must list absent tables");

const complete = simulateMissingSchema(REQUIRED_SCHEMA_TABLES);
assert(complete.ok, "complete schema must pass verification");

resetSchemaVerificationCache();
const dryRun = await checkSchema();
assert(dryRun.skipped === true, "schema verification must skip when database is not configured");

const serverFilesWithDdl = [
  "server/cityHome.js",
  "server/memberSocial.js",
  "server/memberTrust.js",
  "server/services/signupOtp.js",
  "server/services/signupProvisioning.js",
  "server/services/paymentEvents.js",
  "server/services/whatsappVerification.js"
];

for (const relativePath of serverFilesWithDdl) {
  const source = read(relativePath);
  assert(
    !/create table if not exists/i.test(source) &&
      !/alter table/i.test(source) &&
      !/create index if not exists/i.test(source),
    `${relativePath} must not perform runtime schema mutations`
  );
}

const migrationFiles = await listMigrationFiles(join(rootPath, "migrations"));
assert(
  migrationFiles.includes("0001_schema_migrations.sql") &&
    migrationFiles.includes("0002_baseline_bamsignal_schema.sql"),
  "migrations directory must include ledger and baseline schema files"
);

console.log("schema verification tests ok");
