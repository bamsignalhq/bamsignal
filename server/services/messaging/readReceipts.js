import { transitionMessageLifecycle } from "./messages.js";
import {
  updateMembershipReadPointer,
  incrementMembershipUnread,
  getMembership,
  getTotalMembershipUnread,
  listMembershipUnread
} from "./membership.js";

export async function markConversationRead(input = {}) {
  if (!input.conversationId || !input.memberId) {
    return { ok: false, skipped: true };
  }

  const messageId = String(input.messageId || "").trim() || null;
  const readAt = input.readAt || new Date().toISOString();
  const sequenceNumber = input.sequenceNumber ?? input.lastReadSeq ?? null;

  try {
    await updateMembershipReadPointer({
      conversationId: input.conversationId,
      memberId: input.memberId,
      messageId,
      sequenceNumber,
      readAt
    });

    if (messageId) {
      await transitionMessageLifecycle({
        messageId,
        conversationId: input.conversationId,
        memberId: input.memberId,
        sequenceNumber,
        previousStatus: "delivered",
        newStatus: "read",
        reasonCode: "read_receipt",
        actor: "member"
      });
    }

    return {
      ok: true,
      conversationId: input.conversationId,
      lastReadMessageId: messageId,
      lastReadSeq: sequenceNumber,
      readAt
    };
  } catch (error) {
    console.warn("[messaging:read-receipts] mark read failed", error?.message || error);
    return { ok: false, error: error?.message || "mark_read_failed" };
  }
}

export async function incrementUnreadCount(conversationId, memberId, delta = 1) {
  return incrementMembershipUnread(conversationId, memberId, delta);
}

export async function getConversationReadState(conversationId, memberId) {
  const membership = await getMembership(conversationId, memberId);
  if (!membership) {
    return { conversation_id: conversationId, member_id: memberId, unread_count: 0 };
  }
  return {
    conversation_id: membership.conversation_id,
    member_id: membership.member_id,
    last_read_message_id: membership.last_read_message_id,
    last_read_seq: membership.last_read_seq,
    last_read_at: membership.last_read_at,
    unread_count: membership.unread_count,
    notification_enabled: membership.notification_enabled,
    member_status: membership.member_status
  };
}

export async function getUnreadCountsForMember(memberId) {
  return listMembershipUnread(memberId);
}

export async function getTotalUnreadCount(memberId) {
  return getTotalMembershipUnread(memberId);
}
