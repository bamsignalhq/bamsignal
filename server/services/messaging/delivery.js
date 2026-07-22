import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { resolveDeliveryIdempotencyKey } from "./idempotency.js";
import { incrementMessagingMetric } from "./observability.js";

const MAX_RETRIES = 5;
const BASE_BACKOFF_MS = 2000;
const DELIVERY_TIMEOUT_MS = 60_000;

async function ensureTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable("member_message_delivery_queue");
    return true;
  } catch {
    return false;
  }
}

export function computeRetryBackoff(retryCount = 0) {
  const ms = BASE_BACKOFF_MS * Math.pow(2, Math.min(retryCount, 6));
  return new Date(Date.now() + ms).toISOString();
}

export async function enqueueMessageDelivery(input = {}) {
  if (!(await ensureTable()) || !input.messageId || !input.conversationId) {
    return { ok: false, skipped: true };
  }

  const queueId = String(input.queueId || crypto.randomUUID());
  const idempotencyKey = resolveDeliveryIdempotencyKey(
    input.messageId,
    input.recipientMemberId || "unknown",
    input.suffix || "deliver"
  );

  try {
    const result = await query(
      `insert into member_message_delivery_queue (
         queue_id, message_id, conversation_id, recipient_member_id,
         idempotency_key, status, payload
       ) values ($1,$2,$3,$4,$5,'queued',$6::jsonb)
       on conflict (idempotency_key) do nothing
       returning queue_id, idempotency_key`,
      [
        queueId,
        input.messageId,
        input.conversationId,
        input.recipientMemberId || null,
        idempotencyKey,
        JSON.stringify(input.payload || {})
      ]
    );

    if (!result.rows[0]) {
      return { ok: true, duplicate: true, idempotencyKey };
    }

    incrementMessagingMetric("deliveryQueueDepth", 1);
    return { ok: true, queueId, idempotencyKey, status: "queued" };
  } catch (error) {
    console.warn("[messaging:delivery] enqueue failed", error?.message || error);
    return { ok: false, error: error?.message || "enqueue_failed" };
  }
}

export async function acknowledgeDelivery(queueId, input = {}) {
  if (!(await ensureTable()) || !queueId) return { ok: false };

  const result = await query(
    `update member_message_delivery_queue
     set status = 'delivered', updated_at = now(),
         payload = payload || $2::jsonb
     where queue_id = $1 and status in ('queued', 'processing')
     returning *`,
    [queueId, JSON.stringify({ acknowledgedAt: new Date().toISOString(), ...(input.metadata || {}) })]
  );

  return { ok: Boolean(result.rows[0]), row: result.rows[0] || null };
}

export async function markDeliveryFailed(queueId, reason = "delivery_failed") {
  if (!(await ensureTable()) || !queueId) return { ok: false };

  const existing = await query(
    `select queue_id, retry_count from member_message_delivery_queue where queue_id = $1`,
    [queueId]
  );
  const row = existing.rows[0];
  if (!row) return { ok: false };

  const retryCount = Number(row.retry_count) + 1;
  const exhausted = retryCount >= MAX_RETRIES;
  const status = exhausted ? "failed" : "queued";
  const nextRetryAt = exhausted ? null : computeRetryBackoff(retryCount);

  await query(
    `update member_message_delivery_queue
     set status = $2, retry_count = $3, next_retry_at = $4, updated_at = now(),
         payload = payload || $5::jsonb
     where queue_id = $1`,
    [
      queueId,
      status,
      retryCount,
      nextRetryAt,
      JSON.stringify({ lastFailure: reason, failedAt: new Date().toISOString() })
    ]
  );

  incrementMessagingMetric("deliveryRetries");
  if (exhausted) incrementMessagingMetric("failedDeliveries");

  return { ok: true, retryCount, exhausted, nextRetryAt };
}

export async function processPendingDeliveries(options = {}) {
  if (!(await ensureTable())) return { processed: 0, delivered: 0, failed: 0 };

  const limit = Math.min(Math.max(Number(options.limit) || 20, 1), 100);
  const now = new Date().toISOString();
  const staleBefore = new Date(Date.now() - DELIVERY_TIMEOUT_MS).toISOString();

  const { rows } = await query(
    `select queue_id, message_id, conversation_id, recipient_member_id, retry_count, created_at
     from member_message_delivery_queue
     where status = 'queued'
       and (next_retry_at is null or next_retry_at <= $1)
     order by created_at asc
     limit $2`,
    [now, limit]
  );

  let delivered = 0;
  let failed = 0;

  for (const row of rows) {
    await query(
      `update member_message_delivery_queue set status = 'processing', updated_at = now()
       where queue_id = $1 and status = 'queued'`,
      [row.queue_id]
    );

    if (row.created_at && String(row.created_at) < staleBefore && row.retry_count >= MAX_RETRIES - 1) {
      await markDeliveryFailed(row.queue_id, "delivery_timeout");
      failed += 1;
      continue;
    }

    await acknowledgeDelivery(row.queue_id, { metadata: { processedBy: "delivery_engine" } });
    delivered += 1;
  }

  return { processed: rows.length, delivered, failed };
}

export async function listPendingDeliveries(recipientMemberId, options = {}) {
  if (!(await ensureTable()) || !recipientMemberId) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select queue_id, message_id, conversation_id, status, retry_count, payload, created_at
     from member_message_delivery_queue
     where recipient_member_id = $1 and status in ('queued', 'processing')
     order by created_at asc
     limit $2`,
    [recipientMemberId, limit]
  );
  return rows;
}
