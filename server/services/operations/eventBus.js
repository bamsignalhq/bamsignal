import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";

const EVENTS_TABLE = "ops_admin_events";

export const ADMIN_EVENT_TYPES = Object.freeze([
  "admin.login",
  "admin.logout",
  "report.created",
  "report.assigned",
  "report.closed",
  "ticket.created",
  "ticket.updated",
  "ticket.closed",
  "concierge.assigned",
  "concierge.completed",
  "user.suspended",
  "user.restored",
  "feature.updated",
  "configuration.updated"
]);

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

export function subscribeAdminEvents(handler) {
  if (typeof handler === "function") subscribers.add(handler);
  return () => subscribers.delete(handler);
}

export async function publishAdminEvent(input = {}) {
  const eventType = String(input.eventType || "").trim();
  if (!ADMIN_EVENT_TYPES.includes(eventType)) {
    return { ok: false, error: "invalid_event_type" };
  }

  const eventId = String(input.eventId || crypto.randomUUID());
  const idempotencyKey = String(
    input.idempotencyKey || `admin:${eventType}:${eventId}`
  );

  if (await ensureTable()) {
    try {
      await query(
        `insert into ops_admin_events (event_id, event_type, idempotency_key, payload, actor, correlation_id)
         values ($1,$2,$3,$4::jsonb,$5,$6)
         on conflict (idempotency_key) do nothing`,
        [
          eventId,
          eventType,
          idempotencyKey,
          JSON.stringify(input.payload || {}),
          String(input.actor || "system"),
          input.correlationId || null
        ]
      );
    } catch (error) {
      console.warn("[ops:eventBus] persist failed", error?.message || error);
    }
  }

  for (const handler of subscribers) {
    try {
      handler({ eventId, eventType, payload: input.payload || {}, actor: input.actor || "system" });
    } catch (error) {
      console.warn("[ops:eventBus] subscriber failed", error?.message || error);
    }
  }

  const { incrementOperationsMetric } = await import("./observability.js");
  incrementOperationsMetric("adminEventsPublished", 1);

  return { ok: true, eventId, eventType, idempotencyKey };
}

export async function listAdminEvents(options = {}) {
  if (!(await ensureTable())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 100, 1), 500);
  const eventType = options.eventType || null;

  const { rows } = await query(
    eventType
      ? `select event_id, event_type, payload, actor, correlation_id, created_at
         from ops_admin_events where event_type = $1 order by created_at desc limit $2`
      : `select event_id, event_type, payload, actor, correlation_id, created_at
         from ops_admin_events order by created_at desc limit $1`,
    eventType ? [eventType, limit] : [limit]
  );
  return rows;
}

export async function recordAdminLogin(input = {}) {
  return publishAdminEvent({
    eventType: "admin.login",
    payload: { email: input.email || null },
    actor: input.email || "admin",
    idempotencyKey: `admin.login:${input.email}:${input.sessionId || Date.now()}`
  });
}

export async function recordAdminLogout(input = {}) {
  return publishAdminEvent({
    eventType: "admin.logout",
    payload: { email: input.email || null },
    actor: input.email || "admin",
    idempotencyKey: `admin.logout:${input.email}:${input.sessionId || Date.now()}`
  });
}
