/**
 * Idempotency and duplicate detection.
 */

import { query, isDatabaseReady } from "../../db.js";
import { PassportSignalDatabaseError } from "./errors.js";

export function buildIdempotencyMetadata(body = {}) {
  return {
    idempotencyKey: String(body.idempotencyKey || body.idempotency?.idempotencyKey || "").trim(),
    contributorEventId: String(
      body.contributorEventId || body.idempotency?.contributorEventId || ""
    ).trim(),
    correlationId: String(body.correlationId || body.idempotency?.correlationId || "").trim(),
    submittedAt: body.submittedAt || new Date().toISOString()
  };
}

export function assertIdempotencyPresent(idempotency) {
  if (!idempotency.idempotencyKey) {
    return { ok: false, reason: "idempotencyKey is required" };
  }
  if (!idempotency.contributorEventId) {
    return { ok: false, reason: "contributorEventId is required" };
  }
  if (!idempotency.correlationId) {
    return { ok: false, reason: "correlationId is required" };
  }
  return { ok: true };
}

export async function detectDuplicate(contributorId, idempotencyKey) {
  if (!isDatabaseReady()) {
    throw new PassportSignalDatabaseError();
  }

  const result = await query(
    `select signal_id, id::text as row_id
     from passport_trust_signals
     where contributor_id = $1 and idempotency_key = $2 and deleted_at is null
     limit 1`,
    [contributorId, idempotencyKey]
  );

  if (!result.rows[0]) {
    return {
      isDuplicate: false,
      handling: "accept_new",
      existingSignalId: null,
      detectedAt: new Date().toISOString()
    };
  }

  return {
    isDuplicate: true,
    handling: "return_existing",
    existingSignalId: result.rows[0].signal_id,
    existingRowId: result.rows[0].row_id,
    detectedAt: new Date().toISOString()
  };
}
