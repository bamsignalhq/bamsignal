import { isDatabaseReady, query } from "../../db.js";
import { enqueueMessageDelivery, listPendingDeliveries, processPendingDeliveries } from "./delivery.js";
import { recordMessageSendPipeline } from "./messages.js";
import {
  listMessagesFromSequence,
  detectSequenceGaps,
  resolveSequenceConflict
} from "./sequences.js";
import { incrementMessagingMetric } from "./observability.js";

/**
 * Offline sync support — queue, replay, duplicate prevention, sequence-based gap detection.
 */

export async function queueOfflineMessage(input = {}) {
  if (!input.messageId || !input.conversationId || !input.senderMemberId) {
    return { ok: false, skipped: true };
  }

  const enqueue = await enqueueMessageDelivery({
    messageId: input.messageId,
    conversationId: input.conversationId,
    recipientMemberId: input.senderMemberId,
    suffix: "offline-sync",
    payload: {
      kind: "offline_outbound",
      message: input.message || null,
      sequenceNumber: input.sequenceNumber ?? null,
      queuedAt: new Date().toISOString()
    }
  });

  incrementMessagingMetric("offlineQueueDepth", 1);
  return enqueue;
}

export async function syncMessagesFromSequence(conversationId, afterSeq = 0, options = {}) {
  const messages = await listMessagesFromSequence(conversationId, afterSeq, options);
  const gaps = await detectSequenceGaps(conversationId, { afterSeq });
  return { ok: true, messages, gaps: gaps.gaps || [] };
}

export async function syncPendingMessagesForMember(memberId, options = {}) {
  if (!isDatabaseReady() || !memberId) return { ok: false, synced: 0 };

  const pending = await listPendingDeliveries(memberId, options);
  let synced = 0;
  let duplicates = 0;

  for (const row of pending) {
    const existing = await query(
      `select message_id, sequence_number from member_message_state
       where message_id = $1 and conversation_id = $2 and status in ('sent','delivered','read')`,
      [row.message_id, row.conversation_id]
    );
    if (existing.rows[0]) {
      duplicates += 1;
      await query(
        `update member_message_delivery_queue set status = 'delivered', updated_at = now()
         where queue_id = $1`,
        [row.queue_id]
      );
      continue;
    }

    await recordMessageSendPipeline({
      messageId: row.message_id,
      conversationId: row.conversation_id,
      recipientMemberId: memberId,
      metadata: { syncReplay: true, queueId: row.queue_id }
    });
    synced += 1;
  }

  incrementMessagingMetric("reconnectEvents");
  return { ok: true, synced, duplicates, pending: pending.length };
}

export async function replayOfflineQueue(options = {}) {
  const delivery = await processPendingDeliveries(options);
  return { ok: true, ...delivery };
}

export async function resolveMessageConflict(input = {}) {
  if (input.sequenceNumber != null && input.conversationId) {
    return resolveSequenceConflict(input);
  }

  const messageId = String(input.messageId || "").trim();
  const conversationId = String(input.conversationId || "").trim();
  if (!messageId || !conversationId) return { ok: false, resolution: "invalid" };

  const { rows } = await query(
    `select message_id, sequence_number, status, created_at from member_message_state
     where message_id = $1 and conversation_id = $2
     order by created_at desc limit 1`,
    [messageId, conversationId]
  );

  if (rows[0]) {
    return { ok: true, resolution: "keep_server", state: rows[0] };
  }

  return { ok: true, resolution: "accept_client", messageId, conversationId };
}

export { detectSequenceGaps, listMessagesFromSequence, resolveSequenceConflict };
