# Paystack Outbound Connectivity Fix Report

**Date:** June 15, 2026  
**Environment:** Production `https://bamsignal.com` (Coolify)  
**Validation baseline:** 9/10 PASS — only Paystack initialize blocked

---

## Root cause

Two issues combined to produce the observed **Cloudflare `text/plain` HTTP 502** (`error code: 502`) on any route that called Paystack:

### 1. Origin returned HTTP 502 (primary)

`api/paystack/verify.js` mapped Paystack/upstream failures to **`res.status(502)`**.

When BamSignal sits behind **Cloudflare**, an origin **502** is often replaced by Cloudflare’s generic error page (`error code: 502`, `text/plain`) instead of the app’s JSON body. That made failures look like “outbound connectivity” even when the Node handler had already run.

**Evidence:**

| Request | Before fix | After fix (local) |
|---------|------------|-------------------|
| `POST /api/paystack/verify?action=initialize` | Cloudflare 502 plain text | `503 application/json` `{"ok":false,"error":"Invalid key","code":"initialize_failed"}` |
| `POST /api/paystack/verify` (with reference) | Cloudflare 502 plain text | Structured JSON via same client |
| `POST /api/paystack/verify` (no Paystack call) | `400` JSON | Unchanged |

Routes that **never called** `api.paystack.co` (e.g. missing reference → 400) continued to return JSON on production.

### 2. Paystack API response on failed auth (secondary)

Local probe with a test secret shows Paystack is **reachable** from a normal network:

- DNS: `api.paystack.co` → `104.18.28.7`, `104.18.29.7` (IPv4, ~30ms)
- `POST /transaction/initialize` without valid key → **401** `{"message":"Invalid key"}`

Production likely either:

- Returns a similar **401/403** (invalid/expired `PAYSTACK_SECRET_KEY`), or
- Hits a real network error (timeout / DNS) — now surfaced as **503 JSON** with `code: network_error` instead of a masked 502.

**Not confirmed:** Coolify host firewall blocking outbound 443 — local and probe tests reach Paystack successfully; production must be re-tested **after deploy** using the diagnostic endpoint.

---

## Tests performed

### From developer machine (external)

```bash
curl -I https://api.paystack.co
# HTTP/2 403 (expected without auth)

curl -X POST https://api.paystack.co/transaction/initialize -H "Content-Type: application/json" -d '{}'
# HTTP 401 — Paystack reachable

curl -X POST https://bamsignal.com/api/paystack/verify?action=initialize \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","days":30,"plan":"monthly"}'
# HTTP 502 text/plain (pre-fix, still live until deploy)

curl https://bamsignal.com/health
# {"database":"connected","paystack":true,...}
```

### Local production server (post-fix)

```bash
PAYSTACK_SECRET_KEY=sk_test_invalid node server/production.js
curl -X POST http://127.0.0.1:3099/api/paystack/verify?action=initialize \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","days":30,"plan":"monthly"}'
# HTTP 503 application/json — {"ok":false,"error":"Invalid key","code":"initialize_failed"}
```

### Paystack connectivity probe (module)

`probePaystackConnectivity()` reports DNS, HEAD, initialize probe, verify probe — no secret exposure.

---

## Fix applied

### `server/services/paystackClient.js` (new)

- Central Paystack HTTP client
- `dns.setDefaultResultOrder("ipv4first")` to reduce IPv6 egress issues in containers
- 20s timeout with `AbortController`
- Structured `PaystackClientError` with safe codes
- **Never returns HTTP 502** to clients — uses **503** for upstream/network failures
- `probePaystackConnectivity()` for admin diagnostics

### `api/paystack/verify.js` (hardened)

- Uses `initializePaystackTransaction` / `verifyPaystackTransaction`
- Confirms `PAYSTACK_SECRET_KEY` at runtime via `config`
- Bearer auth, amount in kobo, validated email, generated `reference`, `callback_url` from `config.paystackCallbackUrl` (`https://bamsignal.com/payment/success`)
- Safe metadata (no secrets)
- User-facing error: `"Unable to start payment. Please try again shortly."`
- Internal logging: `[paystack] initialize failed` with code/upstream status

### `GET /api/diagnostics/paystack-connectivity` (temporary)

- Protected by `CRON_SECRET` or `DIAGNOSTICS_SECRET` (header `x-bamsignal-secret` or `?secret=`)
- Returns DNS, HEAD status, initialize/verify probe summary
- **Does not expose** `PAYSTACK_SECRET_KEY`
- Remove or disable after production is verified

### `server/production.js`

- Mounts diagnostic route

### `.env.example`

- Documents optional `DIAGNOSTICS_SECRET`

---

## Post-deploy verification steps

### 1. Deploy to Coolify (push `main`, rebuild)

### 2. Run diagnostic from a secure shell

```bash
curl "https://bamsignal.com/api/diagnostics/paystack-connectivity?secret=YOUR_CRON_SECRET"
```

Expected healthy output:

```json
{
  "ok": true,
  "paystack": {
    "configured": true,
    "reachable": true,
    "dns": { "ok": true, "family": "ipv4", "addresses": ["104.18.28.7", "..."] },
    "initializeProbe": { "ok": true, "status": 200, "paystackStatus": true }
  }
}
```

If `initializeProbe.status` is **401** → fix `PAYSTACK_SECRET_KEY` in Coolify (live key for production, `sk_live_...`).

If `initializeProbe.error` is **network_error** / **timeout** → check Coolify host egress (firewall outbound 443, DNS).

### 3. Retest initialize (all products)

| Product | Action | Body hints |
|---------|--------|------------|
| Weekly Signal Pass | `?action=initialize` | `plan: weekly`, `days: 7` |
| Monthly Signal Pass | `?action=initialize` | `plan: monthly`, `days: 30` |
| 3 Months Signal Pass | `?action=initialize` | `plan: quarterly`, `days: 90` |
| Priority Signal | `?action=initialize-boost` | `boostId: priority-signal-once` |
| Signal Boost | `?action=initialize-boost` | `boostId: signal-boost` |
| Profile Boost | `?action=initialize-boost` | `boostId: profile-boost` |
| City Boost | `?action=initialize-boost` | `boostId: city-boost`, `city: Lagos` |

Success: **HTTP 200** with `authorization_url` and `reference`.

Failure: **HTTP 503 JSON** (not Cloudflare plain text) — read `error` and `code`.

### 4. Full payment flow (after initialize passes)

- Complete checkout on Paystack
- Return to `https://bamsignal.com/payment/success`
- `POST /api/paystack/verify` with `reference` → premium/boost activation

---

## Endpoint results (current)

| Endpoint | Pre-fix prod | Expected post-fix |
|----------|--------------|-------------------|
| `GET /health` | `paystack: true`, `database: connected` | Same |
| `POST ...?action=initialize` | Cloudflare 502 plain text | 200 + `authorization_url` OR 503 JSON |
| `POST ...?action=initialize-boost` | Cloudflare 502 plain text | 200 OR 503 JSON |
| `POST /api/paystack/verify` | Cloudflare 502 when calling Paystack | 200/402/403/422 JSON or 503 JSON |
| `GET /api/diagnostics/paystack-connectivity` | Not deployed | 200 diagnostic JSON (secret required) |

---

## Remaining payment risks

1. **`PAYSTACK_SECRET_KEY` validity** — Health only checks presence, not that Paystack accepts the key. Verify with diagnostic endpoint after deploy.
2. **Webhook delivery** — `POST /api/paystack/webhook` must be reachable from Paystack for async confirmation; test separately.
3. **Callback URL** — Must match `PAYSTACK_CALLBACK_URL` / `https://bamsignal.com/payment/success`.
4. **Diagnostic endpoint** — Disable after fix is confirmed (attack surface if secret leaks).
5. **Coolify egress** — If diagnostic shows `network_error` from container, open outbound HTTPS 443 on host firewall.

---

## Play Console closed testing

| Gate | Status |
|------|--------|
| Core social flows | PASS |
| Database | Connected |
| Paystack initialize | **Blocked until deploy + verify** |
| Android APK/AAB | Built (prior sprint) |

**Recommendation:** Proceed with Play Console **closed testing upload** for UX/device QA in parallel, but **do not mark payments as production-ready** until `POST ...?action=initialize` returns **200** with `authorization_url` on production for at least one plan and one boost SKU.

---

## Files modified

- `server/services/paystackClient.js` — **new**
- `api/paystack/verify.js` — refactored
- `api/diagnostics/paystack-connectivity.js` — **new**
- `server/production.js` — mount diagnostic route
- `.env.example` — `DIAGNOSTICS_SECRET`
- `PAYSTACK_OUTBOUND_FIX_REPORT.md` — this report

---

## Summary

The production “502” was largely a **response-status bug**: returning HTTP **502** from the origin caused Cloudflare to hide the real Paystack error. The fix routes all Paystack failures through a hardened client that returns **503 JSON**, forces **IPv4-first DNS**, adds timeouts/logging, and provides a **protected diagnostic endpoint** to confirm egress and key validity from inside Coolify after deploy.

**Next step:** Deploy → run diagnostic → confirm initialize returns `authorization_url` → retest all plan/boost SKUs → remove diagnostic route.
