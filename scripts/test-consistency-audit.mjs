#!/usr/bin/env node
/**
 * Enterprise Consistency Audit — regression checks for operational centralization.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  PAYSTACK_HTTP_TIMEOUT_MS,
  SENDCHAMP_HTTP_TIMEOUT_MS,
  RETRY_DEFAULT_ATTEMPTS
} from "../shared/operationalConstants.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

let failed = 0;

function assert(condition, message) {
  if (condition) return;
  console.error(`FAIL: ${message}`);
  failed += 1;
}

assert(PAYSTACK_HTTP_TIMEOUT_MS === 20_000, "paystack timeout constant");
assert(SENDCHAMP_HTTP_TIMEOUT_MS === 15_000, "sendchamp timeout constant");
assert(RETRY_DEFAULT_ATTEMPTS === 3, "retry attempts constant");

const paystackSource = read("server/services/paystackClient.js");
const sendchampSource = read("server/services/sendchamp.js");
const retrySource = read("server/services/retryPolicy.js");
const readinessSource = read("server/services/readiness.js");
const healthChecksDoc = read("docs/operations/monitoring/health-checks.md");
const startupDoc = read("docs/operations/startup-lifecycle.md");
const auditDoc = read("docs/operations/technical-debt-audit.md");

assert(paystackSource.includes("operationalConstants.mjs"), "paystack imports operational constants");
assert(sendchampSource.includes("operationalConstants.mjs"), "sendchamp imports operational constants");
assert(retrySource.includes("operationalConstants.mjs"), "retry policy imports operational constants");
assert(readinessSource.includes("getServiceRegistry"), "readiness uses service registry");

assert(healthChecksDoc.includes("Service Registry"), "health-checks doc references registry");
assert(!healthChecksDoc.includes("Signup email | Resend + Supabase service role"), "health-checks doc no longer lists signup as hard gate");
assert(startupDoc.includes("bootstrapServiceRegistry"), "startup lifecycle doc includes registry init");
assert(auditDoc.includes("P0"), "technical debt audit report exists");

const fetchUtil = read("src/utils/fetchAdminHealthSnapshot.ts");
assert(fetchUtil.includes("fetchAdminHealthSnapshot"), "shared admin health fetch util exists");
assert(fetchUtil.includes('!("database" in payload)'), "admin fetch rejects liveness-only payload");

const observabilityEngine = read("src/utils/productionObservabilityEngine.ts");
const platformEngine = read("src/utils/platformHealthEngine.ts");
const systemEngine = read("src/utils/systemHealthEngine.ts");

assert(observabilityEngine.includes("fetchAdminHealthSnapshot"), "observability engine uses shared fetch");
assert(platformEngine.includes("fetchAdminHealthSnapshot"), "platform health engine uses shared fetch");
assert(systemEngine.includes("fetchAdminHealthSnapshot"), "system health engine uses shared fetch");

const constantsSource = read("shared/operationalConstants.mjs");
assert(constantsSource.includes("EMAIL_OTP_TTL_MS"), "OTP TTL documented in constants");
assert(constantsSource.includes("MEMBER_API_TIMEOUT_MS"), "member API timeout documented");

console.log("consistency audit checks ok");
console.log(`  operational constants: paystack=${PAYSTACK_HTTP_TIMEOUT_MS}ms sendchamp=${SENDCHAMP_HTTP_TIMEOUT_MS}ms`);
console.log(`  retry default attempts: ${RETRY_DEFAULT_ATTEMPTS}`);

if (failed > 0) {
  console.error(`\n${failed} consistency audit check(s) failed.\n`);
  process.exit(1);
}
