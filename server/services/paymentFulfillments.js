import {
  PaymentDatabaseError,
  assertPaymentPersistenceRow,
  paymentQuery,
  requireDatabaseReadyForPayments
} from "./paymentDb.js";

const VALID_STATUSES = new Set(["pending", "fulfilled", "failed", "ignored"]);

export async function ensurePaymentFulfillmentsSchema() {
  requireDatabaseReadyForPayments();
  const { ensurePaymentFulfillmentsTable } = await import("../db.js");
  await ensurePaymentFulfillmentsTable();
}

function normalizeStatus(status = "pending") {
  const value = String(status || "pending").trim().toLowerCase();
  return VALID_STATUSES.has(value) ? value : "pending";
}

export async function claimPaymentFulfillment({
  reference,
  userId = null,
  productType,
  productId = null,
  amountKobo = null,
  currency = null,
  rawPayload = {}
}) {
  const paystackReference = String(reference || "").trim();
  if (!paystackReference) {
    throw new PaymentDatabaseError("Payment reference is required.", "payment_persistence_failed");
  }

  await ensurePaymentFulfillmentsSchema();
  const result = await paymentQuery(
    `insert into payment_fulfillments (
       paystack_reference, user_id, product_type, product_id, amount_kobo, currency, status, raw_payload, updated_at
     ) values ($1, $2, $3, $4, $5, $6, 'pending', $7::jsonb, now())
     on conflict (paystack_reference) do update
     set user_id = coalesce(payment_fulfillments.user_id, excluded.user_id),
         product_type = coalesce(payment_fulfillments.product_type, excluded.product_type),
         product_id = coalesce(payment_fulfillments.product_id, excluded.product_id),
         amount_kobo = coalesce(payment_fulfillments.amount_kobo, excluded.amount_kobo),
         currency = coalesce(payment_fulfillments.currency, excluded.currency),
         raw_payload = payment_fulfillments.raw_payload || excluded.raw_payload,
         updated_at = now()
     returning *`,
    [
      paystackReference,
      userId,
      String(productType || "").trim(),
      productId,
      Number.isFinite(Number(amountKobo)) ? Number(amountKobo) : null,
      currency ? String(currency).trim() : null,
      JSON.stringify(rawPayload && typeof rawPayload === "object" ? rawPayload : {})
    ]
  );
  return assertPaymentPersistenceRow(result.rows[0]);
}

export async function getPaymentFulfillment(reference) {
  const paystackReference = String(reference || "").trim();
  if (!paystackReference) return null;
  await ensurePaymentFulfillmentsSchema();
  const result = await paymentQuery(
    "select * from payment_fulfillments where paystack_reference = $1 limit 1",
    [paystackReference]
  );
  return result.rows[0] || null;
}

export async function markPaymentFulfillmentStatus(reference, status, patch = {}) {
  const paystackReference = String(reference || "").trim();
  if (!paystackReference) {
    throw new PaymentDatabaseError("Payment reference is required.", "payment_persistence_failed");
  }

  await ensurePaymentFulfillmentsSchema();
  const nextStatus = normalizeStatus(status);
  const setFulfilled = nextStatus === "fulfilled";
  const result = await paymentQuery(
    `update payment_fulfillments
     set status = $2,
         fulfilled_at = case when $3::boolean then coalesce(fulfilled_at, now()) else fulfilled_at end,
         user_id = coalesce($4, user_id),
         product_type = coalesce($5, product_type),
         product_id = coalesce($6, product_id),
         amount_kobo = coalesce($7, amount_kobo),
         currency = coalesce($8, currency),
         raw_payload = raw_payload || $9::jsonb,
         updated_at = now()
     where paystack_reference = $1
     returning *`,
    [
      paystackReference,
      nextStatus,
      setFulfilled,
      patch.userId ?? null,
      patch.productType ?? null,
      patch.productId ?? null,
      Number.isFinite(Number(patch.amountKobo)) ? Number(patch.amountKobo) : null,
      patch.currency ? String(patch.currency).trim() : null,
      JSON.stringify(patch.rawPayload && typeof patch.rawPayload === "object" ? patch.rawPayload : {})
    ]
  );
  return assertPaymentPersistenceRow(result.rows[0]);
}

/**
 * Claim email send only after fulfillment success.
 * Returns true only once per reference.
 */
export async function claimFulfillmentEmailSend(reference) {
  const paystackReference = String(reference || "").trim();
  if (!paystackReference) {
    throw new PaymentDatabaseError("Payment reference is required.", "payment_persistence_failed");
  }

  await ensurePaymentFulfillmentsSchema();
  const result = await paymentQuery(
    `update payment_fulfillments
     set email_sent_at = now(), updated_at = now()
     where paystack_reference = $1
       and status = 'fulfilled'
       and email_sent_at is null
     returning email_sent_at`,
    [paystackReference]
  );
  return Boolean(result.rows[0]);
}

export async function fulfillmentEmailAlreadySent(reference) {
  const paystackReference = String(reference || "").trim();
  if (!paystackReference) return false;

  await ensurePaymentFulfillmentsSchema();
  const result = await paymentQuery(
    "select email_sent_at from payment_fulfillments where paystack_reference = $1 limit 1",
    [paystackReference]
  );
  return Boolean(result.rows[0]?.email_sent_at);
}
