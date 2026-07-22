import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { resolveMessageIdempotencyKey } from "./idempotency.js";
import { publishRealtimeEvent } from "./eventBus.js";
import { incrementMessagingMetric } from "./observability.js";

export const MESSAGE_STATUSES = Object.freeze([
  "queued",
  "sending",
  "sent",
  "delivered",
  "read",
  "edited",
  "deleted",
  "failed",
  "expired"
]);

async function ensureTables() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable("member_message_state");
    await assertSchemaTable("member_message_lifecycle_log");
    return true;
  } catch {
    return false;
  }
}

export async function transitionMessageLifecycle(input = {}) {
  const newStatus = String(input.newStatus || "").trim();
  if (!MESSAGE_STATUSES.includes(newStatus)) {
    return { ok: false, error: "invalid_status" };
  }
  if (!(await ensureTables()) || !input.messageId || !input.conversationId) {
    return { ok: false, skipped: true };
  }

  const previousStatus = String(input.previousStatus || "unknown");
  const logId = String(input.logId || crypto.randomUUID());
  const idempotencyKey = resolveMessageIdempotencyKey(input);

  try {
    await query(
      `insert into member_message_lifecycle_log (
         log_id, message_id, conversation_id, previous_status, new_status,
         reason_code, reason, actor, metadata
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
       on conflict (log_id) do nothing`,
      [
        logId,
        input.messageId,
        input.conversationId,
        previousStatus,
        newStatus,
        String(input.reasonCode || "system"),
        String(input.reason || "").slice(0, 500),
        String(input.actor || "system"),
        JSON.stringify(input.metadata || {})
      ]
    );

    const timestampField =
      newStatus === "delivered"
        ? "delivered_at"
        : newStatus === "read"
          ? "read_at"
          : newStatus === "edited"
            ? "edited_at"
            : newStatus === "deleted"
              ? "deleted_at"
              : null;

    const timestampSql = timestampField ? `, ${timestampField} = coalesce(${timestampField}, now())` : "";

    await query(
      `insert into member_message_state (
         message_id, conversation_id, sender_member_id, idempotency_key, status,
         body_preview, retry_count, sequence_number, metadata
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
       on conflict (message_id, conversation_id) do update set
         status = excluded.status,
         sequence_number = coalesce(member_message_state.sequence_number, excluded.sequence_number),
         retry_count = case when excluded.status = 'failed'
           then member_message_state.retry_count + 1
           else member_message_state.retry_count end,
         metadata = member_message_state.metadata || excluded.metadata
         ${timestampSql}`,
      [
        input.messageId,
        input.conversationId,
        input.senderMemberId || null,
        idempotencyKey,
        newStatus,
        String(input.bodyPreview || "").slice(0, 500),
        Number(input.retryCount) || 0,
        input.sequenceNumber ?? null,
        JSON.stringify({ ...(input.metadata || {}), idempotencyKey, sequenceNumber: input.sequenceNumber ?? null })
      ]
    );

    if (newStatus === "sent") incrementMessagingMetric("messagesSent");
    if (newStatus === "delivered") incrementMessagingMetric("messagesDelivered");
    if (newStatus === "read") incrementMessagingMetric("messagesRead");
    if (newStatus === "failed") incrementMessagingMetric("failedDeliveries");

    const eventMap = {
      sent: { messageSent: true, eventType: "message.sent" },
      delivered: { messageDelivered: true, eventType: "message.delivered" },
      read: { messageRead: true, eventType: "message.read" },
      failed: { messageFailed: true, eventType: "message.failed" }
    };
    const evt = eventMap[newStatus];
    if (evt) {
      await publishRealtimeEvent({
        ...evt,
        messageId: input.messageId,
        conversationId: input.conversationId,
        memberId: input.senderMemberId || input.memberId || null,
        idempotencyKey: `${input.messageId}:${newStatus}`
      });
    }

    return { ok: true, logId, previousStatus, newStatus, idempotencyKey };
  } catch (error) {
    console.warn("[messaging:messages] transition failed", error?.message || error);
    return { ok: false, error: error?.message || "transition_failed" };
  }
}

export async function getMessageState(messageId, conversationId) {
  if (!(await ensureTables()) || !messageId || !conversationId) return null;
  const { rows } = await query(
    `select message_id, conversation_id, sender_member_id, idempotency_key, status,
            body_preview, retry_count, sequence_number, created_at, delivered_at, read_at
     from member_message_state
     where message_id = $1 and conversation_id = $2`,
    [messageId, conversationId]
  );
  return rows[0] || null;
}

export async function listMessageTransitions(messageId, conversationId, options = {}) {
  if (!(await ensureTables()) || !messageId) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select log_id, previous_status, new_status, reason_code, reason, actor, occurred_at
     from member_message_lifecycle_log
     where message_id = $1 and conversation_id = $2
     order by occurred_at desc
     limit $3`,
    [messageId, conversationId, limit]
  );
  return rows;
}

/** Full message send lifecycle hook */
export async function recordMessageSendPipeline(input = {}) {
  const messageId = String(input.messageId || input.message?.id || "").trim();
  const conversationId = String(input.conversationId || input.threadId || "").trim();
  if (!messageId || !conversationId) return { ok: false, skipped: true };

  const bodyPreview = String(input.bodyPreview || input.message?.text || "").slice(0, 500);

  const { allocateMessageSequence } = await import("./sequences.js");
  const seqResult = await allocateMessageSequence(conversationId);
  const sequenceNumber = seqResult.sequenceNumber ?? null;
  const seqMeta = { ...(input.metadata || {}), sequenceNumber };

  await transitionMessageLifecycle({
    messageId,
    conversationId,
    senderMemberId: input.senderMemberId || null,
    sequenceNumber,
    previousStatus: "unknown",
    newStatus: "queued",
    bodyPreview,
    reasonCode: "message_queued",
    metadata: seqMeta
  });

  await transitionMessageLifecycle({
    messageId,
    conversationId,
    senderMemberId: input.senderMemberId || null,
    sequenceNumber,
    previousStatus: "queued",
    newStatus: "sending",
    bodyPreview,
    reasonCode: "message_sending",
    metadata: seqMeta
  });

  if (input.failed) {
    return transitionMessageLifecycle({
      messageId,
      conversationId,
      senderMemberId: input.senderMemberId || null,
      sequenceNumber,
      previousStatus: "sending",
      newStatus: "failed",
      bodyPreview,
      reasonCode: input.reasonCode || "send_failed",
      metadata: { ...seqMeta, error: input.error || null }
    });
  }

  const sent = await transitionMessageLifecycle({
    messageId,
    conversationId,
    senderMemberId: input.senderMemberId || null,
    sequenceNumber,
    previousStatus: "sending",
    newStatus: "sent",
    bodyPreview,
    reasonCode: "message_sent",
    metadata: seqMeta
  });

  if (input.suppressed) return { ...sent, sequenceNumber };

  if (input.recipientMemberId) {
    await transitionMessageLifecycle({
      messageId,
      conversationId,
      senderMemberId: input.senderMemberId || null,
      memberId: input.recipientMemberId,
      sequenceNumber,
      previousStatus: "sent",
      newStatus: "delivered",
      bodyPreview,
      reasonCode: "message_delivered",
      metadata: seqMeta
    });
  }

  return { ...sent, sequenceNumber };
}
