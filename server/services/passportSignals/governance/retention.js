/**
 * Signal retention metadata — never hard-delete production records.
 */

import { query, isDatabaseReady } from "../../../db.js";
import { appendSignalHistory } from "./history.js";

export const RETENTION_POLICY = {
  default: { label: "default", retainYears: 7 },
  archived: { label: "archived", retainYears: 10 },
  compliance: { label: "compliance_hold", retainYears: null }
};

export async function ensureRetentionRecord(signalId, { retentionClass = "active", policyLabel = "default" } = {}) {
  if (!isDatabaseReady()) return null;
  const policy = RETENTION_POLICY[policyLabel] || RETENTION_POLICY.default;
  const retainUntil =
    policy.retainYears === null
      ? null
      : new Date(Date.now() + policy.retainYears * 365 * 24 * 60 * 60 * 1000).toISOString();

  await query(
    `insert into passport_signal_retention (signal_id, retention_class, retain_until, policy_label)
     values ($1, $2, $3, $4)
     on conflict (signal_id) do update set
       retention_class = excluded.retention_class,
       retain_until = excluded.retain_until,
       policy_label = excluded.policy_label,
       updated_at = now()`,
    [signalId, retentionClass, retainUntil, policyLabel]
  );

  return { signalId, retentionClass, retainUntil, policyLabel };
}

export async function archiveSignalRetention(signalId, passportId, actor = "system") {
  if (!isDatabaseReady()) return null;
  await query(
    `update passport_signal_retention
     set retention_class = 'archived',
         archived_at = now(),
         updated_at = now()
     where signal_id = $1`,
    [signalId]
  );
  await appendSignalHistory({
    signalId,
    passportId,
    kind: "retention",
    headline: "Retention: archived",
    summary: "Signal archived per retention policy — record retained",
    actor,
    metadata: { retentionClass: "archived" }
  });
}

export async function getRetentionMetadata(signalId) {
  if (!isDatabaseReady()) return null;
  const result = await query(
    `select signal_id, retention_class, retain_until, archived_at, policy_label
     from passport_signal_retention where signal_id = $1`,
    [signalId]
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    signalId: row.signal_id,
    retentionClass: row.retention_class,
    retainUntil: row.retain_until,
    archivedAt: row.archived_at,
    policyLabel: row.policy_label
  };
}
