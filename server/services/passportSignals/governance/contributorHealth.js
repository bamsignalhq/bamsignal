/**
 * Contributor health — operational metrics only. Never influences trust.
 */

import { query, isDatabaseReady } from "../../../db.js";
import { PassportSignalDatabaseError } from "../errors.js";

export async function ensureContributorHealthRow(contributorId) {
  if (!isDatabaseReady()) return;
  await query(
    `insert into passport_signal_contributor_health (contributor_id)
     values ($1)
     on conflict (contributor_id) do nothing`,
    [contributorId]
  );
}

export async function updateContributorHealthCounters(
  contributorId,
  {
    signalsSubmitted = 0,
    signalsAccepted = 0,
    signalsRejected = 0,
    validationFailures = 0,
    consentFailures = 0,
    duplicateCount = 0,
    replayEvents = 0
  } = {}
) {
  if (!isDatabaseReady()) throw new PassportSignalDatabaseError();
  await ensureContributorHealthRow(contributorId);
  await query(
    `update passport_signal_contributor_health
     set signals_submitted = signals_submitted + $2,
         signals_accepted = signals_accepted + $3,
         signals_rejected = signals_rejected + $4,
         validation_failures = validation_failures + $5,
         consent_failures = consent_failures + $6,
         duplicate_count = duplicate_count + $7,
         replay_events = replay_events + $8,
         last_activity_at = now(),
         snapshot_at = now(),
         updated_at = now()
     where contributor_id = $1`,
    [
      contributorId,
      signalsSubmitted,
      signalsAccepted,
      signalsRejected,
      validationFailures,
      consentFailures,
      duplicateCount,
      replayEvents
    ]
  );
}

export async function getContributorHealth(contributorId) {
  if (!isDatabaseReady()) return null;
  const result = await query(
    `select h.*, c.status as contributor_status, c.display_name
     from passport_signal_contributor_health h
     join passport_signal_contributors c on c.contributor_id = h.contributor_id
     where h.contributor_id = $1`,
    [contributorId]
  );
  const row = result.rows[0];
  if (!row) return null;
  return mapContributorHealthRow(row);
}

export async function listContributorHealth() {
  if (!isDatabaseReady()) return [];
  const result = await query(
    `select h.*, c.status as contributor_status, c.display_name
     from passport_signal_contributor_health h
     join passport_signal_contributors c on c.contributor_id = h.contributor_id
     order by h.last_activity_at desc nulls last`
  );
  return result.rows.map(mapContributorHealthRow);
}

export function mapContributorHealthRow(row) {
  const submitted = Number(row.signals_submitted || 0);
  const accepted = Number(row.signals_accepted || 0);
  const duplicates = Number(row.duplicate_count || 0);
  return {
    contributorId: row.contributor_id,
    displayName: row.display_name,
    signalsSubmitted: submitted,
    signalsAccepted: accepted,
    signalsRejected: Number(row.signals_rejected || 0),
    validationFailures: Number(row.validation_failures || 0),
    consentFailures: Number(row.consent_failures || 0),
    duplicateCount: duplicates,
    replayEvents: Number(row.replay_events || 0),
    acceptanceRate: submitted > 0 ? accepted / submitted : 0,
    duplicateRate: submitted > 0 ? duplicates / submitted : 0,
    lastActivityAt: row.last_activity_at,
    status: row.contributor_status,
    influencesTrust: false
  };
}
