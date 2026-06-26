#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONFIGURATION_PLATFORM_DB_TABLES,
  appendConfigurationVersion,
  buildConfigurationSnapshot,
  canAccessConfigurationPlatform,
  evaluateFeatureFlag,
  getConfigurationPlatformDatabaseTableManifest,
  processConfigurationApproval,
  requiresConfigurationApproval,
  rollbackConfigurationVersion,
  validateConfigurationChange
} from "../server/services/configurationPlatform.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/configurationPlatformAdmin.ts"), "utf8");
assert(adminSource.includes('CONFIGURATION_PLATFORM_ADMIN_PATH = "/hard/configuration"'), "configuration route");
assert(adminSource.includes("Remote Configuration Center™"), "remote config brand");

const constantsSource = readFileSync(join(rootPath, "src/constants/configurationPlatform.ts"), "utf8");
assert(constantsSource.includes("discovery"), "discovery section");
assert(constantsSource.includes("messaging"), "messaging section");
assert(constantsSource.includes("consultation-fee"), "consultation fee rule");
assert(constantsSource.includes("signals.free_daily_limit"), "free daily signals");
assert(constantsSource.includes("configuration_entries"), "configuration_entries table");
assert(constantsSource.includes("CONFIGURATION_AUDIT_ACTIONS"), "audit actions");
assert(constantsSource.includes("config-published"), "publish audit action");
assert(constantsSource.includes("REMOTE_CONFIG_DEFAULTS"), "remote config defaults");

const migrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606252400_configuration_platform.sql"),
  "utf8"
);
assert(migrationSource.includes("uuid primary key"), "uuid primary keys");
assert(migrationSource.includes("configuration_entries"), "configuration_entries migration");
assert(migrationSource.includes("feature_flags"), "feature_flags migration");
assert(migrationSource.includes("configuration_snapshots"), "configuration_snapshots migration");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/configuration"), "configuration permission");

const engineSource = readFileSync(join(rootPath, "src/utils/configurationPlatformEngine.ts"), "utf8");
assert(engineSource.includes("buildConfigurationPlatformBundle"), "configuration engine");
assert(engineSource.includes("auditHistory"), "audit history in bundle");

const storeSource = readFileSync(join(rootPath, "src/utils/configurationPlatformStore.ts"), "utf8");
assert(storeSource.includes("appendAuditCenterEvent"), "configuration audit logging");
assert(storeSource.includes("publishConfigurationDraftEntry"), "publish workflow");
assert(storeSource.includes("rollbackConfigurationEntry"), "rollback workflow");

const logicSource = readFileSync(join(rootPath, "src/utils/configurationPlatformLogic.ts"), "utf8");
assert(logicSource.includes("evaluateFeatureFlag"), "feature flag evaluation");
assert(logicSource.includes("buildConfigurationAuditHistory"), "audit history builder");
assert(logicSource.includes("listBusinessRuleEntries"), "business rule helper");

const seedSource = readFileSync(join(rootPath, "src/data/configurationPlatformSeed.ts"), "utf8");
assert(seedSource.includes("CONFIGURATION_ENTRY_SEED"), "configuration entry seed");
assert(seedSource.includes("signals.free_daily_limit"), "signals seed");

const adminComponents = [
  "ConfigurationCard.tsx",
  "RemoteConfigEntriesCard.tsx",
  "AuditHistoryCard.tsx",
  "ConfigurationPlatformPage.tsx"
];

for (const file of adminComponents) {
  try {
    readFileSync(join(rootPath, "src/components/admin/configuration", file), "utf8");
  } catch {
    assert(false, `missing component ${file}`);
  }
}

const hubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(hubSource.includes("ConfigurationPlatformPage"), "admin hub mounts configuration page");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"configuration"'), "configuration nav tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:configuration-center"), "package.json defines test:configuration-center");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
const entryAdminSource = readFileSync(join(rootPath, "src/styles/entry-admin.css"), "utf8");
assert((entryAdminSource.includes("configuration-platform.css") || mainSource.includes("configuration-platform.css")), "configuration styles imported");

const databaseAuditSource = readFileSync(join(rootPath, "src/utils/databaseAudit.ts"), "utf8");
assert(databaseAuditSource.includes("bamsignal.configurationPlatform.v1"), "localStorage manifest");

assert(CONFIGURATION_PLATFORM_DB_TABLES.length === 5, "five configuration tables");
assert(getConfigurationPlatformDatabaseTableManifest().length === 5, "database manifest");

assert(canAccessConfigurationPlatform(["SystemAdministration"]), "system admin can access");
assert(canAccessConfigurationPlatform(["ManageOperations"]), "operations can access");
assert(!canAccessConfigurationPlatform(["ViewMembers"]), "members cannot access");

const entry = {
  id: "cfg_test",
  configKey: "test.limit",
  categoryId: "operations",
  label: "Test limit",
  value: 10,
  valueType: "number",
  critical: true,
  activeVersion: 1,
  status: "active"
};

assert(requiresConfigurationApproval(entry), "critical requires approval");

const valid = validateConfigurationChange(entry, 12);
assert(valid.ok, "valid number change");

const invalid = validateConfigurationChange(entry, "bad");
assert(!invalid.ok, "invalid type rejected");

const versions = [
  {
    id: "ver_1",
    entryId: "cfg_test",
    versionNumber: 1,
    value: 10,
    changedBy: "system",
    createdAt: "2026-01-01T00:00:00.000Z"
  }
];
const versioned = appendConfigurationVersion(entry, versions, {
  value: 12,
  changedBy: "ops@bamsignal.com"
});
assert(versioned.requiresApproval, "critical change requires approval");
assert(versioned.entry.activeVersion === 2, "version incremented");

const approval = processConfigurationApproval(
  {
    id: "appr_test",
    entryId: "cfg_test",
    proposedVersion: 2,
    proposedValue: 12,
    status: "pending",
    requestedBy: "ops@bamsignal.com"
  },
  versioned.entry,
  "admin@bamsignal.com"
);
assert(approval.approval.status === "approved", "approval processed");

let threw = false;
try {
  processConfigurationApproval(
    {
      id: "appr_self",
      entryId: "cfg_test",
      proposedVersion: 3,
      proposedValue: 15,
      status: "pending",
      requestedBy: "ops@bamsignal.com"
    },
    entry,
    "ops@bamsignal.com"
  );
} catch {
  threw = true;
}
assert(threw, "self-approval rejected");

const rolled = rollbackConfigurationVersion(versioned.entry, versioned.versions, 1);
assert(rolled.activeVersion === 1, "rollback restores version");

const flagOn = evaluateFeatureFlag({ mode: "enable", enabled: true }, {});
assert(flagOn, "enable flag evaluates true");

const preview = evaluateFeatureFlag({ mode: "preview", enabled: true }, { isPreview: true });
assert(preview, "preview flag with preview context");

const internal = evaluateFeatureFlag(
  { mode: "internal-only", enabled: true },
  { role: "Admin" }
);
assert(internal, "internal-only for admin role");

const beta = evaluateFeatureFlag(
  { mode: "beta", enabled: true, rolloutConfig: { percentage: 50 } },
  { memberHash: 25 }
);
assert(beta, "beta rollout bucket works");

const maintenance = evaluateFeatureFlag({ mode: "maintenance", enabled: false }, {});
assert(!maintenance, "maintenance mode blocks by default");

const snapshot = buildConfigurationSnapshot([entry], [], { label: "Test snapshot" });
assert(snapshot.entriesSnapshot.length === 1, "snapshot captures entries");

if (failed) {
  console.error(`\n${failed} configuration center test(s) failed.`);
  process.exit(1);
}

console.log("Remote Configuration Center checks passed.");
