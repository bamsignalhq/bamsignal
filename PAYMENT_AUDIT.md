# Payment Audit

**Audit date:** 14 June 2026  
**Stack:** Paystack initialize + verify via `api/paystack/verify.js`, client in `src/services/payments.ts`

---

## Products in scope

| Product | ID / plan | Price (default) | Initialize | Verify |
|---------|-----------|-----------------|------------|--------|
| Signal Pass Weekly | `weekly` | ₦1,499 / 7d | `?action=initialize` | `product_type: premium` |
| Signal Pass Monthly | `monthly` | ₦3,999 / 30d | ✓ | ✓ |
| Signal Pass Quarterly | `quarterly` | ₦10,999 / 90d | ✓ | ✓ |
| Signal Boost | `signal-boost` | ₦350 | `?action=initialize-boost` | boost metadata |
| Priority Signal | `priority-signal-once` | ₦250 | ✓ | ✓ |
| Profile Boost | `profile-boost` | ₦750 | ✓ | ✓ |
| City Boost | `city-boost` | ₦600 | ✓ | ✓ (+ DB placement) |

Admin can override plan prices via `AdminPricingPage` → `premium_plans` platform setting.

---

## Happy path (success)

1. User selects plan/boost → `startPlanPayment` / `startBoostPayment`
2. POST initialize → Paystack `authorization_url`
3. User pays → redirect to `PAYSTACK_CALLBACK_URL` or `/payment/success?reference=…`
4. Client stores reference in localStorage (`paymentReference`, `paymentKind`, optional `paymentBoostId`)
5. On authed mount, `verifyPayment` / `verifyBoostPayment` POSTs to verify endpoint
6. Server confirms Paystack `status === success`
7. Premium: `activateAppUserPremium` sets DB + returns `premium_until`; client sets localStorage
8. Boost: client `activateBoost()` + toast; city-boost also `activateCityBoostPlacement` in DB

**UI feedback:** `PaymentSuccessToast` + in-app notification helpers.

---

## Failure paths

| Scenario | Server response | Client behavior |
|----------|-----------------|-----------------|
| No `PAYSTACK_SECRET_KEY` | 503 | Checkout never starts; error toast via `authMessage` |
| No email on profile | 400 (client pre-check) | "Add a verified email before upgrading." |
| Paystack init fails | 502 + message | Error shown; `paymentPending` stays set |
| Transaction not success | 402 | Verify fails; recovery banner |
| Email mismatch | 403 | Verify fails — intentional anti-fraud |
| Amount ≠ known plan | 422 | Premium verify fails |
| City boost without onboarding city | 422 | "Complete onboarding in your city…" |
| Network error | catch → error string | Recovery banner |

**Retry:** `PaymentRecoveryBanner` → opens `PricingModal` again. Reference kept until success or dismiss.

**Cancellation:** User closes Paystack without paying — no webhook required; pending flag + banner until dismiss.

---

## Duplicate callback / idempotency

**Server (`activateAppUserPremium`):** If `paystack_reference` already exists in `app_users`, returns existing row without double-charging logic (Paystack reference is unique per transaction).

**City boost (`activateCityBoostPlacement`):** Checks duplicate `paystack_reference` before insert.

**Client:** On success, clears `paymentReference`, `paymentPending`, `paymentKind`. Re-running verify with same ref after clear → "No payment reference found."

**Gap:** Client-side `premiumUntil` extended on each successful verify call; duplicate verify before localStorage clear could theoretically extend twice if server idempotency returns OK but client recomputes — server drives truth via `premiumDaysFromTransaction`; client sets from response once.

**Boost products (non-city):** Server returns `expiresAt` but client `activateBoost` uses local storage only — duplicate verify could re-activate local boost timer.

---

## Environment dependencies

| Variable | Required for |
|----------|------------|
| `PAYSTACK_SECRET_KEY` | All payment API |
| `PAYSTACK_CALLBACK_URL` or `PUBLIC_APP_URL` | Redirect after checkout |
| Database (`DATABASE_URL`) | Premium persistence, city boost placement, VIP Telegram invite |

Without DB, verify may return OK for boosts but city boost placement fails.

---

## Native (Capacitor)

Uses `@capacitor/browser` fullscreen for checkout; return URL must match configured callback. Same verify flow on return.

---

## Test checklist (manual QA)

- [ ] Weekly / monthly / quarterly each complete and unlock premium features
- [ ] Each boost product completes; discover/home reflects boost where applicable
- [ ] Decline card → recovery banner → retry succeeds
- [ ] Dismiss recovery → pending cleared; no ghost premium
- [ ] Pay with email different from BamSignal account → 403, no premium
- [ ] Refresh on `/payment/success?reference=` while logged in → toast + premium
- [ ] Same reference verify twice → no double VIP in DB
- [ ] Premium user buys boost → boost path runs (not blocked by `isPremium` early return on premium branch)

---

## Launch blockers

1. **503 if Paystack not configured in production** — must be set before launch.
2. **Session race on return from Paystack** — verify may not run if user not authed yet.
3. **Client premium state in localStorage** — can desync from server until re-verify.
4. **Non-city boosts** — payment verified server-side but effect is mostly client-local; no server ledger for signal/profile boost.

---

*Audit performed by code review; live Paystack sandbox transactions recommended before go-live.*
