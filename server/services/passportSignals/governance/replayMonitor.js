/**
 * Replay protection monitoring — prepare future alert interfaces.
 */

import crypto from "node:crypto";
import { query, isDatabaseReady } from "../../../db.js";
import { publishSignalAlert } from "./alerting.js";
import { updateContributorHealthCounters } from "./contributorHealth.js";
import { logReplayEvent } from "../observability.js";

function createReplayEventId() {
  return `replay_${crypto.randomBytes(8).toString("hex")}`;
}

export async function recordReplayEvent({
  contributorId,
  signalId = null,
  passportId = null,
  kind,
  severity = "info",
  summary,
  metadata = {}
}) {
  if (!isDatabaseReady()) return null;
  const eventId = createReplayEventId();
  await query(
    `insert into passport_signal_replay_events (
      event_id, contributor_id, signal_id, passport_id, kind, severity, summary, metadata
    ) values ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [eventId, contributorId, signalId, passportId, kind, severity, summary, JSON.stringify(metadata)]
  );

  await updateContributorHealthCounters(contributorId, { replayEvents: 1 });
  logReplayEvent({ eventId, contributorId, kind, severity });

  if (severity === "critical" || kind === "duplicate_burst") {
    await publishSignalAlert({
      alertType: "replay_attack_detected",
      severity,
      headline: "Replay monitoring alert",
      summary,
      metadata: { contributorId, signalId, kind, ...metadata }
    });
  }

  return { eventId, kind, severity, summary, detectedAt: new Date().toISOString() };
}

export async function monitorIngestionReplay({
  contributorId,
  idempotencyKey,
  isDuplicate,
  occurredAt,
  passportId,
  signalId
}) {
  if (isDuplicate) {
    return recordReplayEvent({
      contributorId,
      signalId,
      passportId,
      kind: "repeated_submission",
      severity: "info",
      summary: `Duplicate idempotency key: ${idempotencyKey}`,
      metadata: { idempotencyKey }
    });
  }

  const driftMs = Date.now() - Date.parse(occurredAt);
  if (Number.isFinite(driftMs) && Math.abs(driftMs) > 7 * 24 * 60 * 60 * 1000) {
    return recordReplayEvent({
      contributorId,
      signalId,
      passportId,
      kind: "clock_drift",
      severity: "warning",
      summary: "Signal occurredAt differs from server clock by more than 7 days",
      metadata: { driftMs, occurredAt }
    });
  }

  return null;
}

export async function detectDuplicateBurst(contributorId, windowMinutes = 5, threshold = 20) {
  if (!isDatabaseReady()) return null;
  const result = await query(
    `select count(*)::int as count
     from passport_trust_signals
     where contributor_id = $1
       and recorded_at > now() - ($2 || ' minutes')::interval`,
    [contributorId, String(windowMinutes)]
  );
  const count = result.rows[0]?.count || 0;
  if (count >= threshold) {
    return recordReplayEvent({
      contributorId,
      kind: "duplicate_burst",
      severity: "critical",
      summary: `${count} signals in ${windowMinutes} minutes exceeds threshold ${threshold}`,
      metadata: { count, windowMinutes, threshold }
    });
  }
  return null;
}

export async function listRecentReplayEvents({ contributorId = null, limit = 50 } = {}) {
  if (!isDatabaseReady()) return [];
  const params = [];
  let where = "1=1";
  if (contributorId) {
    params.push(contributorId);
    where = `contributor_id = $${params.length}`;
  }
  params.push(limit);
  const result = await query(
    `select event_id, contributor_id, signal_id, passport_id, kind, severity, summary, detected_at
     from passport_signal_replay_events
     where ${where}
     order by detected_at desc
     limit $${params.length}`,
    params
  );
  return result.rows.map((row) => ({
    eventId: row.event_id,
    contributorId: row.contributor_id,
    signalId: row.signal_id,
    kind: row.kind,
    severity: row.severity,
    summary: row.summary,
    detectedAt: row.detected_at
  }));
}
