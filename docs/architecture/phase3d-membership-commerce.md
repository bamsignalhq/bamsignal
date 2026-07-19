# Phase 3D — Membership Commerce Engine

**Status:** Commercial engine shipped (no checkout UI / invoices / billing dashboard).  
**Depends on:** 3B privacy, 3C entitlements (unchanged).

---

## Architecture

```
Checkout (existing)
    ↓
Payment Provider (Paystack)
    ↓
Payment Fortress (verify + idempotent fulfillment claim)
    ↓
Membership Commerce Engine
    ├── membership_events (immutable)
    ├── member_experience_memberships (current snapshot)
    └── experience effects (premium_until / discreet / concierge row)
    ↓
loadMembershipEntitlements() → capability snapshot
    ↓
UI / gates consume capabilities (not payment state)
```

**Rule:** Payment never grants access directly. Fortress calls `activateMembershipFromPayment`. Feature gates continue to read entitlements (3C).

---

## Membership events

| Event | Meaning |
|---|---|
| `PAYMENT_COMPLETED` | Verified payment accepted for an experience |
| `MEMBERSHIP_GRANTED` | First activation for that experience |
| `MEMBERSHIP_RENEWED` | Stacked extension of active membership |
| `MEMBERSHIP_EXPIRED` | Expiration hook cleared access |
| `MEMBERSHIP_REVOKED` | Access removed |
| `ADMIN_GRANTED` / `ADMIN_REVOKED` | Manual admin actions |
| `REFUND_APPLIED` | Refund recorded (optionally revokes) |

Idempotency: unique index on `(source_payment_ref, event_type)` for GRANT/RENEW — duplicate Paystack callbacks return `duplicate: true` without double-stacking.

---

## Payment lifecycle

| Scenario | Behavior |
|---|---|
| Successful payment | `PAYMENT_COMPLETED` → grant/renew → entitlements refresh |
| Duplicate callback | Prior activation event found → no re-extension |
| Expired membership | `processExpiredMemberships` → status expired + `MEMBERSHIP_EXPIRED` |
| Renewal | `computeEndsAt` stacks from max(now, existing end) |
| Upgrade | Separate experience activations (Discover ≠ Discreet ≠ Concierge) |
| Manual grant | `grantMembershipManual` → `ADMIN_GRANTED` |
| Manual revoke | `revokeMembershipManual` → revoke effects + events |
| Failed payment | Fortress marks fulfillment failed — no grant event |
| Abandoned checkout | No payment ref — no membership change |
| Refund | `applyMembershipRefund` → `REFUND_APPLIED` (+ optional revoke) |

Supported products: **Premium Discover**, **Discreet**, **Concierge eligibility** (consultation fee best-effort grant).

---

## Files

| File | Role |
|---|---|
| `migrations/0052_membership_commerce_events.sql` | `membership_events` + idempotency index |
| `shared/membershipCommerceHelpers.mjs` | Pure event/mode/date helpers |
| `server/services/membershipCommerce.js` | Commerce engine |
| `server/services/paymentFortress.js` | Fulfillment → commerce activation |
| `scripts/test-membership-commerce.mjs` | Lifecycle matrix tests |
| `docs/architecture/phase3d-membership-commerce.md` | This doc |

---

## Regression risks

1. Apply migration `0052` before relying on event idempotency in production (fallback still activates via legacy columns if events table missing).
2. Discover renewals now stack via commerce `computeEndsAt` (improvement over always-from-now intent alone).
3. Consultation fee still succeeds if Concierge membership grant fails (no member profile yet).
4. Capability architecture (3C) and visibility policy (3B) were not modified.
