# Payment Premature Failure — Root Cause Report

**Date:** 2026-06-15  
**Symptom:** Tap Upgrade → “Payment incomplete” banner appears → then Paystack checkout opens at `https://checkout.paystack.com/...`

---

## Summary

Three bugs combined to show the recovery banner **before** checkout opened:

1. **Stale `failed` / `cancelled` state** persisted in `localStorage` from a prior attempt and was never cleared when starting a new payment.
2. **Payment reference stored too early** (before checkout UI opened), allowing background verify logic to fail while checkout was still starting.
3. **No React re-render on state change** — `setPaymentFlowState()` wrote to `localStorage` only; the banner kept showing the old state until unrelated UI updates.

Android additionally skipped **Paystack Inline (`access_code`)** and always opened the hosted redirect URL in an in-app browser.

---

## Where “Payment incomplete” is shown

| File | Line | Trigger |
|------|------|---------|
| `src/components/PaymentRecoveryBanner.tsx` | 10 | Title when `getPaymentFlowState() === "failed"` |
| `src/App.tsx` | 580–584, 795–806 | `showPaymentRecovery && <PaymentRecoveryBanner />` |

Copy:

- **Failed:** “Payment incomplete” / “We couldn't confirm your payment…”
- **Cancelled:** “Payment not completed” / “You closed checkout before paying…”

No other component renders this banner.

---

## Root cause #1 — Stale state survives new Upgrade tap

**File:** `src/utils/paymentState.ts` (old `setPaymentFlowState`)  
**File:** `src/services/payments.ts` (old `startPlanPayment`)

**Old flow:**

```
Prior attempt → verify fails → setPaymentFlowState("failed")
User taps Upgrade → setPaymentFlowState("initializing")  // overwrites state in storage
Banner still visible because React had not re-rendered
Checkout opens → user sees banner + Paystack
```

`shouldShowPaymentRecovery()` returned true for `failed` | `cancelled` with no exclusion for an active payment attempt.

**Fix:**

- `beginPaymentSession()` clears reference, kind, pending flags, and stale failed/cancelled before initialize.
- `sanitizeStalePaymentState()` on app boot drops orphaned sessions (>30 min or missing reference).
- `shouldShowPaymentRecovery()` returns false during `initializing`, `checkout_open`, `verifying`.
- `subscribePaymentState()` + custom event re-renders UI when flow state changes.
- `showPaymentRecovery` also requires `!paymentLoading`.

---

## Root cause #2 — Reference stored before checkout opens

**File:** `src/services/payments.ts` — old `launchCheckout()` line ~56

**Old flow:**

```
POST initialize → localStorage.paymentReference = ref  // BEFORE checkout
state = initializing
openPaystackCheckout() → checkout_open
```

If `processPaymentReturn()` ran while state was `verifying` (stale or race), `completePendingPayment()` called verify on an unpaid reference → `failed` → banner.

**Fix:**

- Reference is written only when entering `checkout_open` (inline iframe / in-app browser / redirect), inside `paymentCheckout.ts` `persistCheckoutReference()`.
- Init failures set state to **`idle`** (not `failed`) — toast only, no recovery banner.

---

## Root cause #3 — `processPaymentReturn` treated pending verify as cancelled

**File:** `src/App.tsx` — old `processPaymentReturn()` ~272–274

```javascript
if (result.cancelled || result.pending) {
  setPaymentFlowState("cancelled");
}
```

A 402 “payment not completed yet” from Paystack during checkout could flip to `cancelled`/`failed` prematurely.

**Fix:**

- `pending` → no state change, no banner (retry verify later).
- `cancelled` only when user closes checkout without paying.
- `failed` only when verify hard-fails **and** `checkoutWasOpened` flag is set.

---

## Root cause #4 — Android forced redirect instead of inline

**File:** `src/services/paymentCheckout.ts` — old `openPaystackCheckout()`

**Old flow:**

```javascript
if (Capacitor.isNativePlatform()) {
  return openCapacitorCheckout(authorizationUrl);  // always hosted URL
}
```

This opened `https://checkout.paystack.com/...` in `@capacitor/browser`, matching observed behavior.

**New flow:**

1. Prefer **Paystack Inline JS** with `access_code` on **all platforms** (Capacitor WebView supports inline iframe).
2. Fallback: in-app browser with `authorization_url` (Android) or full redirect (web).

---

## State transition bug (exact jump to `failed`)

| Step | Old behavior | File:Line |
|------|--------------|-----------|
| 1 | Prior session left `paymentFlowState = "failed"` | localStorage |
| 2 | User taps Upgrade | `App.tsx` handleUpgrade |
| 3 | Banner still rendered (no re-render) | `App.tsx` showPaymentRecovery |
| 4 | New init stores ref early | `payments.ts` launchCheckout |
| 5 | Optional: verify on stale ref → `failed` again | `App.tsx` processPaymentReturn |
| 6 | Hosted checkout opens | `paymentCheckout.ts` |

**Who jumped to `failed` before checkout:** stale state from step 1 (banner visible) + optional step 5; not a single line but **lack of session reset + no UI sync**.

---

## Old flow vs new flow

### Old (broken)

```
idle / failed (stale banner visible)
  → initializing
  → store paymentReference          ← too early
  → checkout_open (redirect URL)
  → [banner still visible]
  → verify may fail → failed
```

### New (fixed)

```
idle
  → beginPaymentSession()           ← clears stale flags + reference
  → initializing
  → POST /transaction/initialize    ← access_code + authorization_url
  → checkout_open                   ← reference stored here; inline preferred
  → user pays OR closes
  → verifying (only after pay / return URL)
  → success | cancelled
  → failed only if verify fails AFTER checkout was opened
```

Console logs: `[payment] state → <state>` on every transition.

---

## Checkout mode

| Platform | Primary | Fallback |
|----------|---------|------------|
| Web | Paystack Inline (`access_code`) | `window.location.assign(authorization_url)` |
| Android (Capacitor) | Paystack Inline in WebView | In-app browser (`@capacitor/browser`) |
| Return handling | Inline callback / `appUrlOpen` deep link | `/payment/success?reference=` |

Initialize endpoint: `POST /api/paystack/verify?action=initialize` → returns `access_code`, `authorization_url`, `reference`.

---

## localStorage keys affected

| Key | Purpose |
|-----|---------|
| `bamsignal-payment-flow-state` | State machine |
| `bamsignal-payment-ref` | Paystack reference (now set at checkout_open) |
| `bamsignal-payment-pending` | Legacy flag; cleared on success/idle |
| `bamsignal-payment-checkout-opened` | **New** — gates failed banner |
| `bamsignal-payment-started-at` | **New** — stale session TTL |

---

## Files changed

- `src/utils/paymentState.ts` — session reset, sanitize, logging, recovery gating
- `src/services/payments.ts` — `beginPaymentSession`, idle on init error, no early ref
- `src/services/paymentCheckout.ts` — inline-first on all platforms
- `src/App.tsx` — boot sanitize, state subscription, pending handling
- `src/components/PaymentRecoveryBanner.tsx` — clearer cancel copy
- `src/constants/limits.ts` — new storage keys
- `src/pages/ChatsPage.tsx` — quickie verify uses `needsVerify`

---

## Verification checklist

- [ ] Fresh install / clear site data → Upgrade → **no banner** before Paystack UI
- [ ] Close checkout without paying → **“Payment not completed”** only after close
- [ ] Complete payment → **“Payment successful — Your Signal Pass is active.”**
- [ ] Console shows: `initializing → checkout_open → verifying → success`
- [ ] Android uses inline modal when `access_code` present (not full browser redirect)

---

## Goal status

| Requirement | Status |
|-------------|--------|
| No “Payment incomplete” before checkout | **Fixed** |
| No stale payment banners | **Fixed** (sanitize + beginPaymentSession) |
| Inline checkout with `access_code` | **Fixed** (all platforms, fallback preserved) |
| Signal Pass activates after success | **Unchanged** (verify → DB → toast) |

Deploy this commit and retest Upgrade on the same device that reproduced the bug.
