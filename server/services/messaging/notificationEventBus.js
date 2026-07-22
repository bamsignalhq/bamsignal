/**
 * Notification event bus — independent from messaging realtime events.
 * Future push/email/SMS workers subscribe here.
 */

import crypto from "node:crypto";
import { query, isDatabaseReady } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { resolveNotificationIdempotencyKey } from "./idempotency.js";

export const NOTIFICATION_EVENT_TYPES = Object.freeze([
  "notification.created",
  "notification.queued",
  "notification.sent",
  "notification.failed",
  "notification.dismissed",
  "notification.read"
]);

const inMemorySubscribers = new Map();

async function ensureTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable("member_notification_events");
    return true;
  } catch {
    return false;
  }
}

export function createNotificationEventId() {
  return `nevt_${crypto.randomBytes(8).toString("hex")}`;
}

export function resolveNotificationEventType(input = {}) {
  if (input.eventType && NOTIFICATION_EVENT_TYPES.includes(input.eventType)) {
    return input.eventType;
  }
  if (input.notificationRead) return "notification.read";
  if (input.notificationDismissed) return "notification.dismissed";
  if (input.notificationFailed) return "notification.failed";
  if (input.notificationSent) return "notification.sent";
  if (input.notificationQueued) return "notification.queued";
  if (input.notificationCreated) return "notification.created";
  return null;
}

export async function publishNotificationEvent(input = {}) {
  const eventType = resolveNotificationEventType(input);
  if (!eventType) return { ok: false, skipped: true, reason: "unknown_event_type" };

  const eventId = String(input.eventId || createNotificationEventId());
  const idempotencyKey = resolveNotificationIdempotencyKey(
    input.idempotencyKey || `${eventType}:${input.notificationId || eventId}`
  );

  const record = {
    eventId,
    eventType,
    idempotencyKey,
    notificationId: input.notificationId || null,
    memberId: input.memberId || null,
    payload: {
      ...(input.payload && typeof input.payload === "object" ? input.payload : {}),
      category: input.category ?? null,
      channel: input.channel ?? null
    },
    occurredAt: input.occurredAt || new Date().toISOString()
  };

  if (await ensureTable()) {
    try {
      await query(
        `insert into member_notification_events (
           event_id, event_type, idempotency_key, notification_id, member_id, payload, occurred_at
         ) values ($1,$2,$3,$4,$5,$6::jsonb,$7)
         on conflict (event_id) do nothing`,
        [
          record.eventId,
          record.eventType,
          record.idempotencyKey,
          record.notificationId,
          record.memberId,
          JSON.stringify(record.payload),
          record.occurredAt
        ]
      );
    } catch (error) {
      console.warn("[messaging:notification-bus] persist failed", error?.message || error);
    }
  }

  const handlers = inMemorySubscribers.get(eventType) || [];
  for (const handler of handlers) {
    try {
      await handler(record);
    } catch {
      /* subscriber errors must not break notification flows */
    }
  }

  return { ok: true, published: true, eventId: record.eventId, eventType, event: record };
}

export function subscribeNotificationEvents(eventTypes, handler) {
  const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
  for (const type of types) {
    const list = inMemorySubscribers.get(type) || [];
    list.push(handler);
    inMemorySubscribers.set(type, list);
  }
  return {
    unsubscribe: () => {
      for (const type of types) {
        const list = (inMemorySubscribers.get(type) || []).filter((fn) => fn !== handler);
        inMemorySubscribers.set(type, list);
      }
    }
  };
}

export async function listNotificationEvents(options = {}) {
  if (!(await ensureTable())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select event_id, event_type, idempotency_key, notification_id, member_id, payload, occurred_at
     from member_notification_events
     where ($1::text is null or event_type = $1)
       and ($2::uuid is null or member_id = $2)
     order by occurred_at desc
     limit $3`,
    [options.eventType || null, options.memberId || null, limit]
  );
  return rows;
}
