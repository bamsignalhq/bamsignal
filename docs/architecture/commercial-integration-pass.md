# Commercial Integration Pass (3B–3E)

**Status:** Verification complete (surgical fixes only).  
**Not a feature phase.**

---

## Verified chain

```
Checkout → Payment Fortress → Commerce → Membership Events
  → Entitlements → Visibility Policy → Concierge Operations → Member Experience
```

| Boundary | Status |
|---|---|
| Payment never grants capability directly | Pass |
| Commerce never bypasses entitlements refresh | Pass |
| Listings use visibility policy | Pass |
| Operations never grant memberships | Pass |
| Invoices never activate memberships | Pass |

---

## Fixes applied in this pass

1. **Stale 3B wiring assertions** — fortress must go through commerce for Discreet; city home asserts policy SQL only.
2. **Referral premium bypass** — referral rewards call `grantMembershipManual` (events + effects) instead of raw `premium_until` updates.
3. **Membership expiry sweep** — `processExpiredMemberships` runs on production startup (alongside account deletion sweep).
4. **Discover expiry identity** — expiry clears `app_users` using resolved `user_key` when experience row stores profile id.

---

## Scenario coverage

| Scenario | Covered by |
|---|---|
| Premium / Discreet / Concierge purchase | Fortress → commerce + phase tests |
| Duplicate callback | Commerce idempotency |
| Refund / admin grant / revoke | Commerce exports + tests |
| Discreet expiration | Lazy heal + startup sweep |
| Concierge application → completion | Operations + tests |
| Invoice payment | Operations (`grantsMembership: false`) |

Run: `node scripts/test-commercial-integration.mjs` plus phase scripts `test-discreet-visibility`, `test-membership-entitlements`, `test-membership-commerce`, `test-concierge-operations`.
