# Payment recovery runbook

**Scope:** Paystack purchases, BamSignal fulfillment ledger, entitlements, confirmation email.

**Do not change payment code during recovery** — use Paystack dashboard, API verify, and existing admin/API paths.

---

## Source of truth hierarchy

1. **Paystack** — charge status and `reference` (authoritative for money movement).
2. **`payment_fulfillments`** — idempotent fulfillment state per reference.
3. **`payment_events`** — audit trail (`audit_log` JSON array per reference).
4. **`subscription_events`** — raw webhook payloads.
5. **`app_users`** — premium / pass flags (`is_premium`, `premium_until`, fast connection fields).

Webhook endpoint (production): `https://bamsignal.com/api/paystack/webhook`  
Verify endpoint: `POST /api/paystack/verify` (member session + reference).

Observability: `payment_verify_failed`, `payment_webhook_failed`, `email_send_failed`.

---

## Investigation checklist

For a member report ("I paid but no Signal Pass"):

1. Get **Paystack reference** (`bs_*` from email/receipt or Paystack dashboard).
2. Query ledger:

   ```sql
   select * from payment_fulfillments where paystack_reference = 'bs_...';
   select audit_log from payment_events where paystack_reference = 'bs_...';
   select event_type, created_at, payload from subscription_events
   order by created_at desc limit 20;
   ```

3. Paystack dashboard → transaction → confirm **success** and amount/metadata match product.
4. Check app user:

   ```sql
   select email, is_premium, premium_until from app_users
   where lower(email) = lower('member@example.com');
   ```

5. Check logs for reference in Coolify (events above).

---

## Scenario A — Payment succeeded, fulfillment missing

**Cause:** DB outage during verify/webhook (`PAYMENT_CONFIRM_UNAVAILABLE`), webhook not delivered, or verify never called.

**Recovery:**

1. Confirm Paystack status = success.
2. Ask member to open app → return to purchase page → complete flow (triggers verify), **or** operator triggers verify with member context (same API the app uses).
3. If webhook was missed, **Paystack dashboard → Webhooks → resend** event for that transaction to:
   - `https://bamsignal.com/api/paystack/webhook`
4. Fulfillment is idempotent — safe to retry verify/webhook (`completePaymentFulfillment` in `server/services/paymentFortress.js`).
5. Confirm:
   - Row in `payment_fulfillments` with `status` fulfilled
   - `payment_events.audit_log` contains `payment_verified`
   - Entitlement active on `app_users`
   - Purchase email sent (`email_sent_at` / audit `payment_success_email_sent`)

---

## Scenario B — Fulfillment recorded, entitlement wrong

**Cause:** Partial DB restore, manual SQL, or catalog mismatch.

**Recovery:**

1. Identify `product_type` / `product_id` from `payment_fulfillments`.
2. Cross-check product catalog in `server/services/paymentCatalog.js` for expected duration/boost behavior.
3. **Manual entitlement restore** (staging first):

   - Premium: update `app_users.is_premium`, `premium_until` consistent with purchase date + plan duration.
   - Fast Connection: use admin tooling or controlled SQL on fast-connection fields (see `server/services/fastConnection.js`).
   - Boosts: `cityHome` / spotlight tables per product id.

4. Append audit note via Command Center or document in support ticket (do not delete ledger rows).

---

## Scenario C — Double charge / duplicate reference

1. List references for user in Paystack.
2. Each unique reference should have at most one fulfilled row in `payment_fulfillments`.
3. If duplicate fulfillment attempted, idempotent paths should return existing activation — verify no double extension in `premium_until`.
4. Refunds are **Paystack operator action** — not automated in app; adjust entitlements manually after refund.

---

## Scenario D — Email not sent, payment OK

1. Check `payment_fulfillments.email_sent_at` and audit events `payment_success_email_failed`.
2. Confirm `RESEND_API_KEY` configured (`/ready` signup email checks).
3. Re-send: fulfillment email is tied to reference claim — contact ops to trigger purchase email path without duplicating entitlement (audit `payment_success_email_skipped` / `already_sent`).

---

## Webhook replay procedure

1. Paystack dashboard → **Settings** → **Webhooks** → select endpoint.
2. Find failed delivery → **Resend**.
3. Watch logs for `payment_webhook_failed` vs success.
4. Validate signature: webhook uses `PAYSTACK_SECRET_KEY` HMAC (`verifyPaystackWebhookSignature`).

Test webhook locally only with test keys — never replay live events against dev without isolated DB.

---

## Ledger reconciliation (periodic)

Weekly ops task:

| Step | Action |
|------|--------|
| 1 | Export Paystack successful transactions (7 days) |
| 2 | Compare count to `payment_fulfillments` where `fulfilled_at` in range |
| 3 | Investigate references in Paystack but not in DB |
| 4 | Investigate DB rows without Paystack success (should be rare — possible test data) |

---

## Manual entitlement restore (last resort)

Only when Paystack proves payment and automated verify/webhook cannot run:

1. Document reference, amount, product, member email.
2. Apply entitlement manually on staging clone SQL.
3. Insert matching `payment_fulfillments` + audit entry **or** run verify API against staging with recorded transaction payload.
4. Repeat on production with two-operator review.

**Never** invent references — must match Paystack.

---

## Related runbooks

- [database-backup.md](./database-backup.md) — payment tables in dumps
- [database-restore.md](./database-restore.md)
- [deployment-recovery.md](./deployment-recovery.md)
