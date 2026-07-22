import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";

export const TRUST_PLATFORM_EVENT_TYPES = Object.freeze([
  "trust.signal.created",
  "trust.signal.accepted",
  "trust.signal.rejected",
  "passport.updated",
  "reputation.updated",
  "verification.completed",
  "identity.updated"
]);

const EVENTS_TABLE = "passport_integration_events";
const subscribers = new Set();

async function ensureTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable(EVENTS_TABLE);
    return true;
  } catch {
    return false;
  }
}

export function subscribeTrustPlatformEvents(handler) {
  if (typeof handler === "function") subscribers.add(handler);
  return () => subscribers.delete(handler);
}

export async function publishTrustPlatformEvent(input = {}) {
  const eventType = String(input.eventType || "").trim();
  if (!TRUST_PLATFORM_EVENT_TYPES.includes(eventType)) {
    return { ok: false, error: "invalid_event_type" };
  }

  const eventId = String(input.eventId || `tpe_${crypto.randomUUID()}`);
  const passportId = String(input.passportId || "").trim().toUpperCase();
  if (!passportId) return { ok: false, error: "missing_passport" };

  if (await ensureTable()) {
    try {
      await query(
        `insert into passport_integration_events (
           event_id, event_type, passport_id, signal_id, correlation_id, payload
         ) values ($1,$2,$3,$4,$5,$6::jsonb)
         on conflict (event_id) do nothing`,
        [
          eventId,
          eventType,
          passportId,
          input.signalId || null,
          input.correlationId || null,
          JSON.stringify(input.payload || {})
        ]
      );
    } catch (error) {
      console.warn("[passportIntegration:eventBus] persist failed", error?.message || error);
    }
  }

  const record = { eventId, eventType, passportId, signalId: input.signalId, payload: input.payload || {} };
  for (const handler of subscribers) {
    try {
      handler(record);
    } catch {
      /* non-fatal */
    }
  }

  const { incrementPassportIntegrationMetric } = await import("./observability.js");
  incrementPassportIntegrationMetric("trustEventsPublished", 1);

  return { ok: true, eventId, eventType };
}

export async function listTrustPlatformEvents(options = {}) {
  if (!(await ensureTable())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const passportId = options.passportId ? String(options.passportId).toUpperCase() : null;

  const { rows } = await query(
    passportId
      ? `select event_id, event_type, passport_id, signal_id, correlation_id, payload, occurred_at
         from passport_integration_events where passport_id = $1 order by occurred_at desc limit $2`
      : `select event_id, event_type, passport_id, signal_id, correlation_id, payload, occurred_at
         from passport_integration_events order by occurred_at desc limit $1`,
    passportId ? [passportId, limit] : [limit]
  );
  return rows;
}
