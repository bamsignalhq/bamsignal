import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";

const PROFILE_TABLE = "passport_reputation_profile";
const LOG_TABLE = "passport_reputation_input_log";

export const REPUTATION_DIMENSIONS = Object.freeze([
  "identity",
  "reliability",
  "safety",
  "engagement",
  "financial",
  "community",
  "verification",
  "concierge",
  "support"
]);

const COLUMN_MAP = {
  identity: "identity_inputs",
  reliability: "reliability_inputs",
  safety: "safety_inputs",
  engagement: "engagement_inputs",
  financial: "financial_inputs",
  community: "community_inputs",
  verification: "verification_inputs",
  concierge: "concierge_inputs",
  support: "support_inputs"
};

async function ensureTables() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable(PROFILE_TABLE);
    await assertSchemaTable(LOG_TABLE);
    return true;
  } catch {
    return false;
  }
}

export async function ensureReputationProfile(passportId) {
  if (!(await ensureTables()) || !passportId) return { ok: false, skipped: true };
  await query(
    `insert into passport_reputation_profile (passport_id) values ($1) on conflict (passport_id) do nothing`,
    [String(passportId).toUpperCase()]
  );
  return { ok: true, passportId };
}

export async function appendReputationInput(input = {}) {
  const passportId = String(input.passportId || "").toUpperCase();
  const dimension = String(input.dimension || "").trim();
  if (!REPUTATION_DIMENSIONS.includes(dimension)) return { ok: false, error: "invalid_dimension" };
  if (!(await ensureTables())) return { ok: false, skipped: true };

  await ensureReputationProfile(passportId);

  const entry = {
    sourceSystem: input.sourceSystem || "unknown",
    signalType: input.signalType || "unknown",
    signalId: input.signalId || null,
    evidenceRef: input.evidenceRef || null,
    actor: input.actor || "system",
    recordedAt: new Date().toISOString(),
    metadata: input.metadata || {}
  };

  const column = COLUMN_MAP[dimension];
  const logId = String(input.logId || crypto.randomUUID());

  await query(
    `insert into passport_reputation_input_log (
       log_id, passport_id, dimension, source_system, signal_type, signal_id, input_payload, correlation_id
     ) values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)
     on conflict (log_id) do nothing`,
    [
      logId,
      passportId,
      dimension,
      entry.sourceSystem,
      entry.signalType,
      entry.signalId,
      JSON.stringify(entry),
      input.correlationId || null
    ]
  );

  await query(
    `update passport_reputation_profile
     set ${column} = ${column} || $2::jsonb, updated_at = now()
     where passport_id = $1`,
    [passportId, JSON.stringify([entry])]
  );

  const { publishTrustPlatformEvent } = await import("./eventBus.js");
  await publishTrustPlatformEvent({
    eventType: "reputation.updated",
    passportId,
    signalId: input.signalId || null,
    correlationId: input.correlationId || logId,
    payload: { dimension, signalType: entry.signalType }
  });

  const { incrementPassportIntegrationMetric } = await import("./observability.js");
  incrementPassportIntegrationMetric("reputationUpdates", 1);

  return { ok: true, logId, passportId, dimension };
}

export async function getReputationProfile(passportId) {
  if (!(await ensureTables()) || !passportId) return null;
  const { rows } = await query(
    "select * from passport_reputation_profile where passport_id = $1 limit 1",
    [String(passportId).toUpperCase()]
  );
  return rows[0] || null;
}

export async function listReputationInputs(passportId, options = {}) {
  if (!(await ensureTables())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const params = [String(passportId).toUpperCase(), limit];
  let clause = "where passport_id = $1";
  if (options.dimension) {
    params.splice(1, 0, options.dimension);
    clause += ` and dimension = $2`;
    params[2] = limit;
  }
  const { rows } = await query(
    `select log_id, dimension, source_system, signal_type, signal_id, input_payload, correlation_id, occurred_at
     from passport_reputation_input_log ${clause}
     order by occurred_at desc limit $${params.length}`,
    options.dimension ? [String(passportId).toUpperCase(), options.dimension, limit] : params
  );
  return rows;
}
