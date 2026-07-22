#!/usr/bin/env node
/**
 * Sprint 5 — Admin Console, Moderation, Concierge Operations & Customer Support tests.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { REPORT_STATUSES } from "../server/services/operations/moderation.js";
import { ADMIN_ROLES } from "../server/services/operations/roles.js";
import { ADMIN_EVENT_TYPES } from "../server/services/operations/eventBus.js";
import { RUNTIME_CONFIG_KEYS } from "../server/services/operations/featureFlags.js";
import { TICKET_STATUSES } from "../server/services/operations/support.js";
import { CONCIERGE_QUEUE_STATUSES } from "../server/services/operations/concierge.js";
import { SAFETY_ACTION_TYPES } from "../server/services/operations/userSafety.js";
import {
  getOperationsObservabilityMetrics,
  incrementOperationsMetric
} from "../server/services/operations/observability.js";
import { hasPermission, canEscalate, canApprove } from "../server/services/operations/roles.js";
import { PRODUCTION_CERT_VERSION } from "../shared/productionCertification.mjs";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

function read(rel) {
  return readFileSync(join(rootPath, rel), "utf8");
}

const migration = read("migrations/0062_admin_operations_core.sql");
assert(migration.includes("ops_admin_role_assignments"), "admin role assignments");
assert(migration.includes("ops_moderation_report_state"), "moderation report state");
assert(migration.includes("ops_moderation_lifecycle_log"), "moderation lifecycle log");
assert(migration.includes("ops_user_safety_action_log"), "user safety action log");
assert(migration.includes("ops_support_ticket_state"), "support ticket state");
assert(migration.includes("ops_concierge_queue_state"), "concierge queue state");
assert(migration.includes("ops_runtime_configuration"), "runtime configuration");
assert(migration.includes("ops_immutable_audit_log"), "immutable audit log");
assert(migration.includes("ops_admin_events"), "admin event bus");

const schema = read("server/services/schemaVerification.js");
for (const table of [
  "ops_admin_role_assignments",
  "ops_admin_role_audit_log",
  "ops_moderation_report_state",
  "ops_moderation_lifecycle_log",
  "ops_moderation_evidence",
  "ops_moderation_internal_notes",
  "ops_user_safety_action_log",
  "ops_support_ticket_state",
  "ops_support_lifecycle_log",
  "ops_support_internal_notes",
  "ops_concierge_queue_state",
  "ops_concierge_assignment_log",
  "ops_runtime_configuration",
  "ops_runtime_configuration_audit",
  "ops_immutable_audit_log",
  "ops_admin_events"
]) {
  assert(schema.includes(`"${table}"`), `schema requires ${table}`);
}

const persistence = read("server/services/memberPersistence.js");
assert(persistence.includes("handleReportSubmittedEvent"), "persistReport hooks ops moderation");

const appSource = read("server/app.js");
assert(appSource.includes("/api/operations/admin"), "operations admin route");

assert(ADMIN_ROLES.length === 9, "nine admin roles");

assert(REPORT_STATUSES.length === 10, "ten moderation report states");
assert(TICKET_STATUSES.length === 8, "eight support ticket states");
assert(CONCIERGE_QUEUE_STATUSES.length === 7, "seven concierge queue states");
assert(SAFETY_ACTION_TYPES.length === 12, "twelve user safety action types");
assert(ADMIN_EVENT_TYPES.length === 14, "fourteen admin event types");
assert(RUNTIME_CONFIG_KEYS.length === 9, "nine runtime config keys");

assert(hasPermission("moderator", "moderation.action"), "moderator has moderation.action");
assert(canEscalate("super_admin", "moderation"), "super admin escalation");
assert(canApprove("finance_administrator", "refund"), "finance refund approval");

incrementOperationsMetric("auditRecords", 1);
const metrics = getOperationsObservabilityMetrics();
assert(metrics.auditRecords >= 1, "operations metrics");

assert(PRODUCTION_CERT_VERSION === "1.5.0", "certification version for Sprint 5");

assert(existsSync(join(rootPath, "scripts/certify-operations-journey.mjs")), "operations journey cert");
assert(existsSync(join(rootPath, "scripts/generate-launch-readiness.mjs")), "launch readiness generator");

for (const doc of [
  "docs/architecture/ADMIN.md",
  "docs/architecture/MODERATION.md",
  "docs/architecture/CONCIERGE.md",
  "docs/architecture/SUPPORT.md",
  "docs/architecture/FEATURE_FLAGS.md",
  "docs/operations/ADMIN_RUNBOOK.md",
  "docs/operations/MODERATION_RUNBOOK.md"
]) {
  assert(existsSync(join(rootPath, doc)), `${doc} exists`);
}

const operationsIndex = read("src/operations/index.ts");
assert(operationsIndex.includes("ModerationReportStatus"), "TS operations contracts");

const operator = read("server/services/operatorDashboardContract.js");
assert(operator.includes("getOperationsObservabilityMetrics"), "operator dashboard operations metrics");

const dashboard = read("server/services/operations/dashboard.js");
assert(dashboard.includes("buildAdminOperationsDashboardContract"), "admin dashboard contract");

if (failed) process.exit(1);
console.log("operations core tests ok");
