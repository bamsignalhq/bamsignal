/**
 * Passport signal observability — structured logging and metrics hooks.
 */

import { logObservabilityEvent } from "../observability.js";

const metrics = {
  signalsReceived: 0,
  ingestionTotal: 0,
  ingestionSuccess: 0,
  ingestionFailure: 0,
  signalsAccepted: 0,
  signalsRejected: 0,
  signalsRevoked: 0,
  signalsExpired: 0,
  validationFailures: 0,
  consentFailures: 0,
  authorizationFailures: 0,
  contributorFailures: 0,
  duplicateDetections: 0,
  persistenceFailures: 0,
  governanceActions: 0,
  replayEvents: 0,
  pipelineLatencyTotalMs: 0,
  pipelineLatencyCount: 0,
  validationLatencyTotalMs: 0,
  validationLatencyCount: 0
};

export function logPassportSignalEvent(event, payload = {}) {
  logObservabilityEvent(event, {
    domain: "passport_signals",
    at: new Date().toISOString(),
    ...payload
  });
}

export function recordIngestionMetric(name, value = 1) {
  if (Object.prototype.hasOwnProperty.call(metrics, name)) {
    metrics[name] += value;
  }
}

export function recordPipelineLatency(ms) {
  metrics.pipelineLatencyTotalMs += ms;
  metrics.pipelineLatencyCount += 1;
}

export function recordValidationLatency(ms) {
  metrics.validationLatencyTotalMs += ms;
  metrics.validationLatencyCount += 1;
}

export function getPassportSignalMetrics() {
  const avgPipelineLatencyMs =
    metrics.pipelineLatencyCount > 0
      ? Math.round(metrics.pipelineLatencyTotalMs / metrics.pipelineLatencyCount)
      : 0;
  const avgValidationTimeMs =
    metrics.validationLatencyCount > 0
      ? Math.round(metrics.validationLatencyTotalMs / metrics.validationLatencyCount)
      : 0;

  return {
    ...metrics,
    avgPipelineLatencyMs,
    avgValidationTimeMs
  };
}

export function createIngestionTimer() {
  const started = Date.now();
  return {
    elapsedMs: () => Date.now() - started
  };
}

export function logIngestionCompleted({ contributorId, signalId, passportId, elapsedMs, duplicate = false, status = "accepted" }) {
  recordIngestionMetric("ingestionTotal");
  recordIngestionMetric("ingestionSuccess");
  recordIngestionMetric("signalsReceived");
  if (!duplicate) recordIngestionMetric("signalsAccepted");
  if (duplicate) recordIngestionMetric("duplicateDetections");
  if (status === "quarantined") recordIngestionMetric("signalsRejected");
  recordPipelineLatency(elapsedMs);
  logPassportSignalEvent("passport_signal_ingested", {
    contributorId,
    signalId,
    passportId,
    elapsedMs,
    duplicate,
    status
  });
}

export function logIngestionFailed({ contributorId, stage, reason, elapsedMs }) {
  recordIngestionMetric("ingestionTotal");
  recordIngestionMetric("ingestionFailure");
  recordPipelineLatency(elapsedMs);
  if (stage === "validate") recordIngestionMetric("validationFailures");
  if (stage === "consent_check") recordIngestionMetric("consentFailures");
  if (stage === "receive") recordIngestionMetric("authorizationFailures");
  if (stage === "persist") recordIngestionMetric("persistenceFailures");
  logPassportSignalEvent("passport_signal_ingestion_failed", {
    contributorId,
    stage,
    reason,
    elapsedMs
  });
}

export function logGovernanceAction({ action, signalId, actor, previousStatus, newStatus, reasonCode }) {
  recordIngestionMetric("governanceActions");
  if (action === "revoke") recordIngestionMetric("signalsRevoked");
  if (action === "expire") recordIngestionMetric("signalsExpired");
  if (action === "reject") recordIngestionMetric("signalsRejected");
  if (action === "approve" || action === "restore") recordIngestionMetric("signalsAccepted");
  logPassportSignalEvent("passport_signal_governance_action", {
    action,
    signalId,
    actor,
    previousStatus,
    newStatus,
    reasonCode
  });
}

export function logReplayEvent({ eventId, contributorId, kind, severity }) {
  recordIngestionMetric("replayEvents");
  logPassportSignalEvent("passport_signal_replay_detected", {
    eventId,
    contributorId,
    kind,
    severity
  });
}
