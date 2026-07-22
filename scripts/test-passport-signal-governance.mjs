#!/usr/bin/env node
/**
 * Passport Signal Governance — lifecycle, actions, replay, contributor health, admin API checks.
 * Core logic runs without database; DB paths fail closed when unavailable.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  LIFECYCLE_TRANSITIONS,
  TERMINAL_STATUSES,
  canTransition,
  targetStatusForAction,
  isTerminalStatus,
  lifecycleStatusAfterIngestion
} from "../server/services/passportSignals/governance/lifecycle.js";
import { mapContributorHealthRow } from "../server/services/passportSignals/governance/contributorHealth.js";
import { mapGovernanceActionRow } from "../server/services/passportSignals/governance/actions.js";
import { mapQueueRow } from "../server/services/passportSignals/governance/reviewQueue.js";
import { mapHistoryRow } from "../server/services/passportSignals/governance/history.js";
import { RETENTION_POLICY } from "../server/services/passportSignals/governance/retention.js";
import {
  passportSignalAlertPublisher,
  subscribePassportSignalAlerts
} from "../server/services/passportSignals/governance/alerting.js";
import { getPassportSignalMetrics } from "../server/services/passportSignals/observability.js";
import { PassportSignalError } from "../server/services/passportSignals/errors.js";

const rootPath = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed += 1;
  }
}

// Lifecycle transitions
assert(canTransition("approve", "quarantined"), "approve from quarantined");
assert(canTransition("reject", "quarantined"), "reject from quarantined");
assert(canTransition("revoke", "accepted"), "revoke from accepted");
assert(canTransition("restore", "revoked"), "restore from revoked");
assert(canTransition("quarantine", "accepted"), "quarantine from accepted");
assert(canTransition("annotate", "archived"), "annotate on archived");
assert(!canTransition("approve", "revoked"), "cannot approve revoked");
assert(!canTransition("revoke", "quarantined"), "cannot revoke quarantined");

assert(targetStatusForAction("approve") === "accepted", "approve targets accepted");
assert(targetStatusForAction("reject") === "rejected", "reject targets rejected");
assert(targetStatusForAction("revoke") === "revoked", "revoke targets revoked");
assert(targetStatusForAction("restore") === "accepted", "restore targets accepted");
assert(targetStatusForAction("quarantine") === "quarantined", "quarantine targets quarantined");
assert(targetStatusForAction("expire") === "expired", "expire targets expired");

assert(isTerminalStatus("rejected"), "rejected is terminal");
assert(isTerminalStatus("archived"), "archived is terminal");
assert(!isTerminalStatus("accepted"), "accepted is not terminal");

assert(
  lifecycleStatusAfterIngestion({ validationPassed: true, requiresReview: true }) === "quarantined",
  "review required → quarantined"
);
assert(
  lifecycleStatusAfterIngestion({ validationPassed: true, requiresReview: false }) === "accepted",
  "no review → accepted"
);
assert(
  lifecycleStatusAfterIngestion({ validationPassed: false }) === "rejected",
  "validation failed → rejected"
);

assert(LIFECYCLE_TRANSITIONS.approve.to === "accepted", "lifecycle contract approve");
assert(TERMINAL_STATUSES.has("expired"), "expired in terminal set");

// Contributor health mapping — operational only
const health = mapContributorHealthRow({
  contributor_id: "bamsignal",
  display_name: "BamSignal",
  signals_submitted: 10,
  signals_accepted: 8,
  signals_rejected: 1,
  validation_failures: 1,
  consent_failures: 0,
  duplicate_count: 2,
  replay_events: 0,
  last_activity_at: new Date().toISOString(),
  contributor_status: "active"
});
assert(health.influencesTrust === false, "contributor health never influences trust");
assert(health.acceptanceRate === 0.8, "acceptance rate calculated");
assert(health.duplicateRate === 0.2, "duplicate rate calculated");

// Governance action row mapping
const actionRow = mapGovernanceActionRow({
  action_id: "gov_test",
  signal_id: "sig_1",
  passport_id: "SKL-4A7D-9XQ2",
  contributor_id: "bamsignal",
  action: "approve",
  reason_code: "manual_review",
  reason: "Approved after review",
  actor: "admin@test.com",
  actor_role: "admin",
  previous_status: "quarantined",
  new_status: "accepted",
  annotation: null,
  audit_ref: "audit:governance:approve:sig_1:1",
  occurred_at: new Date().toISOString()
});
assert(actionRow.action === "approve", "governance action mapped");
assert(actionRow.newStatus === "accepted", "governance new status mapped");

// Review queue mapping
const queueRow = mapQueueRow({
  queue_id: "queue_1",
  signal_id: "sig_1",
  passport_id: "SKL-4A7D-9XQ2",
  contributor_id: "bamsignal",
  status: "pending_review",
  priority: "high",
  assigned_to: null,
  reason: "Human review required",
  resolution_note: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  resolved_at: null
});
assert(queueRow.status === "pending_review", "queue status mapped");
assert(queueRow.priority === "high", "queue priority mapped");

// History mapping
const historyRow = mapHistoryRow({
  history_id: "hist_1",
  signal_id: "sig_1",
  passport_id: "SKL-4A7D-9XQ2",
  kind: "governance_action",
  headline: "Governance: approve",
  summary: "Approved",
  actor: "admin",
  metadata: { action: "approve" },
  occurred_at: new Date().toISOString()
});
assert(historyRow.kind === "governance_action", "history kind mapped");

// Retention policy
assert(RETENTION_POLICY.default.retainYears === 7, "default retention 7 years");
assert(RETENTION_POLICY.compliance.retainYears === null, "compliance hold indefinite");

// Alerting contract
let alertReceived = false;
const sub = subscribePassportSignalAlerts(async (alert) => {
  alertReceived = alert.alertType === "replay_attack_detected";
});
const alertResult = await passportSignalAlertPublisher.publish({
  alertType: "replay_attack_detected",
  severity: "critical",
  headline: "Test alert",
  summary: "Replay test",
  metadata: { contributorId: "bamsignal" }
});
assert(alertResult.published === true, "alert published");
assert(typeof alertResult.alertId === "string", "alert id generated");
assert(alertReceived, "alert subscriber invoked");
sub.unsubscribe();

// Expanded metrics
const metrics = getPassportSignalMetrics();
assert(typeof metrics.signalsRevoked === "number", "signalsRevoked metric");
assert(typeof metrics.governanceActions === "number", "governanceActions metric");
assert(typeof metrics.replayEvents === "number", "replayEvents metric");
assert(typeof metrics.avgValidationTimeMs === "number", "avgValidationTimeMs metric");

// Governance error typing
const transitionError = new PassportSignalError("Cannot revoke", {
  code: "invalid_transition",
  status: 422
});
assert(transitionError.code === "invalid_transition", "invalid transition error code");

// Admin API static checks — requireAdmin protection
const adminApiSource = readFileSync(join(rootPath, "api/passport/admin/signals.js"), "utf8");
const appSource = readFileSync(join(rootPath, "server/app.js"), "utf8");

assert(adminApiSource.includes("requireAdmin"), "admin API uses requireAdmin");
assert(adminApiSource.includes("approveSignal"), "admin API supports approve");
assert(adminApiSource.includes("rejectSignal"), "admin API supports reject");
assert(adminApiSource.includes("revokeSignal"), "admin API supports revoke");
assert(adminApiSource.includes("restoreSignal"), "admin API supports restore");
assert(adminApiSource.includes("quarantineSignal"), "admin API supports quarantine");
assert(adminApiSource.includes("listSignalHistory"), "admin API returns history");
assert(adminApiSource.includes("buildGovernanceDashboardSnapshot"), "admin API dashboard contract");

assert(appSource.includes("/api/passport/admin/signals"), "admin routes mounted");
assert(appSource.includes("passportAdminSignalsHandler"), "admin handler imported");

// Schema verification includes governance tables
const schemaSource = readFileSync(
  join(rootPath, "server/services/schemaVerification.js"),
  "utf8"
);
assert(schemaSource.includes("passport_signal_governance_actions"), "schema verify governance actions");
assert(schemaSource.includes("passport_signal_review_queue"), "schema verify review queue");
assert(schemaSource.includes("passport_signal_replay_events"), "schema verify replay events");

// Migration exists
const migrationSource = readFileSync(
  join(rootPath, "migrations/0057_passport_signal_governance.sql"),
  "utf8"
);
assert(migrationSource.includes("passport_signal_history"), "migration creates history table");
assert(migrationSource.includes("passport_signal_contributor_health"), "migration creates contributor health");

// ADR and docs exist
const adrSource = readFileSync(
  join(rootPath, "docs/architecture/adr/ADR-0005-trust-signal-governance.md"),
  "utf8"
);
assert(adrSource.includes("Trust Engine"), "ADR explains separation from Trust Engine");
assert(adrSource.includes("Human review"), "ADR documents human review authority");

const govDocSource = readFileSync(
  join(rootPath, "docs/architecture/SIGNAL_GOVERNANCE.md"),
  "utf8"
);
assert(govDocSource.includes("```mermaid"), "governance doc includes mermaid diagrams");
assert(govDocSource.includes("influencesTrust: false"), "governance doc states no trust influence");

if (failed) process.exit(1);
console.log("passport signal governance tests ok");
