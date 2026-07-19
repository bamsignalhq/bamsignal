# Phase 3C — Membership Entitlements

**Status:** Capability layer shipped (no checkout / billing UI).  
**Depends on:** Phase 3B privacy (do not reopen unless production bug).

---

## Entitlement architecture

```
Plan / experience activation
        ↓
  Entitlement bundles (EXPERIENCE_BUNDLES)
        ↓
  Capability set (CAPABILITY.*)
        ↓
  Feature gates: can(capability) / limits
```

| Layer | File | Role |
|---|---|---|
| Capability IDs + bundles | `shared/membershipCapabilities.mjs` | Stable capabilities; experience→bundle maps; product-id→experience maps |
| Entitlement service | `server/services/membershipEntitlements.js` | Load membership state → snapshot; `canFromSnapshot` |
| Client helpers | `src/utils/membershipCapabilities.ts` | `canCapability(snapshot, id)` |
| Legacy mirrors | `signalPass` / `fastConnectionPass` on snapshot | Back-compat for existing `isPremium` clients |

**Rules**

- Membership ≠ pricing ≠ payment.
- UI/business logic must not depend on plan display names (`weekly`, `Monthly Discover`, etc.).
- Product catalog ids (`discover`, `discreet`) map to experience bundles via `PRODUCT_TO_EXPERIENCE`.
- Discreet **overrides** passive placement: removes `appear_in_discover`, `purchase_city_boost`, `purchase_spotlight`.

---

## Capability matrix

| Capability | Guest | Free | Premium Discover | Discreet | Concierge* | Admin |
|---|---|---|---|---|---|---|
| `browse_discover` | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| `search_members` | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| `send_signal` | — | ✓ (5/day) | ✓ unlimited | ✓ unlimited | ✓ (5/day) | ✓ |
| `send_message` | — | ✓ (5/day) | ✓ unlimited | ✓ unlimited | ✓ (5/day) | ✓ |
| `unlimited_signals` | — | — | ✓ | ✓ | — | ✓ |
| `unlimited_messaging` | — | — | ✓ | ✓ | — | ✓ |
| `appear_in_discover` | — | ✓ | ✓ | **—** | ✓ | ✓ |
| `discreet_privacy` | — | — | — | ✓ | — | ✓ |
| `view_visitors` | — | — | ✓ | ✓ | — | ✓ |
| `purchase_boost` | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| `purchase_city_boost` | — | ✓ | ✓ | **—** | ✓ | ✓ |
| `purchase_spotlight` | — | ✓ | ✓ | **—** | ✓ | ✓ |
| `use_fast_connection` | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| `use_concierge` | — | — | — | — | ✓ | ✓ |
| `reduced_signal_cooldown` | — | — | ✓ | ✓ | — | ✓ |
| `admin_tools` | — | — | — | — | — | ✓ |

\* Concierge row = free Discover base + `use_concierge` from an active concierge experience membership. Full Concierge shell separation remains 3E.

---

## Wired gates (read entitlements)

- `fetchMemberEntitlements` → `loadMembershipEntitlements` (status API returns full snapshot)
- Signal cooldown → `REDUCED_SIGNAL_COOLDOWN`
- City boost / spotlight activation → `PURCHASE_CITY_BOOST` / `PURCHASE_SPOTLIGHT`

Visibility policy (3B) remains authoritative for whether others **see** you; `appear_in_discover` is the entitlement mirror of that intent.

---

## Out of scope (unchanged)

Payment processing, checkout UI, invoices, Concierge workflow, Journey redesign.
