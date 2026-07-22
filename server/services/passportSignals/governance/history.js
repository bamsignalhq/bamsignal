/**
 * Append-only signal history — never overwrite.
 */

import crypto from "node:crypto";
import { query, isDatabaseReady } from "../../../db.js";
import { PassportSignalDatabaseError } from "../errors.js";

export function createHistoryId() {
  return `hist_${crypto.randomBytes(8).toString("hex")}`;
}

export async function appendSignalHistory({
  signalId,
  passportId,
  kind,
  headline,
  summary = "",
  actor = null,
  metadata = {}
}) {
  if (!isDatabaseReady()) throw new PassportSignalDatabaseError();
  const historyId = createHistoryId();
  await query(
    `insert into passport_signal_history (
      history_id, signal_id, passport_id, kind, headline, summary, actor, metadata, occurred_at
    ) values ($1,$2,$3,$4,$5,$6,$7,$8, now())`,
    [historyId, signalId, passportId, kind, headline, summary, actor, JSON.stringify(metadata)]
  );
  return { historyId };
}

export async function listSignalHistory(signalId, { limit = 100 } = {}) {
  if (!isDatabaseReady()) return [];
  const result = await query(
    `select history_id, signal_id, passport_id, kind, headline, summary, actor, metadata, occurred_at
     from passport_signal_history
     where signal_id = $1
     order by occurred_at asc
     limit $2`,
    [signalId, limit]
  );
  return result.rows.map(mapHistoryRow);
}

export function mapHistoryRow(row) {
  return {
    historyId: row.history_id,
    signalId: row.signal_id,
    passportId: row.passport_id,
    kind: row.kind,
    headline: row.headline,
    summary: row.summary,
    actor: row.actor,
    metadata: row.metadata || {},
    occurredAt: row.occurred_at
  };
}
