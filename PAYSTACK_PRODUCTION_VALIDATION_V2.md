# Paystack Production Validation V2

**Date:** June 15, 2026  
**Production:** https://bamsignal.com  
**Sprint:** Paystack Live Key validation (post–Coolify env update)  
**Latest deployed commit (local `main`):** `b54cf3f`

---

## Final status: **BLOCKED**

Payments are **not** ready for real users. Outbound connectivity and application handlers are healthy, but **Paystack rejects the configured secret** (`Invalid key`) on every initialize and verify call. Until `POST /api/paystack/verify?action=initialize` returns HTTP **200** with `authorization_url`, no end-to-end payment, premium activation, or boost activation can complete.

---

## Step 1 — Production redeploy

| Check | Result | Notes |
|-------|--------|-------|
| Coolify env update confirmed | **Not verifiable from CI** | No Coolify API access from this sprint; ops must confirm in [control.bamsignal.com](https://control.bamsignal.com) |
| Fresh deployment triggered | **Not triggered** | Env-only changes require **manual Redeploy/Restart** in Coolify; git `main` is already at `b54cf3f` with no pending push |
| Deployment errors | **None observed** | Origin responds; no Cloudflare `502 text/plain` |
| `GET /health` | **PASS** | See below |

### Health response (2026-06-15)

```json
{
  "ok": true,
  "service": "bamsignal",
  "database": "connected",
  "paystack": true,
  "resend": true,
  "firebase": false,
  "telegram": false
}
```

**Important:** `paystack: true` only means `PAYSTACK_SECRET_KEY` is **non-empty** at runtime. It does **not** mean Paystack accepts the key.

### Required ops action

1. Open Coolify → BamSignal service → confirm `PAYSTACK_SECRET_KEY` is the live secret (`sk_live_…`), no quotes/whitespace.
2. Click **Redeploy** (or restart container) so the new env is loaded.
3. Re-run initialize smoke test (Step 3 command at bottom).

---

## Step 2 — Paystack connectivity diagnostics

### `GET /api/diagnostics/paystack-connectivity`

| Test | HTTP | Result |
|------|------|--------|
| No secret | 401 | `{"ok":false,"error":"Diagnostics secret required."}` — **expected** |
| With `CRON_SECRET` / `DIAGNOSTICS_SECRET` | Not run | Secret not available in local `.env` |

### Inferred connectivity (from live initialize/verify behavior)

| Check | Status | Evidence |
|-------|--------|----------|
| DNS resolution | **PASS (inferred)** | Paystack responds in ~0.3–0.9s (not DNS timeout) |
| HTTPS connection | **PASS (inferred)** | TLS to `api.paystack.co` succeeds from external curl |
| Paystack API reachable | **PASS** | JSON error body returned, not network failure |
| Authentication accepted | **FAIL** | Every initialize/verify returns `"Invalid key"` |
| Invalid key errors | **YES** | `initialize_failed` / `verify_failed` with message `Invalid key` |
| Timeout errors | **None** | Response times &lt; 1s |

**Manual diagnostics command (run in trusted shell with production secret):**

```bash
curl -sS "https://bamsignal.com/api/diagnostics/paystack-connectivity?secret=YOUR_CRON_SECRET" | jq .
```

**Expected after valid key + redeploy:**

- `paystack.ok: true`
- `paystack.initializeProbe.ok: true`
- `paystack.initializeProbe.status: 200`
- `paystack.authOk: true`

---

## Step 3 — Payment initialization tests

**Endpoint:** `POST /api/paystack/verify?action=initialize` (premium) or `?action=initialize-boost` (boosts)  
**Test email:** `paystack-validation-v2@bamsignal.com`  
**Configured callback URL:** `https://bamsignal.com/payment/success` (default in `server/config.js`)

| Product | Expected amount (₦) | HTTP | `authorization_url` | `access_code` | `reference` | Pass |
|---------|---------------------|------|---------------------|---------------|-------------|------|
| Weekly Signal Pass | 1,499 | 503 | No | No | No | **FAIL** |
| Monthly Signal Pass | 3,999 | 503 | No | No | No | **FAIL** |
| 3 Month Signal Pass | 10,999 | 503 | No | No | No | **FAIL** |
| Signal Boost | 350 | 503 | No | No | No | **FAIL** |
| Priority Signal | 250 | 503 | No | No | No | **FAIL** |
| Profile Boost | 750 | 503 | No | No | No | **FAIL** |

**Error body (all products):**

```json
{"ok":false,"error":"Invalid key","code":"initialize_failed"}
```

| Additional check | Result |
|------------------|--------|
| No Cloudflare `502` plain text | **PASS** — structured JSON 503 |
| No `503` from missing email | **PASS** — HTTP 400 with clear message |
| Amount / callback_url in response | **Not verifiable** — blocked before Paystack success |

**Pass criteria:** HTTP **200**, `ok: true`, non-empty `authorization_url` (typically `https://checkout.paystack.com/…`), `access_code`, `reference`, amount matches plan/boost price, `callback_url` = `https://bamsignal.com/payment/success`.

---

## Step 4 — Callback validation

**Route:** `https://bamsignal.com/payment/success` (SPA; client handles `reference` / `trxref` query params)

| Test | HTTP | Result |
|------|------|--------|
| Base URL loads | 200 | HTML SPA served (`text/html`) — **no blank page** |
| `?reference=…&trxref=…` | 200 | Route serves; app stores ref and redirects to `/` when authed |
| Cancelled / no reference | 200 | SPA loads; `PaymentRecoveryBanner` shown when `paymentPending` set |
| Invalid reference (client verify) | N/A | Server verify returns `Invalid key` until auth fixed |
| Duplicate callback | N/A | Idempotency depends on successful verify + DB; not testable |

### Client UX (code review)

- **Success:** `PaymentSuccessToast` — “Payment successful” / “Your Signal Pass is now active.”
- **Incomplete:** `PaymentRecoveryBanner` — “Payment incomplete” / “Your purchase was not completed. You can try again at any time.”
- **No crash path** on `/payment/success` — static shell always serves.

| Callback gate | Status |
|---------------|--------|
| Route live | **PASS** |
| Success redirect handling | **PASS (static)** |
| Full success flow | **NOT TESTED** (blocked by key) |

---

## Step 5 — Webhook validation

**Endpoint:** `https://bamsignal.com/api/paystack/webhook`  
**Alternate mount:** `/webhooks/paystack` (same handler)

| Test | HTTP | Body | Pass |
|------|------|------|------|
| No `x-paystack-signature` | 401 | `Invalid Paystack signature` | **PASS** |
| Invalid signature | 401 | `Invalid Paystack signature` | **PASS** |
| Valid signed `charge.success` | Not run | Requires production `PAYSTACK_SECRET_KEY` to sign test payload | **NOT TESTED** |
| Valid signed `subscription.create` | Not run | Same | **NOT TESTED** |
| Duplicate event idempotency | Not run | Requires successful webhook + DB | **NOT TESTED** |

Signature verification is **active** (`verifyPaystackSignature` in `server/routes/paystack.js`). Premium events handled: `charge.success`, `subscription.create`, `invoice.payment_success`.

---

## Step 6 — Premium activation (full flow)

| Stage | Status |
|-------|--------|
| Payment (Paystack checkout) | **NOT TESTED** |
| Callback | **NOT TESTED** |
| Webhook → `activateAppUserPremium` | **NOT TESTED** |
| `app_users` premium flag / expiry | **NOT TESTED** |
| Premium benefits unlocked | **NOT TESTED** |

**Blocker:** Cannot obtain `authorization_url` without valid live secret.

---

## Step 7 — Boost purchases

| Product | Initialize | Payment | Purchase recorded | Benefit activated | Duplicate safe |
|---------|------------|---------|-------------------|-------------------|----------------|
| Signal Boost | **FAIL** | Not tested | Not tested | Not tested | Not tested |
| Priority Signal | **FAIL** | Not tested | Not tested | Not tested | Not tested |
| Profile Boost | **FAIL** | Not tested | Not tested | Not tested | Not tested |

---

## Step 8 — Failure handling

| Scenario | HTTP | User-facing message | Professional? |
|----------|------|---------------------|---------------|
| Missing email at initialize | 400 | “A verified email is required before Paystack checkout.” | **PASS** |
| Missing reference at verify | 400 | “Payment reference is required.” | **PASS** |
| Invalid / unpaid reference | 503* | “Invalid key” (*current production key issue) | **FAIL** — exposes Paystack auth error |
| Payment not successful | 402 (expected with valid key) | “Payment is not successful yet.” | **PASS** (code path) |
| Incomplete purchase (client) | — | “Payment incomplete” / “Your purchase was not completed…” | **PASS** |

\*With a **valid** key and fake reference, expect Paystack “transaction not found” surfaced via `verify_failed` — re-test after key fix to ensure no raw stack traces.

---

## Remaining payment risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Invalid or stale `PAYSTACK_SECRET_KEY`** | **Critical** | Confirm live `sk_live_…` in Coolify; **redeploy** after env change |
| Health check does not validate key | High | Add post-deploy smoke: initialize probe or diagnostics with secret |
| Diagnostics secret not in local QA env | Low | Store `CRON_SECRET` in secure runbook for sprint reruns |
| Webhook / E2E not exercised | High | After key fix: Paystack dashboard test webhook + one real ₦ transaction |
| Verify errors may leak “Invalid key” to users | Medium | Retest failure copy after key fix; map auth errors to generic message |
| `firebase: false`, `telegram: false` on health | Low | VIP Telegram invite optional; not a Paystack blocker |

---

## Gate summary

| Gate | Status |
|------|--------|
| Production health (`database`, `paystack` set) | **PASS** |
| Outbound Paystack reachability | **PASS** |
| Paystack authentication (live secret) | **FAIL** |
| Initialize — all 6 paid products | **FAIL** |
| `authorization_url` generation | **FAIL** |
| Callback route & recovery UX | **PASS** |
| Webhook signature gate | **PASS** |
| Premium activation E2E | **NOT TESTED** |
| Boost activation E2E | **NOT TESTED** |
| Failure messaging (all paths) | **PARTIAL** |

---

## Re-validation checklist (after Coolify redeploy)

```bash
# 1. Health
curl -sS https://bamsignal.com/health | jq .

# 2. Diagnostics (replace secret)
curl -sS "https://bamsignal.com/api/diagnostics/paystack-connectivity?secret=CRON_SECRET" | jq .

# 3. Monthly initialize — expect HTTP 200 + authorization_url
curl -sS -X POST "https://bamsignal.com/api/paystack/verify?action=initialize" \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","plan":"monthly","days":30,"amount":3999}' | jq .

# 4. Signal Boost initialize
curl -sS -X POST "https://bamsignal.com/api/paystack/verify?action=initialize-boost" \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","boostId":"signal-boost","amount":350,"city":"Lagos"}' | jq .

# 5. Webhook unsigned — expect 401
curl -sS -X POST "https://bamsignal.com/api/paystack/webhook" \
  -H "Content-Type: application/json" \
  -d '{"event":"charge.success","data":{"reference":"test"}}' | jq .
```

Then complete **one** real Weekly Signal Pass payment and confirm premium in app + `app_users`.

---

*Generated by Paystack Live Validation Sprint V2 — no application code changes.*
