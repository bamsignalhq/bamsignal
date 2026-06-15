# In-App Payment Flow Report

**Date:** June 2026  
**Scope:** Paystack checkout UX — premature errors, state machine, in-app browser, channel preference.

---

## Root cause: premature “Payment incomplete”

Two bugs combined:

1. **`handleUpgrade` set `paymentPending` before Paystack opened**  
   `App.tsx` wrote `localStorage.paymentPending = "1"` on Upgrade tap.  
   `showPaymentRecovery` treated any `paymentPending` **or** stored `paymentReference` as incomplete → banner appeared instantly.

2. **Failed verify on stale references**  
   On load, if a `paymentReference` existed from a prior attempt, verify ran immediately. Failure re-set `paymentPending`, keeping the recovery banner visible even when the user had not started a new checkout.

---

## State machine fix

New flow states (`src/utils/paymentState.ts`):

| State | Meaning |
|-------|---------|
| `idle` | No active payment |
| `initializing` | Calling Paystack initialize |
| `checkout_open` | Paystack UI open (inline or in-app browser) |
| `verifying` | Confirming reference with backend |
| `success` | Verified and applied |
| `failed` | Initialize or verify hard failure |
| `cancelled` | User closed checkout without paying |

**Recovery banner** only shows for `failed` or `cancelled` — never for `initializing` or `checkout_open`.

---

## Client flow (all products)

1. User taps Upgrade / boost / Quickie pay  
2. UI: **“Starting secure payment…”** (`PaymentLoadingOverlay`)  
3. `POST /api/paystack/verify?action=initialize*`  
4. On failure → toast: *We couldn't start payment right now. Please try again shortly.*  
5. On success → open checkout (see below)  
6. On pay → `verifying` → `completePendingPayment()` → success toast + entitlement  
7. On cancel → `cancelled` → calm recovery banner (*Payment not completed*)

Unified in:

- `src/services/payments.ts` — initialize + launch  
- `src/services/paymentCheckout.ts` — platform checkout  
- `src/App.tsx` — `processPaymentReturn()` + `applyPaymentSuccess()`

**Products covered:** Signal Pass, all boosts (`initialize-boost`), Quickie daily pass (`initialize-quickie`).

---

## In-app checkout

### Web / PWA

- Uses **Paystack Inline JS** (`access_code` from initialize) — checkout in an iframe overlay, no full-page redirect when the script loads.
- Fallback: `window.location.assign(authorization_url)` → return via `/payment/success?reference=…`

### Android / Capacitor

- `@capacitor/browser` opens checkout in **in-app browser** (`presentationStyle: "popover"`).
- `@capacitor/app` `appUrlOpen` listens for `https://bamsignal.com/payment/success` (or `trxref` / `reference` query).
- `browserFinished` → `cancelled` if user closes without callback.

**Deep link `bamsignal://payment/success`:** parser supports it; Android intent filter can be added in a follow-up native config. HTTPS callback is the primary path today.

---

## Channel preference & card control

### Code change

`server/paystackChannels.js`:

```js
["bank_transfer", "ussd", "bank", "mobile_money"]
```

Applied to all initialize actions in `api/paystack/verify.js`. **Card and QR are excluded** from the `channels` array.

### Paystack limitations

- `channels` **restricts** which methods appear; order is a preference — Paystack may reorder based on merchant dashboard settings.
- If card still appears, disable it in dashboard (see below).

### Dashboard: disable card (if needed)

1. Log in to [Paystack Dashboard](https://dashboard.paystack.com)  
2. **Settings** → **Payment Channels** (or **Preferences** → **Payment Channels**, depending on account UI)  
3. **Disable Card**  
4. Keep **Bank Transfer**, **USSD**, and **Bank** enabled  

Exact menu labels vary by Paystack account type; use the channel list in Settings.

---

## Success & cancelled UX

| Outcome | UI |
|---------|-----|
| Success | “Payment successful” + product-specific body + **Continue** |
| Cancelled | “Payment not completed” + “You can try again whenever you're ready.” + Try Again / Close |
| Failed verify | “Payment incomplete” + “We couldn't confirm your payment.” + Try Again / Close |

---

## Test matrix

| Scenario | Expected | Automated |
|----------|----------|-----------|
| Upgrade tap | Loading overlay, no recovery banner | Manual |
| Initialize 502 | Error toast, state `failed` | Manual |
| Web inline success | Verify + success toast | Manual |
| Web redirect return | `/payment/success` → verify | Manual |
| Capacitor cancel | `cancelled` banner | Manual on APK |
| Capacitor success | appUrlOpen → verify | Manual on APK |
| Duplicate verify | Idempotent server-side ref check | Existing server logic |
| Bad reference | `failed`, no premium | Manual |
| Network drop during verify | `failed` or retry | Manual |

**Android APK:** Requires device test with live Paystack — not run in this session.

---

## Remaining risks

1. **Inline script blocked** (CSP/adblock) → falls back to full redirect (still works, less “in-app”).  
2. **Capacitor `browserFinished` race** — may fire after successful `appUrlOpen`; guarded with `settled` flag.  
3. **Dashboard channel overrides** — merchant-level Paystack settings can still expose card until disabled in dashboard.  
4. **`bamsignal://` deep link** — not registered in `AndroidManifest` yet; HTTPS callback is production path.

---

## Files changed

| File | Change |
|------|--------|
| `src/utils/paymentState.ts` | State machine + session clear |
| `src/services/paymentCheckout.ts` | Inline + Capacitor checkout |
| `src/services/payments.ts` | Initialize/launch/verify orchestration |
| `src/App.tsx` | Recovery logic, loading overlay, success handler |
| `src/components/PaymentRecoveryBanner.tsx` | Cancelled vs failed copy |
| `src/components/PaymentLoadingOverlay.tsx` | Starting payment UI |
| `server/paystackChannels.js` | Channel list without card |
| `api/paystack/verify.js` | Use shared channels |
| `src/pages/ChatsPage.tsx` | Quickie verify after checkout |
| `src/utils/authSession.ts` | Clear payment session on logout |

---

## Success criteria

- Upgrade no longer shows “Payment incomplete” before checkout opens  
- Clear loading → checkout → verify → success/cancel paths  
- Web uses inline checkout when possible; native uses in-app browser  
- Bank transfer / USSD / bank prioritized; card excluded in API  
- All paid products share the same flow
