# Phase 3B Privacy Audit

**Date:** 2026-07-19  
**Scope:** Audit only — verify active Discreet members never appear unintentionally.  
**Code changes:** Only where a real privacy leak was confirmed (likes / follows / saved + match detection hardening).

---

## Verdict

Primary listing surfaces from 3B remain sound. The audit found **three secondary exposure paths** that bypassed the central policy; those are now gated. Remaining items are either relationship-scoped (allowed), not implemented, or residual client-cache risk (documented, not a server leak).

---

## Surface-by-surface results

| Surface | Status | Notes |
|---|---|---|
| Discover feed | Pass | `passiveListingVisibilitySql` + `discoverable` |
| Search | Pass | Same policy SQL |
| City home / nearby / spotlight | Pass | Policy SQL + Discreet city boost blocked |
| Fast Connection pool / target assert | Pass | Policy + `isDiscreetPrivacyActive` |
| `profile-by-id` | Pass | `getVisibleMemberProfileById` fail closed |
| Signal send → Discreet target | Pass | Rejected unless intentional contact |
| Incoming Signals / visitors (signal-derived) | Pass | Signal = intentional initiation |
| Matches / chat peers | Pass | Relationship context (after accept) |
| Online / recently-active indicators | Pass | Client-only on already-fetched cards; feed is gated |
| Typing indicators | Pass | Client chat-list status for matched threads only; no server presence broadcast |
| Mutual friends / mutual interests widgets | N/A | No member-facing mutual-profile widget found (metrics only) |
| Referral suggestions | Pass | Code/points only — no profile suggestion list |
| Recommendation caches | Pass | Client ranks server-fetched Discover results |
| Push notifications | Pass | FCM topic subscribe only; no per-profile Discover push payloads found |
| Email digests | Pass | No member “new nearby / liked you” digest that lists strangers found |
| Notification payloads (in-app ops) | Pass | Notification Center / Concierge ops — not Discover stranger lists |
| WebSocket broadcasts | Pass | Observability close events only; no profile fan-out |
| Search indexes | Pass | Search Center is ops/admin, not public member index |
| Sitemap generation | Pass | SEO marketing paths only; no member profile URLs |
| Analytics exports | Pass | Engagement/admin metrics; no public member export of Discreet profiles |
| Admin dashboards | Pass | Admin APIs use `requireAdmin`; public city home uses policy |
| Admin visible to non-admins | Pass | No non-admin admin profile dump found |
| Profile previews (public landing samples) | Pass | Static marketing samples, not live members |
| Client Discover Map cache | Residual | Stale card possible until refresh if someone activates Discreet mid-session after already cached; new fetches / `profile-by-id` fail closed |

---

## Leaks found and fixed

### 1. Incoming likes / follows (HIGH)

**Issue:** `fetchIncomingProfileLikes` / `fetchIncomingProfileFollows` returned Discreet actors’ name/photo with no policy check. A Discreet member who liked/followed without sending a Signal would appear in the recipient’s social bundle.

**Fix:** Filter through `filterPassiveExposureRows` (fail closed unless intentional contact).

### 2. Saved profiles list + save action (HIGH)

**Issue:** `fetchSavedProfiles` joined and returned Discreet profiles unconditionally (e.g. saved while Discover, then converted). `saveMemberProfile` could also persist a Discreet target if the ID was known.

**Fix:** List filtered via policy; save rejects Discreet targets without intentional contact.

### 3. Like / follow write paths (MEDIUM)

**Issue:** `likeMemberProfile` / `followMemberProfile` could target a Discreet ID without contact (probing via known UUID).

**Fix:** Same intentional-contact gate as Signal-to-Discreet.

### 4. Match detection for intentional contact (HIGH priority hardening)

**Issue:** `hasIntentionalContact` only checked `payload->>'profileId'`. `persistMatch` also writes `profile_id` column — relying on JSON alone risked false negatives (hiding legitimate peers) and was fragile.

**Fix:** Match query now accepts **either** `payload->>'profileId'` **or** `profile_id::text`.

---

## Intentional-contact contract (validated)

Unlock requires **Discreet → viewer** pending/accepted Signal, **or** an `app_matches` row linking the pair via `profile_id` / payload.

Likes, follows, and saves are **not** unlock actions by themselves (fail closed).

---

## VisibilityDecision note

`evaluateMemberVisibility` already returns `{ allowed, reason }` (e.g. `discreet_no_intentional_contact`, `passive_blocked`). A richer enum (`VISIBLE` / `HIDDEN_DISCREET` / …) can layer on later without blocking 3C.

---

## Files touched in this audit pass

- `server/services/memberVisibilityPolicy.js` — match hardening + `filterPassiveExposureRows`
- `server/memberSocial.js` — likes / follows / saved gates
- `scripts/test-discreet-visibility.mjs` — wiring assert updated
- `docs/architecture/phase3b-privacy-audit.md` — this report

---

## Tests

Run after fixes: `node scripts/test-discreet-visibility.mjs`, `npm run test:server-import`.

**No commit** (commercial layer still open).
