# Paystack Production Validation

**Date:** June 15, 2026  
**Commit deployed:** `58dbddb` — *Fix Paystack initialize by returning JSON upstream errors instead of HTTP 502*  
**Production:** https://bamsignal.com  
**Deploy:** Pushed to `main`; Coolify rebuild confirmed (responses changed from Cloudflare `502 text/plain` to application JSON within ~60s)

---

## Executive summary

| Area | Result |
|------|--------|
| **Code fix (502 masking)** | **PASS** — origin now returns JSON errors |
| **Outbound reachability** | **PASS** — Paystack API responds (`Invalid key` = network + auth layer reached) |
| **`PAYSTACK_SECRET_KEY` loaded** | **PASS** — `/health` → `paystack: true` |
| **`PAYSTACK_SECRET_KEY valid** | **FAIL** — Paystack returns `401 Invalid key` on all initialize/verify calls |
| **Initialize → `authorization_url`** | **FAIL** — blocked by invalid secret |
| **Callback page** | **PASS** |
| **Webhook handler** | **PASS** — rejects unsigned payloads correctly |
| **Overall payment readiness** | **FAIL** — update `PAYSTACK_SECRET_KEY` in Coolify to a valid live key |

---

## 1. Diagnostic endpoint

### `GET /api/diagnostics/paystack-connectivity`

| Test | HTTP | Result |
|------|------|--------|
| No secret | 401 | `{"ok":false,"error":"Diagnostics secret required."}` — **expected** |
| With `CRON_SECRET` | Not run | Secret not available in local env; run manually in Coolify shell |

**Manual command (Coolify / trusted shell):**

```bash
curl -sS "https://bamsignal.com/api/diagnostics/paystack-connectivity?secret=YOUR_CRON_SECRET"
```

**Expected after valid key:**

- `paystack.reachable: true`
- `paystack.dns.ok: true`
- `paystack.initializeProbe.ok: true`
- `paystack.initializeProbe.status: 200`

**Inferred without secret (from initialize behavior):**

| Check | Status | Evidence |
|-------|--------|----------|
| `reachable` | **true** | Paystack responded with `Invalid key` (not timeout/DNS error) |
| `initializeProbe` | **auth fail** | Upstream 401 — key rejected |
| Key loaded at runtime | **true** | Bearer sent; `health.paystack: true` |

---

## 2. Initialize status (all products)

Test email: `paystack-qa@bamsignal.com`  
Endpoint: `POST /api/paystack/verify?action=initialize` or `?action=initialize-boost`

| Product | Request | HTTP | Body | Pass |
|---------|---------|------|------|------|
| Weekly Signal Pass | `plan: weekly`, `days: 7` | 503 | `{"ok":false,"error":"Invalid key","code":"initialize_failed"}` | **FAIL** |
| Monthly Signal Pass | `plan: monthly`, `days: 30` | 503 | `{"ok":false,"error":"Invalid key","code":"initialize_failed"}` | **FAIL** |
| 3 Month Signal Pass | `plan: quarterly`, `days: 90` | 503 | `{"ok":false,"error":"Invalid key","code":"initialize_failed"}` | **FAIL** |
| Signal Boost | `boostId: signal-boost`, `amount: 350` | 503 | `{"ok":false,"error":"Invalid key","code":"initialize_failed"}` | **FAIL** |
| Priority Signal | `boostId: priority-signal-once`, `amount: 250` | 503 | `{"ok":false,"error":"Invalid key","code":"initialize_failed"}` | **FAIL** |
| Profile Boost | `boostId: profile-boost`, `amount: 750` | 503 | `{"ok":false,"error":"Invalid key","code":"initialize_failed"}` | **FAIL** |

**Before deploy (same requests):** HTTP `502`, body `error code: 502` (Cloudflare plain text)  
**After deploy:** HTTP `503`, structured JSON — **fix confirmed**

**Pass criteria for initialize:** HTTP `200` with `ok: true`, `reference`, and `authorization_url` starting with `https://checkout.paystack.com/`.

---

## 3. Authorization URL generation

| Check | Result |
|-------|--------|
| URL returned | **No** — initialize blocked at Paystack auth |
| Reference generated server-side | Not returned to client (failed before success) |
| Callback URL configured | `https://bamsignal.com/payment/success` (via `PAYSTACK_CALLBACK_URL` / config default) |

**Action required:** Set valid `sk_live_...` in Coolify → redeploy if needed → re-run initialize tests.

---

## 4. Callback handling

| Test | Result |
|------|--------|
| `GET https://bamsignal.com/payment/success` | **PASS** — HTTP 200 (SPA route serves) |
| Client verify after redirect | Not tested — requires completed Paystack transaction |

App flow: user returns to `/payment/success` → client calls `POST /api/paystack/verify` with `reference` → premium/boost activation.

---

## 5. Webhook handling

| Test | Result |
|------|--------|
| `POST /api/paystack/webhook` (no signature) | **PASS** — HTTP 401 `{"ok":false,"error":"Invalid Paystack signature"}` |
| `POST /webhooks/paystack` | Same handler mounted (not re-tested) |
| Signed `charge.success` event | Not tested — requires Paystack dashboard test webhook + valid secret |

Webhook route is live and validates HMAC signature before processing.

---

## 6. Verify endpoint (reference lookup)

| Test | HTTP | Result |
|------|------|--------|
| `POST /api/paystack/verify` with fake reference | 503 | `{"ok":false,"error":"Invalid key","code":"verify_failed"}` |

Confirms verify path reaches Paystack (same key issue). With valid key + fake reference, expect Paystack message like transaction not found (JSON, not 502).

---

## 7. Health check

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

`paystack: true` only means **key is set**, not that Paystack accepts it.

---

## Root cause (remaining blocker)

Production **`PAYSTACK_SECRET_KEY` is present but rejected by Paystack** (`Invalid key`).

Common causes:

1. Test key (`sk_test_...`) on live mode or vice versa  
2. Truncated / rotated key in Coolify env  
3. Wrong key copied (public key instead of secret)  
4. Extra whitespace — client trims, but verify in Coolify UI  

**Not the issue:** Outbound HTTPS to `api.paystack.co` — responses arrive in ~300–900ms with JSON errors.

---

## Fix checklist (ops)

1. Paystack Dashboard → Settings → API Keys → copy **Live Secret Key** (`sk_live_...`)  
2. Coolify → BamSignal service → Environment → set `PAYSTACK_SECRET_KEY`  
3. Confirm `PAYSTACK_CALLBACK_URL=https://bamsignal.com/payment/success`  
4. Confirm `PAYSTACK_WEBHOOK_URL=https://bamsignal.com/api/paystack/webhook` in Paystack dashboard  
5. Redeploy if env change requires restart  
6. Re-run:

```bash
curl -X POST "https://bamsignal.com/api/paystack/verify?action=initialize" \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","days":30,"plan":"monthly"}'
```

Expect HTTP **200** and `authorization_url`.

---

## Final pass/fail

| Gate | Status |
|------|--------|
| Deploy Paystack code fix | **PASS** |
| Database connected | **PASS** |
| Outbound Paystack connectivity | **PASS** |
| Valid Paystack secret | **FAIL** |
| Initialize (all 6 SKUs) | **FAIL** |
| Authorization URL | **FAIL** |
| Callback route | **PASS** |
| Webhook signature gate | **PASS** |
| Full end-to-end payment | **NOT TESTED** (blocked by key) |

### Play Console closed testing

**Can proceed** for app UX/device QA (APK already built).  
**Cannot mark payments production-ready** until initialize returns `authorization_url` for at least one plan.

---

## Commands used

```bash
# Health
curl https://bamsignal.com/health

# Diagnostics (requires secret)
curl "https://bamsignal.com/api/diagnostics/paystack-connectivity?secret=CRON_SECRET"

# Weekly initialize
curl -X POST "https://bamsignal.com/api/paystack/verify?action=initialize" \
  -H "Content-Type: application/json" \
  -d '{"email":"paystack-qa@bamsignal.com","days":7,"plan":"weekly"}'

# Boost initialize
curl -X POST "https://bamsignal.com/api/paystack/verify?action=initialize-boost" \
  -H "Content-Type: application/json" \
  -d '{"email":"paystack-qa@bamsignal.com","boostId":"signal-boost","amount":350}'

# Webhook probe
curl -X POST "https://bamsignal.com/api/paystack/webhook" \
  -H "Content-Type: application/json" \
  -d '{"event":"charge.success","data":{"reference":"test"}}'

# Callback
curl -I https://bamsignal.com/payment/success
```

---

*Generated after commit `58dbddb` push to `main` and production re-validation.*
