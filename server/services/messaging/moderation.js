import crypto from "node:crypto";
import { isDatabaseReady, query } from "../../db.js";
import { assertSchemaTable } from "../schemaVerification.js";
import { transitionConversationLifecycle } from "./conversations.js";
import { incrementMessagingMetric } from "./observability.js";

export const MODERATION_KINDS = Object.freeze([
  "report_message",
  "block_conversation",
  "safety_review",
  "spam_hook",
  "ai_hook_placeholder"
]);

async function ensureTable() {
  if (!isDatabaseReady()) return false;
  try {
    await assertSchemaTable("member_messaging_moderation_events");
    return true;
  } catch {
    return false;
  }
}

export async function recordModerationEvent(input = {}) {
  if (!(await ensureTable())) return { ok: false, skipped: true };

  const kind = MODERATION_KINDS.includes(input.kind) ? input.kind : "safety_review";
  const eventId = String(input.eventId || crypto.randomUUID());

  try {
    await query(
      `insert into member_messaging_moderation_events (
         event_id, kind, conversation_id, message_id,
         reporter_member_id, target_member_id, status, payload
       ) values ($1,$2,$3,$4,$5,$6,'open',$7::jsonb)
       on conflict (event_id) do nothing
       returning event_id`,
      [
        eventId,
        kind,
        input.conversationId || null,
        input.messageId || null,
        input.reporterMemberId || null,
        input.targetMemberId || null,
        JSON.stringify(input.payload || {})
      ]
    );

    incrementMessagingMetric("moderationEvents");
    return { ok: true, eventId, kind };
  } catch (error) {
    console.warn("[messaging:moderation] record failed", error?.message || error);
    return { ok: false, error: error?.message || "record_failed" };
  }
}

export async function reportMessage(input = {}) {
  const result = await recordModerationEvent({
    kind: "report_message",
    conversationId: input.conversationId,
    messageId: input.messageId,
    reporterMemberId: input.reporterMemberId,
    targetMemberId: input.targetMemberId,
    payload: { reason: input.reason || null, details: input.details || null }
  });

  if (result.ok && input.conversationId && input.reporterMemberId) {
    await transitionConversationLifecycle({
      conversationId: input.conversationId,
      memberId: input.reporterMemberId,
      previousStatus: input.previousStatus || "active",
      newStatus: "reported",
      reasonCode: "message_reported",
      reason: input.reason || "Message reported",
      actor: "member"
    });
  }

  return result;
}

export async function blockConversation(input = {}) {
  const result = await recordModerationEvent({
    kind: "block_conversation",
    conversationId: input.conversationId,
    reporterMemberId: input.memberId,
    targetMemberId: input.targetMemberId,
    payload: input.payload || {}
  });

  if (result.ok && input.conversationId && input.memberId) {
    await transitionConversationLifecycle({
      conversationId: input.conversationId,
      memberId: input.memberId,
      previousStatus: input.previousStatus || "active",
      newStatus: "blocked",
      reasonCode: "conversation_blocked",
      actor: "member"
    });
  }

  return result;
}

export async function hookSpamDetection(input = {}) {
  return recordModerationEvent({
    kind: "spam_hook",
    conversationId: input.conversationId,
    messageId: input.messageId,
    targetMemberId: input.senderMemberId,
    payload: {
      messageHash: input.messageHash || null,
      severity: input.severity || null,
      flagged: Boolean(input.flagged)
    }
  });
}

export async function listOpenModerationEvents(options = {}) {
  if (!(await ensureTable())) return [];
  const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 200);
  const { rows } = await query(
    `select event_id, kind, conversation_id, message_id, reporter_member_id, target_member_id, status, created_at
     from member_messaging_moderation_events
     where status = 'open'
     order by created_at desc
     limit $1`,
    [limit]
  );
  return rows;
}
