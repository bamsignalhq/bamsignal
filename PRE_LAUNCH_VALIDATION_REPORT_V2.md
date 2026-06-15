# Pre-Launch Validation Report V2

**Validated:** 2026-06-15T07:16:47Z (UTC)  
**Environment:** Production — https://bamsignal.com  
**Database:** `connected`  
**Method:** Live HTTP requests only. No assumptions.

---

## Summary

| # | Test | Result |
|---|------|--------|
| 1 | Register user | **PASS** |
| 2 | Discover users | **PASS** |
| 3 | Send signal | **PASS** |
| 4 | Accept signal | **PASS** |
| 5 | Send message | **PASS** |
| 6 | Pull messages after reload | **PASS** |
| 7 | Submit report | **PASS** |
| 8 | Referral signup | **PASS** |
| 9 | Premium status | **PASS** |
| 10 | Paystack initialize | **FAIL** |

**Score: 9 / 10 passed**

---

## 1. Register user — PASS

**Request:** `POST /api/member/data?action=register`

```json
{"email":"val-a-1781507293@test.bamsignal.com","phone":"80815072931","name":"Val User A"}
```

**Response:** HTTP 200, `ok: true`, user UUID returned.

**Post-fix (dab2dd0):** `referral_code` persisted on register (e.g. `VALA2QGN`).

---

## 2. Discover users — PASS

**Request:** `POST /api/member/data?action=discover` with `city: "Lagos"` after User A and B profiles synced.

**Response:** HTTP 200, `profiles` array includes User B (`72cc27c7-f221-4d30-83ab-2ac5b0cb45b4`).

---

## 3. Send signal — PASS

**Request:** `POST /api/member/data?action=signal` — User A → User B profile.

**Response:** HTTP 200, signal id `5e8cf686-095e-4036-a840-9bf5711ceaed`, `status: "pending"`.

---

## 4. Accept signal — PASS

**Request:** `POST /api/member/data?action=accept-signal` — User B accepts signal.

**Response:** HTTP 200, match id `m-2a014dae-d4d1-43f3-9afd-f86f595f7879-72cc27c7-f221-4d30-83ab-2ac5b0cb45b4`.

---

## 5. Send message — PASS

**Request:** `POST /api/member/data?action=message` — User A in match thread.

**Response:** HTTP 200, message id `msg-1781507293`, body `"Hello from validation test"`.

---

## 6. Pull messages after reload — PASS

**Request:** `POST /api/member/data?action=pull` — User A (simulates fresh session / reload).

**Response:** HTTP 200, `bundle.chats` contains thread with message:

```json
{
  "id": "msg-1781507293",
  "text": "Hello from validation test",
  "from": "me"
}
```

`bundle.matches` includes User B match. Message survived pull.

---

## 7. Submit report — PASS

**Request:** `POST /api/member/data?action=report`

**Response:** HTTP 200, report id `99110ac0-6306-498d-889c-26341b6c13a8`.

**Pull verification:** Subsequent `pull` returns `bundle.reports` length 1.

---

## 8. Referral signup — PASS

**Initial test (before `dab2dd0`):** **FAIL** — User C registered with referral code but `referred_by_user_key: null`; `complete-onboarding` returned `credited: false`.

**After fix deployed:**

| Step | Result |
|------|--------|
| User A register | `referral_code: "VALA2QGN"` |
| User C register with `VALA2QGN` | `referred_by_user_key: "email:val2-a-1781507727@test.bamsignal.com"` |
| User C `complete-onboarding` | `credited: true` |
| User A `referral` stats | `successfulReferrals: 1` |

---

## 9. Premium status — PASS

**Request:** `POST /api/member/data?action=status`

**Response:** HTTP 200

```json
{
  "ok": true,
  "premium": { "isPremium": false, "premiumUntil": null }
}
```

Endpoint operational for free users. Paid premium activation not tested (blocked by Paystack initialize failure).

---

## 10. Paystack initialize — FAIL

**Request:** `POST /api/paystack/verify?action=initialize`

```json
{"email":"val2-a-1781507293@test.bamsignal.com","plan":"monthly","days":30,"name":"Val User A"}
```

**Response:** HTTP 502, `content-type: text/plain`, body `error code: 502` (Cloudflare origin error).

**Notes:**
- `POST /api/paystack/verify` without `action` returns HTTP 400 JSON — route is live.
- `/health` shows `paystack: true` (secret key configured).
- Any handler path that calls `api.paystack.co` returns Cloudflare 502, not application JSON.
- Code hardening (`paystackFetch` + try/catch, commit `dab2dd0`) did not change production response — indicates **outbound connectivity** issue from Coolify host to Paystack, not missing error handling alone.

---

## Launch blockers

| Priority | Blocker | Status |
|----------|---------|--------|
| ~~P0~~ | `DATABASE_URL` not connected | **Resolved** |
| ~~P1~~ | Referral codes not persisted | **Resolved** (`dab2dd0`) |
| **P0** | Paystack checkout cannot initialize | **Open** — fix Coolify outbound HTTPS to `api.paystack.co` |

---

## Fixes applied this sprint

| Commit | Change |
|--------|--------|
| `dab2dd0` | Persist referral codes on register; harden Paystack fetch with timeout + error handling |

---

## Test log

```
GET  /health                                     → 200  database:connected
POST /api/member/data?action=register            → 200  user created
POST /api/member/data?action=profile             → 200  profile synced
POST /api/member/data?action=discover           → 200  1 profile
POST /api/member/data?action=signal              → 200  signal pending
POST /api/member/data?action=incoming            → 200  1 incoming
POST /api/member/data?action=accept-signal       → 200  match created
POST /api/member/data?action=message             → 200  message saved
POST /api/member/data?action=pull                → 200  match + message in bundle
POST /api/member/data?action=report              → 200  report saved
POST /api/member/data?action=register+referral   → 200  referred_by_user_key set (post-fix)
POST /api/member/data?action=complete-onboarding → 200  credited:true (post-fix)
POST /api/member/data?action=status              → 200  premium status returned
POST /api/paystack/verify?action=initialize      → 502  Cloudflare origin error
```

---

*Validation only. No new features. No redesign.*
