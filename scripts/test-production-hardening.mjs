#!/usr/bin/env node
/**
 * Sprint 1.1 — production hardening tests.
 * Rate limit memory fallback, secret validation, certification contracts.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { validateOperationSecrets } from "../shared/operationSecretValidation.mjs";
import { validateEnterpriseStartup } from "../shared/enterpriseStartupValidation.mjs";
import {
  VALIDATION_LEVELS,
  DEPRECATED_ENV_VARS,
  REGISTRY_REQUIRED_TO_LEVEL
} from "../shared/environmentRegistry.mjs";
import {
  buildProductionCertReport,
  PRODUCTION_CERT_VERSION
} from "../shared/productionCertification.mjs";
import { getRateLimitConfig, checkRateLimit } from "../server/services/rateLimit.js";
import { resetMemoryMemberThrottleStore } from "../server/services/memoryThrottle.js";
import { getInfrastructureMetrics } from "../server/services/infrastructureObservability.js";
import { isDatabaseReady } from "../server/db.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

const rateLimitSource = readFileSync(join(rootPath, "server/services/rateLimit.js"), "utf8");
const diagnosticsSource = readFileSync(join(rootPath, "server/services/diagnosticsAccess.js"), "utf8");
const pinAuthSource = readFileSync(join(rootPath, "server/services/pinAuthThrottle.js"), "utf8");
const readinessSource = readFileSync(join(rootPath, "server/services/readiness.js"), "utf8");
const productionCertSource = readFileSync(join(rootPath, "certification/production/run.mjs"), "utf8");

assert(
  rateLimitSource.includes("checkMemoryRateLimit") &&
    rateLimitSource.includes("recordFallbackActivation") &&
    !rateLimitSource.includes("if (!isDatabaseReady()) return { ok: true }"),
  "rate limit must use memory fallback instead of fail-open when DB unavailable"
);
assert(
  rateLimitSource.includes("getRateLimitConfig") &&
    rateLimitSource.includes("RATE_LIMIT_"),
  "rate limit limits must be configurable via env"
);

assert(
  diagnosticsSource.includes("DIAGNOSTICS_SECRET_HEADER") &&
    diagnosticsSource.includes("matchesDiagnosticsSecret") &&
    diagnosticsSource.includes("matchesCronSecret"),
  "diagnostics must validate DIAGNOSTICS_SECRET with deprecated CRON fallback"
);
assert(
  pinAuthSource.includes("PIN_AUTH_WINDOW_MS") &&
    pinAuthSource.includes("recordFallbackActivation"),
  "PIN auth throttle must be configurable and observable"
);

assert(
  readinessSource.includes("infrastructureSummary") &&
    readinessSource.includes("PRODUCTION_CERT_VERSION"),
  "readiness detailed payload must include infrastructure sections"
);

assert(
  productionCertSource.includes("certify:migrations") &&
    productionCertSource.includes("test:fortress") &&
    productionCertSource.includes("writeProductionCertReports"),
  "production certification must orchestrate required suites and emit reports"
);

assert(VALIDATION_LEVELS.CRITICAL === "critical", "validation levels exported");
assert(REGISTRY_REQUIRED_TO_LEVEL.critical === VALIDATION_LEVELS.CRITICAL, "registry level mapping");
assert(DEPRECATED_ENV_VARS.includes("ADMIN_ACTION_PIN"), "deprecated env vars documented");

const duplicateSecrets = validateOperationSecrets(
  {
    NODE_ENV: "production",
    ADMIN_SECRET: "same-secret-value",
    CRON_SECRET: "same-secret-value",
    DIAGNOSTICS_SECRET: "diag-secret"
  },
  { mode: "production" }
);
assert(!duplicateSecrets.ok, "duplicate ADMIN/CRON secrets must fail validation");
assert(
  duplicateSecrets.critical.some((c) => c.detail.includes("Duplicate")),
  "duplicate secret failure must be explicit"
);

const validSecrets = validateOperationSecrets(
  {
    NODE_ENV: "production",
    ADMIN_SECRET: "admin-secret-unique",
    CRON_SECRET: "cron-secret-unique",
    DIAGNOSTICS_SECRET: "diag-secret-unique",
    DATABASE_URL: "postgres://localhost/bamsignal",
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    VITE_PUBLIC_APP_URL: "https://bamsignal.com",
    PAYSTACK_SECRET_KEY: "sk_live_test",
    VITE_PAYSTACK_PUBLIC_KEY: "pk_live_test",
    COMMAND_CENTER_PIN: "123456",
    COMMAND_CENTER_EMAILS: "admin@bamsignal.com"
  },
  { mode: "production" }
);
assert(validSecrets.ok, "unique operation secrets should pass");

const placeholderSecrets = validateOperationSecrets(
  {
    NODE_ENV: "production",
    ADMIN_SECRET: "changeme",
    CRON_SECRET: "cron-secret",
    DIAGNOSTICS_SECRET: "diag-secret"
  },
  { mode: "production" }
);
assert(
  placeholderSecrets.warnings.some((w) => w.name === "ADMIN_SECRET"),
  "placeholder ADMIN_SECRET must warn"
);

const startupWithSecrets = validateEnterpriseStartup(
  {
    NODE_ENV: "production",
    DATABASE_URL: "postgres://localhost/bamsignal",
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    VITE_PUBLIC_APP_URL: "https://bamsignal.com",
    PAYSTACK_SECRET_KEY: "sk_live_test",
    VITE_PAYSTACK_PUBLIC_KEY: "pk_live_test",
    COMMAND_CENTER_PIN: "123456",
    COMMAND_CENTER_EMAILS: "admin@bamsignal.com",
    CRON_SECRET: "cron",
    ADMIN_SECRET: "admin",
    DIAGNOSTICS_SECRET: "diag"
  },
  { mode: "production" }
);
assert(startupWithSecrets.secrets?.ok === true, "startup validation must include secret validation");

const report = buildProductionCertReport([
  { id: "migrations", label: "Migrations", passed: true, durationMs: 10 },
  { id: "environment", label: "Environment", passed: true, durationMs: 5 }
]);
assert(report.passed === true && report.title === "Production Ready", "cert report builder");
assert(report.certificationVersion === PRODUCTION_CERT_VERSION, "cert version present");

resetMemoryMemberThrottleStore();
const config = getRateLimitConfig("discover");
assert(config && config.max > 0 && config.windowMs > 0, "discover rate limit config");

if (!isDatabaseReady()) {
  const req = { headers: {}, socket: { remoteAddress: "203.0.113.50" } };
  let blocked = false;
  for (let i = 0; i <= config.max + 2; i += 1) {
    const result = await checkRateLimit({
      req,
      endpoint: "discover",
      email: "rate-test@example.com",
      phone: null
    });
    if (!result.ok) {
      blocked = true;
      assert(result.store === "memory", "outage rate limit must use memory store");
      break;
    }
  }
  assert(blocked, "rate limit must block excessive requests during DB outage");
}

const metrics = getInfrastructureMetrics();
assert(typeof metrics.fallbackActivations === "number", "infrastructure metrics available");

const operatorSource = readFileSync(
  join(rootPath, "server/services/operatorDashboardContract.js"),
  "utf8"
);
assert(
  operatorSource.includes("buildOperatorDashboardSnapshot") &&
    operatorSource.includes("certification") &&
    operatorSource.includes("getAuthObservabilityMetrics") &&
    !operatorSource.includes("ADMIN_SECRET"),
  "operator dashboard contract must exist without exposing secrets"
);

const branchGovernanceDoc = readFileSync(
  join(rootPath, "docs/engineering/BRANCH_GOVERNANCE.md"),
  "utf8"
);
assert(
  branchGovernanceDoc.includes("Protected") && branchGovernanceDoc.includes("main"),
  "branch governance doc"
);

if (failed) process.exit(1);
console.log("production hardening tests ok");
