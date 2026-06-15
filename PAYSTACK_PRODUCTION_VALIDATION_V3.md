# Paystack + Contact Production Validation V3

**Date:** June 15, 2026  
**Production:** https://bamsignal.com  
**Context:** `RESEND_API_KEY` and `PAYSTACK_SECRET_KEY` updated in Coolify / `.env`

---

## Final status: **PASS**

| System | Status | Evidence |
|--------|--------|----------|
| Contact form (Resend) | **PASS** | `GET /health` → `resend: true`; `POST /api/contact` → HTTP 200, acknowledgement sent |
| Paystack initialize (all products) | **PASS** | 6/6 products return HTTP 200 + `authorization_url` |
| Paystack webhook signature gate | **PASS** | Unsigned POST → HTTP 401 |
| Database | **PASS** | `database: connected` |

---

## Health

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

---

## Contact form

**Endpoint:** `POST /api/contact`

| Test | HTTP | Result |
|------|------|--------|
| Missing fields | 400 | `Name, email, and message are required` |
| Valid submission | **200** | `{ "ok": true, "acknowledgement": true, "message": "Support request received." }` |

Resend is live — support email + user acknowledgement both succeed.

---

## Paystack initialization

**Endpoint:** `POST /api/paystack/verify?action=initialize` (premium) / `?action=initialize-boost` (boosts)  
**Test email:** `paystack-validation-v3@bamsignal.com`

| Product | HTTP | `authorization_url` | Pass |
|---------|------|-------------------|------|
| Weekly Signal Pass | 200 | `https://checkout.paystack.com/…` | **PASS** |
| Monthly Signal Pass | 200 | `https://checkout.paystack.com/…` | **PASS** |
| 3 Month Signal Pass | 200 | `https://checkout.paystack.com/…` | **PASS** |
| Signal Boost | 200 | `https://checkout.paystack.com/…` | **PASS** |
| Priority Signal | 200 | `https://checkout.paystack.com/…` | **PASS** |
| Profile Boost | 200 | `https://checkout.paystack.com/…` | **PASS** |

**Note:** Immediately after redeploy, some requests briefly returned `Invalid key` (likely mixed old/new container instances). A full Coolify redeploy with a single running instance should eliminate that flake.

---

## Webhook

| Test | HTTP | Result |
|------|------|--------|
| No signature | 401 | `Invalid Paystack signature` — **expected** |

Full signed `charge.success` flow still requires a real test payment in Paystack dashboard.

---

## Recommended manual follow-up

1. Complete one **live test payment** (small plan) and confirm `/payment/success` + premium flag in app.
2. Confirm Paystack dashboard webhook URL: `https://bamsignal.com/api/paystack/webhook`
3. Submit contact form once from https://bamsignal.com/contact in browser (captcha + UX).

---

## Launch blockers cleared

- ~~Contact form needs `RESEND_API_KEY`~~ — **resolved**
- ~~Paystack blocked on invalid key~~ — **resolved**
