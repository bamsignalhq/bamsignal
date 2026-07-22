import { requireMemberAuth } from "../../server/services/memberAuth.js";
import { sendLoggedApiError } from "../../server/services/apiErrorResponse.js";
import {
  getConversationState,
  listConversationTransitions,
  transitionConversationLifecycle,
  CONVERSATION_STATUSES
} from "../../server/services/messaging/conversations.js";
import {
  getMessageState,
  listMessageTransitions,
  transitionMessageLifecycle,
  MESSAGE_STATUSES
} from "../../server/services/messaging/messages.js";
import {
  markConversationRead,
  getConversationReadState,
  getUnreadCountsForMember,
  getTotalUnreadCount
} from "../../server/services/messaging/readReceipts.js";
import {
  updatePresenceHeartbeat,
  markPresenceOffline,
  getPresenceState,
  resolveEffectivePresence
} from "../../server/services/messaging/presence.js";
import { startTyping, stopTyping, getActiveTypers } from "../../server/services/messaging/typing.js";
import {
  listMemberNotifications,
  listNotificationPreferences,
  setNotificationPreference,
  createMemberNotification
} from "../../server/services/messaging/notifications.js";
import {
  syncPendingMessagesForMember,
  replayOfflineQueue
} from "../../server/services/messaging/offline.js";
import {
  reportMessage,
  blockConversation
} from "../../server/services/messaging/moderation.js";
import {
  registerMediaUpload,
  markMediaUploadVerified,
  listPendingMediaUploads
} from "../../server/services/messaging/media.js";
import { listRealtimeEvents } from "../../server/services/messaging/eventBus.js";
import { listPendingDeliveries } from "../../server/services/messaging/delivery.js";

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = parseBody(req);
  const action = String(req.query.action || body.action || "status").toLowerCase();

  try {
    const auth = await requireMemberAuth(req, body);
    if (!auth.ok) {
      return res.status(auth.status || 401).json({ ok: false, error: auth.error || "Unauthorized" });
    }

    const memberId = auth.memberId;
    if (!memberId) {
      return res.status(404).json({ ok: false, error: "Profile not found" });
    }

    if (action === "conversation-state") {
      const conversationId = String(body.conversationId || "").trim();
      if (!conversationId) {
        return res.status(400).json({ ok: false, error: "conversationId required" });
      }
      const state = await getConversationState(conversationId, memberId);
      const transitions = await listConversationTransitions(conversationId, { limit: body.limit });
      return res.status(200).json({ ok: true, state, transitions, statuses: CONVERSATION_STATUSES });
    }

    if (action === "conversation-transition") {
      const conversationId = String(body.conversationId || "").trim();
      const newStatus = String(body.newStatus || "").trim();
      if (!conversationId || !newStatus) {
        return res.status(400).json({ ok: false, error: "conversationId and newStatus required" });
      }
      const current = await getConversationState(conversationId, memberId);
      const result = await transitionConversationLifecycle({
        conversationId,
        memberId,
        previousStatus: current?.status || "unknown",
        newStatus,
        reasonCode: body.reasonCode || "member_action",
        reason: body.reason || "",
        actor: "member"
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "message-state") {
      const messageId = String(body.messageId || "").trim();
      const conversationId = String(body.conversationId || "").trim();
      if (!messageId || !conversationId) {
        return res.status(400).json({ ok: false, error: "messageId and conversationId required" });
      }
      const state = await getMessageState(messageId, conversationId);
      const transitions = await listMessageTransitions(messageId, conversationId, { limit: body.limit });
      return res.status(200).json({ ok: true, state, transitions, statuses: MESSAGE_STATUSES });
    }

    if (action === "mark-read") {
      const conversationId = String(body.conversationId || "").trim();
      if (!conversationId) {
        return res.status(400).json({ ok: false, error: "conversationId required" });
      }
      const result = await markConversationRead({
        conversationId,
        memberId,
        messageId: body.messageId || null
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "read-state") {
      const conversationId = String(body.conversationId || "").trim();
      if (conversationId) {
        const state = await getConversationReadState(conversationId, memberId);
        return res.status(200).json({ ok: true, state });
      }
      const unread = await getUnreadCountsForMember(memberId);
      const total = await getTotalUnreadCount(memberId);
      return res.status(200).json({ ok: true, unread, total });
    }

    if (action === "presence-heartbeat") {
      const result = await updatePresenceHeartbeat({
        memberId,
        status: body.status || "online",
        deviceId: body.deviceId || null,
        metadata: body.metadata || {}
      });
      return res.status(200).json(result);
    }

    if (action === "presence-offline") {
      const result = await markPresenceOffline(memberId);
      return res.status(200).json(result);
    }

    if (action === "presence") {
      const targetId = String(body.targetMemberId || memberId).trim();
      const state = body.effective
        ? await resolveEffectivePresence(targetId)
        : await getPresenceState(targetId);
      return res.status(200).json({ ok: true, presence: state });
    }

    if (action === "typing-start") {
      const conversationId = String(body.conversationId || "").trim();
      if (!conversationId) {
        return res.status(400).json({ ok: false, error: "conversationId required" });
      }
      const result = await startTyping({ conversationId, memberId });
      return res.status(200).json(result);
    }

    if (action === "typing-stop") {
      const conversationId = String(body.conversationId || "").trim();
      if (!conversationId) {
        return res.status(400).json({ ok: false, error: "conversationId required" });
      }
      const result = await stopTyping({ conversationId, memberId });
      return res.status(200).json(result);
    }

    if (action === "typing") {
      const conversationId = String(body.conversationId || "").trim();
      if (!conversationId) {
        return res.status(400).json({ ok: false, error: "conversationId required" });
      }
      const typers = await getActiveTypers(conversationId);
      return res.status(200).json({ ok: true, typers });
    }

    if (action === "notifications") {
      const notifications = await listMemberNotifications(memberId, { limit: body.limit });
      return res.status(200).json({ ok: true, notifications });
    }

    if (action === "notification-preferences") {
      if (body.set) {
        const result = await setNotificationPreference(
          memberId,
          String(body.category || "message"),
          String(body.channel || "in_app"),
          body.enabled !== false
        );
        return res.status(200).json(result);
      }
      const preferences = await listNotificationPreferences(memberId);
      return res.status(200).json({ ok: true, preferences });
    }

    if (action === "offline-sync") {
      const synced = await syncPendingMessagesForMember(memberId, { limit: body.limit });
      return res.status(200).json(synced);
    }

    if (action === "offline-replay") {
      const replay = await replayOfflineQueue({ limit: body.limit });
      return res.status(200).json(replay);
    }

    if (action === "pending-deliveries") {
      const pending = await listPendingDeliveries(memberId, { limit: body.limit });
      return res.status(200).json({ ok: true, pending });
    }

    if (action === "report-message") {
      const result = await reportMessage({
        conversationId: body.conversationId,
        messageId: body.messageId,
        reporterMemberId: memberId,
        targetMemberId: body.targetMemberId || null,
        reason: body.reason || null,
        details: body.details || null
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "block-conversation") {
      const result = await blockConversation({
        conversationId: body.conversationId,
        memberId,
        targetMemberId: body.targetMemberId || null
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "media-register") {
      const result = await registerMediaUpload({
        memberId,
        messageId: body.messageId || null,
        conversationId: body.conversationId || null,
        contentType: body.contentType || null,
        storagePath: body.storagePath || null,
        idempotencyKey: body.idempotencyKey || null
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "media-verify") {
      const result = await markMediaUploadVerified(String(body.uploadId || "").trim(), {
        storagePath: body.storagePath || null
      });
      return res.status(result.ok ? 200 : 400).json(result);
    }

    if (action === "media-pending") {
      const pending = await listPendingMediaUploads(memberId, { limit: body.limit });
      return res.status(200).json({ ok: true, pending });
    }

    if (action === "realtime-events") {
      const events = await listRealtimeEvents({
        eventType: body.eventType || null,
        conversationId: body.conversationId || null,
        limit: body.limit
      });
      return res.status(200).json({ ok: true, events });
    }

    if (action === "status") {
      const [totalUnread, notifications, presence] = await Promise.all([
        getTotalUnreadCount(memberId),
        listMemberNotifications(memberId, { limit: 5 }),
        getPresenceState(memberId)
      ]);
      return res.status(200).json({
        ok: true,
        memberId,
        totalUnread,
        recentNotifications: notifications,
        presence
      });
    }

    return res.status(400).json({ ok: false, error: "Unknown action" });
  } catch (error) {
    return sendLoggedApiError({
      req,
      res,
      event: "messaging_member_error",
      error,
      status: 500,
      message: "Messaging request failed.",
      context: { action }
    });
  }
}
