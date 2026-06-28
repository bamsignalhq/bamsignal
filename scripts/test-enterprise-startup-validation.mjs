#!/usr/bin/env node
/**
 * Enterprise Startup Validation System — unit tests.
 */
import { validateEnterpriseStartup } from "../shared/enterpriseStartupValidation.mjs";
import { evaluateFeature, STARTUP_FEATURE_DEFINITIONS } from "../shared/environmentClassification.mjs";
import { resetStartupReportForTests } from "../shared/startupReport.mjs";
import {
  applySmokeStartupFixtures,
  resolveStartupMode
} from "../shared/startupExecutionMode.mjs";
import { isReadinessChecksReady } from "../server/services/readiness.js";

const PRODUCTION_BASE = {
  NODE_ENV: "production",
  DATABASE_URL: "postgres://user:pass@localhost:5432/bamsignal",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "sb_secret_test_key_1234567890",
  VITE_PUBLIC_APP_URL: "https://bamsignal.com",
  PAYSTACK_SECRET_KEY: "sk_live_test1234567890",
  VITE_PAYSTACK_PUBLIC_KEY: "pk_live_test1234567890",
  COMMAND_CENTER_PIN: "123456",
  COMMAND_CENTER_EMAILS: "admin@bamsignal.com",
  CRON_SECRET: "cron-secret-test"
};

let failed = 0;

function assert(condition, message) {
  if (condition) return;
  console.error(`FAIL: ${message}`);
  failed += 1;
}

function productionEnv(overrides = {}) {
  return { ...PRODUCTION_BASE, ...overrides };
}

resetStartupReportForTests();

assert(resolveStartupMode({ NODE_ENV: "production" }) === "production", "production mode");
assert(resolveStartupMode({ BAMSIGNAL_STARTUP_MODE: "smoke" }) === "smoke", "smoke mode");
assert(resolveStartupMode({ BAMSIGNAL_SMOKE_IMPORT: "1" }) === "smoke-import", "smoke-import mode");

const full = validateEnterpriseStartup(productionEnv(), { mode: "production" });
assert(full.ok === true, "production with all critical secrets is ok");
assert(full.critical.length === 0, "no critical blockers when fully configured");

const noDb = validateEnterpriseStartup(productionEnv({ DATABASE_URL: "" }), { mode: "production" });
assert(noDb.ok === false, "missing DATABASE_URL blocks production");
assert(noDb.critical.some((c) => c.feature === "Database"), "database listed as critical blocker");

const noSupabase = validateEnterpriseStartup(
  productionEnv({ SUPABASE_URL: "", SUPABASE_SERVICE_ROLE_KEY: "" }),
  { mode: "production" }
);
assert(noSupabase.ok === false, "missing Supabase blocks production");

const noPaystack = validateEnterpriseStartup(
  productionEnv({ PAYSTACK_SECRET_KEY: "", VITE_PAYSTACK_PUBLIC_KEY: "" }),
  { mode: "production" }
);
assert(noPaystack.ok === false, "missing Paystack blocks production");

const noSendchamp = validateEnterpriseStartup(
  productionEnv({ SENDCHAMP_API_KEY: "", SENDCHAMP_WHATSAPP_SENDER: "" }),
  { mode: "production" }
);
assert(noSendchamp.ok === true, "missing Sendchamp does not block production startup");
assert(
  noSendchamp.important.some((i) => i.feature === "Sendchamp WhatsApp"),
  "Sendchamp listed as important missing"
);

const noResend = validateEnterpriseStartup(productionEnv({ RESEND_API_KEY: "" }), {
  mode: "production"
});
assert(noResend.ok === true, "missing Resend does not block production startup");
assert(noResend.important.some((i) => i.feature === "Resend Email"), "Resend listed as important");

const noGoogle = validateEnterpriseStartup(
  productionEnv({ GOOGLE_CLIENT_ID: "", GOOGLE_CLIENT_SECRET: "", GOOGLE_REDIRECT_URI: "" }),
  { mode: "production" }
);
assert(noGoogle.ok === true, "missing Google Calendar does not block production");
assert(noGoogle.optional.some((o) => o.feature === "Google Calendar"), "Calendar optional missing");

const noZoom = validateEnterpriseStartup(
  productionEnv({ ZOOM_CLIENT_ID: "", ZOOM_CLIENT_SECRET: "" }),
  { mode: "production" }
);
assert(noZoom.ok === true, "missing Zoom does not block production");

const noOpenAi = validateEnterpriseStartup(productionEnv({ OPENAI_API_KEY: "" }), {
  mode: "production"
});
assert(noOpenAi.ok === true, "missing OpenAI does not block production");
assert(noOpenAi.optional.some((o) => o.feature === "OpenAI"), "OpenAI optional missing");

const dev = validateEnterpriseStartup({}, { mode: "development" });
assert(dev.ok === true, "development mode always ok for validation engine");

const smokeEnv = {};
applySmokeStartupFixtures(smokeEnv);
const smoke = validateEnterpriseStartup(smokeEnv, { mode: "smoke" });
assert(smoke.ok === true, "smoke mode never blocks validation");
assert(smoke.mode === "smoke", "smoke fixtures set mode");

const paystackFeature = evaluateFeature(
  STARTUP_FEATURE_DEFINITIONS.find((d) => d.id === "payments"),
  productionEnv()
);
assert(paystackFeature.enabled === true, "paystack feature enabled with secrets");

assert(
  isReadinessChecksReady({ criticalReady: true, databaseReady: true }),
  "readiness true when critical + database ready"
);
assert(
  !isReadinessChecksReady({ criticalReady: true, databaseReady: false }),
  "readiness false without database connection"
);
assert(
  !isReadinessChecksReady({ criticalReady: false, databaseReady: true }),
  "readiness false when critical features missing"
);

const configSource = await import("node:fs").then((fs) =>
  fs.readFileSync(new URL("../server/config.js", import.meta.url), "utf8")
);
assert(!configSource.includes("process.exit"), "config.js must not exit on import");
assert(!configSource.includes("console.warn"), "config.js must not duplicate warnings on import");

const productionSource = await import("node:fs").then((fs) =>
  fs.readFileSync(new URL("../server/production.js", import.meta.url), "utf8")
);
assert(productionSource.includes("bootstrapStartup"), "production uses enterprise bootstrap");
assert(productionSource.includes("export async function startServer"), "startServer exported");

if (failed > 0) {
  console.error(`\n${failed} enterprise startup test(s) failed.\n`);
  process.exit(1);
}

console.log("enterprise startup validation tests ok\n");
