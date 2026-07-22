import crypto from "node:crypto";

/**
 * Standard financial idempotency keys for the entire payment pipeline.
 */

export function resolveFinancialIdempotencyKey(input = {}) {
  const explicit = String(input.idempotencyKey || input.idempotency_key || "").trim();
  if (explicit) return explicit.slice(0, 160);

  const webhookEventId = String(input.webhookEventId || input.webhook_event_id || "").trim();
  if (webhookEventId) return `webhook:${webhookEventId}`.slice(0, 160);

  const refundId = String(input.refundId || input.refund_id || "").trim();
  if (refundId) return `refund:${refundId}`.slice(0, 160);

  const reference = String(input.reference || input.paystackReference || "").trim();
  const lifecycleStatus = String(input.lifecycleStatus || input.lifecycle_status || "").trim();
  if (reference && lifecycleStatus) {
    return `pay:${reference}:${lifecycleStatus}`.slice(0, 160);
  }
  if (reference) return `pay:${reference}`.slice(0, 160);

  const transactionId = String(input.transactionId || input.transaction_id || "").trim();
  if (transactionId) return `tx:${transactionId}`.slice(0, 160);

  return `fin:${crypto.randomUUID()}`.slice(0, 160);
}

export function resolveRefundIdempotencyKey(refundId, suffix = "create") {
  const id = String(refundId || crypto.randomUUID()).trim();
  return `refund:${id}:${suffix}`.slice(0, 160);
}

export function resolveWebhookIdempotencyKey(eventId, reference) {
  const evt = String(eventId || "").trim();
  const ref = String(reference || "").trim();
  if (evt && ref) return `webhook:${evt}:${ref}`.slice(0, 160);
  if (evt) return `webhook:${evt}`.slice(0, 160);
  return resolveFinancialIdempotencyKey({ reference: ref });
}
