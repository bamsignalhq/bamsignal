#!/usr/bin/env node
/**
 * Enterprise Feature Flag Platform™ — route, SDK, and engine verification.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FEATURE_FLAG_PLATFORM_DB_TABLES,
  FEATURE_FLAG_PLATFORM_SERVER_SEED,
  canAccessFeatureFlagPlatform,
  canDeleteFeatureFlag,
  evaluateEnterpriseFeatureFlag,
  featureFlagPlatformRouteRegistered,
  formatFeatureFlagPlatformSummary,
  getFeatureFlagPlatformDatabaseTableManifest,
  isFeatureEnabled
} from "../server/services/featureFlagPlatform.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(relativePath) {
  return readFileSync(join(rootPath, relativePath), "utf8");
}

const adminSource = read("src/constants/featureFlagPlatformAdmin.ts");
assert(adminSource.includes('FEATURE_FLAG_PLATFORM_ADMIN_PATH = "/hard/feature-flags"'), "feature flag route");
assert(adminSource.includes("Enterprise Feature Flag Platform™"), "feature flag brand");

const constantsSource = read("src/constants/featureFlagPlatform.ts");
assert(constantsSource.includes("voice_vibe"), "voice vibe flag");
assert(constantsSource.includes("ai_matching"), "ai matching flag");
assert(constantsSource.includes("member_ids"), "member id rollout");
assert(constantsSource.includes("feature_flag_audits"), "audit table reference");
assert(constantsSource.includes("FEATURE_FLAG_OFFLINE_CACHE_KEY"), "offline cache key");

const migrationSource = read("supabase/migrations/202606258000_feature_flag_platform.sql");
assert(migrationSource.includes("feature_flag_audits"), "audit migration");
assert(migrationSource.includes("rollout_percentage"), "rollout_percentage column");
assert(migrationSource.includes("environment"), "environment column");

const typesSource = read("src/types/featureFlagPlatform.ts");
assert(typesSource.includes("FeatureFlagPlatformBundle"), "bundle type");
assert(typesSource.includes("FeatureFlagAuditRecord"), "audit record type");

const logicSource = read("src/utils/featureFlagPlatformLogic.ts");
assert(logicSource.includes("evaluateEnterpriseFeatureFlag"), "evaluation logic");
assert(logicSource.includes("canDeleteFeatureFlag"), "delete safeguard");
assert(logicSource.includes("appendFeatureFlagAudit"), "audit append");

const storeSource = read("src/utils/featureFlagPlatformStore.ts");
assert(storeSource.includes("bamsignal.featureFlagPlatform.v1"), "platform storage key");
assert(storeSource.includes("toggleFeatureFlag"), "toggle store");
assert(storeSource.includes("Cannot delete active feature flag"), "active delete guard");

const hookSource = read("src/hooks/useFeatureFlag.ts");
assert(hookSource.includes("useFeatureFlag"), "useFeatureFlag hook");

const gateSource = read("src/components/FeatureGate.tsx");
assert(gateSource.includes("FeatureGate"), "FeatureGate component");
assert(gateSource.includes("useFeatureFlag"), "FeatureGate uses hook");

const clientSource = read("src/services/featureFlagClient.ts");
assert(clientSource.includes("loadFeatureFlags"), "client loader");
assert(clientSource.includes("FEATURE_FLAG_OFFLINE_CACHE_KEY"), "offline cache in client");

const apiSource = read("api/feature-flags/index.js");
assert(apiSource.includes("buildFeatureFlagApiPayload"), "api handler");

const appSource = read("server/app.js");
assert(appSource.includes('"/api/feature-flags"'), "api route mounted");

const permissionsSource = read("src/constants/permissions.ts");
assert(featureFlagPlatformRouteRegistered(permissionsSource), "feature flag permissions wired");
assert(permissionsSource.includes("featureflags"), "featureflags tab permission");

const hardRoutesSource = read("src/constants/hardRoutes.ts");
assert(hardRoutesSource.includes('featureflags: "feature-flags"'), "feature flags slug");

const lazyTabsSource = read("src/components/admin/lazyAdminHubTabs.ts");
assert(lazyTabsSource.includes("LazyFeatureFlagPlatformPage"), "lazy feature flag page");

const adminHubSource = read("src/pages/AdminHubPage.tsx");
assert(adminHubSource.includes('tab === "featureflags"'), "AdminHub mounts feature flag page");

const pageSource = read("src/components/admin/featureFlags/FeatureFlagPlatformPage.tsx");
assert(pageSource.includes("FeatureFlagAuditCard"), "audit card mounted");
assert(pageSource.includes("FeatureFlagListCard"), "flag list mounted");

const navSource = read("src/components/admin/adminConsoleNav.ts");
assert(navSource.includes('"featureflags"'), "feature flags nav tab");

const packageSource = read("package.json");
assert(packageSource.includes("test:feature-flag-platform"), "package.json defines test script");

const mainSource = read("src/main.tsx");
const entryAdminSource = read("src/styles/entry-admin.css");
assert((entryAdminSource.includes("feature-flag-platform.css") || mainSource.includes("feature-flag-platform.css")), "feature flag styles imported");

const databaseAuditSource = read("src/utils/databaseAudit.ts");
assert(databaseAuditSource.includes("bamsignal.featureFlagPlatform.v1"), "database audit manifest");

assert(FEATURE_FLAG_PLATFORM_DB_TABLES.length === 2, "two feature flag tables");
assert(getFeatureFlagPlatformDatabaseTableManifest().length === 2, "database manifest");

assert(canAccessFeatureFlagPlatform(["SystemAdministration"]), "system admin can access");
assert(canAccessFeatureFlagPlatform(["ManageGovernance"]), "governance can access");
assert(canAccessFeatureFlagPlatform(["ManageOperations"]), "operations can access");
assert(!canAccessFeatureFlagPlatform(["ViewMembers"]), "members cannot access");

const globalFlag = FEATURE_FLAG_PLATFORM_SERVER_SEED.find((item) => item.key === "trusted_member");
assert(evaluateEnterpriseFeatureFlag(globalFlag, {}), "global enabled flag");

const pctFlag = FEATURE_FLAG_PLATFORM_SERVER_SEED.find((item) => item.key === "voice_vibe");
assert(evaluateEnterpriseFeatureFlag(pctFlag, { memberHash: 10 }), "percentage rollout bucket");
assert(!evaluateEnterpriseFeatureFlag(pctFlag, { memberHash: 90 }), "percentage rollout exclusion");

const countryFlag = FEATURE_FLAG_PLATFORM_SERVER_SEED.find((item) => item.key === "relationship_consultant");
assert(evaluateEnterpriseFeatureFlag(countryFlag, { country: "nigeria" }), "country rollout");

assert(isFeatureEnabled("trusted_member", FEATURE_FLAG_PLATFORM_SERVER_SEED, {}), "server isFeatureEnabled");

const inactive = { key: "future_experiments", enabled: false, rolloutPercentage: 0 };
assert(canDeleteFeatureFlag(inactive), "inactive flag deletable");
const active = { key: "communities", enabled: true, rolloutPercentage: 100 };
assert(!canDeleteFeatureFlag(active), "active flag not deletable");

const bundle = {
  summary: { enabled: 6, total: 11, active: 8 },
  audits: [{ id: "a1" }, { id: "a2" }]
};
assert(formatFeatureFlagPlatformSummary(bundle).includes("6/11"), "summary formatter");

if (failed > 0) {
  console.error(`\n${failed} feature flag platform test(s) failed.`);
  process.exit(1);
}

console.log("Enterprise Feature Flag Platform checks passed.");
