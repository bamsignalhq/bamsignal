/**
 * Internal realtime event bus — loosely couples downstream consumers from direct DB reads.
 */

import crypto from "node:crypto";
import { query, isDatabaseReady } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { resolveRealtimeEventIdempotencyKey } from "./idempotency.js";

export const REALTIME_EVENT_TYPES = Object.freeze([
  "conversation.created",
  "conversation.archived",
  "message.sent",
  "message.delivered",
  "message.read",
  "message.failed",
  "presence.online",
  "presence.offline",
  "typing.started",
  "typing.stopped"
]);

const inMemorySubscribers = new Map();

async function ensureTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable("member_realtime_events");
    return true;
  } catch {
    return false;
  }
}

export function createRealtimeEventId() {
  return `revt_${crypto.randomBytes(8).toString("hex")}`;
}

export function resolveRealtimeEventType(input = {}) {
  if (input.eventType && REALTIME_EVENT_TYPES.includes(input.eventType)) {
    return input.eventType;
  }
  if (input.typingStopped) return "typing.stopped";
  if (input.typingStarted) return "typing.started";
  if (input.presenceOffline) return "presence.offline";
  if (input.presenceOnline) return "presence.online";
  if (input.messageRead) return "message.read";
  if (input.messageDelivered) return "message.delivered";
  if (input.messageFailed) return "message.failed";
  if (input.messageSent) return "message.sent";
  if (input.conversationArchived) return "conversation.archived";
  if (input.conversationCreated) return "conversation.created";
  return null;
}

export async function publishRealtimeEvent(input = {}) {
  const eventType = resolveRealtimeEventType(input);
  if (!eventType) return { ok: false, skipped: true, reason: "unknown_event_type" };

  const eventId = String(input.eventId || createRealtimeEventId());
  const idempotencyKey = resolveRealtimeEventIdempotencyKey(
    eventType,
    input.idempotencyKey || input.messageId || input.conversationId || eventId
  );

  const record = {
    eventId,
    eventType,
    idempotencyKey,
    conversationId: input.conversationId || input.threadId || null,
    messageId: input.messageId || null,
    memberId: input.memberId || null,
    payload: {
      ...(input.payload && typeof input.payload === "object" ? input.payload : {}),
      status: input.status ?? null,
      peerMemberId: input.peerMemberId ?? null
    },
    occurredAt: input.occurredAt || new Date().toISOString()
  };

  if (await ensureTable()) {
    try {
      await query(
        `insert into member_realtime_events (
           event_id, event_type, idempotency_key, conversation_id, message_id, member_id, payload, occurred_at
         ) values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)
         on conflict (event_id) do nothing`,
        [
          record.eventId,
          record.eventType,
          record.idempotencyKey,
          record.conversationId,
          record.messageId,
          record.memberId,
          JSON.stringify(record.payload),
          record.occurredAt
        ]
      );
    } catch (error) {
      console.warn("[messaging:event-bus] persist failed", error?.message || error);
    }
  }

  const handlers = inMemorySubscribers.get(eventType) || [];
  for (const handler of handlers) {
    try {
      await handler(record);
    } catch {
      /* subscriber errors must not break messaging flows */
    }
  }

  return { ok: true, published: true, eventId: record.eventId, eventType: record.eventType, event: record };
}

export function subscribeRealtimeEvents(eventTypes, handler) {
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

export async function listRealtimeEvents(options = {}) {
  if (!(await ensureTable())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select event_id, event_type, idempotency_key, conversation_id, message_id, member_id, payload, occurred_at
     from member_realtime_events
     where ($1::text is null or event_type = $1)
       and ($2::text is null or conversation_id = $2)
     order by occurred_at desc
     limit $3`,
    [options.eventType || null, options.conversationId || null, limit]
  );
  return rows;
}
