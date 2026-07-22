import crypto from "node:crypto";

export function resolveMessageIdempotencyKey(input = {}) {
  const explicit = String(input.idempotencyKey || input.idempotency_key || "").trim();
  if (explicit) return explicit.slice(0, 160);

  const messageId = String(input.messageId || input.message_id || input.id || "").trim();
  const conversationId = String(input.conversationId || input.threadId || input.thread_id || "").trim();
  if (messageId && conversationId) return `msg:${conversationId}:${messageId}`.slice(0, 160);
  if (messageId) return `msg:${messageId}`.slice(0, 160);

  return `msg:${crypto.randomUUID()}`.slice(0, 160);
}

export function resolveDeliveryIdempotencyKey(messageId, recipientMemberId, suffix = "deliver") {
  return `delivery:${messageId}:${recipientMemberId}:${suffix}`.slice(0, 160);
}

export function resolveNotificationIdempotencyKey(notificationId) {
  return `notify:${String(notificationId || crypto.randomUUID()).trim()}`.slice(0, 160);
}

export function resolveRealtimeEventIdempotencyKey(eventType, reference) {
  const type = String(eventType || "event").trim();
  const ref = String(reference || crypto.randomUUID()).trim();
  return `rt:${type}:${ref}`.slice(0, 160);
}
