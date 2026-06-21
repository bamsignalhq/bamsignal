# Paystack Live Validation Report

**Date:** 21 June 2026  
**Production:** https://bamsignal.com  
**Scope:** Post–Payment Fortress live validation (Signal Pass, Fast Connection, Signal Boost)  
**Related commits:** Payment Fortress hardening on `main` (through `0871556` script separation)  
**Prior baseline:** [PAYSTACK_PRODUCTION_VALIDATION_V2.md](../../PAYSTACK_PRODUCTION_VALIDATION_V2.md) — **BLOCKED** (Invalid Paystack key, 15 June 2026)

---

## Executive summary

| Gate | Status |
|------|--------|
| Production readiness (`GET /ready`) | **PASS** |
| Paystack initialize (all 3 product classes) | **PASS** |
| Callback route (`/payment/success`) | **PASS** |
| Webhook signature gate (unsigned) | **PASS** |
| Verify fail-closed (unpaid reference) | **PASS** |
| Live charge → fulfillment → entitlement (×3) | **NOT COMPLETED** |
| Duplicate verify/webhook idempotency (live) | **NOT COMPLETED** |
| Purchase confirmation email (live) | **NOT COMPLETED** |

**Overall:** **PARTIAL** — Pre-payment production gates pass. Full end-to-end validation requires an operator to complete one live (or controlled) card payment per product class, then run the SQL/log checks below. No secrets or card data are recorded in this document.

---

## Environment checks (21 June 2026)

| Check | Result | Notes |
|-------|--------|-------|
| `GET /ready` (public) | **200** | `{"ok":true,"service":"bamsignal","ready":true}` |
| `GET /health` | **200** | Liveness OK |
| Local `DATABASE_URL` | **Not available** | Fulfillment rows could not be queried from this sprint environment |
| Integrity tests | **PASS** | `test:source-integrity`, `test:server-import`, `test:docker-integrity-stages` |

**Improvement vs V2:** Paystack initialize now returns HTTP **200** with `authorization_url` (V2 was **503** / `Invalid key` for all products).

---

## Server catalog amounts (authoritative)

Source: `server/services/paymentCatalog.js`, `server/pricing.js`, `server/services/subscriptionCatalog.js`

| Product | API action | Catalog amount (₦) | Amount (kobo) | Duration / benefit |
|---------|------------|-------------------|---------------|-------------------|
| Signal Pass — Weekly | `POST …?action=initialize` + `plan: weekly` | 1,499 | 149,900 | 7 days premium |
| Fast Connection Pass — Weekly | `POST …?action=initialize-quickie` | 999 | 99,900 | 7 days; 30 Fast Signals / 24h |
| Signal Boost | `POST …?action=initialize-boost` + `boostId: signal-boost` | 350 | 35,000 | 24 hours boost only |

---

## Test account (masked)

| Field | Value |
|-------|-------|
| Test email | `p***-live-val@bamsignal.com` |
| Member account | Not bound — initialize-only probes used a dedicated validation email |

---

## A. Signal Pass (Weekly)

### Initialize probe — **PASS**

| Field | Value |
|-------|-------|
| Product | Signal Pass — Weekly |
| Paystack reference | `bs_weekly_mqnke8jj_****` |
| Expected catalog amount | ₦1,499 (149,900 kobo) |
| Initialize HTTP | **200** |
| `productType` / `productId` | `premium` / `weekly` |
| `authorization_url` | Issued (`checkout.paystack.com/…`) |

### Post-payment evidence — **PENDING**

| Field | Status | Notes |
|-------|--------|-------|
| Amount charged (Paystack) | **Not captured** | Checkout URL issued; card payment not completed in this sprint |
| Callback verify result | **Not captured** | Requires logged-in member + successful Paystack charge |
| Webhook response | **Not captured** | Requires signed `charge.success` after payment |
| `payment_fulfillments` row | **Not verified** | No DB access from sprint environment |
| Fulfillment `status = fulfilled` | **Not verified** | — |
| Entitlement: Premium active | **Not verified** | Expected: `is_premium`, `premium_until` ≈ +7 days |
| Entitlement: Unlimited normal signals | **Not verified** | Via `resolveSignalPassStatus` when premium active |
| Purchase email sent once | **Not verified** | Expected: `email_sent_at` set; audit `payment_success_email_sent` |
| Duplicate verify/webhook | **Not verified** | Code path idempotent when `status = fulfilled` |

### Expected entitlement behavior (code)

- Premium until ≈ purchase time + 7 days (`premiumUntilFromIntent`).
- Does **not** grant Fast Connection pass.
- Boost purchases do **not** apply.

---

## B. Fast Connection Pass (Weekly)

### Initialize probe — **PASS**

| Field | Value |
|-------|-------|
| Product | Fast Connection Pass — Weekly |
| Paystack reference | `bs_quickie_mqnkepgl_****` |
| Expected catalog amount | ₦999 (99,900 kobo) |
| Initialize HTTP | **200** |
| API action | `initialize-quickie` (not `initialize` with `productType`) |
| `productType` / `productId` | `fast_connection` / `fast-connection-pass` |
| `authorization_url` | Issued |

### Post-payment evidence — **PENDING**

| Field | Status | Notes |
|-------|--------|-------|
| Amount charged | **Not captured** | — |
| Callback verify result | **Not captured** | Expected return path: `/fast-connection` (metadata) |
| Webhook response | **Not captured** | — |
| `payment_fulfillments` row | **Not verified** | `product_type` expected: `fast_connection` |
| Fulfillment `status = fulfilled` | **Not verified** | — |
| Fast Connection active | **Not verified** | Expected: `fast_connection_pass_until` ≈ +7 days |
| 30 Fast Signals / 24h | **Not verified** | `FAST_CONNECTION_DAILY_SIGNALS = 30` in catalog |
| Returns `/fast-connection` | **Not verified** | Client return path from purchase metadata |
| Purchase email sent once | **Not verified** | — |
| Duplicate verify/webhook | **Not verified** | — |

### Expected entitlement behavior (code)

- Fast pass expiry ≈ +7 days (`fastConnectionUntilFromIntent`).
- Does **not** set unlimited normal Signal Pass premium unless separately purchased.
- Daily Fast Signal quota resets every 24h.

---

## C. Signal Boost

### Initialize probe — **PASS**

| Field | Value |
|-------|-------|
| Product | Signal Boost |
| Paystack reference | `bs_signal-boost_mqnkei0w_****` |
| Expected catalog amount | ₦350 (35,000 kobo) |
| Initialize HTTP | **200** |
| `productType` / `productId` | `boost` / `signal-boost` |
| `authorization_url` | Issued |

### Post-payment evidence — **PENDING**

| Field | Status | Notes |
|-------|--------|-------|
| Amount charged | **Not captured** | — |
| Callback verify result | **Not captured** | Expected return path: `/profile` |
| Webhook response | **Not captured** | — |
| `payment_fulfillments` row | **Not verified** | `product_type` expected: `boost` |
| Fulfillment `status = fulfilled` | **Not verified** | — |
| Boost active (24h) | **Not verified** | `durationHours: 24` in catalog |
| Does **not** grant Premium | **Expected by design** | Boost fulfillment path separate from premium |
| Does **not** grant unlimited signals | **Expected by design** | — |
| Purchase email sent once | **Not verified** | — |
| Duplicate verify/webhook | **Not verified** | — |

---

## Cross-cutting security gates (live)

| Test | HTTP | Response | Pass |
|------|------|----------|------|
| Webhook without `x-paystack-signature` | 401 | `Invalid Paystack signature` | **PASS** |
| Verify unpaid initialize reference | 402 | `Payment is not successful yet.` | **PASS** |
| `/payment/success?reference=…` | 200 | SPA shell (no crash) | **PASS** |

Automated regression (not live money): `scripts/test-payment-webhook.mjs` confirms invalid webhook signature → 401 and shared handler owns fulfillment.

---

## Idempotency (expected — live retest required)

From `server/services/paymentFortress.js` → `completePaymentFulfillment`:

1. Second verify or webhook for the same reference when `payment_fulfillments.status = fulfilled` returns `{ ok: true, idempotent: true }`.
2. Entitlements must **not** double-extend (`premium_until`, fast pass, boost expiry).
3. Purchase email sent once via `fulfillmentEmailAlreadySent(reference)` in `server/services/purchaseEmail.js`.

**Live retest procedure:**

1. Complete payment for one product.
2. Call verify again with same reference (member session + email).
3. Resend webhook from Paystack dashboard for same transaction.
4. Confirm single `fulfilled` row, stable entitlement expiry, `email_sent_at` unchanged.

---

## Operator completion checklist

Run after each **completed** live card payment (replace `bs_****` with full reference from Paystack dashboard or initialize response):

```sql
-- Ledger
select paystack_reference, product_type, product_id, amount_kobo, status, fulfilled_at, email_sent_at
from payment_fulfillments
where paystack_reference = 'bs_****';

-- Audit trail
select audit_log from payment_events where paystack_reference = 'bs_****';

-- Entitlements (adjust email)
select email, is_premium, premium_until, fast_connection_pass_until
from app_users where lower(email) = lower('p***@example.com');
```

**Paystack dashboard:** confirm transaction status = success, amount matches catalog kobo ÷ 100.

**App verify:** member opens app → `/payment/success?reference=bs_****` or purchase page auto-verify → HTTP 200 with product-specific payload.

**Webhook:** Paystack → Webhooks → delivery log for `https://bamsignal.com/api/paystack/webhook` → HTTP 200 on signed `charge.success`.

**Email:** check Resend logs / member inbox once; second verify must not resend.

---

## Integrity test results (this sprint)

| Command | Result |
|---------|--------|
| `npm run test:source-integrity` | **PASS** |
| `npm run test:server-import` | **PASS** |
| `npm run test:docker-integrity-stages` | **PASS** |

Payment fortress unit coverage (local, no live money): `test:fortress` includes `test-payment-catalog`, `test-payment-persistence`, `test-payment-webhook`.

---

## Remaining risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| No committed E2E proof after Fortress fixes | **High** | Operator completes 3 low-value live payments + SQL above |
| Initialize-only refs left unpaid | Low | Abandon or allow Paystack expiry; no fulfillment without charge |
| Fast Connection must use `initialize-quickie` | Medium | Documented; wrong action (`initialize` + `productType`) resolves as premium |
| Email / entitlement not live-tested | High | Complete checklist per product |

---

## Sign-off criteria (for **PASS**)

- [ ] One successful live payment each: Signal Pass weekly, Fast Connection weekly, Signal Boost
- [ ] Paystack amount matches catalog kobo for all three
- [ ] `payment_fulfillments.status = fulfilled` for each reference
- [ ] Entitlements match product class (no cross-grants)
- [ ] Purchase email exactly once per reference
- [ ] Duplicate verify + webhook idempotent on at least one reference

**Current sign-off:** **PARTIAL** — pre-payment gates only.

---

*Documentation-only sprint. No application code changed. No secrets, card numbers, or full customer emails recorded.*
