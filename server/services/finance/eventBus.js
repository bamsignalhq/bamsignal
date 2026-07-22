/**
 * Internal financial event bus — loosely couples downstream consumers from ledger reads.
 */

import crypto from "node:crypto";
import { query, isDatabaseReady } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { resolveFinancialIdempotencyKey } from "./idempotency.js";

export const FINANCIAL_EVENT_TYPES = Object.freeze([
  "payment.initialized",
  "payment.processing",
  "payment.successful",
  "payment.failed",
  "subscription.activated",
  "subscription.expired",
  "boost.purchased",
  "refund.created",
  "refund.completed",
  "wallet.updated"
]);

const inMemorySubscribers = new Map();

async function ensureTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable("member_financial_events");
    return true;
  } catch {
    return false;
  }
}

export function createFinancialEventId() {
  return `fevt_${crypto.randomBytes(8).toString("hex")}`;
}

function lifecycleToPaymentEvent(lifecycleStatus = "") {
  const status = String(lifecycleStatus).toLowerCase();
  if (status === "initialized") return "payment.initialized";
  if (status === "processing" || status === "pending") return "payment.processing";
  if (status === "successful") return "payment.successful";
  if (status === "failed" || status === "cancelled" || status === "expired") return "payment.failed";
  return null;
}

export function resolvePaymentFinancialEventType(input = {}) {
  if (input.eventType && FINANCIAL_EVENT_TYPES.includes(input.eventType)) {
    return input.eventType;
  }
  const productType = String(input.productType || "").toLowerCase();
  const lifecycleStatus = String(input.lifecycleStatus || "").toLowerCase();

  if (input.refundKind || input.refundId) {
    return input.refundCompleted ? "refund.completed" : "refund.created";
  }
  if (input.walletUpdated) return "wallet.updated";
  if (input.subscriptionExpired) return "subscription.expired";
  if (input.subscriptionActivated) return "subscription.activated";
  if (productType.includes("boost") && lifecycleStatus === "successful") return "boost.purchased";
  if (
    (productType.includes("premium") ||
      productType.includes("subscription") ||
      productType.includes("membership")) &&
    lifecycleStatus === "successful"
  ) {
    return "subscription.activated";
  }
  return lifecycleToPaymentEvent(lifecycleStatus);
}

export async function publishFinancialEvent(input = {}) {
  const eventType = resolvePaymentFinancialEventType(input);
  if (!eventType) return { ok: false, skipped: true, reason: "unknown_event_type" };

  const eventId = String(input.eventId || createFinancialEventId());
  const idempotencyKey = resolveFinancialIdempotencyKey({
    ...input,
    idempotencyKey: input.idempotencyKey || `event:${eventType}:${input.reference || input.transactionId || eventId}`
  });

  const record = {
    eventId,
    eventType,
    idempotencyKey,
    transactionId: input.transactionId || input.reference || null,
    reference: input.reference || null,
    memberId: input.memberId || null,
    payload: {
      amountKobo: input.amountKobo ?? null,
      productType: input.productType ?? null,
      productId: input.productId ?? null,
      lifecycleStatus: input.lifecycleStatus ?? null,
      subscriptionStatus: input.subscriptionStatus ?? null,
      wallet: input.wallet ?? null,
      ...(input.payload && typeof input.payload === "object" ? input.payload : {})
    },
    occurredAt: input.occurredAt || new Date().toISOString()
  };

  if (await ensureTable()) {
    try {
      await query(
        `insert into member_financial_events (
           event_id, event_type, idempotency_key, transaction_id, reference, member_id, payload, occurred_at
         ) values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)
         on conflict (event_id) do nothing`,
        [
          record.eventId,
          record.eventType,
          record.idempotencyKey,
          record.transactionId,
          record.reference,
          record.memberId,
          JSON.stringify(record.payload),
          record.occurredAt
        ]
      );
    } catch (error) {
      console.warn("[finance:event-bus] persist failed", error?.message || error);
    }
  }

  const handlers = inMemorySubscribers.get(eventType) || [];
  for (const handler of handlers) {
    try {
      await handler(record);
    } catch {
      /* subscriber errors must not break financial flows */
    }
  }

  return { ok: true, published: true, eventId: record.eventId, eventType: record.eventType, event: record };
}

export function subscribeFinancialEvents(eventTypes, handler) {
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

export async function listFinancialEvents(options = {}) {
  if (!(await ensureTable())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select event_id, event_type, idempotency_key, transaction_id, reference, member_id, payload, occurred_at
     from member_financial_events
     where ($1::text is null or event_type = $1)
       and ($2::text is null or reference = $2)
     order by occurred_at desc
     limit $3`,
    [options.eventType || null, options.reference || null, limit]
  );
  return rows;
}
