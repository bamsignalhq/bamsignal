# Phase 3B — Discreet Membership visibility enforcement

**Status:** Implemented (enforcement + entitlement activation). Billing UI / commercial dashboards remain out of scope.  
**Baseline Journey:** `45f6b19` (do not redesign).

---

## Architecture summary

Discreet is a **privacy mode**, not Premium and not a feature toggle.

| Layer | Role |
|---|---|
| `server/services/memberVisibilityPolicy.js` | **Single policy** — passive listing SQL, discoverable computation, direct-profile allow/deny, intentional-contact checks. Fail closed. |
| `server/services/discreetMembership.js` | Entitlement activation / expiry; syncs `privacy_mode`, `discreet_until`, `discoverable`; records `member_experience_memberships`. |
| `migrations/0051_discreet_visibility_policy.sql` | Denormalized `privacy_mode` + `discreet_until` on `app_member_profiles` for listing SQL. |
| Listing queries | Use `passiveListingVisibilitySql` / `discoverVisibilitySql` (delegates to policy) + `discoverable = true`. |
| `profile-by-id` | Uses `getVisibleMemberProfileById` — Discreet subjects hidden unless viewer has intentional contact. |
| Payment fortress | Discreet product fulfillment calls `activateDiscreetMembership` (does **not** fall through to Premium). |

**Intentional contact** = Discreet member sent a pending/accepted Signal to the viewer, **or** a match payload links them.

**Discoverable writes** always go through `computeDiscoverableFlag` so profile save / unpause / restore cannot re-expose an active Discreet member.

---

## Enforcement matrix

Legend: **V** = visible in that surface · **H** = hidden · **R** = relationship-only · **N/A** = not applicable

| Viewer \ Subject | Guest | Free Discover | Premium Discover | Discreet (active) | Blocked peer | Reported | Shadow-banned | Banned / deleted | Admin console |
|---|---|---|---|---|---|---|---|---|---|
| **Discover feed** | H (auth) | V | V | **H** | H (block filter) | V* | **H** | **H** | V (admin list) |
| **Search** | H (auth) | V | V | **H** | H | V* | **H** | **H** | — |
| **City home / nearby / spotlight** | V public cards | V | V | **H** | — | V* | **H** | **H** | V |
| **Fast Connection pool** | H | V† | V† | **H** | — | V* | **H** | **H** | — |
| **profile-by-id** | V | V | V | **H** unless intentional contact | H if blocked UX | V* | **H** | **H** | V |
| **Incoming Signals / matches / chat** | — | R | R | **R** (after Discreet initiates or match) | H | R | H | H | — |
| **Signal *to* Discreet** | — | **H** (rejected) | **H** | N/A | — | — | — | — | — |
| **Passive counts / placements** | — | included | included | **excluded** | — | — | excluded | excluded | — |

\* Reported subjects remain listable until moderation acts (existing behavior).  
† Requires Fast Connection eligibility on subject.

### Discreet member as actor

| Action | Allowed |
|---|---|
| Manual Discover / Search browse | Yes (as viewer) |
| Send Signal to Discover member | Yes |
| Accept Signal / chat after match | Yes |
| Appear in others’ Discover / Search / Nearby / Recommendations | **Never** while active |
| City boost / spotlight purchase placement | **Blocked** while active |

### Backward compatibility

Existing Discover members (`privacy_mode = discover` default) keep prior behavior. Only active Discreet privacy changes visibility.

---

## Ops

1. Apply `migrations/0050_experience_membership_billing.sql` (if not yet) then `0051_discreet_visibility_policy.sql`.
2. Pricing remains catalog-driven (no hardcoded Discreet prices in enforcement).

---

## Out of scope (3C+)

Checkout UX polish, Concierge, commercial dashboards, Journey/Discover redesign, matching algorithm changes.
