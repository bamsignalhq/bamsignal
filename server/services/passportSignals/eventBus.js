/**
 * Internal event bus — swappable publisher (future Redis/Kafka adapter).
 */

import crypto from "node:crypto";
import { query, isDatabaseReady } from "../../db.js";

const inMemorySubscribers = new Map();

export function createEventId() {
  return `evt_${crypto.randomBytes(8).toString("hex")}`;
}

export async function publishSignalEvent(event) {
  const eventId = event.eventId || createEventId();
  const record = {
    eventId,
    eventType: event.eventType,
    passportId: event.passportId,
    signalId: event.signalId || null,
    contributorId: event.contributorId || null,
    correlationId: event.correlationId,
    payload: event.payload || {},
    auditRef: event.auditRef,
    occurredAt: event.occurredAt || new Date().toISOString()
  };

  if (isDatabaseReady()) {
    await query(
      `insert into passport_signal_events (
        event_id, event_type, passport_id, signal_id, contributor_id,
        correlation_id, payload, audit_ref, occurred_at
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      on conflict (event_id) do nothing`,
      [
        record.eventId,
        record.eventType,
        record.passportId,
        record.signalId,
        record.contributorId,
        record.correlationId,
        JSON.stringify(record.payload),
        record.auditRef,
        record.occurredAt
      ]
    );
  }

  const handlers = inMemorySubscribers.get(record.eventType) || [];
  for (const handler of handlers) {
    try {
      await handler(record);
    } catch {
      /* subscriber errors must not break ingestion */
    }
  }

  return { published: true, eventId: record.eventId, event: record };
}

export function subscribeSignalEvents(eventTypes, handler) {
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

export async function listRecentEvents(passportId, limit = 20) {
  if (!isDatabaseReady()) return [];
  const result = await query(
    `select event_id, event_type, passport_id, signal_id, contributor_id, correlation_id, payload, occurred_at
     from passport_signal_events
     where passport_id = $1
     order by occurred_at desc
     limit $2`,
    [passportId, limit]
  );
  return result.rows;
}
