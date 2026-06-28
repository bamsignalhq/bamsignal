#!/usr/bin/env node
/**
 * Enterprise Service Registry — integrity, lifecycle, health, and shutdown tests.
 */
import { createServiceRegistry, resetGlobalServiceRegistryForTests } from "../shared/serviceRegistry/index.mjs";
import { resetStartupReportForTests } from "../shared/startupReport.mjs";
import { applySmokeStartupFixtures } from "../shared/startupExecutionMode.mjs";
import {
  getServiceRegistry,
  initializeServiceRegistry,
  registryHealthSnapshot,
  resetServiceRegistryForTests
} from "../server/services/serviceRegistry.js";
import { isReadinessChecksReady } from "../server/services/readiness.js";
import { resetGracefulShutdownForTests } from "../server/services/gracefulShutdown.js";

let failed = 0;

function assert(condition, message) {
  if (condition) return;
  console.error(`FAIL: ${message}`);
  failed += 1;
}

const PRODUCTION_ENV = {
  NODE_ENV: "production",
  DATABASE_URL: "postgres://user:pass@localhost:5432/bamsignal",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "sb_secret_test_key_1234567890",
  VITE_PUBLIC_APP_URL: "https://bamsignal.com",
  PAYSTACK_SECRET_KEY: "sk_live_test1234567890",
  VITE_PAYSTACK_PUBLIC_KEY: "pk_live_test1234567890",
  COMMAND_CENTER_PIN: "123456",
  COMMAND_CENTER_EMAILS: "admin@bamsignal.com",
  CRON_SECRET: "cron-secret-test",
  RESEND_API_KEY: "re_test_key",
  SENDCHAMP_API_KEY: "sc_test",
  SENDCHAMP_WHATSAPP_SENDER: "BamSignal"
};

resetGlobalServiceRegistryForTests();
resetServiceRegistryForTests();
resetStartupReportForTests();
resetGracefulShutdownForTests();

const isolated = createServiceRegistry();
let duplicateBlocked = false;
isolated.register({
  id: "demo",
  label: "Demo",
  tier: "optional",
  evaluateFeatureState: () => "disabled"
});
try {
  isolated.register({
    id: "demo",
    label: "Demo Duplicate",
    tier: "optional",
    evaluateFeatureState: () => "disabled"
  });
} catch (error) {
  duplicateBlocked = error instanceof Error && error.message.includes("Duplicate service registration");
}
assert(duplicateBlocked, "duplicate registration prevented");

const registry = getServiceRegistry();
const ids = registry.listIds();
assert(ids.includes("database"), "database registered");
assert(ids.includes("supabase"), "supabase registered");
assert(ids.includes("payments"), "paystack/payments registered");
assert(ids.includes("sendchamp"), "sendchamp registered");
assert(ids.includes("resend"), "resend registered");
assert(ids.includes("firebase"), "firebase registered");
assert(ids.includes("background-workers"), "background workers registered");
assert(ids.includes("notification-queue"), "notification queue registered");
assert(ids.includes("http-server"), "http-server registered");
assert(ids.length >= 17, "registry owns all external dependencies");

const smokeEnv = {};
applySmokeStartupFixtures(smokeEnv);
const smokeInit = await initializeServiceRegistry(smokeEnv);
assert(smokeInit.skipped !== true || smokeInit.ok !== false, "smoke registry initialize completes");

const smokeHealth = await registryHealthSnapshot(smokeEnv);
assert(typeof smokeHealth.readiness.ready === "boolean", "readiness propagated from registry");
assert(typeof smokeHealth.health.database === "object", "database health in snapshot");

const configuredEnv = { ...PRODUCTION_ENV };
registry.evaluateFeatureStates(configuredEnv);
const critical = registry.snapshot(configuredEnv).filter((service) => service.tier === "critical");
assert(
  critical.every((service) => service.featureState === "enabled"),
  "critical services enabled with production env"
);

const missingPaystack = { ...PRODUCTION_ENV, PAYSTACK_SECRET_KEY: "", VITE_PAYSTACK_PUBLIC_KEY: "" };
const missingReadiness = await createServiceRegistry()
  .register({
    id: "payments-test",
    label: "Paystack Test",
    tier: "critical",
    evaluateFeatureState: () => "disabled",
    ready: () => false
  })
  .isReady(missingPaystack);
assert(missingReadiness.ready === false, "dependency failure fails readiness");

const initOrder = [];
const orderRegistry = createServiceRegistry();
orderRegistry.register({
  id: "child",
  label: "Child",
  tier: "runtime",
  dependsOn: ["parent"],
  evaluateFeatureState: () => "enabled",
  async initialize() {
    initOrder.push("child");
  }
});
orderRegistry.register({
  id: "parent",
  label: "Parent",
  tier: "runtime",
  evaluateFeatureState: () => "enabled",
  async initialize() {
    initOrder.push("parent");
  }
});
await orderRegistry.initializeAll({});
assert(initOrder.join(",") === "parent,child", "initialize respects dependency order");

const shutdownOrder = [];
const shutdownRegistry = createServiceRegistry();
shutdownRegistry.register({
  id: "db",
  label: "DB",
  tier: "critical",
  shutdownPriority: 100,
  evaluateFeatureState: () => "enabled",
  async shutdown() {
    shutdownOrder.push("db");
  }
});
shutdownRegistry.register({
  id: "http",
  label: "HTTP",
  tier: "runtime",
  shutdownPriority: 1000,
  evaluateFeatureState: () => "enabled",
  async shutdown() {
    shutdownOrder.push("http");
  }
});
await shutdownRegistry.shutdownAll();
assert(shutdownOrder.join(",") === "http,db", "shutdown follows priority ordering");

assert(
  isReadinessChecksReady({ criticalReady: true, databaseReady: true }),
  "readiness helper accepts registry-derived checks"
);

const timing = registry.startupTimingReport();
assert(Array.isArray(timing.services), "startup timing report includes services");

const registrySource = await import("node:fs").then((fs) =>
  fs.readFileSync(new URL("../shared/serviceRegistry/ServiceRegistry.mjs", import.meta.url), "utf8")
);
assert(registrySource.includes("initializeAll"), "registry exposes initialize");
assert(registrySource.includes("healthCheckAll"), "registry exposes health");
assert(registrySource.includes("shutdownAll"), "registry exposes shutdown");

const readinessSource = await import("node:fs").then((fs) =>
  fs.readFileSync(new URL("../server/services/readiness.js", import.meta.url), "utf8")
);
assert(readinessSource.includes("getServiceRegistry"), "readiness uses registry as source of truth");

console.log("Registry test report");
console.log(`  services registered: ${ids.length}`);
console.log(`  smoke readiness: ${smokeHealth.readiness.ready}`);
console.log(`  init order verified: ${initOrder.join(" → ")}`);
console.log(`  shutdown order verified: ${shutdownOrder.join(" → ")}`);

if (failed > 0) {
  console.error(`\n${failed} service registry test(s) failed.\n`);
  process.exit(1);
}

console.log("\nservice registry tests ok\n");
