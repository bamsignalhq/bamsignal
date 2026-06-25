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
assert(adminSource.includes("Institutional Configuration Center™"), "configuration brand");

const constantsSource = readFileSync(join(rootPath, "src/constants/configurationPlatform.ts"), "utf8");
assert(constantsSource.includes("consultants"), "consultants section");
assert(constantsSource.includes("consultation-duration"), "consultation duration rule");
assert(constantsSource.includes("enable"), "enable flag mode");
assert(constantsSource.includes("configuration_entries"), "configuration_entries table");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/configuration"), "configuration permission");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:configuration"), "package.json defines test:configuration");

assert(CONFIGURATION_PLATFORM_DB_TABLES.length === 5, "five configuration tables");
assert(canAccessConfigurationPlatform(["SystemAdministration"]), "system admin can access");

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
assert(validateConfigurationChange(entry, 12).ok, "valid number change");
assert(!validateConfigurationChange(entry, "bad").ok, "invalid type rejected");

const versioned = appendConfigurationVersion(entry, [], {
  value: 12,
  changedBy: "ops@bamsignal.com"
});
assert(versioned.requiresApproval, "critical change requires approval");

assert(
  evaluateFeatureFlag({ mode: "enable", enabled: true }, {}),
  "enable flag evaluates true"
);

const snapshot = buildConfigurationSnapshot([entry], [], { label: "Test snapshot" });
assert(snapshot.entriesSnapshot.length === 1, "snapshot captures entries");

if (failed) {
  console.error(`\n${failed} configuration test(s) failed.`);
  process.exit(1);
}

console.log("Configuration platform smoke checks passed.");
