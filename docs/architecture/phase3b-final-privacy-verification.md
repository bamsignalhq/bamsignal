# Phase 3B Final Privacy Verification

**Date:** 2026-07-19  
**Mode:** Adversarial verification only (no Phase 3C).  
**Fixes:** Uniform denial responses on Signal / Like / Follow / Save.

---

## Findings

| Attack | Result | Evidence |
|---|---|---|
| Enumerate Discreet via Discover / Search / City / FC pool | **Blocked** | Policy SQL excludes active Discreet; no ID list of hidden members |
| Infer via `profile-by-id` body | **Blocked** | Missing and Discreet both → `200 { ok: true, profile: null }` |
| Infer via Signal / Like / Follow / Save | **Blocked** (hardened) | Missing, shadow-banned, and Discreet-without-contact → same `404 { ok: false, error: "Profile not available." }` |
| Infer via error message wording | **Blocked** | No “private”, “discreet”, or “hidden” copy on member denial paths |
| Infer via HTTP status alone | **Blocked** | Same status for missing vs Discreet on each endpoint |
| Infer via listing counts / totals | **Blocked** | Feeds return arrays only; no city-wide member totals |
| Infer via pagination / `excludeProfileIds` | **Blocked** | Excluding a Discreet UUID vs random UUID does not change visible set differently in a detectable way |
| Infer via search suggestions / typeahead | **N/A** | No member profile suggestion/autocomplete API |
| Infer via rate-limit differentiation | **Blocked** | Shared action buckets (`profile-view`, `discover`, `search`); no per-privacy-class limiter |
| Infer via profile previews | **Blocked** | Public landings use static samples; live previews go through gated APIs |
| Infer via saved-state write | **Blocked** | Save of unknown / Discreet UUID → same `Profile not available.` |
| Infer via saved-list disappearance | **Residual** | Prior saver may notice a previously saved card vanish after peer activates Discreet (acquaintance oracle, not stranger enumeration) |
| Infer via websocket events | **Blocked** | No member-profile fan-out websocket |
| Infer via retries | **Blocked** | Deterministic same denial; no alternating truth |
| Infer via Fast Connection copy | **Blocked for Discreet** | Discreet and missing both `"Profile not available."` before pool-eligibility messaging |
| Infer via response timing | **Residual** | Discreet denial may run intentional-contact queries; missing ID returns earlier. Not closed without constant-time DB design |
| Username availability | **Residual (platform)** | `check-username` reveals taken names for all members; not Discreet-specific |

---

## Fixes applied

Unified member interaction denials in `api/member/data.js`:

- `signal`
- `like-profile`
- `follow-profile`
- `save-profile`

When the target is unavailable for **any** privacy-safe reason (missing, shadow-banned, Discreet without intentional contact):

```json
{ "ok": false, "error": "Profile not available." }
```

Status: **404** (replacing prior `503`/`400` with bare `ok: false` and null payloads).

Sender-only errors (paused profile, cooldown, FC daily limit) remain distinct — they describe the **caller**, not the target.

---

## Residual accepted risks

1. **Client Discover Map cache** — stale card until refresh after peer activates Discreet (known limitation).
2. **Timing side-channel** — theoretical distinction between missing UUID and Discreet-denied path under precise latency measurement.
3. **Prior-relationship saved-list / local cache** — someone who already knew the profile may observe disappearance; strangers cannot enumerate.
4. **Username taken checks** — global username oracle (pre-existing; applies to Discover too).
5. **Fast Connection “not in pool”** — can confirm existence of a **non-Discreet** profile that fails FC eligibility; Discreet never reaches that branch.

---

## Tests

- `node scripts/test-discreet-visibility.mjs`
- `npm run test:server-import`

**Stop.** Do not begin Phase 3C from this verification.
