# Subscriptions — Sprint 3

Subscription billing uses the existing membership commerce engine (`membershipCommerce.js`, `membership_events`, `member_experience_memberships`). Sprint 3 does **not** redesign pricing or plans.

## Supported Intervals

Plans are defined in `membership_plans` (migration 0050):

- Weekly, monthly, quarterly, annual — via `interval_label` and `days`
- Grace period and expiration — existing `premium_until`, discreet/concierge membership columns
- Renewal — Paystack webhook events: `subscription.create`, `charge.success`, `invoice.payment_success`
- Cancellation — `subscription.disable` ignored until period end (existing policy)

## Status Synchronization

1. Paystack webhook → `completePaymentFulfillment`
2. `activateMembershipFromPayment` → membership event + subscription state machine
3. Financial ledger → `successful` entry with product metadata
4. Entitlements consumed via `membershipEntitlements.js` (not payment flags)

## Subscription State Machine

Formal lifecycle states in `member_subscription_state`:

| Status | Meaning |
|--------|---------|
| `trial` | Trial period active |
| `active` | Paid subscription active |
| `grace_period` | Premium expired but within grace window |
| `payment_pending` | Awaiting payment confirmation |
| `expired` | Subscription lapsed |
| `cancelled` | User or admin cancelled |
| `suspended` | Account suspended (shadow ban, etc.) |

Transitions are append-only in `member_subscription_lifecycle_log`.  
Activation hook: `recordSubscriptionActivatedFromPayment()` after membership payment fulfillment.

## Backend Billing History

`POST /api/finance/billing?action=subscription-history` returns `membership_events` for authenticated members.

## Financial Audit

Subscription renewals increment `subscriptionRenewals` observability counter when ledger records successful subscription product types.
