import { query, isDatabaseReady } from "../db.js";
import { paymentQuery, requireDatabaseReadyForPayments } from "./paymentDb.js";
import { assertSchemaTable } from "./schemaVerification.js";
import { buildPaymentAuditIdentity } from "./paymentAuditIdentity.js";

export async function ensurePaymentEventsTable() {
  if (!isDatabaseReady()) return;
  await assertSchemaTable("payment_events");
}

function auditIdentityPatch(detail = {}) {
  const identity = buildPaymentAuditIdentity({
    email: detail.userEmail || detail.email || "",
    phone: detail.phone || "",
    body: detail
  });
  const userId = detail.userId || detail.authUserId || identity.userId || null;
  const userEmail = detail.userEmail || detail.email || identity.userEmail || null;
  return { userId, userEmail };
}

export async function appendPaymentAudit(reference, event, detail = {}) {
  if (!reference) return;
  await ensurePaymentEventsTable();
  if (!isDatabaseReady()) {
    console.info("[payment-audit]", event, { reference, ...detail });
    return;
  }

  const identityPatch = auditIdentityPatch(detail);
  const entry = {
    event,
    at: new Date().toISOString(),
    ...detail,
    userId: detail.userId || detail.authUserId || identityPatch.userId || null,
    authUserId: detail.authUserId || detail.userId || identityPatch.userId || null,
    profileId: detail.profileId || null,
    userEmail: detail.userEmail || identityPatch.userEmail || null
  };
  console.info("[payment-audit]", event, { reference, ...entry });
  await query(
    `insert into payment_events (paystack_reference, user_id, user_email, audit_log)
     values ($1, $2, $3, jsonb_build_array($4::jsonb))
     on conflict (paystack_reference) do update
     set audit_log = payment_events.audit_log || jsonb_build_array($4::jsonb),
         user_id = coalesce(excluded.user_id, payment_events.user_id),
         user_email = coalesce(excluded.user_email, payment_events.user_email),
         updated_at = now()`,
    [
      reference,
      entry.userId,
      entry.userEmail,
      JSON.stringify(entry)
    ]
  );
}

export async function repairPaymentAuditIdentity(reference, identity = {}) {
  if (!reference) return false;
  await ensurePaymentEventsTable();
  if (!isDatabaseReady()) return false;

  const patch = buildPaymentAuditIdentity({
    memberAuth: identity.memberAuth || null,
    email: identity.userEmail || identity.email || "",
    phone: identity.phone || "",
    body: identity
  });
  const userId = identity.userId || identity.authUserId || patch.userId || null;
  const userEmail = identity.userEmail || patch.userEmail || null;
  if (!userId && !userEmail) return false;

  const result = await query(
    `update payment_events
     set user_id = coalesce($2, user_id),
         user_email = coalesce($3, user_email),
         updated_at = now()
     where paystack_reference = $1
       and (user_id is null or user_email is null)
     returning paystack_reference`,
    [reference, userId, userEmail]
  );
  return Boolean(result.rows[0]);
}

export async function recordPaymentVerified({
  reference,
  userId,
  userEmail,
  productType,
  productId,
  amountKobo,
  returnPath
}) {
  if (!reference) {
    requireDatabaseReadyForPayments();
    throw new Error("Payment reference is required.");
  }
  await ensurePaymentEventsTable();
  requireDatabaseReadyForPayments();

  await appendPaymentAudit(reference, "payment_verified", {
    userId: userId || null,
    userEmail: userEmail || null,
    productType,
    productId,
    returnPath: returnPath || null
  });

  const result = await paymentQuery(
    `insert into payment_events (
       paystack_reference, user_id, user_email, product_type, product_id, amount_kobo, return_path, verified_at
     ) values ($1, $2, $3, $4, $5, $6, $7, now())
     on conflict (paystack_reference) do update
     set user_id = coalesce(excluded.user_id, payment_events.user_id),
         user_email = coalesce(excluded.user_email, payment_events.user_email),
         product_type = coalesce(excluded.product_type, payment_events.product_type),
         product_id = coalesce(excluded.product_id, payment_events.product_id),
         amount_kobo = coalesce(excluded.amount_kobo, payment_events.amount_kobo),
         return_path = coalesce(excluded.return_path, payment_events.return_path),
         verified_at = coalesce(payment_events.verified_at, now()),
         updated_at = now()
     returning *`,
    [
      reference,
      userId || null,
      userEmail || null,
      productType || "premium",
      productId || null,
      Number.isFinite(amountKobo) ? amountKobo : null,
      returnPath || null
    ]
  );
  return result.rows[0] || null;
}

export async function markPurchaseEmailSent(reference) {
  if (!reference) return false;
  await ensurePaymentEventsTable();
  if (!isDatabaseReady()) return false;

  const result = await query(
    `update payment_events
     set email_sent_at = now(), updated_at = now()
     where paystack_reference = $1 and email_sent_at is null
     returning email_sent_at`,
    [reference]
  );
  return Boolean(result.rows[0]);
}

export async function purchaseEmailAlreadySent(reference) {
  if (!reference) return false;
  await ensurePaymentEventsTable();
  if (!isDatabaseReady()) return false;

  const result = await query(
    "select email_sent_at from payment_events where paystack_reference = $1 limit 1",
    [reference]
  );
  return Boolean(result.rows[0]?.email_sent_at);
}
