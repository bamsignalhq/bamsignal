export {
  CONVERSATION_STATUSES,
  transitionConversationLifecycle,
  getConversationState,
  listConversationTransitions,
  recordConversationCreated,
  ensureConversationPair
} from "./conversations.js";
export {
  MESSAGE_STATUSES,
  transitionMessageLifecycle,
  getMessageState,
  listMessageTransitions,
  recordMessageSendPipeline
} from "./messages.js";
export {
  enqueueMessageDelivery,
  acknowledgeDelivery,
  markDeliveryFailed,
  processPendingDeliveries,
  listPendingDeliveries,
  computeRetryBackoff
} from "./delivery.js";
export {
  markConversationRead,
  incrementUnreadCount,
  getConversationReadState,
  getUnreadCountsForMember,
  getTotalUnreadCount
} from "./readReceipts.js";
export {
  PRESENCE_STATUSES,
  updatePresenceHeartbeat,
  markPresenceOffline,
  getPresenceState,
  resolveEffectivePresence,
  expireStalePresence
} from "./presence.js";
export { startTyping, stopTyping, getActiveTypers, expireStaleTyping } from "./typing.js";
export {
  MEMBERSHIP_STATUSES,
  transitionMembershipStatus,
  joinConversation,
  getMembership,
  updateMembershipReadPointer,
  incrementMembershipUnread,
  setMembershipNotificationPreference,
  getTotalMembershipUnread,
  listMembershipUnread,
  ensureMembershipPair
} from "./membership.js";
export {
  allocateMessageSequence,
  getConversationHighSequence,
  listMessagesFromSequence,
  detectSequenceGaps,
  resolveSequenceConflict
} from "./sequences.js";
export {
  NOTIFICATION_EVENT_TYPES,
  publishNotificationEvent,
  subscribeNotificationEvents,
  listNotificationEvents,
  createNotificationEventId
} from "./notificationEventBus.js";
export {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
  createMemberNotification,
  notifyNewMessage,
  markNotificationSent,
  markNotificationFailed,
  markNotificationRead,
  dismissNotification,
  listMemberNotifications,
  listNotificationPreferences,
  setNotificationPreference,
  isNotificationEnabled
} from "./notifications.js";
export {
  registerMediaUpload,
  markMediaUploadVerified,
  markMediaUploadFailed,
  listPendingMediaUploads
} from "./media.js";
export {
  queueOfflineMessage,
  syncPendingMessagesForMember,
  replayOfflineQueue,
  resolveMessageConflict
} from "./offline.js";
export {
  MODERATION_KINDS,
  recordModerationEvent,
  reportMessage,
  blockConversation,
  hookSpamDetection,
  listOpenModerationEvents
} from "./moderation.js";
export {
  REALTIME_EVENT_TYPES,
  publishRealtimeEvent,
  subscribeRealtimeEvents,
  listRealtimeEvents,
  createRealtimeEventId
} from "./eventBus.js";
export {
  resolveMessageIdempotencyKey,
  resolveDeliveryIdempotencyKey,
  resolveNotificationIdempotencyKey,
  resolveRealtimeEventIdempotencyKey
} from "./idempotency.js";
export {
  incrementMessagingMetric,
  recordRealtimeLatency,
  getMessagingObservabilityMetrics,
  resetMessagingObservabilityMetrics
} from "./observability.js";

/** Unified messaging hook after persistMessage — never throws. */
export async function handleMessagingSendEvent(input = {}) {
  const { recordMessageSendPipeline } = await import("./messages.js");
  const { enqueueMessageDelivery } = await import("./delivery.js");
  const { incrementUnreadCount } = await import("./readReceipts.js");
  const { notifyNewMessage } = await import("./notifications.js");
  const { hookSpamDetection } = await import("./moderation.js");

  if (input.spamFlagged) {
    await hookSpamDetection({
      conversationId: input.conversationId || input.threadId,
      messageId: input.messageId || input.message?.id,
      senderMemberId: input.senderMemberId,
      messageHash: input.messageHash,
      flagged: true
    });
  }

  const pipeline = await recordMessageSendPipeline({
    messageId: input.messageId || input.message?.id,
    conversationId: input.conversationId || input.threadId,
    senderMemberId: input.senderMemberId || null,
    recipientMemberId: input.recipientMemberId || null,
    bodyPreview: input.message?.text || input.bodyPreview,
    suppressed: input.suppressed,
    failed: input.failed,
    metadata: input.metadata || {}
  });

  if (!input.failed && !input.suppressed && input.recipientMemberId) {
    await enqueueMessageDelivery({
      messageId: input.messageId || input.message?.id,
      conversationId: input.conversationId || input.threadId,
      recipientMemberId: input.recipientMemberId,
      payload: { message: input.message || null }
    });
    await incrementUnreadCount(input.conversationId || input.threadId, input.recipientMemberId);
    await notifyNewMessage({
      recipientMemberId: input.recipientMemberId,
      conversationId: input.conversationId || input.threadId,
      messageId: input.messageId || input.message?.id,
      sequenceNumber: pipeline?.sequenceNumber ?? null,
      senderMemberId: input.senderMemberId,
      bodyPreview: input.message?.text || input.bodyPreview
    });
  }

  return pipeline;
}
