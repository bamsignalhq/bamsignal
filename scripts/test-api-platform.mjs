#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  API_PLATFORM_DB_TABLES,
  buildApiPlatformSummary,
  canAccessApiPlatform,
  getApiPlatformDatabaseTableManifest,
  listActiveApiKeys,
  listFailingWebhooks,
  revokeApiKey,
  rotateApiKey,
  validateApiKeyScopes
} from "../server/services/apiPlatform.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const adminSource = readFileSync(join(rootPath, "src/constants/apiPlatformAdmin.ts"), "utf8");
assert(adminSource.includes('API_PLATFORM_ADMIN_PATH = "/hard/api-platform"'), "api platform route");
assert(adminSource.includes("Institutional API Platform™"), "api platform brand");

const constantsSource = readFileSync(join(rootPath, "src/constants/apiPlatform.ts"), "utf8");
assert(constantsSource.includes("catalog"), "catalog section");
assert(constantsSource.includes("rate-limits"), "rate limits section");
assert(constantsSource.includes("journey"), "journey domain");
assert(constantsSource.includes("paystack"), "paystack webhook");
assert(constantsSource.includes("api_catalog_entries"), "api_catalog_entries table");
assert(constantsSource.includes("API_PLATFORM_AUDIT_ACTIONS"), "audit actions");
assert(constantsSource.includes("API_PLATFORM_FUTURE_ARCHITECTURE"), "future architecture");
assert(constantsSource.includes("Developer Portal"), "developer portal future item");
assert(constantsSource.includes("read:payments"), "api scopes");

const migrationSource = readFileSync(
  join(rootPath, "supabase/migrations/202606252800_api_platform.sql"),
  "utf8"
);
assert(migrationSource.includes("uuid primary key"), "uuid primary keys");
assert(migrationSource.includes("api_catalog_entries"), "api_catalog_entries migration");
assert(migrationSource.includes("api_keys"), "api_keys migration");
assert(migrationSource.includes("api_usage_snapshots"), "api_usage_snapshots migration");

const permissionsSource = readFileSync(join(rootPath, "src/constants/permissions.ts"), "utf8");
assert(permissionsSource.includes("/hard/api-platform"), "api platform permission");

const engineSource = readFileSync(join(rootPath, "src/utils/apiPlatformEngine.ts"), "utf8");
assert(engineSource.includes("buildApiPlatformBundle"), "api platform engine");

const storeSource = readFileSync(join(rootPath, "src/utils/apiPlatformStore.ts"), "utf8");
assert(storeSource.includes("appendAuditCenterEvent"), "api platform audit logging");
assert(storeSource.includes("rotateApiPlatformKey"), "key rotation");
assert(storeSource.includes("revokeApiPlatformKey"), "key revocation");

const logicSource = readFileSync(join(rootPath, "src/utils/apiPlatformLogic.ts"), "utf8");
assert(logicSource.includes("buildApiPlatformSummary"), "summary builder");
assert(logicSource.includes("validateApiKeyScopes"), "scope validation");

const seedSource = readFileSync(join(rootPath, "src/data/apiPlatformSeed.ts"), "utf8");
assert(seedSource.includes("API_CATALOG_SEED"), "catalog seed");
assert(seedSource.includes("API_WEBHOOK_SEED"), "webhook seed");
assert(seedSource.includes("API_KEY_SEED"), "key seed");
assert(seedSource.includes("API_USAGE_SEED"), "usage seed");

const adminComponents = [
  "ApiCatalogCard.tsx",
  "ApiUsageCard.tsx",
  "WebhookCard.tsx",
  "IntegrationCard.tsx",
  "RateLimitCard.tsx",
  "SecurityCard.tsx",
  "ApiPlatformPage.tsx"
];

for (const file of adminComponents) {
  try {
    readFileSync(join(rootPath, "src/components/admin/apiPlatform", file), "utf8");
  } catch {
    assert(false, `missing component ${file}`);
  }
}

const hubSource = readFileSync(join(rootPath, "src/pages/AdminHubPage.tsx"), "utf8");
assert(hubSource.includes("ApiPlatformPage"), "admin hub mounts api platform page");

const navSource = readFileSync(join(rootPath, "src/components/admin/adminConsoleNav.ts"), "utf8");
assert(navSource.includes('"apiplatform"'), "api platform nav tab");

const packageSource = readFileSync(join(rootPath, "package.json"), "utf8");
assert(packageSource.includes("test:api-platform"), "package.json defines test:api-platform");

const mainSource = readFileSync(join(rootPath, "src/main.tsx"), "utf8");
const entryAdminSource = readFileSync(join(rootPath, "src/styles/entry-admin.css"), "utf8");
assert((entryAdminSource.includes("api-platform.css") || mainSource.includes("api-platform.css")), "api platform styles imported");

const cssSource = readFileSync(join(rootPath, "src/styles/api-platform.css"), "utf8");
assert(cssSource.includes("api-platform-page"), "api platform styles");

const databaseAuditSource = readFileSync(join(rootPath, "src/utils/databaseAudit.ts"), "utf8");
assert(databaseAuditSource.includes("API_PLATFORM_SCHEMA_TABLES"), "database audit schema");
assert(databaseAuditSource.includes("bamsignal.apiPlatform.v1"), "localStorage manifest");

assert(API_PLATFORM_DB_TABLES.length === 6, "six api platform tables");
assert(getApiPlatformDatabaseTableManifest().length === 6, "database manifest");

assert(canAccessApiPlatform(["SystemAdministration"]), "system admin can access");
assert(canAccessApiPlatform(["ManageOperations"]), "operations can access");
assert(canAccessApiPlatform(["ManageGovernance"]), "governance can access");
assert(!canAccessApiPlatform(["ViewMembers"]), "members cannot access");

const catalog = [{ id: "api_1", deprecated: false }, { id: "api_2", deprecated: true }];
const clients = [{ id: "cli_1", active: true }, { id: "cli_2", active: false }];
const keys = [
  { id: "key_1", status: "active", scopes: ["read:payments", "write:payments"] },
  { id: "key_2", status: "revoked", scopes: [] }
];
const webhooks = [
  { id: "wh_1", active: true, failureCount: 0 },
  { id: "wh_2", active: true, failureCount: 3 }
];
const rateLimits = [{ id: "rl_1", active: true }];
const usage = [
  { requestCount: 1000, errorCount: 5 },
  { requestCount: 500, errorCount: 2 }
];

const summary = buildApiPlatformSummary(catalog, clients, keys, webhooks, rateLimits, usage);
assert(summary.catalogCount === 2, "catalog count");
assert(summary.activeClients === 1, "active clients");
assert(summary.activeKeys === 1, "active keys");
assert(summary.totalRequests24h === 1500, "total requests");
assert(summary.deprecatedEndpoints === 1, "deprecated count");

const activeKeys = listActiveApiKeys(keys);
assert(activeKeys.length === 1, "active keys listed");

const failing = listFailingWebhooks(webhooks);
assert(failing.length === 1, "failing webhooks");

assert(
  validateApiKeyScopes(keys[0], ["read:payments"]),
  "scope validation passes"
);
assert(
  !validateApiKeyScopes(keys[0], ["admin:operations"]),
  "scope validation fails"
);

const rotated = rotateApiKey(keys[0], "admin@bamsignal.com");
assert(rotated.status === "rotating", "key rotated");

let threw = false;
try {
  rotateApiKey(keys[1], "admin@bamsignal.com");
} catch {
  threw = true;
}
assert(threw, "cannot rotate revoked key");

const revoked = revokeApiKey(keys[0], "admin@bamsignal.com");
assert(revoked.status === "revoked", "key revoked");

if (failed) {
  console.error(`\n${failed} api platform test(s) failed.`);
  process.exit(1);
}

console.log("Institutional API Platform checks passed.");
