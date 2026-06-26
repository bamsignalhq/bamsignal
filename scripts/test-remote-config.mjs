#!/usr/bin/env node
/**
 * Remote Configuration Center™ — SDK, API, and draft/publish verification.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  REMOTE_CONFIG_SERVER_DEFAULTS,
  buildRemoteConfigSnapshot,
  canAccessRemoteConfigurationCenter,
  getCachedRemoteConfigSnapshot,
  remoteConfigurationRouteRegistered,
  resolveRemoteConfigValue,
  validateRemoteConfigValue
} from "../server/services/remoteConfig.js";

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

const adminSource = read("src/constants/configurationPlatformAdmin.ts");
assert(adminSource.includes('CONFIGURATION_PLATFORM_ADMIN_PATH = "/hard/configuration"'), "configuration route");
assert(adminSource.includes("Remote Configuration Center™"), "remote config brand");

const constantsSource = read("src/constants/configurationPlatform.ts");
assert(constantsSource.includes("discovery"), "discovery group");
assert(constantsSource.includes("messaging"), "messaging group");
assert(constantsSource.includes("signals.free_daily_limit"), "free daily signals key");
assert(constantsSource.includes("REMOTE_CONFIG_DEFAULTS"), "remote config defaults");
assert(constantsSource.includes("config-draft-saved"), "draft audit action");
assert(constantsSource.includes("config-published"), "publish audit action");

const logicSource = read("src/utils/configurationPlatformLogic.ts");
assert(logicSource.includes("saveConfigurationDraft"), "draft save logic");
assert(logicSource.includes("publishConfigurationDraft"), "draft publish logic");
assert(logicSource.includes("buildRemoteConfigMap"), "remote config map builder");

const storeSource = read("src/utils/configurationPlatformStore.ts");
assert(storeSource.includes("saveConfigurationDraftValue"), "draft store");
assert(storeSource.includes("publishConfigurationDraftEntry"), "publish store");
assert(storeSource.includes("REMOTE_CONFIG_OFFLINE_CACHE_KEY"), "offline cache sync");

const hookSource = read("src/hooks/useRemoteConfig.ts");
assert(hookSource.includes("useRemoteConfig"), "useRemoteConfig hook");

const clientSource = read("src/services/remoteConfigClient.ts");
assert(clientSource.includes("loadRemoteConfig"), "remote config client");
assert(clientSource.includes("subscribeRemoteConfig"), "realtime subscription");

const apiSource = read("api/remote-config/index.js");
assert(apiSource.includes("getCachedRemoteConfigSnapshot"), "remote config api");

const appSource = read("server/app.js");
assert(appSource.includes('"/api/remote-config"'), "api route mounted");

const pageSource = read("src/components/admin/configuration/ConfigurationPlatformPage.tsx");
assert(pageSource.includes("RemoteConfigEntriesCard"), "remote config entries card");
assert(pageSource.includes("useRemoteConfig"), "sdk documented on page");

const permissionsSource = read("src/constants/permissions.ts");
assert(remoteConfigurationRouteRegistered(permissionsSource), "configuration permissions wired");

const packageSource = read("package.json");
assert(packageSource.includes("test:remote-config"), "package.json test script");

const seedSource = read("src/data/configurationPlatformSeed.ts");
assert(seedSource.includes("signals.free_daily_limit"), "signals seed");
assert(seedSource.includes("verification.otp_cooldown_seconds"), "otp cooldown seed");
assert(seedSource.includes("ai.matching_experiment_weight"), "ai seed draft");

assert(canAccessRemoteConfigurationCenter(["SystemAdministration"]), "system admin access");
assert(!canAccessRemoteConfigurationCenter(["ViewMembers"]), "members blocked");

const snapshot = buildRemoteConfigSnapshot([
  { configKey: "signals.free_daily_limit", value: 8, status: "active" }
]);
assert(snapshot.config["signals.free_daily_limit"] === 8, "snapshot override");

const cached = getCachedRemoteConfigSnapshot([]);
assert(cached.config["messaging.max_messages_per_day"] === 50, "server cache defaults");

const resolved = resolveRemoteConfigValue("consultations.pricing_ngn", [], REMOTE_CONFIG_SERVER_DEFAULTS);
assert(resolved === 25000, "server resolve");

const valid = validateRemoteConfigValue("number", 5);
assert(valid.ok, "typed validation pass");

const invalid = validateRemoteConfigValue("number", "bad");
assert(!invalid.ok, "typed validation fail");

if (failed > 0) {
  console.error(`\n${failed} remote config test(s) failed.`);
  process.exit(1);
}

console.log("Remote Configuration Center checks passed.");
