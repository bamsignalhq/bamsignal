import { query, isDatabaseReady } from "../db.js";
import { paymentQuery, requireDatabaseReadyForPayments } from "./paymentDb.js";

export async function ensurePaymentEventsTable() {
  if (!isDatabaseReady()) return;

  await query(`
    create table if not exists payment_events (
      id uuid primary key default gen_random_uuid(),
      paystack_reference text not null unique,
      user_id text,
      user_email text,
      product_type text not null default 'premium',
      product_id text,
      amount_kobo bigint,
      return_path text,
      verified_at timestamptz,
      email_sent_at timestamptz,
      audit_log jsonb not null default '[]'::jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
  await query(
    "create index if not exists payment_events_user_email_idx on payment_events (lower(user_email), created_at desc)"
  );
}

export async function appendPaymentAudit(reference, event, detail = {}) {
  if (!reference) return;
  await ensurePaymentEventsTable();
  if (!isDatabaseReady()) {
    console.info("[payment-audit]", event, { reference, ...detail });
    return;
  }

  const entry = { event, at: new Date().toISOString(), ...detail };
  console.info("[payment-audit]", event, { reference, ...detail });
  await query(
    `insert into payment_events (paystack_reference, audit_log)
     values ($1, jsonb_build_array($2::jsonb))
     on conflict (paystack_reference) do update
     set audit_log = payment_events.audit_log || jsonb_build_array($2::jsonb),
         updated_at = now()`,
    [reference, JSON.stringify(entry)]
  );
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
